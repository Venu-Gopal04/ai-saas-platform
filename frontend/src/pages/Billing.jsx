import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import { Zap, Check, ArrowLeft, CreditCard, AlertCircle } from "lucide-react";

export default function Billing() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await api.get("/stripe/plans");
        setPlans(data.plans);
      } catch (error) {
        toast.error("Failed to load plans");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();

    // Handle success/cancel from Stripe
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) {
      toast.success("Subscription activated! 🎉");
    }
    if (params.get("canceled")) {
      toast.error("Payment canceled");
    }
  }, []);

  const handleUpgrade = async (planId) => {
    if (planId === "free") return;
    if (planId === user?.plan) {
      toast.error("You are already on this plan");
      return;
    }
    setUpgrading(planId);
    try {
      const { data } = await api.post("/stripe/create-checkout-session", {
        plan: planId,
      });
      window.location.href = data.url;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create checkout");
    } finally {
      setUpgrading(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription?")) return;
    try {
      await api.post("/stripe/cancel");
      toast.success("Subscription cancelled");
      updateUser({ ...user, plan: "free" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel");
    }
  };

  const planColors = {
    free: { border: "border-gray-800", button: "bg-gray-800 hover:bg-gray-700", badge: "bg-gray-700" },
    pro: { border: "border-blue-500", button: "bg-blue-600 hover:bg-blue-700", badge: "bg-blue-600" },
    enterprise: { border: "border-purple-500", button: "bg-purple-600 hover:bg-purple-700", badge: "bg-purple-600" },
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
              <span className="font-bold">Billing & Plans</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-gray-400 text-lg">
            Upgrade to unlock more generations and features
          </p>
        </div>

        {/* Current Plan Banner */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-10 flex items-center gap-3">
          <CreditCard size={20} className="text-blue-400" />
          <span className="text-gray-300">
            Current plan:{" "}
            <span className="font-semibold text-white capitalize">{user?.plan}</span>
          </span>
          {user?.plan !== "free" && (
            <button onClick={handleCancel}
              className="ml-auto text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition">
              <AlertCircle size={14} /> Cancel Subscription
            </button>
          )}
        </div>

        {/* Plans */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const colors = planColors[plan.id];
              const isCurrent = user?.plan === plan.id;
              const isPopular = plan.id === "pro";

              return (
                <div key={plan.id}
                  className={`relative bg-gray-900 border-2 rounded-2xl p-8 flex flex-col ${colors.border} ${isCurrent ? "ring-2 ring-blue-500/30" : ""}`}>
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded-full font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  {isCurrent && (
                    <div className="absolute -top-4 right-4">
                      <span className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold">
                        Current
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-gray-400">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-300">
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-blue-400" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrent || upgrading === plan.id || plan.id === "free"}
                    className={`w-full py-3 rounded-xl font-semibold transition ${
                      isCurrent
                        ? "bg-green-600/20 text-green-400 cursor-default"
                        : plan.id === "free"
                        ? "bg-gray-800 text-gray-500 cursor-default"
                        : `${colors.button} text-white`
                    }`}>
                    {upgrading === plan.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : isCurrent ? (
                      "✓ Current Plan"
                    ) : plan.id === "free" ? (
                      "Free Forever"
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Test card info */}
        <div className="mt-10 bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-300 font-medium mb-1">Test Mode — No real charges</p>
            <p className="text-xs text-gray-500">
              Use card number <span className="font-mono text-yellow-400">4242 4242 4242 4242</span> with any future expiry and any CVC to test payments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}