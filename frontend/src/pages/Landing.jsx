import { useNavigate } from "react-router-dom";
import { Zap, Shield, BarChart3, ArrowRight, Check } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    { icon: <Zap size={24} />, title: "AI-Powered Writing", desc: "Generate blogs, emails, ad copy and more in seconds using GPT-4o" },
    { icon: <Shield size={24} />, title: "Secure & Private", desc: "Your data is encrypted and never shared with third parties" },
    { icon: <BarChart3 size={24} />, title: "Usage Analytics", desc: "Track your generations, word count and monthly usage in real-time" },
  ];

  const plans = [
    { name: "Free", price: 0, features: ["10 generations/month", "500 words/request", "Basic support"], cta: "Get Started" },
    { name: "Pro", price: 19, features: ["100 generations/month", "2000 words/request", "Priority support"], cta: "Start Pro", popular: true },
    { name: "Enterprise", price: 49, features: ["Unlimited generations", "5000 words/request", "24/7 support"], cta: "Go Enterprise" },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl">WriteAI</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => navigate("/login")}
            className="text-gray-400 hover:text-white transition px-4 py-2">
            Login
          </button>
          <button onClick={() => navigate("/register")}
            className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg font-medium">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
          <Zap size={14} className="text-blue-400" />
          <span className="text-blue-400 text-sm">Powered by GPT-4o</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Write Better Content<br />
          <span className="text-blue-500">10x Faster</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          AI-powered writing assistant that generates blogs, emails, ad copy,
          LinkedIn posts and more in seconds.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button onClick={() => navigate("/register")}
            className="bg-blue-600 hover:bg-blue-700 transition px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-2">
            Start Writing Free <ArrowRight size={20} />
          </button>
          <button onClick={() => navigate("/login")}
            className="border border-gray-700 hover:border-gray-500 transition px-8 py-4 rounded-xl font-semibold text-lg">
            Sign In
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to write better</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500/50 transition">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Simple, transparent pricing</h2>
        <p className="text-gray-400 text-center mb-12">Start free, upgrade when you need more</p>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div key={i} className={`relative bg-gray-900 border rounded-2xl p-8 ${plan.popular ? "border-blue-500" : "border-gray-800"}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="font-bold text-xl mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-gray-300">
                    <Check size={16} className="text-blue-400" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate("/register")}
                className={`w-full py-3 rounded-xl font-semibold transition ${plan.popular ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-800 hover:bg-gray-700"}`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500">
        <p>© 2025 WriteAI. Built with React, Node.js & OpenAI.</p>
      </footer>
    </div>
  );
}