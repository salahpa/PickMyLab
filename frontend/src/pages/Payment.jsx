import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [booking, setBooking] = useState(null);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await bookingService.getBookingById(id);
      // Handle response structure - could be response.data.data or response.data
      const bookingData = response.data?.data || response.data;
      setBooking(bookingData);

      // If payment not completed, initiate payment
      if (bookingData.payment_status !== 'completed') {
        await initiatePayment(bookingData);
      }
    } catch (error) {
      console.error('Error loading booking:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to load booking details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (bookingData) => {
    try {
      const response = await paymentService.initiatePayment(id, paymentMethod);
      // Handle response structure
      const paymentData = response.data?.data || response.data;
      setPaymentIntent(paymentData);
    } catch (error) {
      console.error('Error initiating payment:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to initiate payment';
      setError(errorMessage);
      // Don't set loading to false here, let user see the error
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    if (!paymentIntent) {
      setError('Payment not initialized. Please refresh the page.');
      setProcessing(false);
      return;
    }

    try {
      // In production, integrate with Stripe Elements or payment gateway SDK
      // For now, we'll simulate payment confirmation
      
      // Mock payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Confirm payment
      const response = await paymentService.confirmPayment(
        id,
        paymentIntent.payment_intent_id,
        `txn_${Date.now()}`
      );

      // Handle response structure
      const result = response.data?.data || response.data;
      
      if (result.success || response.data?.success) {
        // Navigate to success page
        navigate(`/bookings/${id}/success`);
      } else {
        setError('Payment confirmation failed. Please try again.');
        setProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err.response?.data?.error?.message || err.message || 'Payment failed. Please try again.';
      setError(errorMessage);
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="loading">Loading payment details...</div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="payment-page">
        <div className="container">
          <div className="error-message">
            {error || 'Booking not found'}
          </div>
          <button onClick={() => navigate('/bookings')} className="btn btn-primary">
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  if (booking.payment_status === 'completed') {
    return (
      <div className="container">
        <div className="payment-completed">
          <h2>Payment Already Completed</h2>
          <p>This booking has already been paid.</p>
          <button onClick={() => navigate(`/bookings/${id}`)} className="btn btn-primary">
            View Booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="container">
        <h1>Complete Payment</h1>

        {error && <div className="error-message">{error}</div>}

        <div className="payment-layout">
          <div className="payment-form-section">
            <h2>Payment Details</h2>

            <form onSubmit={handlePayment} className="payment-form">
              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={processing}
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="cash">Cash on Collection</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              {paymentMethod === 'card' && (
                <div className="card-details">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      disabled={processing}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength="5"
                        disabled={processing}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        maxLength="4"
                        disabled={processing}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      disabled={processing}
                      required
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="cash-notice">
                  <p>You will pay cash when the phlebotomist arrives for sample collection.</p>
                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div className="bank-transfer-info">
                  <p>Please transfer the amount to:</p>
                  <div className="bank-details">
                    <p><strong>Bank:</strong> PickMyLab Bank</p>
                    <p><strong>Account Number:</strong> 1234567890</p>
                    <p><strong>IBAN:</strong> AE123456789012345678901</p>
                    <p><strong>Reference:</strong> {booking.booking_number}</p>
                  </div>
                  <p className="note">Please include the booking number as reference.</p>
                </div>
              )}

              <div className="payment-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>AED {parseFloat(booking.total_amount || 0).toFixed(2)}</span>
                </div>
                {booking.discount_amount > 0 && (
                  <div className="summary-row">
                    <span>Discount:</span>
                    <span>-AED {parseFloat(booking.discount_amount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="summary-total">
                  <span>Total Amount:</span>
                  <span className="total-amount">
                    AED {parseFloat(booking.final_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {!paymentIntent && !error && (
                <div className="info-message">
                  Initializing payment...
                </div>
              )}
              
              <button
                type="submit"
                className="btn btn-primary btn-large"
                disabled={processing || !paymentIntent}
              >
                {processing ? 'Processing Payment...' : `Pay AED ${parseFloat(booking.final_amount || 0).toFixed(2)}`}
              </button>
              
              {!paymentIntent && error && (
                <button
                  type="button"
                  onClick={() => initiatePayment(booking)}
                  className="btn btn-outline"
                  style={{ marginTop: '1rem' }}
                >
                  Retry Payment Initialization
                </button>
              )}
            </form>
          </div>

          <div className="booking-summary-section">
            <h2>Booking Summary</h2>
            <div className="summary-card">
              <p><strong>Booking Number:</strong> {booking.booking_number}</p>
              <p><strong>Date:</strong> {new Date(booking.preferred_date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {booking.preferred_time_slot}</p>
              <p><strong>Collection:</strong> {booking.collection_type === 'home' ? 'Home Collection' : 'Walk-in'}</p>
              
              <div className="tests-list">
                <strong>Tests:</strong>
                {booking.tests && booking.tests.length > 0 ? (
                  booking.tests.map((test, index) => (
                    <div key={index} className="test-item">
                      {test.test_name || test.name || 'Test'} - AED {parseFloat(test.price || 0).toFixed(2)}
                    </div>
                  ))
                ) : (
                  <div className="test-item">No tests found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
