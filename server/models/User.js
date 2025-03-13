const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true }, 
  password: String,
  otp: String,
  otpExpires: Date,
  verified: { type: Boolean, default: false },
  role: { type: String, default: "user" }, 
  examMonth: { type: String, required: false }, 

});

module.exports = mongoose.model("User", userSchema);
