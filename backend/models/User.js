const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
    select: false,
  },
  plan: {
    type: String,
    enum: ["free", "pro", "enterprise"],
    default: "free",
  },
  usage: {
    wordsGenerated: { type: Number, default: 0 },
    requestsThisMonth: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now },
  },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get plan limits
userSchema.methods.getPlanLimits = function () {
  const limits = {
    free:       { requestsPerMonth: 100,  wordsPerRequest: 500  },
    pro:        { requestsPerMonth: 500, wordsPerRequest: 2000 },
    enterprise: { requestsPerMonth: 9999, wordsPerRequest: 5000 },
  };
  return limits[this.plan];
};

module.exports = mongoose.model("User", userSchema);