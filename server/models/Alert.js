const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }
  },
  status: { type: String, enum: ["active", "resolved", "dismissed", "false_alarm"], default: "active" },
  timestamp: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  responders: [{
    volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['en_route', 'arrived'], default: 'en_route' },
    timestamp: { type: Date, default: Date.now },
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String }
  }]
});

module.exports = mongoose.model("Alert", alertSchema);
