import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { Zap, PenTool, BarChart3, Clock, LogOut, CreditCard, ChevronRight } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get("/ai/history");
        setHistory(data.generations || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const planColors = {
    free: "bg-gray-700 text-gray-300",
    pro: "bg-blue-600 text-white",
    enterprise: "bg-purple-600 text-white",
  };

  const limits = { free: 10, pro: 100, enterprise: 999 };
  const usagePercent = user
    ? Math.min((user.usage?.requestsThisMonth / limits[user.plan]) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-xl">WriteAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/writer" className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg font-medium flex items-center gap-2">
              <PenTool size={16} /> New Generation
            </Link>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white transition flex items-center gap-2">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">
            Welcome back, {user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-400">Here's your writing activity overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Plan */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Current Plan</span>
              <CreditCard size={18} className="text-gray-500" />
            </div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize ${planColors[user?.plan || "free"]}`}>
              {user?.plan || "free"}
            </span>
            <button onClick={() => navigate("/billing")}
              className="mt-3 text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
              Upgrade <ChevronRight size={14} />
            </button>
          </div>

          {/* Usage */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Monthly Usage</span>
              <BarChart3 size={18} className="text-gray-500" />
            </div>
            <div className="text-2xl font-bold mb-2">
              {user?.usage?.requestsThisMonth || 0}
              <span className="text-gray-500 text-sm font-normal">/{limits[user?.plan || "free"]}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>

          {/* Words Generated */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Words Generated</span>
              <PenTool size={18} className="text-gray-500" />
            </div>
            <div className="text-2xl font-bold">
              {(user?.usage?.wordsGenerated || 0).toLocaleString()}
            </div>
            <p className="text-gray-500 text-sm mt-1">Total all time</p>
          </div>

          {/* Generations */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Total Generations</span>
              <Clock size={18} className="text-gray-500" />
            </div>
            <div className="text-2xl font-bold">{history.length}</div>
            <p className="text-gray-500 text-sm mt-1">All time</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { type: "blog", label: "Blog Post", desc: "SEO-friendly articles", icon: "📝" },
            { type: "email", label: "Email Copy", desc: "Professional emails", icon: "📧" },
            { type: "ad", label: "Ad Copy", desc: "Persuasive ads", icon: "📢" },
            { type: "linkedin", label: "LinkedIn Post", desc: "Engaging posts", icon: "💼" },
            { type: "summary", label: "Summary", desc: "Concise summaries", icon: "📋" },
          ].map((item) => (
            <button key={item.type}
              onClick={() => navigate(`/writer?type=${item.type}`)}
              className="bg-gray-900 border border-gray-800 hover:border-blue-500/50 transition rounded-2xl p-5 text-left group">
              <div className="text-2xl mb-3">{item.icon}</div>
              <div className="font-semibold group-hover:text-blue-400 transition">{item.label}</div>
              <div className="text-gray-500 text-sm">{item.desc}</div>
            </button>
          ))}
        </div>

        {/* Recent Generations */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Generations</h2>
            <Link to="/writer" className="text-blue-400 hover:text-blue-300 text-sm">
              New generation →
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">✨</div>
              <p className="text-gray-400 mb-4">No generations yet</p>
              <button onClick={() => navigate("/writer")}
                className="bg-blue-600 hover:bg-blue-700 transition px-6 py-2 rounded-lg font-medium">
                Create your first generation
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((gen) => (
                <div key={gen._id} className="border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full capitalize">
                          {gen.type}
                        </span>
                        <span className="text-xs text-gray-500">{gen.wordCount} words</span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{gen.prompt}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(gen.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}