import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testService } from '../services/testService';

const Tests = () => {
  const [categories, setCategories] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category_id: '',
    search: '',
    min_price: '',
    max_price: '',
    sample_type: '',
    page: 1,
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    loadCategories();
    loadTests();
  }, [filters.page]);

  const loadCategories = async () => {
    try {
      const response = await testService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTests = async () => {
    setLoading(true);
    try {
      const response = await testService.getTests(filters);
      setTests(response.data.tests);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadTests();
  };

  useEffect(() => {
    loadTests();
  }, [filters.category_id, filters.sample_type, filters.min_price, filters.max_price]);

  return (
    <div className="tests-page">
      <div className="container">
        <h1>Browse Tests</h1>

        <div className="tests-layout">
          {/* Sidebar Filters */}
          <aside className="filters-sidebar">
            <h3>Filters</h3>

            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search tests..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </form>

            <div className="filter-group">
              <label>Category</label>
              <select
                value={filters.category_id}
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Sample Type</label>
              <select
                value={filters.sample_type}
                onChange={(e) => handleFilterChange('sample_type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="blood">Blood</option>
                <option value="urine">Urine</option>
                <option value="stool">Stool</option>
                <option value="saliva">Saliva</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                />
              </div>
            </div>

            <button onClick={loadTests} className="btn btn-primary">
              Apply Filters
            </button>
          </aside>

          {/* Main Content */}
          <main className="tests-content">
            {loading ? (
              <div className="loading">Loading tests...</div>
            ) : tests.length === 0 ? (
              <div className="no-results">No tests found</div>
            ) : (
              <>
                <div className="tests-grid">
                  {tests.map((test) => (
                    <div key={test.id} className="test-card">
                      <div className="test-card-header">
                        <h3>{test.name}</h3>
                        <span className="test-code">{test.code}</span>
                      </div>
                      <p className="test-category">{test.category_name || 'Uncategorized'}</p>
                      <p className="test-description">
                        {test.description || 'No description available'}
                      </p>
                      <div className="test-info">
                        <span className="sample-type">Sample: {test.sample_type}</span>
                        {test.fasting_required && (
                          <span className="fasting-badge">Fasting Required</span>
                        )}
                      </div>
                      {test.pricing && test.pricing.length > 0 ? (
                        <div className="test-pricing">
                          <div className="price-range">
                            <span className="price-label">From</span>
                            <span className="price-amount">
                              AED {test.min_price?.toFixed(2)}
                            </span>
                          </div>
                          <p className="labs-count">
                            Available at {test.pricing.length} lab{test.pricing.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      ) : (
                        <div className="test-pricing">
                          <span className="price-unavailable">Price not available</span>
                        </div>
                      )}
                      <Link to={`/tests/${test.id}`} className="btn btn-primary">
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>

                {pagination && pagination.total_pages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                      disabled={filters.page === 1}
                      className="btn btn-outline"
                    >
                      Previous
                    </button>
                    <span>
                      Page {pagination.page} of {pagination.total_pages}
                    </span>
                    <button
                      onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                      disabled={filters.page === pagination.total_pages}
                      className="btn btn-outline"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Tests;
