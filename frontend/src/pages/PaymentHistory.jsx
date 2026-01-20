import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { paymentService } from '../services/paymentService';

const PaymentHistory = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadPayments();
  }, [filters.status, filters.page]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const response = await paymentService.getPaymentHistory(filters);
      setPayments(response.data.payments);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: '#10b981',
      pending: '#f59e0b',
      failed: '#ef4444',
      refunded: '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && payments.length === 0) {
    return (
      <div className="container">
        <div className="loading">Loading payment history...</div>
      </div>
    );
  }

  return (
    <div className="payment-history-page">
      <div className="container">
        <h1>Payment History</h1>

        <div className="payment-filters">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="status-filter"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {payments.length === 0 ? (
          <div className="no-payments">
            <p>No payments found</p>
          </div>
        ) : (
          <>
            <div className="payments-list">
              {payments.map((payment) => (
                <div key={payment.id} className="payment-card">
                  <div className="payment-header">
                    <div>
                      <h3>Booking #{payment.booking_number}</h3>
                      <p className="payment-date">{formatDate(payment.created_at)}</p>
                    </div>
                    <div className="payment-status">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(payment.status) }}
                      >
                        {payment.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="payment-details">
                    <div className="detail-item">
                      <span className="label">Amount:</span>
                      <span className="amount">AED {parseFloat(payment.amount).toFixed(2)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Payment Method:</span>
                      <span>{payment.payment_method}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Transaction ID:</span>
                      <span className="transaction-id">{payment.transaction_id}</span>
                    </div>
                  </div>

                  <div className="payment-actions">
                    <button
                      onClick={() => navigate(`/bookings/${payment.booking_id}`)}
                      className="btn btn-outline"
                    >
                      View Booking
                    </button>
                    <button
                      onClick={() => navigate(`/payments/${payment.id}/receipt`)}
                      className="btn btn-outline"
                    >
                      Download Receipt
                    </button>
                  </div>
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
      </div>
    </div>
  );
};

export default PaymentHistory;
