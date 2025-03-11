import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Signup.css";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [otp, setOtp] = useState("");
  const [showOtpField, setShowOtpField] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async () => {
    try {
      await axios.post("http://localhost:5001/api/auth/signup", form);
      setShowOtpField(true);
      alert("OTP sent to your email. Please enter OTP to verify.");
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const res = await axios.post("http://localhost:5001/api/auth/verify-otp", { email: form.email, otp });

      const user = res.data.user;

      // Save token & full user details in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      alert("Signup Successful! You are now logged in.");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "OTP verification failed");
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
            <button className="verify-btn" onClick={handleVerifyOTP}>Verify OTP</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Signup;
