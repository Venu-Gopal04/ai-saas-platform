import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Zap, ArrowLeft, Copy, Trash2, Send } from "lucide-react";

const WRITING_TYPES = [
  { key: "blog", label: "Blog Post", icon: "📝", placeholder: "Write a blog post about the future of AI in healthcare..." },
  { key: "email", label: "Email", icon: "📧", placeholder: "Write a follow-up email after a job interview..." },
  { key: "ad", label: "Ad Copy", icon: "📢", placeholder: "Write ad copy for a new fitness app targeting busy professionals..." },
  { key: "linkedin", label: "LinkedIn Post", icon: "💼", placeholder: "Write a LinkedIn post about lessons learned from my first startup..." },
  { key: "summary", label: "Summary", icon: "📋", placeholder: "Summarize the key points about climate change solutions..." },
];

const TONES = ["professional", "casual", "humorous", "formal", "persuasive", "inspirational"];

export default function Writer() {
  const [searchParams] = useSearchParams();
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "blog");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
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

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ai/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type: selectedType, prompt, tone }),
        }
      );

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
            {user?.usage?.requestsThisMonth || 0} / {user?.plan === "pro" ? 100 : user?.plan === "enterprise" ? "∞" : 10} uses this month
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
                  <button key={type.key}
                    onClick={() => setSelectedType(type.key)}
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
                  <button key={t}
                    onClick={() => setTone(t)}
                    className={`px-3 py-1.5 rounded-lg text-sm capitalize transition ${
                      tone === t
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Your Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={currentType?.placeholder}
                rows={6}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send size={18} /> Generate Content
                </>
              )}
            </button>
          </div>

          {/* Right — Output */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-300">Generated Content</h3>
              {output && (
                <div className="flex gap-2">
                  <button onClick={copyToClipboard}
                    className="text-gray-400 hover:text-white transition p-2 rounded-lg hover:bg-gray-800">
                    <Copy size={16} />
                  </button>
                  <button onClick={() => setOutput("")}
                    className="text-gray-400 hover:text-red-400 transition p-2 rounded-lg hover:bg-gray-800">
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <div ref={outputRef}
              className="flex-1 min-h-96 overflow-y-auto">
              {!output && !isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="text-5xl mb-4">✨</div>
                  <p className="text-gray-500">Your generated content will appear here</p>
                  <p className="text-gray-600 text-sm mt-2">Enter a prompt and click Generate</p>
                </div>
              ) : (
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                  {output}
                  {isGenerating && (
                    <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />
                  )}
                </div>
              )}
            </div>

            {output && (
              <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-sm text-gray-500">
                <span>{output.split(" ").length} words</span>
                <span>{output.length} characters</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}