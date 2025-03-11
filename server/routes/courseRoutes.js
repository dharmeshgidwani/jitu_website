const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { adminMiddleware } = require("../middlewares/adminMiddleware");
const multer = require("multer");
const Course = require("../models/Course");
const path = require("path");
const sharp = require("sharp");
const router = express.Router();
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const Booking = require("../models/Booking")

// Use memory storage for image uploads (commented out file system storage)
const storage = multer.memoryStorage(); 
const upload = multer({ storage });

const generateCourseToken = (courseId) => {
  return jwt.sign({ courseId }, process.env.JWT_SECRET);
};

// ✅ GET all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    
    const coursesWithToken = courses.map(course => {
      const token = generateCourseToken(course._id); 
      return { ...course.toObject(), token }; 
    });

    res.status(200).json(coursesWithToken);
  } catch (error) {
    console.error("Error fetching courses:", error); 
    res.status(500).json({ message: "Error fetching courses" });
  }
});

// ✅ GET courses (only accessible by admin)
router.get("/admin/courses", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({ message: "Only admins can see this", courses });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin courses" });
  }
});

// ✅ Add a new course
router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, ExtraDetails, Details, price } = req.body;

    const newCourse = new Course({
      title,
      description,
      ExtraDetails: ExtraDetails?.trim() || "", 
      Details,
      price
    });

    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding course" });
  }
});



// ✅ Update a course (Removed categories)
router.put("/:id", authMiddleware, adminMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, ExtraDetails, Details, price } = req.body;

    // Find the existing course
    const existingCourse = await Course.findById(req.params.id);
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Update the course with new data
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { 
        title, 
        description, 
        ExtraDetails: ExtraDetails?.trim() || "",
        Details, 
        price 
      },
      { new: true }
    );

    res.status(200).json({ message: "Course updated", course: updatedCourse });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Error updating course" });
  }
});


// ✅ Delete a course
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);

    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ message: "Course deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting course" });
  }
});

// ✅ Get course details by token
router.get("/:token", async (req, res) => {
  try {
    const { token } = req.params;  
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  

    const course = await Course.findById(decoded.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);  
  } catch (error) {
    console.error("Error decoding token:", error);
    res.status(500).json({ message: "Error fetching course details" });
  }
});

router.post("/book-course", async (req, res) => {
  try {
    const { courseId, courseTitle, joiningDate, name, email, phone } = req.body;

    const newBooking = new Booking({
      courseId,
      courseTitle,
      joiningDate,
      name,
      email,
      phone,
    });

    await newBooking.save(); 

    const subject = `New Course Booking Request: ${courseTitle}`;
    const text = `
      📢 New Booking Request!
      -----------------------------------
      📚 Course: ${courseTitle}
      📅 Joining Date: ${joiningDate}
      
      👤 User Details:
      🔹 Name: ${name}
      📧 Email: ${email}
      📞 Phone: ${phone}
      
      ✅ Please confirm the booking.
    `;

    // Send email to admin
    await sendEmail(process.env.EMAIL_USER, subject, text);

    res.status(200).json({ message: "Booking request saved and sent to admin" });
  } catch (error) {
    console.error("Error processing booking:", error);
    res.status(500).json({ message: "Error processing booking request" });
  }
});
router.get("/bookings", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    console.log("🔵 Admin Authenticated:", req.user);

    const bookings = await Booking.find().sort({ createdAt: -1 });

    console.log("📋 Found Bookings:", bookings);

    res.status(200).json(bookings);
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    res.status(500).json({ message: "Error fetching bookings" });
  }
});



module.exports = router;
