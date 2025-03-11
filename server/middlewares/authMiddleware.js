const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    console.log("🟡 Headers received:", req.headers);

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ Invalid Authorization Header:", authHeader);
      return res.status(401).json({ message: "Unauthorized: Invalid token format" });
    }

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer "
    console.log("🔑 Token received:", token);

    if (!token) {
      console.log("❌ No token found after 'Bearer'");
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded token:", decoded);

    const user = await User.findById(decoded.userId).select("-password");
    console.log("👤 User found:", user);

    if (!user) {
      console.log("❌ User not found in DB!");
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Auth Middleware Error:", error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = { authMiddleware };
