const express = require("express");
const router = express.Router();
const {
  createAlert,
  getAlertHistory,
  resolveAlert,
  getActiveAlerts,
  respondToAlert,
  updateResponseStatus,
  rateResponders
} = require("../controllers/alertController");
const { protect, verifiedVolunteer } = require("../middleware/authMiddleware");

router.post("/", protect, createAlert);
router.get("/history", protect, getAlertHistory);
router.put("/:id/resolve", protect, resolveAlert);
router.put("/:id/rate", protect, rateResponders);

// Volunteer routes
router.get("/active", protect, verifiedVolunteer, getActiveAlerts);
router.put("/:id/respond", protect, verifiedVolunteer, respondToAlert);
router.put("/:id/status", protect, verifiedVolunteer, updateResponseStatus);

module.exports = router;
