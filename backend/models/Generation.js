const mongoose = require("mongoose");

const generationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["blog", "email", "ad", "summary", "linkedin"],
    required: true,
  },
  prompt: { type: String, required: true },
  content: { type: String, required: true },
  wordCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Generation", generationSchema);