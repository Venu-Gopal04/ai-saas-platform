const mongoose = require("mongoose");

const calendarEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, default: "" },
  type: { type: String, enum: ["blog", "email", "ad", "linkedin", "summary"], default: "blog" },
  scheduledDate: { type: Date, required: true },
  status: { type: String, enum: ["planned", "draft", "published"], default: "planned" },
  notes: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("CalendarEvent", calendarEventSchema);