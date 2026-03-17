const Stripe = require("stripe");
const User = require("../models/User");

// @route POST /api/stripe/create-checkout-session
exports.createCheckoutSession = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
  try {
    const { plan } = req.body;
    const user = await User.findById(req.user.id);

    const priceId = plan === "pro"
      ? process.env.STRIPE_PRO_PRICE_ID
      : process.env.STRIPE_ENTERPRISE_PRICE_ID;

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() },
      });
      customerId = customer.id;
      await User.findByIdAndUpdate(user._id, { stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.CLIENT_URL}/dashboard?success=true`,
      cancel_url: `${process.env.CLIENT_URL}/billing?canceled=true`,
      metadata: { userId: user._id.toString(), plan },
    });

    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/stripe/webhook
exports.webhook = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, sig, process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).json({ message: `Webhook Error: ${error.message}` });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const { userId, plan } = session.metadata;
      await User.findByIdAndUpdate(userId, {
        plan,
        stripeSubscriptionId: session.subscription,
      });
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const user = await User.findOne({ stripeSubscriptionId: subscription.id });
      if (user) await User.findByIdAndUpdate(user._id, { plan: "free" });
      break;
    }
  }
  res.json({ received: true });
};

// @route POST /api/stripe/cancel
exports.cancelSubscription = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });
  try {
    const user = await User.findById(req.user.id);
    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ success: false, message: "No active subscription" });
    }
    await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    await User.findByIdAndUpdate(user._id, { plan: "free", stripeSubscriptionId: null });
    res.status(200).json({ success: true, message: "Subscription cancelled successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/stripe/plans
exports.getPlans = async (req, res) => {
  res.status(200).json({
    success: true,
    plans: [
      {
        id: "free", name: "Free", price: 0,
        features: ["10 generations/month", "500 words/request", "Basic support"],
      },
      {
        id: "pro", name: "Pro", price: 19,
        features: ["100 generations/month", "2000 words/request", "Priority support"],
        priceId: process.env.STRIPE_PRO_PRICE_ID,
      },
      {
        id: "enterprise", name: "Enterprise", price: 49,
        features: ["Unlimited generations", "5000 words/request", "24/7 support"],
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
      },
    ],
  });
};