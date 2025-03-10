const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const multer = require("multer");
const Course = require("../models/Course");
const path = require("path");
const sharp = require("sharp");
const router = express.Router();
const jwt = require("jsonwebtoken");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); 
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); 
//   }
// });

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
// ✅ Add a new course
router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, categories, ingredients, cookingTime } = req.body;
    const imagePaths = [];

    for (let file of req.files) {
      const filename = `uploads/${Date.now()}-${file.originalname}`;
      await sharp(file.buffer).resize(800).jpeg({ quality: 80 }).toFile(filename);
      imagePaths.push(`/${filename}`);
    }

    const newCourse = new Course({
      title,
      description,
      categories: Array.isArray(categories) ? categories : [categories],
      images: imagePaths,
      ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
      cookingTime,
    });

    await newCourse.save();

    const token = generateCourseToken(newCourse._id);
    console.log("Generated Token:", token);

    res.status(201).json({ course: newCourse, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding course" });
  }
});

// ✅ Update a course 
router.put("/:id", authMiddleware, adminMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, categories, ingredients, cookingTime } = req.body;

    // Find the existing course
    const existingCourse = await Course.findById(req.params.id);
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // If no new images are uploaded, use the existing images
    let imagePaths = existingCourse.images;

    if (req.files.length > 0) {
      // If new images are uploaded, process them
      imagePaths = [];
      for (let file of req.files) {
        const filename = `uploads/${Date.now()}-${file.originalname}`;
        await sharp(file.buffer).resize(800).jpeg({ quality: 80 }).toFile(filename);
        imagePaths.push(`/${filename}`);
      }
    }

    // Update the course with the new data
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { title, description, categories, ingredients, cookingTime, images: imagePaths },
      { new: true }
    );

    res.status(200).json({ message: "Course updated", course: updatedCourse });
  } catch (error) {
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



module.exports = router;
