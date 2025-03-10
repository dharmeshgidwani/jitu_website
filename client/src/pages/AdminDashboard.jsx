import { useEffect, useState } from "react";
import axios from "axios";
import "../css/AdminDashboard.css"; // Import the CSS file
import imageCompression from "browser-image-compression";

const categoryOptions = ["Veg", "Non-Veg", "Snacks", "Breakfast", "Dessert"];

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cookingTime, setCookingTime] = useState(""); // ✅ Cooking Time
  const [ingredients, setIngredients] = useState([]); // ✅ Ingredients Array
  const [images, setImages] = useState([]); // Store image files
  const [categories, setCategories] = useState([]);
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

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const compressedImages = [];
  
    for (let file of files) {
      try {
        const options = { maxSizeMB: 0.2, maxWidthOrHeight: 800, useWebWorker: true };
        const compressedFile = await imageCompression(file, options);
        compressedImages.push(compressedFile);
      } catch (error) {
        console.error("Image compression error:", error);
      }
    }
  
    setImages(compressedImages);
  };

  const handleCategoryChange = (category) => {
    setCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((c) => c !== category)
        : [...prevCategories, category]
    );
  };

  const handleIngredientsChange = (e) => {
    const value = e.target.value;
    setIngredients(value.split("\n")); // ✅ Splitting ingredients by new line
  };

  const handleAddOrUpdateCourse = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Unauthorized! Please log in again.");
      return;
    }

    if (!title || !description || categories.length === 0 || !cookingTime) {
      alert("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("cookingTime", cookingTime);
    ingredients.forEach((ingredient) =>
      formData.append("ingredients", ingredient)
    );
    categories.forEach((category) => formData.append("categories", category));

    if (images.length > 0) {
      images.forEach((image) => formData.append("images", image));
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      if (editingCourse) {
        await axios.put(
          `http://localhost:5001/api/courses/${editingCourse._id}`,
          formData,
          config
        );
        alert("Course updated successfully");
      } else {
        await axios.post("http://localhost:5001/api/courses", formData, config);
        alert("Course added successfully");
      }

      setTitle("");
      setDescription("");
      setCookingTime("");
      setIngredients([]);
      setCategories([]);
      setImages([]);
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
    setCookingTime(course.cookingTime);
    setIngredients(course.ingredients);
    setCategories(course.categories);
    setImages([]); 
    setEditingCourse(course);
    setView("add");
  };

  const handleDelete = async (courseId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Unauthorized! Please log in again.");
      return;
    }

    const confirmation = window.confirm(
      "Are you sure you want to delete this course?"
    );
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
        <button onClick={() => setView("add")} className="add-btn">
          Add Course
        </button>
        <button onClick={() => setView("edit")} className="edit-btn">
          Edit Course
        </button>
        <button onClick={() => setView("delete")} className="delete-btn">
          Delete Course
        </button>
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
            placeholder="Cooking Time (in minutes)"
            value={cookingTime}
            onChange={(e) => setCookingTime(e.target.value)}
            required
          />
          <textarea
            placeholder="Enter Ingredients (each on a new line)"
            value={ingredients.join("\n")}
            onChange={handleIngredientsChange}
            required
          ></textarea>
          
          <div className="image-input">
          <input
            type="file"
            multiple
            onChange={handleImageChange}
          />
          {/* Show existing images if editing */}
          {editingCourse && editingCourse.images.length > 0 && (
            <div className="existing-images">
              <h4>Existing Images:</h4>
              {editingCourse.images.map((image, index) => (
                <img key={index} src={`http://localhost:5001${image}`} alt={`existing-img-${index}`} />
              ))}
            </div>
          )}
        </div>

          {/* Multi-Select Categories */}
          <div className="category-selector">
            <h3>Select Categories:</h3>
            {categoryOptions.map((cat) => (
              <label key={cat} className="category-label">
                <input
                  type="checkbox"
                  checked={categories.includes(cat)}
                  onChange={() => handleCategoryChange(cat)}
                />
                {cat}
              </label>
            ))}
          </div>

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
              <div
                key={course._id}
                onClick={() => handleEditSelect(course)}
                className="course-card edit"
              >
                <h2>{course.title}</h2>
                <p>{course.description}</p>
                <p>
                  <strong>Cooking Time:</strong> {course.cookingTime} mins
                </p>
                <p>
                  <strong>Ingredients:</strong>
                </p>
                <ul>
                  {course.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
                <p>
                  <strong>Categories:</strong> {course.categories.join(", ")}
                </p>
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
                <p>
                  <strong>Cooking Time:</strong> {course.cookingTime} mins
                </p>
                <p>
                  <strong>Ingredients:</strong>
                </p>
                <ul>
                  {course.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(course._id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
