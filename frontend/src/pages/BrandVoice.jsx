import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import { ArrowLeft, Zap, Plus, Trash2, Sparkles, CheckCircle } from "lucide-react";

export default function BrandVoice() {
  const navigate = useNavigate();
  const [samples, setSamples] = useState([""]);
  const [brandVoice, setBrandVoice] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrandVoice = async () => {
      try {
        const { data } = await api.get("/brand-voice");
        if (data.brandVoice) {
          setBrandVoice(data.brandVoice);
          setSamples(data.brandVoice.samples);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrandVoice();
  }, []);

  const addSample = () => {
    if (samples.length < 5) setSamples([...samples, ""]);
    else toast.error("Maximum 5 samples allowed");
  };

  const updateSample = (index, value) => {
    const updated = [...samples];
    updated[index] = value;
    setSamples(updated);
  };

  const removeSample = (index) => {
    setSamples(samples.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    const validSamples = samples.filter((s) => s.trim().length > 50);
    if (validSamples.length === 0) {
      toast.error("Please add at least one sample with 50+ characters");
      return;
    }
    setAnalyzing(true);
    try {
      const { data } = await api.post("/brand-voice/analyze", {
        samples: validSamples,
      });
      setBrandVoice(data.brandVoice);
      toast.success("Brand voice analyzed successfully! 🎉");
    } catch (error) {
      toast.error(error.response?.data?.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your brand voice profile?")) return;
    try {
      await api.delete("/brand-voice");
      setBrandVoice(null);
      setSamples([""]);
      toast.success("Brand voice deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")}
            className="text-gray-400 hover:text-white transition flex items-center gap-2">
            <ArrowLeft size={18} /> Dashboard
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple-500 rounded-lg flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-bold">Brand Voice</span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Brand Voice Training</h1>
          <p className="text-gray-400">
            Train the AI on your writing style so every generation sounds like you — not a generic AI.
          </p>
        </div>

        {/* Analyzed Result */}
        {brandVoice?.analyzedStyle?.summary && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={20} className="text-purple-400" />
              <span className="font-semibold text-purple-300">Brand Voice Active</span>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">TONE</div>
                <p className="text-sm text-gray-300">{brandVoice.analyzedStyle.tone}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">VOCABULARY</div>
                <p className="text-sm text-gray-300">{brandVoice.analyzedStyle.vocabulary}</p>
              </div>
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-1">SENTENCE STYLE</div>
                <p className="text-sm text-gray-300">{brandVoice.analyzedStyle.sentenceStyle}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 italic">"{brandVoice.analyzedStyle.summary}"</p>
            <button onClick={handleDelete}
              className="mt-4 text-red-400 hover:text-red-300 text-sm flex items-center gap-1">
              <Trash2 size={14} /> Delete brand voice
            </button>
          </div>
        )}

        {/* Writing Samples */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-lg">Your Writing Samples</h2>
              <p className="text-gray-500 text-sm mt-1">
                Paste 1-5 examples of your best writing (emails, blog posts, social posts)
              </p>
            </div>
            <button onClick={addSample}
              className="flex items-center gap-2 text-sm bg-gray-800 hover:bg-gray-700 transition px-3 py-2 rounded-lg">
              <Plus size={14} /> Add Sample
            </button>
          </div>

          <div className="space-y-4">
            {samples.map((sample, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Sample {index + 1}</span>
                  {samples.length > 1 && (
                    <button onClick={() => removeSample(index)}
                      className="text-gray-600 hover:text-red-400 transition">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <textarea
                  value={sample}
                  onChange={(e) => updateSample(index, e.target.value)}
                  placeholder="Paste a sample of your writing here... (minimum 50 characters)"
                  rows={5}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition resize-none text-sm"
                />
                <div className="text-right text-xs text-gray-600 mt-1">
                  {sample.length} characters
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition py-4 rounded-xl font-semibold flex items-center justify-center gap-2">
            {analyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing your writing style...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Analyze Brand Voice
              </>
            )}
          </button>
        </div>

        {/* How it works */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {[
            { step: "01", title: "Paste Your Writing", desc: "Add samples of your best content — blogs, emails, or social posts" },
            { step: "02", title: "AI Analyzes Style", desc: "Our AI extracts your unique tone, vocabulary, and writing patterns" },
            { step: "03", title: "Generate In Your Voice", desc: "Enable Brand Voice in the writer and every output sounds like you" },
          ].map((item) => (
            <div key={item.step} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-purple-500 font-bold text-lg mb-2">{item.step}</div>
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}