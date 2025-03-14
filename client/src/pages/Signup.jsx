import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/Signup.css";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    examMonth: "",
  });

  const [otp, setOtp] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Signup function with validation
  const handleSignup = async () => {
    if (isLoading) return; // Prevent multiple clicks
  
    const { name, email, phone, password, examMonth } = form;
  
    // ✅ Allow examMonth to be empty
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      toast.error("⚠️ Please fill in all required fields before signing up.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
  
    setIsLoading(true); // Show loading state
  
    try {
      await axios.post("https://jituwebsite.up.railway.app/api/auth/signup", {
        ...form,
        examMonth: examMonth.trim() ? examMonth : null, // ✅ Send null if empty
      });
  
      toast.success("✅ OTP sent to your email. Please enter OTP to verify.", {
        position: "top-center",
        autoClose: 3000,
      });
  
      setShowOtpModal(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed", {
        position: "top-center",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false); // Reset loading state after request
    }
  };
  

  // ✅ Verify OTP function
  const handleVerifyOTP = async () => {
    try {
      const res = await axios.post(
        "https://jituwebsite.up.railway.app/api/auth/verify-otp",
        {
          email: form.email,
          otp: otp.trim(), // Ensure trimmed OTP
        }
      );

      const user = res.data.user;
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("🎉 Signup Successful! You are now logged in.", {
        position: "top-center",
        autoClose: 3000,
      });

      setShowOtpModal(false); // Close OTP popup
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "❌ OTP verification failed",
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
    }
  };

  return (
    <div className="signup-container">
      <ToastContainer /> {/* ✅ Toast notifications container */}
      <div className="signup-box">
        <h2>Signup</h2>
        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        {/* Dropdown for selecting Exam Month */}
        <select name="examMonth" onChange={handleChange}>
          <option value="">Select Exam Month</option>
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="April">April</option>
          <option value="May">May</option>
          <option value="June">June</option>
          <option value="July">July</option>
          <option value="August">August</option>
          <option value="September">September</option>
          <option value="October">October</option>
          <option value="November">November</option>
          <option value="December">December</option>
        </select>

        <button
          className="signup-btn"
          onClick={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? "Please wait..." : "Signup"}
        </button>
      </div>
      {/* OTP Verification Popup */}
      {showOtpModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Verify OTP</h3>
            <input
              type="text"
              placeholder="Enter OTP"
              onChange={(e) => setOtp(e.target.value)}
            />
            <button className="verify-btn" onClick={handleVerifyOTP}>
              Verify OTP
            </button>
            <button
              className="close-btn"
              onClick={() => setShowOtpModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
