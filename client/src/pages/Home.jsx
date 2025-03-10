import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // ✅ Import Link
import "../css/Home.css"; // Import updated CSS

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/courses");
        console.log("Courses API Response:", response.data);
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Categories for filtering
  const filters = ["All", "Veg", "Non-Veg", "Snacks", "Breakfast", "Dessert"];

  // Filter courses based on search and selected category
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "All" || course.categories.includes(selectedFilter);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <h1>Empowering Teachers to Build the Future</h1>
        <p>
          At <span className="highlight">Teachers for Doctors</span>, we believe
          that **quality education** is the foundation of every profession. We
          provide **top-notch courses** to shape future doctors, engineers, and
          innovators.
        </p>
        <p>
          Join us and take a step towards **transforming lives through
          education**.
        </p>
      </section>

      <div className="home-hero">
        <h2>What is Plab</h2>
        <p>
          The Professional and Linguistic Assessment Board (PLAB) test is the
          main route by which International Medical Graduates (IMGs) demonstrate
          that they have the necessary skills and knowledge to practise medicine
          in the UK. International medical graduates who completed their degree
          outside the UK, EEA, or Switzerland. Those who do not have a
          recognised postgraduate qualification that grants GMC registration
          directly.
        </p>
         <h2>Why Choose Us?</h2>  
        <p>
          We offer a structured revision plan for
          intermediate-level candidates preparing for exams. Our approach
          includes: System-wise Preparation: Detailed study and revision of each
          system with a structured plan. Targeted Mock Exams: Regular
          system-specific mocks with in-depth performance analysis. Personalized
          Feedback: Detailed reviews to improve history-taking skills and
          identify strengths & weaknesses. Cost-Effective Solution: Unlike
          others offering single mocks at the same price, we provide a full
          schedule of exams and feedback.
        </p>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="filter-container">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`filter-button ${
              selectedFilter === filter ? "active" : ""
            }`}
            onClick={() => setSelectedFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Courses Section */}
      <h2 className="courses-heading">Available Courses</h2>

      {loading ? (
        <p className="loading-text">Loading...</p>
      ) : (
        <div className="courses-grid">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                token={course.token}
              />
            ))
          ) : (
            <p className="no-results">No courses found.</p>
          )}
        </div>
      )}
    </div>
  );
};

// ✅ Separate CourseCard Component with Link to Course Details Page
const CourseCard = ({ course, token }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
  console.log(course.token);

  return (
    <Link to={`/${token}`} className="course-card-link">
      <div className="course-card">
        <div className="image-slider">
          {course.images.length > 1 && (
            <button
              className="prev-btn"
              onClick={(e) => {
                e.preventDefault();
                handlePrevImage();
              }}
            >
              ❮
            </button>
          )}

          <img
            src={`http://localhost:5001${
              course.images[currentImageIndex]
            }?t=${new Date().getTime()}`}
            alt="img not found"
            className="course-image"
            onError={(e) => (e.target.src = "/default-image.jpg")}
          />

          {course.images.length > 1 && (
            <button
              className="next-btn"
              onClick={(e) => {
                e.preventDefault();
                handleNextImage();
              }}
            >
              ❯
            </button>
          )}
        </div>

        <div className="course-info">
          <h3 className="course-title">{course.title}</h3>
          <p className="course-description">{course.description}</p>
        </div>
      </div>
    </Link>
  );
};

export default Home;
