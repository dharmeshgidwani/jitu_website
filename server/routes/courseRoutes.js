const express = require("express");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { adminMiddleware } = require("../middlewares/adminMiddleware");
const multer = require("multer");
const mongoose = require("mongoose");
const Course = require("../models/Course");
const Booking = require("../models/Booking");
const path = require("path");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const generateCourseToken = (courseId) => {
  return jwt.sign({ courseId }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

router.get("/", authMiddleware, async (req, res) => {
  try {
    let courses;

    if (req.user) {
      console.log("🔍 Logged-in user:", req.user._id);

      const user = await User.findById(req.user._id);
      if (!user) {
        console.error("❌ User not found");
        return res.status(400).json({ message: "User not found" });
      }

      console.log("🎯 User's examMonth:", user.examMonth);

      if (user.examMonth) {
        // Show courses that match the user's examMonth OR have no examMonth
        courses = await Course.find({
          $or: [{ examMonth: user.examMonth }, { examMonth: null }],
        }).lean();
      } else {
        // Show courses that don't have an examMonth
        courses = await Course.find({ examMonth: null }).lean();
      }
    } else {
      // If no user, show all courses with no examMonth
      console.log("🌍 Showing only general courses (no examMonth)");
      courses = await Course.find({ examMonth: null }).lean();
    }

    res.status(200).json(courses);
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    res.status(500).json({ message: "Error fetching courses" });
  }
});


// 🔹 GET Courses (Admin Only)
router.get("/admin/courses", authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find().lean();
    res.status(200).json({ message: "Admin access granted", courses });
  } catch (error) {
    console.error("Error fetching admin courses:", error);
    res.status(500).json({ message: "Error fetching admin courses" });
  }
});

// 🔹 POST: Add New Course
router.post("/", authMiddleware, adminMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, ExtraDetails, Details, price, examMonth } = req.body;

    const newCourse = new Course({
      title,
      description,
      ExtraDetails: ExtraDetails?.trim() || "",
      Details,
      price,
      examMonth: examMonth ? examMonth.trim() : null,
    });

    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({ message: "Error adding course" });
  }
});


// 🔹 PUT: Update a Course
router.put("/:id", authMiddleware, adminMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, ExtraDetails, Details, price } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Course ID in :update /id" });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { title, description, ExtraDetails: ExtraDetails?.trim() || "", Details, price },
      { new: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ message: "Course updated", course: updatedCourse });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Error updating course" });
  }
});

// 🔹 DELETE: Remove a Course
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Course ID on delete" });
    }

    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({ message: "Course deleted" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Error deleting course" });
  }
});

// 🔹 POST: Book a Course
router.post("/book-course", async (req, res) => {
  try {
    const { courseId, courseTitle, joiningDate, name, email, phone } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid Course ID on book" });
    }

    const newBooking = new Booking({ courseId, courseTitle, joiningDate, name, email, phone });
    await newBooking.save();

    const subject = `New Course Booking: ${courseTitle}`;
    const text = `
      📢 New Booking!
      ----------------------
      📚 Course: ${courseTitle}
      📅 Date: ${joiningDate}
      
      👤 User:
      🔹 Name: ${name}
      📧 Email: ${email}
      📞 Phone: ${phone}
    `;

    await sendEmail(process.env.EMAIL_USER, subject, text);

    res.status(200).json({ message: "Booking request saved & sent to admin" });
  } catch (error) {
    console.error("Error processing booking:", error);
    res.status(500).json({ message: "Error processing booking request" });
  }
});

// 🔹 GET Course Details (by ID)
router.get("/fetch/:courseId", async (req, res) => {
  try {
    console.log("Received Course ID:", req.params.courseId);

    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid Course ID" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    res.status(200).json(course);
  } catch (error) {
    console.error("❌ Error fetching course details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



// 🔹 GET All Bookings (Admin Only)
router.get("/bookings", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find();

    if (!bookings) {
      return res.status(404).json({ message: "No bookings found" });
    }

    console.log("✅ Sending bookings:", bookings); // Debugging log

    res.json({ bookings }); 
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/bookings/:id/complete", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.isCompleted = true;
    await booking.save();

    console.log("✅ Booking marked as completed:", booking);

    res.json({ message: "Booking marked as completed", booking });
  } catch (error) {
    console.error("❌ Error marking booking as completed:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put('/bookings/mark-as-incomplete/:id', async (req, res) => {
  try {
      const booking = await Booking.findById(req.params.id);
      if (!booking) {
          return res.status(404).json({ message: "Booking not found" });
      }

      booking.isCompleted = false;
      await booking.save();

      res.json({ message: "Booking marked as incomplete", booking });
  } catch (error) {
      res.status(500).json({ message: "Server Error", error });
  }
});




module.exports = router;
