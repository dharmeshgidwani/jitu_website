import { useEffect, useState } from "react";
import axios from "axios";
import "../css/AdminDashboard.css"; // Import the CSS file

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [Details, setDetails] = useState(""); 
  const [ExtraDetails, setExtraDetails] = useState("");
  const [price, setPrice] = useState(""); 
  const [editingCourse, setEditingCourse] = useState(null);
  const [view, setView] = useState("add");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://localhost:5001/api/courses");
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleAddOrUpdateCourse = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Unauthorized! Please log in again.");
      return;
    }

    if (!title || !description || !Details || !ExtraDetails || !price) {
      alert("All fields are required!");
      return;
    }

    const courseData = {
      title,
      description,
      Details, 
      ExtraDetails, // ✅ Send as a string
      price,
    };

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    try {
      if (editingCourse) {
        await axios.put(
          `http://localhost:5001/api/courses/${editingCourse._id}`,
          courseData,
          config
        );
        alert("Course updated successfully");
      } else {
        await axios.post("http://localhost:5001/api/courses", courseData, config);
        alert("Course added successfully");
      }

      setTitle("");
      setDescription("");
      setDetails(""); 
      setExtraDetails(""); // ✅ Reset to empty string
      setPrice(""); 
      setEditingCourse(null);
      fetchCourses();
      setView("add");
    } catch (error) {
      console.error("Error saving course:", error);
      alert(error.response?.data?.message || "Failed to save course");
    }
  };

  const handleEditSelect = (course) => {
    setTitle(course.title);
    setDescription(course.description);
    setDetails(course.Details); // ✅ Match backend field
    setExtraDetails(course.ExtraDetails); // ✅ Match backend field
    setPrice(course.price); 
    setEditingCourse(course);
    setView("add");
  };

  const handleDelete = async (courseId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized! Please log in again.");
      return;
    }

    const confirmation = window.confirm("Are you sure you want to delete this course?");
    if (confirmation) {
      try {
        await axios.delete(`http://localhost:5001/api/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Course deleted successfully");
        fetchCourses();
      } catch (error) {
        console.error("Error deleting course:", error);
        alert("Failed to delete course");
      }
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Dashboard</h1>

      {/* Navigation */}
      <div className="admin-nav">
        <button onClick={() => setView("add")} className="add-btn">Add Course</button>
        <button onClick={() => setView("edit")} className="edit-btn">Edit Course</button>
        <button onClick={() => setView("delete")} className="delete-btn">Delete Course</button>
      </div>

      {/* Add/Edit Course Form */}
      {view === "add" && (
        <form onSubmit={handleAddOrUpdateCourse} className="course-form">
          <input
            type="text"
            placeholder="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Course Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
          <input
            type="text"
            placeholder="Course Includes"
            value={Details} 
            onChange={(e) => setDetails(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          <textarea
            placeholder="Extra Details"
            value={ExtraDetails} // ✅ No need to use `.join("\n")`
            onChange={(e) => setExtraDetails(e.target.value)} // ✅ Set as a string
            required
          ></textarea>

          <button type="submit">
            {editingCourse ? "Update Course" : "Add Course"}
          </button>
        </form>
      )}

      {/* Edit/Delete Course Sections */}
      {view === "edit" && (
        <div>
          <h2>Select a Course to Edit</h2>
          <div className="course-grid">
            {courses.map((course) => (
              <div key={course._id} onClick={() => handleEditSelect(course)} className="course-card edit">
                <h2>{course.title}</h2>
                <p>{course.description}</p>
                <p><strong>Details:</strong> {course.Details}</p> {/* ✅ Match backend field */}
                <p><strong>Extra Details:</strong> {course.ExtraDetails}</p> {/* ✅ Corrected */}
                <p><strong>Price:</strong> ₹{course.price}</p> 
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "delete" && (
        <div>
          <h2>Select a Course to Delete</h2>
          <div className="course-grid">
            {courses.map((course) => (
              <div key={course._id} className="course-card delete">
                <h2>{course.title}</h2>
                <p>{course.description}</p>
                <p><strong>Details:</strong> {course.Details}</p> {/* ✅ Match backend field */}
                <p><strong>Extra Details:</strong> {course.ExtraDetails}</p> {/* ✅ Corrected */}
                <p><strong>Price:</strong> ₹{course.price}</p> 
                <button className="delete-btn" onClick={() => handleDelete(course._id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
