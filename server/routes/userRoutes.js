const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  addContact,
  resetPassword,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/contacts", protect, addContact);

module.exports = router;
