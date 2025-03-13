const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    console.log("🟡 Headers received on backend:", req.headers);

    const authHeader = req.headers["authorization"];
    console.log("📌 Received Auth Header:", authHeader);

    // If no token is provided, proceed as a guest
    if (!authHeader) {
      console.log("👤 No token provided, proceeding as guest");
      return next(); // Allow request to proceed without a user
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.log("❌ Invalid Authorization Header format:", authHeader);
      return res.status(401).json({ message: "Unauthorized: Invalid token format" });
    }

    const token = authHeader.split(" ")[1]; 
    console.log("🔹 Extracted Token:", token);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Decoded token:", decoded);
    } catch (err) {
      console.log("❌ JWT Verification Failed:", err);
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    console.log("👤 User found:", user);

    if (!user) {
      console.log("❌ User not found in DB!");
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // ✅ Attach user to request
    next();
  } catch (error) {
    console.error("❌ Auth Middleware Error:", error);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = { authMiddleware };
