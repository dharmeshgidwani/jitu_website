const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendOTP = require("../utils/sendOTP");

const router = express.Router();

// Generate random OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Temporary storage for users before OTP verification
global.tempUsers = {};

// ✅ Signup Route
router.post("/signup", async (req, res) => {
  const { name, email, phone, password, examMonth } = req.body;

  try {
    let existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    // Store user data in a temporary global variable
    global.tempUsers[email] = {
      name,
      email,
      phone,
      password: hashedPassword,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000, // 5 mins expiry
      examMonth: examMonth || undefined,
    };

    // Send OTP to email
    await sendOTP(email, otp);

    res.status(200).json({ message: "OTP sent to email. Please verify." });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Verify OTP Route
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Get user from temporary storage
    const userData = global.tempUsers[email];

    if (!userData) return res.status(400).json({ message: "User not found" });

    // Validate OTP
    if (userData.otp !== otp.trim() || userData.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Save user in the database
    const newUser = new User({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password, // Hashed password
      verified: true,
      examMonth: userData.examMonth,
    });

    await newUser.save();

    // Clean up temporary storage
    delete global.tempUsers[email];

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ 
      message: "Email verified successfully",
      token,
      user: {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Error in OTP verification:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.verified) return res.status(400).json({ message: "User not found or not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token, user: { name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
