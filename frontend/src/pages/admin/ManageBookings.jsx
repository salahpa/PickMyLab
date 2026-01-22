import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';

const ManageBookings = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: '',
    search: '',
    page: 1,
  });
  const [pagination, setPagination] = useState({});
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', notes: '' });

  useEffect(() => {
    if (!user || (user.user_type !== 'admin' && user.user_type !== 'ops')) {
      navigate('/');
      return;
    }
    loadBookings();
  }, [filters.status, filters.date_from, filters.date_to, filters.search, filters.page]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllBookings({
        status: filters.status || undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        user_id: filters.search || undefined,
        page: filters.page,
        limit: 20,
      });
      // Handle response structure
      const data = response.data?.data || response.data;
      setBookings(data?.bookings || []);
      setPagination(data?.pagination || {});
    } catch (error) {
      console.error('Error loading bookings:', error);
      console.error('Error details:', error.response?.data);
      alert(`Error loading bookings: ${error.response?.data?.error?.message || error.message}. Please check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdate.status) {
      alert('Please select a status');
      return;
    }

    try {
      await adminService.updateBookingStatus(
        selectedBooking.id,
        statusUpdate.status,
        statusUpdate.notes
      );
      alert('Booking status updated successfully!');
      setShowStatusModal(false);
      setSelectedBooking(null);
      setStatusUpdate({ status: '', notes: '' });
      loadBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert(error.response?.data?.error?.message || 'Error updating booking status.');
    }
  };

  const openStatusModal = (booking) => {
    setSelectedBooking(booking);
    setStatusUpdate({ status: booking.booking_status, notes: '' });
    setShowStatusModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      confirmed: 'blue',
      completed: 'green',
      cancelled: 'red',
      'sample_collected': 'purple',
      'in_transit': 'orange',
      'at_lab': 'indigo',
    };
    return colors[status] || 'gray';
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="container">
        <div className="loading">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-page-header">
          <h1>Manage Bookings</h1>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Search by user ID..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="input"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="input"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="sample_collected">Sample Collected</option>
            <option value="in_transit">In Transit</option>
            <option value="at_lab">At Lab</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            placeholder="From Date"
            value={filters.date_from}
            onChange={(e) => setFilters({ ...filters, date_from: e.target.value, page: 1 })}
            className="input"
          />
          <input
            type="date"
            placeholder="To Date"
            value={filters.date_to}
            onChange={(e) => setFilters({ ...filters, date_to: e.target.value, page: 1 })}
            className="input"
          />
          <button onClick={() => setFilters({ status: '', date_from: '', date_to: '', search: '', page: 1 })} className="btn btn-outline">
            Clear Filters
          </button>
        </div>

        {showStatusModal && selectedBooking && (
          <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Update Booking Status</h2>
              <p><strong>Booking #:</strong> {selectedBooking.booking_number}</p>
              <p><strong>Patient:</strong> {selectedBooking.patient_name}</p>
              <div className="form-group">
                <label>Status *</label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                  className="input"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="sample_collected">Sample Collected</option>
                  <option value="in_transit">In Transit</option>
                  <option value="at_lab">At Lab</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                  className="input"
                  rows="3"
                  placeholder="Add any notes about this status change..."
                />
              </div>
              <div className="form-actions">
                <button onClick={handleStatusUpdate} className="btn btn-primary">
                  Update Status
                </button>
                <button onClick={() => setShowStatusModal(false)} className="btn btn-outline">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Patient</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.booking_number}</td>
                    <td>
                      {booking.patient_name}
                      <br />
                      <small>{booking.patient_email}</small>
                    </td>
                    <td>
                      {new Date(booking.preferred_date).toLocaleDateString()}
                      <br />
                      <small>{booking.preferred_time_slot}</small>
                    </td>
                    <td>AED {parseFloat(booking.final_amount || 0).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(booking.booking_status)}`}>
                        {booking.booking_status}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${booking.payment_status === 'completed' ? 'green' : 'yellow'}`}>
                        {booking.payment_status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => navigate(`/bookings/${booking.id}`)}
                        className="btn btn-sm btn-outline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openStatusModal(booking)}
                        className="btn btn-sm btn-primary"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.total_pages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="btn btn-outline"
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.total_pages} ({pagination.total} total)
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page >= pagination.total_pages}
              className="btn btn-outline"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;
