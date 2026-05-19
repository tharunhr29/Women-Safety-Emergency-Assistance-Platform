const User = require('../models/User');
const Alert = require('../models/Alert');
const SafeZone = require('../models/SafeZone');

// @desc    Get all users (for admin management)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// @desc    Verify a volunteer
// @route   PUT /api/admin/users/:id/verify
// @access  Private/Admin
const verifyVolunteer = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user && user.role === 'volunteer') {
      user.isVerified = true;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified
      });
    } else {
      res.status(404).json({ message: 'Volunteer not found or user is not a volunteer' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error verifying volunteer' });
  }
};

// @desc    Update a user's role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.role = req.body.role || user.role;
      if (user.role === 'volunteer' && !user.isVerified) {
        user.isVerified = false; // Default new volunteers to unverified
      }
      
      const updatedUser = await user.save();
      
      // Notify admins
      if (req.app.get('io')) {
        req.app.get('io').to('admins').emit('admin_data_updated');
      }

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error updating user role' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await User.deleteOne({ _id: user._id });
      
      // Notify admins
      if (req.app.get('io')) {
        req.app.get('io').to('admins').emit('admin_data_updated');
      }

      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

// @desc    Get all alerts for monitoring/reports
// @route   GET /api/admin/alerts
// @access  Private/Admin
const getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({})
      .populate('userId', 'name phone')
      .populate('responders.volunteerId', 'name phone')
      .sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching alerts' });
  }
};

// @desc    Mark an alert as false alarm and penalize user
// @route   PUT /api/admin/alerts/:id/false-alarm
// @access  Private/Admin
const markFalseAlarm = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (alert) {
      alert.status = 'false_alarm';
      alert.resolvedAt = Date.now();
      await alert.save();

      // Find the user and increment false alarm count
      const user = await User.findById(alert.userId);
      if (user) {
        user.falseAlarmCount = (user.falseAlarmCount || 0) + 1;
        
        // If 3 or more false alarms, ban for 15 days
        if (user.falseAlarmCount >= 3) {
          user.sosBanUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 days from now
        }
        await user.save();
      }

      // Notify connected clients to refresh data
      if (req.app.get('io')) {
        req.app.get('io').to('admins').emit('admin_data_updated');
      }

      res.json({ message: 'Alert marked as false alarm and user penalized.' });
    } else {
      res.status(404).json({ message: 'Alert not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error marking false alarm' });
  }
};

// @desc    Get all safe zones
// @route   GET /api/admin/safezones
// @access  Public (so users can see them on the map)
const getSafeZones = async (req, res) => {
  try {
    const safeZones = await SafeZone.find({});
    res.json(safeZones);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching safe zones' });
  }
};

// @desc    Create a safe zone
// @route   POST /api/admin/safezones
// @access  Private/Admin
const createSafeZone = async (req, res) => {
  const { name, type, lat, lng, address, contactNumber } = req.body;

  try {
    const safeZone = new SafeZone({
      name,
      type,
      location: { lat, lng, address },
      contactNumber
    });

    const createdSafeZone = await safeZone.save();
    res.status(201).json(createdSafeZone);
  } catch (error) {
    res.status(400).json({ message: 'Invalid safe zone data' });
  }
};

// @desc    Delete a safe zone
// @route   DELETE /api/admin/safezones/:id
// @access  Private/Admin
const deleteSafeZone = async (req, res) => {
  try {
    const safeZone = await SafeZone.findById(req.params.id);

    if (safeZone) {
      await SafeZone.deleteOne({ _id: safeZone._id });
      res.json({ message: 'Safe zone removed' });
    } else {
      res.status(404).json({ message: 'Safe zone not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting safe zone' });
  }
};

module.exports = {
  getUsers,
  verifyVolunteer,
  updateUserRole,
  deleteUser,
  getAllAlerts,
  markFalseAlarm,
  getSafeZones,
  createSafeZone,
  deleteSafeZone
};
