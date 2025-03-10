import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../css/Course.css"; // Ensure CSS is updated accordingly
//import placeholderImage from "../assets/course-placeholder.jpg"; // Add an image in the assets folder

const Course = () => {
  const { token } = useParams(); 
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/courses/${token}`);
        console.log(response.data);
        setCourse(response.data);
      } catch (error) {
        setError("Failed to fetch course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [token]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="course-container">
      {/* Course Header Section */}
      <div className="course-header">
        <div className="course-info">
          <h1 className="course-title">{course.title}</h1>
          <p className="course-meta">
            <span>📖 Created by <strong>Dr. G</strong></span>
            <span>{course.description}</span>
          </p>
          <p className="course-rating">⭐ 4.7 (4,699 ratings) | ★★★★★ 5/5</p>
        </div>
        {/* <div className="course-image">
          <img src={placeholderImage} alt="Course" />
        </div> */}
      </div>

      {/* Course Overview */}
      <div className="course-section">
        <h2>📌 Course Highlights</h2>
        <ul className="highlights-list">
          <li>✔ Covers all aspects as per GMC Blue Print</li>
          <li>✔ Focus on communication & interpersonal skills</li>
          <li>✔ Up-to-date UK guidelines and protocols</li>
          <li>✔ Dedicated WhatsApp group for discussion</li>
        </ul>
      </div>


      {/* Topics Covered */}
      <div className="course-section">
        <h2>📖 Topics Covered</h2>
        <div className="topics-grid">
          <span>🩺 Medicine</span>
          <span>🔪 Surgery</span>
          <span>👶 Pediatrics</span>
          <span>👩‍⚕️ Gynecology & Obstetrics</span>
          <span>🗣 Communication Skills</span>
          <span>🧠 Psychiatry</span>
          <span>🏥 Common Disease Management</span>

        </div>
      </div>

      {/* Extra Details */}
      {course.ExtraDetails && (
        <div className="extra-details">
          <h2>🔍 Additional Information</h2>
          <p>{course.ExtraDetails}</p>
        </div>
      )}

      {/* Course Details Section */}
      <div className="course-details">
        <h2>📚 Course Includes:</h2>
        <p><strong>💰 Course Fee:</strong> £{course.price}</p>
        <p>{course.Details}</p>
      </div>
      {/* Booking Section */}
      <div className="booking-section">
        <h2>🎯 Batch Dates 2022</h2>
        <p><strong>IOTA3:</strong> 17th December - 24th December 2022 (Only Online, 8 Days)</p>
        <button className="book-now-btn">BOOK NOW</button>
      </div>
    </div>
  );
};

export default Course;
