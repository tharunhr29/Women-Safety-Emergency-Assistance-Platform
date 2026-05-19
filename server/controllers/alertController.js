const Alert = require("../models/Alert");

// @desc    Create new alert
// @route   POST /api/alerts
// @access  Private
const createAlert = async (req, res) => {
  const { lat, lng, address } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ message: "Location is required" });
  }

  // Check if user is banned from using SOS
  if (req.user.sosBanUntil && new Date(req.user.sosBanUntil) > Date.now()) {
    const banEndDate = new Date(req.user.sosBanUntil).toLocaleDateString();
    return res.status(403).json({ message: `SOS feature is disabled until ${banEndDate} due to multiple false alarms.` });
  }

  const alert = await Alert.create({
    userId: req.user._id,
    location: { lat, lng, address },
  });

  if (alert) {
    res.status(201).json(alert);
  } else {
    res.status(400).json({ message: "Invalid alert data" });
  }
};

// @desc    Get user's alert history
// @route   GET /api/alerts/history
// @access  Private
const getAlertHistory = async (req, res) => {
  const alerts = await Alert.find({ userId: req.user._id }).sort({ timestamp: -1 });
  res.json(alerts);
};

// @desc    Resolve alert
// @route   PUT /api/alerts/:id/resolve
// @access  Private
const resolveAlert = async (req, res) => {
  const alert = await Alert.findById(req.params.id);

  if (alert) {
    if (alert.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    alert.status = "resolved";
    alert.resolvedAt = Date.now();
    const updatedAlert = await alert.save();
    res.json(updatedAlert);
  } else {
    res.status(404).json({ message: "Alert not found" });
  }
};

// @desc    Get all active alerts (for volunteers)
// @route   GET /api/alerts/active
// @access  Private (Volunteer only ideally, but we'll protect the route)
const getActiveAlerts = async (req, res) => {
  const alerts = await Alert.find({ status: "active" }).populate('userId', 'name phone').sort({ timestamp: -1 });
  res.json(alerts);
};

// @desc    Respond to an alert
// @route   PUT /api/alerts/:id/respond
// @access  Private
const respondToAlert = async (req, res) => {
  const alert = await Alert.findById(req.params.id);

  if (alert) {
    // Check if volunteer is already responding
    const isResponding = alert.responders.find(r => r.volunteerId.toString() === req.user._id.toString());
    
    if (isResponding) {
      return res.status(400).json({ message: "Already responding to this alert" });
    }

    alert.responders.push({ volunteerId: req.user._id });
    const updatedAlert = await alert.save();
    
    // Populate user info for the frontend
    await updatedAlert.populate('userId', 'name phone');
    res.json(updatedAlert);
  } else {
    res.status(404).json({ message: "Alert not found" });
  }
};

// @desc    Update response status (arrived)
// @route   PUT /api/alerts/:id/status
// @access  Private
const updateResponseStatus = async (req, res) => {
  const { status } = req.body;
  const alert = await Alert.findById(req.params.id);

  if (alert) {
    const responderIndex = alert.responders.findIndex(r => r.volunteerId.toString() === req.user._id.toString());
    
    if (responderIndex !== -1) {
      alert.responders[responderIndex].status = status;
      const updatedAlert = await alert.save();
      await updatedAlert.populate('userId', 'name phone');
      res.json(updatedAlert);
    } else {
      res.status(400).json({ message: "Not a responder for this alert" });
    }
  } else {
    res.status(404).json({ message: "Alert not found" });
  }
};

module.exports = {
  createAlert,
  getAlertHistory,
  resolveAlert,
  getActiveAlerts,
  respondToAlert,
  updateResponseStatus
};
