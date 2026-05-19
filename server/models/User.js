const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  relation: { type: String }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  bloodGroup: { type: String },
  medicalConditions: { type: String },
  emergencyContacts: [emergencyContactSchema],
  lastLocation: {
    lat: { type: Number },
    lng: { type: Number },
    timestamp: { type: Date }
  },
  role: { type: String, enum: ["user", "volunteer", "admin"], default: "user" },
  isVerified: { type: Boolean, default: false },
  falseAlarmCount: { type: Number, default: 0 },
  sosBanUntil: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
