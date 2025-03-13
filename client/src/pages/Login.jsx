import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/Login.css"; // Import the CSS file

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5001/api/auth/login", form);
      const user = res.data.user;

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("🎉 Login Successful!", {
        position: "top-center",
        autoClose: 3000, // Closes after 3 seconds
      });

      setTimeout(() => {
        // 🔹 Redirect Admin to AdminDashboard
        if (user.role === "admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }, 2000); // Slight delay for toast to show before redirect
    } catch (error) {
      toast.error(error.response?.data?.message || "❌ Login failed", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="login-container">
      <ToastContainer /> 

      <div className="login-box">
        <h2>Login</h2>
        <input type="email" name="email" placeholder="Email" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} />
        <button className="login-btn" onClick={handleLogin}>Login</button>

        {/* Signup Redirect */}
        <p className="signup-text">
          New user? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
