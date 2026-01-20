import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { testService } from '../services/testService';

const TestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLab, setSelectedLab] = useState(null);

  useEffect(() => {
    loadTest();
  }, [id]);

  const loadTest = async () => {
    setLoading(true);
    try {
      const response = await testService.getTestById(id);
      setTest(response.data);
      if (response.data.pricing && response.data.pricing.length > 0) {
        setSelectedLab(response.data.pricing[0].lab_partner_id);
      }
    } catch (error) {
      console.error('Error loading test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = () => {
    if (!selectedLab) {
      alert('Please select a lab partner');
      return;
    }
    navigate(`/book-test/${id}?lab=${selectedLab}`);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading test details...</div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="container">
        <div className="error">Test not found</div>
      </div>
    );
  }

  const selectedLabPricing = test.pricing?.find(
    (p) => p.lab_partner_id === selectedLab
  );

  return (
    <div className="test-detail-page">
      <div className="container">
        <Link to="/tests" className="back-link">
          ← Back to Tests
        </Link>

        <div className="test-detail-header">
          <h1>{test.name}</h1>
          <span className="test-code">{test.code}</span>
        </div>

        <div className="test-detail-content">
          <div className="test-info-section">
            <h2>Test Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Category</label>
                <p>{test.category_name || 'Uncategorized'}</p>
              </div>
              <div className="info-item">
                <label>Sample Type</label>
                <p>{test.sample_type}</p>
              </div>
              {test.fasting_required && (
                <div className="info-item">
                  <label>Fasting Required</label>
                  <p>Yes</p>
                </div>
              )}
              {test.turnaround_time_hours && (
                <div className="info-item">
                  <label>Turnaround Time</label>
                  <p>{test.turnaround_time_hours} hours</p>
                </div>
              )}
            </div>

            {test.description && (
              <div className="description-section">
                <h3>Description</h3>
                <p>{test.description}</p>
              </div>
            )}

            {test.special_instructions && (
              <div className="instructions-section">
                <h3>Special Instructions</h3>
                <p>{test.special_instructions}</p>
              </div>
            )}

            {test.related_tests && test.related_tests.length > 0 && (
              <div className="related-tests-section">
                <h3>Related Tests</h3>
                <div className="related-tests-list">
                  {test.related_tests.map((relatedTest) => (
                    <Link
                      key={relatedTest.id}
                      to={`/tests/${relatedTest.id}`}
                      className="related-test-link"
                    >
                      {relatedTest.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pricing-section">
            <h2>Price Comparison</h2>
            {test.pricing && test.pricing.length > 0 ? (
              <>
                <div className="lab-selector">
                  <label>Select Lab Partner:</label>
                  <select
                    value={selectedLab || ''}
                    onChange={(e) => setSelectedLab(e.target.value)}
                  >
                    {test.pricing.map((price) => (
                      <option key={price.lab_partner_id} value={price.lab_partner_id}>
                        {price.lab_partner_name} - AED {parseFloat(price.price).toFixed(2)}
                        {price.rating && ` (⭐ ${price.rating})`}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedLabPricing && (
                  <div className="selected-lab-details">
                    <div className="price-card">
                      <div className="price-main">
                        <span className="price-label">Price</span>
                        <span className="price-value">
                          AED {parseFloat(selectedLabPricing.price).toFixed(2)}
                        </span>
                      </div>
                      <div className="lab-info">
                        <h4>{selectedLabPricing.lab_partner_name}</h4>
                        {selectedLabPricing.rating && (
                          <p>
                            ⭐ {selectedLabPricing.rating} ({selectedLabPricing.total_reviews}{' '}
                            reviews)
                          </p>
                        )}
                        {selectedLabPricing.turnaround_time_hours && (
                          <p>Turnaround: {selectedLabPricing.turnaround_time_hours} hours</p>
                        )}
                      </div>
                    </div>
                    <button onClick={handleBook} className="btn btn-primary btn-large">
                      Book This Test
                    </button>
                  </div>
                )}

                <div className="all-pricing-table">
                  <h3>All Available Labs</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Lab Partner</th>
                        <th>Price</th>
                        <th>Rating</th>
                        <th>Turnaround Time</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {test.pricing.map((price) => (
                        <tr key={price.lab_partner_id}>
                          <td>{price.lab_partner_name}</td>
                          <td>AED {parseFloat(price.price).toFixed(2)}</td>
                          <td>
                            {price.rating ? (
                              <>
                                ⭐ {price.rating} ({price.total_reviews})
                              </>
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td>
                            {price.turnaround_time_hours
                              ? `${price.turnaround_time_hours} hours`
                              : 'N/A'}
                          </td>
                          <td>
                            <button
                              onClick={() => {
                                setSelectedLab(price.lab_partner_id);
                                handleBook();
                              }}
                              className="btn btn-outline btn-small"
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="no-pricing">
                <p>No pricing available for this test</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDetail;
