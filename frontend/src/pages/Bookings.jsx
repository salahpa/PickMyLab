import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getUserBookings, cancelBooking } from '../store/slices/bookingSlice';

const Bookings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { bookings, loading, pagination } = useSelector((state) => state.bookings);

  const [statusFilter, setStatusFilter] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadBookings();
  }, [statusFilter]);

  const loadBookings = async () => {
    try {
      await dispatch(getUserBookings({ status: statusFilter || undefined })).unwrap();
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleCancel = (booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a cancellation reason');
      return;
    }

    try {
      await dispatch(
        cancelBooking({ bookingId: bookingToCancel.id, reason: cancelReason })
      ).unwrap();
      setShowCancelModal(false);
      setCancelReason('');
      setBookingToCancel(null);
      loadBookings();
      alert('Booking cancelled successfully');
    } catch (error) {
      alert('Failed to cancel booking: ' + error);
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

  if (loading && bookings.length === 0) {
    return (
      <div className="container">
        <div className="loading">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <div className="container">
        <h1>My Bookings</h1>

        <div className="bookings-filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="sample_collected">Sample Collected</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>No bookings found</p>
            <a href="/tests" className="btn btn-primary">
              Browse Tests
            </a>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div>
                    <h3>Booking #{booking.booking_number}</h3>
                    <p className="booking-date">
                      {new Date(booking.preferred_date).toLocaleDateString()} at{' '}
                      {booking.preferred_time_slot}
                    </p>
                  </div>
                  <div className="booking-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(booking.booking_status) }}
                    >
                      {booking.booking_status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="booking-details">
                  <div className="detail-item">
                    <span className="label">Lab Partner:</span>
                    <span>{booking.lab_partner_name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Total Amount:</span>
                    <span className="amount">AED {parseFloat(booking.final_amount).toFixed(2)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Payment Status:</span>
                    <span>{booking.payment_status}</span>
                  </div>
                </div>

                <div className="booking-actions">
                  <button
                    onClick={() => navigate(`/bookings/${booking.id}`)}
                    className="btn btn-outline"
                  >
                    View Details
                  </button>
                  {booking.payment_status === 'pending' && booking.booking_status !== 'cancelled' && (
                    <button
                      onClick={() => navigate(`/payment/${booking.id}`)}
                      className="btn btn-primary"
                    >
                      Pay Now
                    </button>
                  )}
                  {['pending', 'confirmed'].includes(booking.booking_status) && (
                    <button
                      onClick={() => handleCancel(booking)}
                      className="btn btn-outline"
                      style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Cancel Booking</h2>
              <p>Please provide a reason for cancellation:</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation..."
                rows={4}
                className="cancel-reason-input"
              />
              <div className="modal-actions">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                    setBookingToCancel(null);
                  }}
                  className="btn btn-outline"
                >
                  Close
                </button>
                <button onClick={confirmCancel} className="btn btn-primary">
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;
