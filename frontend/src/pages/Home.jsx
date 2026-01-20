import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testService } from '../services/testService';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [popularTests, setPopularTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, popularRes] = await Promise.all([
        testService.getCategories(),
        testService.getPopularTests(6),
      ]);
      setCategories(categoriesRes.data);
      setPopularTests(popularRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <h1>Welcome to Tasheel HealthConnect</h1>
          <p>Your trusted lab aggregator platform</p>
          <div className="hero-actions">
            <Link to="/tests" className="btn btn-primary">
              Browse Tests
            </Link>
            <Link to="/register" className="btn btn-outline">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="categories-section">
          <div className="container">
            <h2>Test Categories</h2>
            <div className="categories-grid">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/tests?category_id=${category.id}`}
                  className="category-card"
                >
                  <h3>{category.name}</h3>
                  {category.description && <p>{category.description}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {popularTests.length > 0 && (
        <section className="popular-tests-section">
          <div className="container">
            <h2>Popular Tests</h2>
            <div className="tests-grid">
              {popularTests.map((test) => (
                <div key={test.id} className="test-card-small">
                  <h3>{test.name}</h3>
                  <p className="test-category">{test.category_name}</p>
                  {test.min_price && (
                    <p className="test-price">From AED {test.min_price.toFixed(2)}</p>
                  )}
                  <Link to={`/tests/${test.id}`} className="btn btn-outline btn-small">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
            <div className="section-footer">
              <Link to="/tests" className="btn btn-primary">
                View All Tests
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="features">
        <div className="container">
          <h2>Why Choose Tasheel?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Compare Prices</h3>
              <p>Compare test prices across multiple lab partners</p>
            </div>
            <div className="feature-card">
              <h3>Home Collection</h3>
              <p>Get samples collected at your convenience</p>
            </div>
            <div className="feature-card">
              <h3>Smart Reports</h3>
              <p>Get detailed health insights with interactive reports</p>
            </div>
            <div className="feature-card">
              <h3>Track in Real-time</h3>
              <p>Track your booking status in real-time</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
