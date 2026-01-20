import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getBookingById, getBookingTracking } from '../store/slices/bookingSlice';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentBooking, loading } = useSelector((state) => state.bookings);

  const [tracking, setTracking] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadBooking();
    loadTracking();
  }, [id]);

  const loadBooking = async () => {
    try {
      await dispatch(getBookingById(id)).unwrap();
    } catch (error) {
      console.error('Error loading booking:', error);
    }
  };

  const loadTracking = async () => {
    try {
      const result = await dispatch(getBookingTracking(id)).unwrap();
      setTracking(result);
    } catch (error) {
      console.error('Error loading tracking:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#10b981',
      in_progress: '#2563eb',
      sample_collected: '#8b5cf6',
      completed: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  if (loading && !currentBooking) {
    return (
      <div className="container">
        <div className="loading">Loading booking details...</div>
      </div>
    );
  }

  if (!currentBooking) {
    return (
      <div className="container">
        <div className="error">Booking not found</div>
      </div>
    );
  }

  return (
    <div className="booking-detail-page">
      <div className="container">
        <button onClick={() => navigate('/bookings')} className="back-link">
          ← Back to Bookings
        </button>

        <div className="booking-detail-header">
          <div>
            <h1>Booking #{currentBooking.booking_number}</h1>
            <p className="booking-date">
              Created on {new Date(currentBooking.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="status-badge-large" style={{ backgroundColor: getStatusColor(currentBooking.booking_status) }}>
            {currentBooking.booking_status.replace('_', ' ').toUpperCase()}
          </div>
        </div>

        <div className="booking-tabs">
          <button
            className={activeTab === 'details' ? 'active' : ''}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={activeTab === 'tracking' ? 'active' : ''}
            onClick={() => setActiveTab('tracking')}
          >
            Tracking
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="booking-details-content">
            {currentBooking.payment_status === 'pending' && (
              <div className="payment-prompt">
                <p>Payment pending. Please complete payment to confirm your booking.</p>
                <button
                  onClick={() => navigate(`/payment/${id}`)}
                  className="btn btn-primary"
                >
                  Pay Now
                </button>
              </div>
            )}
            <div className="details-grid">
              <div className="detail-section">
                <h3>Test Information</h3>
                {currentBooking.tests?.map((test, index) => (
                  <div key={index} className="test-item">
                    <h4>{test.test_name}</h4>
                    <p>Code: {test.test_code}</p>
                    <p>Sample: {test.sample_type}</p>
                    <p>Price: AED {parseFloat(test.price).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="detail-section">
                <h3>Lab Partner</h3>
                <p>{currentBooking.lab_partner_name || 'N/A'}</p>
              </div>

              <div className="detail-section">
                <h3>Collection Details</h3>
                <p>
                  <strong>Type:</strong> {currentBooking.collection_type === 'home' ? 'Home Collection' : 'Walk-in'}
                </p>
                {currentBooking.address_line1 && (
                  <div className="address-info">
                    <p>
                      <strong>Address:</strong>
                    </p>
                    <p>
                      {currentBooking.address_line1}
                      {currentBooking.address_line2 && `, ${currentBooking.address_line2}`}
                    </p>
                    <p>
                      {currentBooking.city}, {currentBooking.state} {currentBooking.postal_code}
                    </p>
                  </div>
                )}
                <p>
                  <strong>Date:</strong> {new Date(currentBooking.preferred_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time Slot:</strong> {currentBooking.preferred_time_slot}
                </p>
              </div>

              <div className="detail-section">
                <h3>Payment Information</h3>
                <div className="payment-details">
                  <div className="payment-item">
                    <span>Subtotal:</span>
                    <span>AED {parseFloat(currentBooking.total_amount).toFixed(2)}</span>
                  </div>
                  {currentBooking.discount_amount > 0 && (
                    <div className="payment-item">
                      <span>Discount:</span>
                      <span>-AED {parseFloat(currentBooking.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="payment-total">
                    <span>Total:</span>
                    <span>AED {parseFloat(currentBooking.final_amount).toFixed(2)}</span>
                  </div>
                  <p>
                    <strong>Payment Status:</strong> {currentBooking.payment_status}
                  </p>
                </div>
              </div>

              {currentBooking.special_requirements && (
                <div className="detail-section">
                  <h3>Special Requirements</h3>
                  <p>{currentBooking.special_requirements}</p>
                </div>
              )}

              {currentBooking.phlebotomist && (
                <div className="detail-section">
                  <h3>Phlebotomist</h3>
                  <p>
                    <strong>Name:</strong> {currentBooking.phlebotomist.name}
                  </p>
                  <p>
                    <strong>Phone:</strong> {currentBooking.phlebotomist.phone}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tracking' && tracking && (
          <div className="tracking-content">
            <div className="tracking-status">
              <h3>Current Status: {tracking.current_status.replace('_', ' ').toUpperCase()}</h3>
            </div>

            {tracking.timeline && tracking.timeline.length > 0 && (
              <div className="timeline">
                <h3>Timeline</h3>
                {tracking.timeline.map((event, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <h4>{event.message}</h4>
                      <p>{new Date(event.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tracking.phlebotomist && (
              <div className="phlebotomist-info">
                <h3>Phlebotomist Information</h3>
                <p>
                  <strong>Name:</strong> {tracking.phlebotomist.name}
                </p>
                <p>
                  <strong>Phone:</strong> {tracking.phlebotomist.phone}
                </p>
                {tracking.phlebotomist.eta_minutes && (
                  <p>
                    <strong>ETA:</strong> {tracking.phlebotomist.eta_minutes} minutes
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetail;
