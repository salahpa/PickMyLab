import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getBookingById } from '../store/slices/bookingSlice';

const PaymentSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentBooking } = useSelector((state) => state.bookings);

  useEffect(() => {
    if (id) {
      dispatch(getBookingById(id));
    }
  }, [id]);

  return (
    <div className="payment-success-page">
      <div className="container">
        <div className="success-content">
          <div className="success-icon">✓</div>
          <h1>Payment Successful!</h1>
          <p className="success-message">
            Your payment has been processed successfully.
          </p>

          {currentBooking && (
            <div className="booking-info">
              <div className="info-item">
                <span>Booking Number:</span>
                <strong>{currentBooking.booking_number}</strong>
              </div>
              <div className="info-item">
                <span>Amount Paid:</span>
                <strong>AED {parseFloat(currentBooking.final_amount).toFixed(2)}</strong>
              </div>
              <div className="info-item">
                <span>Payment Status:</span>
                <strong style={{ color: '#10b981' }}>Completed</strong>
              </div>
            </div>
          )}

          <div className="success-actions">
            <button
              onClick={() => navigate(`/bookings/${id}`)}
              className="btn btn-primary"
            >
              View Booking Details
            </button>
            <button
              onClick={() => navigate('/bookings')}
              className="btn btn-outline"
            >
              My Bookings
            </button>
            <button
              onClick={() => navigate('/tests')}
              className="btn btn-outline"
            >
              Browse More Tests
            </button>
          </div>

          <div className="next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>You will receive a confirmation email shortly</li>
              <li>A phlebotomist will be assigned to your booking</li>
              <li>You'll be notified when the phlebotomist is on the way</li>
              <li>Track your booking status in real-time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
