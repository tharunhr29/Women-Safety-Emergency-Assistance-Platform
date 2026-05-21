const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: "Not authorized as an admin" });
  }
};

const verifiedVolunteer = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || (req.user.role === 'volunteer' && req.user.isVerified))) {
    next();
  } else if (req.user && req.user.role === 'volunteer') {
    res.status(403).json({ message: "Your volunteer account is pending admin verification. You cannot receive or respond to alerts yet." });
  } else {
    res.status(403).json({ message: "Access restricted to verified volunteers only." });
  }
};

module.exports = { protect, admin, verifiedVolunteer };
