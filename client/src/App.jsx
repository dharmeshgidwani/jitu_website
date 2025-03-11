import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home.jsx";
import Course from "./pages/Course.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";
import Navbar from "./components/Navbar";
;

const isAdmin = () => {
  const userData = localStorage.getItem("user");
  
  if (!userData || userData === "undefined") return false; 

  try {
    const user = JSON.parse(userData);
    return user && user.role === "admin";
  } catch (error) {
    console.error("Error parsing user data:", error);
    return false;
  }
};



function App() {
  return (
    <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:token" element={<Course />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={<AboutUs />} />
          <Route
            path="/admin"
            element={isAdmin() ? <AdminDashboard /> : <Navigate to="/login" />}
          />
        </Routes>
    </Router>
  );
}

export default App;
