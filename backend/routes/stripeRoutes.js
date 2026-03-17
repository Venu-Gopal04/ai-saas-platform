const express = require("express");
const router = express.Router();
const {
  createCheckoutSession,
  webhook,
  cancelSubscription,
  getPlans,
} = require("../controllers/stripeController");
const { protect } = require("../middleware/authMiddleware");

router.post("/webhook", webhook);
router.get("/plans", getPlans);
router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/cancel", protect, cancelSubscription);

module.exports = router;
