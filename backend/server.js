const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const aiRoutes = require("./routes/aiRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const brandVoiceRoutes = require("./routes/brandVoiceRoutes");
const calendarRoutes = require("./routes/calendarRoutes");

dotenv.config();
connectDB();

const app = express();

app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/brand-voice", brandVoiceRoutes);
app.use("/api/calendar", calendarRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "AI SaaS API is running 🚀" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});