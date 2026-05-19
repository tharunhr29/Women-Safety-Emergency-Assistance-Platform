const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, confirmPassword, phone, role } = req.body;

  if (!name || !email || !password || !confirmPassword || !phone) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    role: role || "user", // Default to user if not provided
  });

  if (user) {
    // Emit event to admins that data has updated
    if (req.app.get('io')) {
      req.app.get('io').to('admins').emit('admin_data_updated');
    }

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

// @desc    Update profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
    user.medicalConditions = req.body.medicalConditions || user.medicalConditions;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      bloodGroup: updatedUser.bloodGroup,
      medicalConditions: updatedUser.medicalConditions,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// @desc    Add emergency contact
// @route   POST /api/users/contacts
// @access  Private
const addContact = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.emergencyContacts.push(req.body);
    await user.save();
    res.status(201).json(user.emergencyContacts);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// @desc    Reset password using email and phone
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, phone, newPassword } = req.body;

  const user = await User.findOne({ email, phone });

  if (user) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.status(200).json({ message: "Password reset successfully" });
  } else {
    res.status(404).json({ message: "No account found with this email and phone number" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  addContact,
  resetPassword,
};
