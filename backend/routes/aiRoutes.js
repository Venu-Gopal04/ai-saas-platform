const express = require("express");
const router = express.Router();
const { generate, getHistory, getTypes, getSeoScore } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.post("/generate", protect, generate);
router.get("/history", protect, getHistory);
router.get("/types", getTypes);
router.post("/seo-score", protect, getSeoScore);

module.exports = router;