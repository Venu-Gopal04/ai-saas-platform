import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Zap, ArrowLeft, Copy, Trash2, Send, BarChart2, X } from "lucide-react";

const WRITING_TYPES = [
  { key: "blog", label: "Blog Post", icon: "📝", placeholder: "Write a blog post about the future of AI in healthcare..." },
  { key: "email", label: "Email", icon: "📧", placeholder: "Write a follow-up email after a job interview..." },
  { key: "ad", label: "Ad Copy", icon: "📢", placeholder: "Write ad copy for a new fitness app targeting busy professionals..." },
  { key: "linkedin", label: "LinkedIn Post", icon: "💼", placeholder: "Write a LinkedIn post about lessons learned from my first startup..." },
  { key: "summary", label: "Summary", icon: "📋", placeholder: "Summarize the key points about climate change solutions..." },
];

const TONES = ["professional", "casual", "humorous", "formal", "persuasive", "inspirational"];

function ScoreRing({ score, size = 80 }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={size} height={size} viewBox="0 0 70 70">
      <circle cx="35" cy="35" r={radius} fill="none" stroke="#1f2937" strokeWidth="6" />
      <circle cx="35" cy="35" r={radius} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 35 35)"
        style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      <text x="35" y="35" textAnchor="middle" dominantBaseline="central"
        fill="white" fontSize="13" fontWeight="bold">{score}</text>
    </svg>
  );
}

