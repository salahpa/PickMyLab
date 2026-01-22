import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { paymentService } from '../services/paymentService';
import { bookingService } from '../services/bookingService';

const PaymentReceipt = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [payment, setPayment] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadReceipt();
  }, [id]);

  const loadReceipt = async () => {
    setLoading(true);
    setError('');
    try {
      const paymentRes = await paymentService.getPaymentById(id);
      const paymentData = paymentRes.data?.data || paymentRes.data;
      setPayment(paymentData);

      // Load booking if booking_id exists
      if (paymentData.booking_id) {
        try {
          const bookingRes = await bookingService.getBookingById(paymentData.booking_id);
          const bookingData = bookingRes.data?.data || bookingRes.data;
          setBooking(bookingData);
        } catch (bookingError) {
          console.error('Error loading booking:', bookingError);
          // Don't fail the whole receipt if booking fails
        }
      }
    } catch (error) {
      console.error('Error loading receipt:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to load receipt. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In production, this would generate a PDF
    // For now, we'll use print functionality
    handlePrint();
  };

  if (loading) {
    return (
      <div className="payment-receipt-page">
        <div className="container">
          <div className="loading">Loading receipt...</div>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="payment-receipt-page">
        <div className="container">
          <div className="error-message">{error || 'Receipt not found'}</div>
          <button onClick={() => navigate('/payments')} className="btn btn-primary">
            Back to Payment History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-receipt-page">
      <div className="container">
        <div className="receipt-actions">
          <button onClick={() => navigate('/payments')} className="btn btn-outline">
            ← Back
          </button>
          <div className="action-buttons">
            <button onClick={handlePrint} className="btn btn-outline">
              Print
            </button>
            <button onClick={handleDownload} className="btn btn-primary">
              Download PDF
            </button>
          </div>
        </div>

        <div className="receipt-container">
          <div className="receipt">
            {/* Receipt Header */}
            <div className="receipt-header">
              <div className="company-info">
                <h1>PickMyLab</h1>
                <p>Healthcare Platform</p>
                <p>Payment Receipt</p>
              </div>
              <div className="receipt-number">
                <p><strong>Receipt #:</strong> {payment.transaction_id}</p>
                <p><strong>Date:</strong> {new Date(payment.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="receipt-section">
              <h2>Payment Details</h2>
              <div className="receipt-details">
                <div className="detail-row">
                  <span className="label">Transaction ID:</span>
                  <span className="value">{payment.transaction_id}</span>
                </div>
                {payment.payment_intent_id && (
                  <div className="detail-row">
                    <span className="label">Payment Intent ID:</span>
                    <span className="value">{payment.payment_intent_id}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="label">Payment Method:</span>
                  <span className="value">{payment.payment_method?.toUpperCase() || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className={`value status-${payment.status}`}>
                    {payment.status?.toUpperCase() || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Booking Information */}
            {booking && (
              <div className="receipt-section">
                <h2>Booking Information</h2>
                <div className="receipt-details">
                  <div className="detail-row">
                    <span className="label">Booking Number:</span>
                    <span className="value">{booking.booking_number || payment.booking_number}</span>
                  </div>
                  {booking.preferred_date && (
                    <div className="detail-row">
                      <span className="label">Collection Date:</span>
                      <span className="value">
                        {new Date(booking.preferred_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {booking.preferred_time_slot && (
                    <div className="detail-row">
                      <span className="label">Time Slot:</span>
                      <span className="value">{booking.preferred_time_slot}</span>
                    </div>
                  )}
                  {booking.collection_type && (
                    <div className="detail-row">
                      <span className="label">Collection Type:</span>
                      <span className="value">
                        {booking.collection_type === 'home' ? 'Home Collection' : 'Walk-in'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Amount Breakdown */}
            <div className="receipt-section">
              <h2>Amount Breakdown</h2>
              <div className="amount-breakdown">
                <div className="amount-row">
                  <span className="label">Amount Paid:</span>
                  <span className="value amount">AED {parseFloat(payment.amount || 0).toFixed(2)}</span>
                </div>
                {payment.refund_amount > 0 && (
                  <div className="amount-row refund">
                    <span className="label">Refund Amount:</span>
                    <span className="value">-AED {parseFloat(payment.refund_amount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="amount-row total">
                  <span className="label">Total Amount:</span>
                  <span className="value amount">
                    AED {(parseFloat(payment.amount || 0) - parseFloat(payment.refund_amount || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="receipt-footer">
              <p>Thank you for using PickMyLab!</p>
              <p className="footer-note">
                This is an official receipt. Please keep it for your records.
              </p>
              {payment.refund_reason && (
                <div className="refund-note">
                  <p><strong>Refund Reason:</strong> {payment.refund_reason}</p>
                  {payment.refunded_at && (
                    <p><strong>Refunded On:</strong> {new Date(payment.refunded_at).toLocaleDateString()}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;
