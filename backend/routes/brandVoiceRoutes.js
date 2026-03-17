const express = require("express");
const router = express.Router();
const {
  analyzeBrandVoice,
  getBrandVoice,
  deleteBrandVoice,
} = require("../controllers/brandVoiceController");
const { protect } = require("../middleware/authMiddleware");

router.post("/analyze", protect, analyzeBrandVoice);
router.get("/", protect, getBrandVoice);
router.delete("/", protect, deleteBrandVoice);

module.exports = router;