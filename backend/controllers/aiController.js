const Groq = require("groq-sdk");
const User = require("../models/User");
const Generation = require("../models/Generation");

const WRITING_TYPES = {
  blog:     { label: "Blog Post",     system: "You are an expert blog writer. Write engaging, SEO-friendly blog posts." },
  email:    { label: "Email",         system: "You are an expert email copywriter. Write professional and compelling emails." },
  ad:       { label: "Ad Copy",       system: "You are an expert advertising copywriter. Write persuasive and catchy ad copy." },
  summary:  { label: "Summary",       system: "You are an expert at summarizing content clearly and concisely." },
  linkedin: { label: "LinkedIn Post", system: "You are an expert at writing engaging LinkedIn posts that drive engagement." },
};

// @route POST /api/ai/generate
exports.generate = async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { type, prompt, tone = "professional", useBrandVoice = false } = req.body;
    const user = await User.findById(req.user.id);
    const limits = user.getPlanLimits();

    // Check usage limits
    if (user.usage.requestsThisMonth >= limits.requestsPerMonth) {
      return res.status(403).json({
        success: false,
        message: "Monthly limit reached. Upgrade your plan to continue.",
        upgradeRequired: true,
      });
    }

    if (!type || !prompt) {
      return res.status(400).json({
        success: false,
        message: "Please provide type and prompt",
      });
    }

    const writingType = WRITING_TYPES[type] || WRITING_TYPES.blog;

    // Get brand voice if enabled
    let brandVoiceInstruction = "";
    if (useBrandVoice) {
      const BrandVoice = require("../models/BrandVoice");
      const brandVoice = await BrandVoice.findOne({ user: req.user.id });
      if (brandVoice?.analyzedStyle?.summary) {
        brandVoiceInstruction = `\n\nIMPORTANT - Write in this specific brand voice: ${brandVoice.analyzedStyle.summary}`;
      }
    }

    // Set headers for streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullContent = "";

    // Stream from Groq
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: writingType.system + brandVoiceInstruction },
        {
          role: "user",
          content: `Write a ${writingType.label} with a ${tone} tone about: ${prompt}. Keep it under ${limits.wordsPerRequest} words. Make it high quality and ready to use.`,
        },
      ],
      max_tokens: limits.wordsPerRequest * 2,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        fullContent += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // Save to DB
    await Generation.create({
      user: user._id,
      type,
      prompt,
      content: fullContent,
      wordCount: fullContent.split(" ").length,
    });

    // Update usage
    await User.findByIdAndUpdate(user._id, {
      $inc: {
        "usage.wordsGenerated": fullContent.split(" ").length,
        "usage.requestsThisMonth": 1,
      },
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

  } catch (error) {
    console.error("AI Error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
};

// @route GET /api/ai/history
exports.getHistory = async (req, res) => {
  try {
    const generations = await Generation.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json({ success: true, generations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/ai/types
exports.getTypes = async (req, res) => {
  res.status(200).json({
    success: true,
    types: Object.entries(WRITING_TYPES).map(([key, val]) => ({
      key, label: val.label,
    })),
  });
};

// @route POST /api/ai/seo-score
exports.getSeoScore = async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { content, keyword } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: "Content is required" });
    }

    // Basic local analysis
    const words = content.trim().split(/\s+/);
    const wordCount = words.length;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = Math.round(wordCount / (sentences.length || 1));
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);

    // Keyword density
    let keywordDensity = 0;
    let keywordCount = 0;
    if (keyword) {
      const kw = keyword.toLowerCase();
      keywordCount = words.filter(w => w.toLowerCase().includes(kw)).length;
      keywordDensity = parseFloat(((keywordCount / wordCount) * 100).toFixed(1));
    }

    // Ask Groq for SEO analysis
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an SEO expert. Analyze the given content and return ONLY a valid JSON object with no extra text, no markdown, no code blocks. Just raw JSON.`,
        },
        {
          role: "user",
          content: `Analyze this content for SEO and return ONLY this JSON structure:
{
  "score": <number 0-100>,
  "readabilityScore": <number 0-100>,
  "strengths": [<up to 3 short strings>],
  "improvements": [<up to 4 short actionable strings>],
  "metaDescription": "<suggested meta description under 160 chars>",
  "suggestedTitle": "<suggested SEO title under 60 chars>"
}

Content to analyze (${wordCount} words):
${content.substring(0, 1500)}`,
        },
      ],
      max_tokens: 600,
      temperature: 0.3,
    });

    let aiAnalysis = {};
    try {
      const raw = response.choices[0]?.message?.content || "{}";
      // Strip any markdown code blocks if present
      const cleaned = raw.replace(/```json|```/g, "").trim();
      aiAnalysis = JSON.parse(cleaned);
    } catch {
      aiAnalysis = {
        score: 65,
        readabilityScore: 70,
        strengths: ["Content is well-structured"],
        improvements: ["Add more keywords", "Improve sentence variety"],
        metaDescription: content.substring(0, 155),
        suggestedTitle: "Optimized Content Title",
      };
    }

    res.status(200).json({
      success: true,
      seoData: {
        ...aiAnalysis,
        wordCount,
        avgSentenceLength,
        paragraphCount: paragraphs.length,
        keywordDensity,
        keywordCount,
      },
    });

  } catch (error) {
    console.error("SEO Score Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};