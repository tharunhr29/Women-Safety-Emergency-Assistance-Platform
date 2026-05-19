const express = require("express");
const router = express.Router();
const {
  createAlert,
  getAlertHistory,
  resolveAlert,
  getActiveAlerts,
  respondToAlert,
  updateResponseStatus
} = require("../controllers/alertController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createAlert);
router.get("/history", protect, getAlertHistory);
router.put("/:id/resolve", protect, resolveAlert);

// Volunteer routes
router.get("/active", protect, getActiveAlerts);
router.put("/:id/respond", protect, respondToAlert);
router.put("/:id/status", protect, updateResponseStatus);

module.exports = router;
