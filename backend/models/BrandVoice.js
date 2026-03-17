const mongoose = require("mongoose");

const brandVoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  samples: [{ type: String }],
  analyzedStyle: {
    tone: { type: String, default: "" },
    vocabulary: { type: String, default: "" },
    sentenceStyle: { type: String, default: "" },
    summary: { type: String, default: "" },
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("BrandVoice", brandVoiceSchema);