export default function Writer() {
  const [searchParams] = useSearchParams();
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "blog");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [useBrandVoice, setUseBrandVoice] = useState(false);

  // SEO Score states
  const [seoKeyword, setSeoKeyword] = useState("");
  const [seoData, setSeoData] = useState(null);
  const [isSeoLoading, setIsSeoLoading] = useState(false);
  const [showSeoPanel, setShowSeoPanel] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const outputRef = useRef(null);

  const currentType = WRITING_TYPES.find((t) => t.key === selectedType);

  useEffect(() => {
    if (output && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    setIsGenerating(true);
    setOutput("");
    setSeoData(null);
    setShowSeoPanel(false);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type: selectedType, prompt, tone, useBrandVoice }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Generation failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) setOutput((prev) => prev + data.content);
              if (data.done) setIsGenerating(false);
            } catch {}
          }
        }
      }
      toast.success("Content generated!");
    } catch (error) {
      toast.error(error.message || "Generation failed");
      setIsGenerating(false);
    }
  };

  const handleSeoScore = async () => {
    if (!output.trim()) {
      toast.error("Generate content first!");
      return;
    }
    setIsSeoLoading(true);
    setShowSeoPanel(true);
    setSeoData(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai/seo-score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: output, keyword: seoKeyword }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      setSeoData(data.seoData);
      toast.success("SEO analysis complete!");
    } catch (error) {
      toast.error(error.message || "SEO analysis failed");
      setShowSeoPanel(false);
    } finally {
      setIsSeoLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")}
              className="text-gray-400 hover:text-white transition flex items-center gap-2">
              <ArrowLeft size={18} /> Dashboard
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                <Zap size={14} className="text-white" />
              </div>
              <span className="font-bold">AI Writer</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {user?.usage?.requestsThisMonth || 0} / {user?.plan === "pro" ? 500 : user?.plan === "enterprise" ? "∞" : 100} uses this month
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left — Input */}
          <div className="space-y-6">
            {/* Type selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Content Type</label>
              <div className="grid grid-cols-3 gap-2">
                {WRITING_TYPES.map((type) => (
                  <button key={type.key} onClick={() => setSelectedType(type.key)}
                    className={`p-3 rounded-xl border text-sm font-medium transition flex flex-col items-center gap-1 ${
                      selectedType === type.key
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700"
                    }`}>
                    <span className="text-lg">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone selector */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Tone</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button key={t} onClick={() => setTone(t)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize transition ${
                      tone === t ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Your Prompt</label>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
                placeholder={currentType?.placeholder} rows={6}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition resize-none" />
            </div>

            {/* SEO Keyword input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Target Keyword <span className="text-gray-600 font-normal">(optional — for SEO score)</span>
              </label>
              <input
                type="text"
                value={seoKeyword}
                onChange={(e) => setSeoKeyword(e.target.value)}
                placeholder="e.g. AI writing tools"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 transition"
              />
            </div>

            {/* Brand Voice Toggle */}
            <div className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
              <div>
                <div className="text-sm font-medium">Use Brand Voice</div>
                <div className="text-xs text-gray-500">Generate in your trained writing style</div>
              </div>
              <button onClick={() => setUseBrandVoice(!useBrandVoice)}
                className={`w-12 h-6 rounded-full transition-all ${useBrandVoice ? "bg-purple-600" : "bg-gray-700"} relative`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${useBrandVoice ? "left-6" : "left-0.5"}`} />
              </button>
            </div>

            {/* Generate button */}
            <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
              {isGenerating ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
              ) : (
                <><Send size={18} /> Generate Content</>
              )}
            </button>
          </div>

          {/* Right — Output */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-300">Generated Content</h3>
                {output && (
                  <div className="flex gap-2">
                    <button onClick={copyToClipboard}
                      className="text-gray-400 hover:text-white transition p-2 rounded-lg hover:bg-gray-800">
                      <Copy size={16} />
                    </button>
                    <button onClick={() => { setOutput(""); setSeoData(null); setShowSeoPanel(false); }}
                      className="text-gray-400 hover:text-red-400 transition p-2 rounded-lg hover:bg-gray-800">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div ref={outputRef} className="flex-1 min-h-64 overflow-y-auto">
                {!output && !isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="text-5xl mb-4">✨</div>
                    <p className="text-gray-500">Your generated content will appear here</p>
                    <p className="text-gray-600 text-sm mt-2">Enter a prompt and click Generate</p>
                  </div>
                ) : (
                  <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                    {output}
                    {isGenerating && <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />}
                  </div>
                )}
              </div>

              {output && (
                <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{output.split(" ").length} words</span>
                    <span>{output.length} characters</span>
                  </div>
                  {/* SEO Score Button */}
                  <button onClick={handleSeoScore} disabled={isSeoLoading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm">
                    {isSeoLoading ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing SEO...</>
                    ) : (
                      <><BarChart2 size={16} /> Analyze SEO Score</>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* SEO Panel */}
            {showSeoPanel && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold flex items-center gap-2">
                    <BarChart2 size={18} className="text-green-400" /> SEO Analysis
                  </h3>
                  <button onClick={() => setShowSeoPanel(false)}
                    className="text-gray-500 hover:text-white transition">
                    <X size={18} />
                  </button>
                </div>

                {isSeoLoading ? (
                  <div className="flex flex-col items-center py-8 gap-3">
                    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Analyzing your content...</p>
                  </div>
                ) : seoData ? (
                  <div className="space-y-5">
                    {/* Score row */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <ScoreRing score={seoData.score} />
                        <p className="text-xs text-gray-500 mt-1">SEO Score</p>
                      </div>
                      <div className="text-center">
                        <ScoreRing score={seoData.readabilityScore} />
                        <p className="text-xs text-gray-500 mt-1">Readability</p>
                      </div>
                      <div className="flex-1 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-400">
                          <span>Words</span><span className="text-white font-medium">{seoData.wordCount}</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>Avg sentence</span><span className="text-white font-medium">{seoData.avgSentenceLength} words</span>
                        </div>
                        <div className="flex justify-between text-gray-400">
                          <span>Paragraphs</span><span className="text-white font-medium">{seoData.paragraphCount}</span>
                        </div>
                        {seoKeyword && (
                          <div className="flex justify-between text-gray-400">
                            <span>Keyword density</span>
                            <span className={`font-medium ${seoData.keywordDensity >= 1 && seoData.keywordDensity <= 3 ? "text-green-400" : "text-yellow-400"}`}>
                              {seoData.keywordDensity}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Strengths */}
                    {seoData.strengths?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">✅ Strengths</p>
                        <ul className="space-y-1">
                          {seoData.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                              <span className="text-green-500 mt-0.5">•</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvements */}
                    {seoData.improvements?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-yellow-400 uppercase tracking-wider mb-2">⚡ Improvements</p>
                        <ul className="space-y-1">
                          {seoData.improvements.map((imp, i) => (
                            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                              <span className="text-yellow-500 mt-0.5">•</span> {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Meta & Title suggestions */}
                    {seoData.suggestedTitle && (
                      <div className="bg-gray-800 rounded-xl p-3 space-y-2">
                        <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">💡 SEO Suggestions</p>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Title Tag</p>
                          <p className="text-sm text-white">{seoData.suggestedTitle}</p>
                        </div>
                        {seoData.metaDescription && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Meta Description</p>
                            <p className="text-sm text-gray-300">{seoData.metaDescription}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
