import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../css/Home.css"; // Import CSS

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("📌 Retrieved Token:", token);

        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const { data } = await axios.get("http://localhost:5001/api/courses", {
          headers,
        });

        console.log("✅ Course data received:", data);
        setCourses(data);
      } catch (error) {
        console.error("❌ Error fetching courses:", error.response);
        alert(error.response?.data?.message || "Failed to fetch courses");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (sortOrder === "low-to-high") return a.price - b.price;
    if (sortOrder === "high-to-low") return b.price - a.price;
    return 0;
  });

  return (
    <div className="home-container">
      {/* Hero Section */}
      <HeroSection />

      {/* Information Section */}
      <InfoSection />

      {/* Search Bar & Sorting Dropdown */}
      <div className="search-sort-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sort-container">
          <label>Sort by Price:</label>
          <select
            onChange={(e) => setSortOrder(e.target.value)}
            value={sortOrder}
          >
            <option value="">Select</option>
            <option value="low-to-high">Low to High</option>
            <option value="high-to-low">High to Low</option>
          </select>
        </div>
      </div>

      {/* Courses Section */}
      <h2 className="courses-heading">Available Courses</h2>

      {loading ? (
        <p className="loading-text">Loading courses...</p>
      ) : (
        <div className="courses-grid">
          {sortedCourses.length > 0 ? (
            sortedCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))
          ) : (
            <p className="no-results">No courses found.</p>
          )}
        </div>
      )}
    </div>
  );
};

/* ✅ Define the `InfoSection` Component */
const InfoSection = () => (
  <div className="home-hero">
    <div className="info-block">
      <h2>What is PLAB?</h2>
      <p>
        The Professional and Linguistic Assessment Board (PLAB) test is the main
        route by which International Medical Graduates (IMGs) demonstrate that
        they have the necessary skills and knowledge to practice medicine in the
        UK.
      </p>
    </div>
    <div className="info-block">
      <h2>Why Choose Us?</h2>
      <ul>
        <li>System-wise Preparation: Detailed study plans.</li>
        <li>Targeted Mock Exams: Regular system-specific assessments.</li>
        <li>Personalized Feedback: Improve history-taking skills.</li>
        <li>Cost-Effective: Full schedule of exams and feedback.</li>
      </ul>
    </div>
  </div>
);

/* ✅ Define `HeroSection` Component */
const HeroSection = () => (
  <section className="hero-section">
    <h1 className="typing-effect">Keep it Simple yet Effective</h1>
    <p>
      At <span className="highlight">Dr. G</span>, we believe that{" "}
      <strong>quality education</strong> is the foundation of every profession.
      We provide <strong>top-notch courses</strong> to shape future doctors.
    </p>
    <p>
      Join us and take a step towards{" "}
      <strong>transforming lives through education</strong>.
    </p>
  </section>
);

/* ✅ Define `CourseCard` Component */
const CourseCard = ({ course }) => {
  const increasedPrice = Number(course.price) + 250; // Ensure proper addition

  return (
    <Link to={`/course/${course._id}`} className="course-card-link">
      <div className="course-card">
        <div className="course-info">
          <h3 className="course-title">{course.title}</h3>
          <p className="course-description">{course.description}</p>

          {/* ✅ Updated Price Section (Only Increased Price) */}
          <div className="course-price-section">
            <p className="increased-price">Price: £ {increasedPrice}</p>
            <p className="discount-text">DISCOUNT AVAILABLE</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Home;
