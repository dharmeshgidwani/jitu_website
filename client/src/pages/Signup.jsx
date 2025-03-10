import { useState } from "react";
import axios from "axios";
import "../css/Signup.css"; 

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async () => {
    try {
      await axios.post("http://localhost:5001/api/auth/signup", form);
      setShowOtpField(true);
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      await axios.post("http://localhost:5001/api/auth/verify-otp", { email: form.email, otp });
      alert("Email Verified! Please login.");
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Signup</h2>
        <input type="text" name="name" placeholder="Name" onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} />
        <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} />
        <button className="signup-btn" onClick={handleSignup}>Signup</button>

        {showOtpField && (
          <>
            <input type="text" placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} />
            <button className="otp-btn" onClick={handleVerifyOTP}>Verify OTP</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Signup;
