const express = require('express');
const router = express.Router();
const {
  getUsers,
  verifyVolunteer,
  updateUserRole,
  deleteUser,
  getAllAlerts,
  markFalseAlarm,
  getSafeZones,
  createSafeZone,
  deleteSafeZone
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// User Management
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/verify', protect, admin, verifyVolunteer);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.delete('/users/:id', protect, admin, deleteUser);

// Alert Monitoring
router.get('/alerts', protect, admin, getAllAlerts);
router.put('/alerts/:id/false-alarm', protect, admin, markFalseAlarm);

// Safe Zone Management
// Note: GET safezones is public (or just protected) so regular users can see them on the map
router.get('/safezones', protect, getSafeZones); 
router.post('/safezones', protect, admin, createSafeZone);
router.delete('/safezones/:id', protect, admin, deleteSafeZone);

module.exports = router;
