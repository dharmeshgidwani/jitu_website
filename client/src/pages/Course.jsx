import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../css/Course.css";

const Course = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (!courseId) {
      console.error("🚨 courseId is missing in useParams!");
      setError("Invalid Course ID.");
      setLoading(false);
      return;
    }

    const fetchCourse = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5001/api/courses/fetch/${courseId}`
        );
        setCourse(data);
      } catch (error) {
        console.error(
          "Error fetching course details:",
          error.response?.data || error.message
        );
        setError("Failed to fetch course details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleBooking = async () => {
    if (!selectedDate) {
      toast.warn("⚠️ Please select a start date before booking.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      toast.error("🚨 User details not found. Please log in again.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    try {
      const bookingDetails = {
        courseId: course._id,
        courseTitle: course.title,
        joiningDate: selectedDate,
        name: user.name,
        email: user.email,
        phone: user.phone,
      };

      await axios.post(
        "http://localhost:5001/api/courses/book-course",
        bookingDetails
      );
      toast.success("✅ Booking request sent successfully!", {
        position: "top-center",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("❌ Failed to book the course. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="course-container">
      <ToastContainer /> {/* ✅ Toast notifications container */}
      {/* Course Header Section */}
      <div className="course-header">
        <div className="course-info">
          <h1 className="course-title">{course.title}</h1>
          <p className="course-meta">
            <span>
              📖 Created by <strong>Dr. G</strong>
            </span>
            <span>{course.description}</span>
          </p>
          <p className="course-rating">⭐ 4.7 (4,699 ratings) | ★★★★★ 5/5</p>
        </div>
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
      {/* ✅ Price Section with Discount */}
      <div className="course-price">
        <span className="original-price">
          Original Price:{" "}
          <span className="strike">£ {Number(course.price) + 250}</span>
        </span>
        <span className="current-price">Now Only: £ {course.price}</span>
      </div>
      {/* Booking Section */}
      <div className="booking-section">
        <h2>🎯 Select Your Course Joining Date</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="date-picker"
        />
        <button className="book-now-btn" onClick={handleBooking}>
          BOOK NOW
        </button>
      </div>
    </div>
  );
};

export default Course;
