const Groq = require("groq-sdk");
const BrandVoice = require("../models/BrandVoice");

// @route POST /api/brand-voice/analyze
exports.analyzeBrandVoice = async (req, res) => {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const { samples } = req.body;

    if (!samples || samples.length < 1) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least 1 writing sample",
      });
    }

    const combinedSamples = samples.join("\n\n---\n\n");

    const analysis = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an expert writing style analyst. Analyze writing samples and extract the unique voice, tone, and style patterns.",
        },
        {
          role: "user",
          content: `Analyze these writing samples and extract the brand voice:

${combinedSamples}

Respond in this exact JSON format:
{
  "tone": "description of the overall tone (e.g., professional yet friendly, casual and conversational)",
  "vocabulary": "description of vocabulary patterns (e.g., simple words, technical jargon, industry terms)",
  "sentenceStyle": "description of sentence structure (e.g., short punchy sentences, detailed explanations)",
  "summary": "2-3 sentence summary of the brand voice that can be used as a system prompt"
}`,
        },
      ],
      max_tokens: 500,
    });

    const responseText = analysis.choices[0].message.content;
    let analyzedStyle;

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      analyzedStyle = JSON.parse(jsonMatch[0]);
    } catch {
      analyzedStyle = {
        tone: "Professional and engaging",
        vocabulary: "Clear and accessible",
        sentenceStyle: "Balanced mix of short and long sentences",
        summary: "Write in a professional, engaging tone with clear and accessible language.",
      };
    }

    // Save or update brand voice
    const brandVoice = await BrandVoice.findOneAndUpdate(
      { user: req.user.id },
      { samples, analyzedStyle },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, brandVoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/brand-voice
exports.getBrandVoice = async (req, res) => {
  try {
    const brandVoice = await BrandVoice.findOne({ user: req.user.id });
    res.status(200).json({ success: true, brandVoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/brand-voice
exports.deleteBrandVoice = async (req, res) => {
  try {
    await BrandVoice.findOneAndDelete({ user: req.user.id });
    res.status(200).json({ success: true, message: "Brand voice deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};