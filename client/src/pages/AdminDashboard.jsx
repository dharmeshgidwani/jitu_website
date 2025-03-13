import { useEffect, useState } from "react";
import axios from "axios";
import "../css/AdminDashboard.css";

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [Details, setDetails] = useState("");
  const [ExtraDetails, setExtraDetails] = useState("");
  const [price, setPrice] = useState("");
  const [editingCourse, setEditingCourse] = useState(null);
  const [view, setView] = useState("add");
  const [completedBookings, setCompletedBookings] = useState([]);
  const [incompleteBookings, setIncompleteBookings] = useState([]);
  const [examMonth, setExamMonth] = useState("");

  useEffect(() => {
    console.log("Local", localStorage.getItem("token"));
    fetchCourses();
    fetchBookings();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("📌 Retrieved token before request:", token); 
  
      if (!token) {
        console.warn("⚠️ No token found! Redirecting to login...");
        alert("Unauthorized! Please log in again.");
        return;
      }
  
      const response = await axios.get("http://localhost:5001/api/courses/admin/courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log("📢 Admin Course Data Received:", response.data);
  
      const courseData = Array.isArray(response.data.courses) ? response.data.courses : [];
      setCourses(courseData);
    } catch (error) {
      console.error("❌ Error fetching admin courses:", error.response);
      alert(error.response?.data?.message || "Failed to fetch courses");
      setCourses([]); 
    }
  };
  
  
  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("🚨 No token found.");
        return;
      }

      console.log("🔵 Fetching bookings...");
      const { data } = await axios.get(
        "http://localhost:5001/api/courses/bookings",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!data || !data.bookings) {
        console.error("❌ API response does not contain 'bookings'", data);
        return;
      }

      const completed = data.bookings.filter((booking) => booking.isCompleted);
      const incomplete = data.bookings.filter(
        (booking) => !booking.isCompleted
      );

      console.log("✅ Completed Bookings:", completed);
      console.log("🟡 Incomplete Bookings:", incomplete);

      setCompletedBookings(completed);
      setIncompleteBookings(incomplete);
    } catch (error) {
      console.error(
        "❌ Error fetching bookings:",
        error.response?.data || error.message
      );
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
      ExtraDetails,
      price,
      examMonth: examMonth?.trim() || null
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
        await axios.post(
          "http://localhost:5001/api/courses",
          courseData,
          config
        );
        alert("Course added successfully");
      }

      setTitle("");
      setDescription("");
      setDetails("");
      setExtraDetails("");
      setPrice("");
      setEditingCourse(null);
      fetchCourses();
      setView("add");
      setExamMonth("");
    } catch (error) {
      console.error("Error saving course:", error);
      alert(error.response?.data?.message || "Failed to save course");
    }
  };

  const handleMarkAsCompleted = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("🚨 No token found.");
        return;
      }

      const response = await axios.put(
        `http://localhost:5001/api/courses/bookings/${bookingId}/complete`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("✅ Booking marked as completed:", response.data);

      await fetchBookings();
    } catch (error) {
      console.error(
        "❌ Error marking booking as completed:",
        error.response?.data || error.message
      );
    }
  };

  const handleMarkAsIncomplete = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/courses/bookings/mark-as-incomplete/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error("Failed to update booking");

      fetchBookings();
    } catch (error) {
      console.error("Error marking as incomplete:", error);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("🚨 No token found.");
        return;
      }

      await axios.delete(
        `http://localhost:5001/api/courses/bookings/${bookingId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("🗑️ Booking deleted successfully.");

      await fetchBookings();
    } catch (error) {
      console.error(
        "❌ Error deleting booking:",
        error.response?.data || error.message
      );
    }
  };

  const handleSendMail = (email) => {
    window.location.href = `mailto:${email}`;
  };

  const handleEditSelect = (course) => {
    setTitle(course.title);
    setDescription(course.description);
    setDetails(course.Details);
    setExtraDetails(course.ExtraDetails);
    setPrice(course.price);
    setEditingCourse(course);
    setView("add");
    setExamMonth(course.examMonth || "");
  };

  const handleDelete = async (courseId) => {
    console.log("course id", courseId);
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
        <button onClick={() => setView("bookings")} className="booking-btn">
          Booking Requests
        </button>
      </div>
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
            value={ExtraDetails}
            onChange={(e) => setExtraDetails(e.target.value)}
            required
          ></textarea>

          {/* New dropdown for selecting Exam Month */}
          <select
            value={examMonth}
            onChange={(e) => setExamMonth(e.target.value)}
          >
            <option value="">Select Exam Month (Optional)</option>
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>

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
                  <strong>Details:</strong> {course.Details}
                </p>{" "}
                {/* ✅ Match backend field */}
                <p>
                  <strong>Extra Details:</strong> {course.ExtraDetails}
                </p>{" "}
                {/* ✅ Corrected */}
                <p>
                  <strong>Price:</strong> ₹{course.price}
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
                  <strong>Details:</strong> {course.Details}
                </p>{" "}
                {/* ✅ Match backend field */}
                <p>
                  <strong>Extra Details:</strong> {course.ExtraDetails}
                </p>{" "}
                {/* ✅ Corrected */}
                <p>
                  <strong>Price:</strong> ₹{course.price}
                </p>
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
      {view === "bookings" && (
        <div>
          <h2 className="booking-header">Booking Requests</h2>

          {completedBookings.length === 0 && incompleteBookings.length === 0 ? (
            <p className="no-bookings">No booking requests found.</p>
          ) : (
            <div className="booking-list">
              {/* Incomplete Bookings Section */}
              {incompleteBookings.length > 0 && (
                <>
                  <h3 className="incomplete-title">📌 Pending Requests</h3>
                  <div className="booking-grid">
                    {incompleteBookings.map((booking) => (
                      <div
                        key={booking._id}
                        className="booking-card incomplete"
                      >
                        <h3>📖 {booking.courseTitle}</h3>
                        <p>
                          <strong>📅 Joining Date:</strong>{" "}
                          {booking.joiningDate}
                        </p>
                        <p>
                          <strong>👤 Name:</strong> {booking.name}
                        </p>
                        <p>
                          <strong>✉️ Email:</strong> {booking.email}
                        </p>
                        <p>
                          <strong>📞 Phone:</strong> {booking.phone}
                        </p>
                        <p>
                          <strong>🕒 Requested On:</strong>{" "}
                          {new Date(booking.createdAt).toLocaleString()}
                        </p>

                        <div className="booking-actions">
                          <button
                            className="mail-btn"
                            onClick={() => handleSendMail(booking.email)}
                          >
                            📧 Mail
                          </button>
                          <button
                            className="complete-btn"
                            onClick={() => handleMarkAsCompleted(booking._id)}
                          >
                            ✅ Mark as Completed
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteBooking(booking._id)}
                          >
                            ❌ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Completed Bookings Section */}
              {completedBookings.length > 0 && (
                <>
                  <h3 className="completed-title">✅ Completed Bookings</h3>
                  <div className="booking-grid">
                    {completedBookings.map((booking) => (
                      <div key={booking._id} className="booking-card completed">
                        <h3>📖 {booking.courseTitle}</h3>
                        <p>
                          <strong>📅 Joining Date:</strong>{" "}
                          {booking.joiningDate}
                        </p>
                        <p>
                          <strong>👤 Name:</strong> {booking.name}
                        </p>
                        <p>
                          <strong>✉️ Email:</strong> {booking.email}
                        </p>
                        <p>
                          <strong>📞 Phone:</strong> {booking.phone}
                        </p>
                        <p>
                          <strong>🕒 Completed On:</strong>{" "}
                          {new Date(booking.createdAt).toLocaleString()}
                        </p>

                        <div className="booking-actions">
                          <button
                            className="incomplete-btn"
                            onClick={() => handleMarkAsIncomplete(booking._id)}
                          >
                            🔄 Mark as Incomplete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
