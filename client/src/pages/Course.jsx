import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/Course.css";

const Course = () => {
  const { token } = useParams(); // Use token directly from URL params
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/courses/${token}`);
        setCourse(response.data);
      } catch (error) {
        setError("Failed to fetch course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [token]);

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === course.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? course.images.length - 1 : prevIndex - 1
    );
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="course-container">
      <h1 className="course-title">{course.title}</h1>

      {/* Image Slider */}
      <div className="image-slider">
        {course.images.length > 1 && (
          <button className="prev-btn" onClick={handlePrevImage}>
            ❮
          </button>
        )}

        <img
          src={`http://localhost:5001${course.images[currentImageIndex]}`}
          alt={course.title}
          className="course-image"
        />

        {course.images.length > 1 && (
          <button className="next-btn" onClick={handleNextImage}>
            ❯
          </button>
        )}
      </div>

      {/* Course Details */}
      <p className="course-description"><strong>Description:</strong> {course.description}</p>
      <p className="course-time"><strong>Cooking Time:</strong> {course.cookingTime} minutes</p>

      {/* Ingredients */}
      <h2 className="ingredients-title">Ingredients:</h2>
      <ul className="ingredients-list">
        {course.ingredients.map((ingredient, index) => (
          <li key={index} className="ingredient-item">{ingredient}</li>
        ))}
      </ul>
    </div>
  );
};

export default Course;
