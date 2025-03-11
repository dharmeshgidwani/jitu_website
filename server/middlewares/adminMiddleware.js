const adminMiddleware = (req, res, next) => {
    console.log("🔍 Checking admin role:", req.user.role);
    
    if (req.user.role !== "admin") {
      console.log("❌ Access denied: Not an admin");
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
  
    console.log("✅ Admin access granted!");
    next();
  };
  
  module.exports = { adminMiddleware }; // ✅ Correct Export
  