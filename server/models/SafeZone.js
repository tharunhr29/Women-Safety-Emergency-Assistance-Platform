const mongoose = require("mongoose");

const safeZoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["Police Station", "Hospital", "Volunteer Hub", "Safe Zone"], 
    required: true 
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }
  },
  contactNumber: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SafeZone", safeZoneSchema);
