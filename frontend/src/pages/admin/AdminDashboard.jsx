import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: null,
    to: null,
  });

  useEffect(() => {
    if (!user || (user.user_type !== 'admin' && user.user_type !== 'ops')) {
      navigate('/');
      return;
    }
    loadStats();
  }, [dateRange]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await adminService.getDashboardStats(
        dateRange.from,
        dateRange.to
      );
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <div className="date-filter">
            <input
              type="date"
              value={dateRange.from || ''}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              placeholder="From Date"
            />
            <input
              type="date"
              value={dateRange.to || ''}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              placeholder="To Date"
            />
            <button onClick={() => setDateRange({ from: null, to: null })} className="btn btn-outline">
              Clear
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Bookings</h3>
            <p className="stat-value">{stats.bookings.total}</p>
            <div className="stat-breakdown">
              <span>Pending: {stats.bookings.pending}</span>
              <span>Confirmed: {stats.bookings.confirmed}</span>
              <span>Completed: {stats.bookings.completed}</span>
            </div>
          </div>

          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-value">AED {stats.revenue.total.toFixed(2)}</p>
            <p className="stat-subtitle">{stats.revenue.paid_bookings} paid bookings</p>
          </div>

          <div className="stat-card">
            <h3>Users</h3>
            <p className="stat-value">{stats.users.patients}</p>
            <p className="stat-subtitle">Patients</p>
            <div className="stat-breakdown">
              <span>Phlebotomists: {stats.users.phlebotomists}</span>
              <span>Lab Staff: {stats.users.lab_staff}</span>
            </div>
          </div>

          <div className="stat-card">
            <h3>Reports</h3>
            <p className="stat-value">{stats.reports.total}</p>
            <p className="stat-subtitle">{stats.reports.ready} ready</p>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="section">
            <h2>Recent Bookings</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Booking #</th>
                    <th>Patient</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.booking_number}</td>
                      <td>{booking.patient_name}</td>
                      <td>
                        <span className={`status-badge ${booking.booking_status}`}>
                          {booking.booking_status}
                        </span>
                      </td>
                      <td>AED {parseFloat(booking.final_amount).toFixed(2)}</td>
                      <td>{new Date(booking.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                          className="btn btn-sm btn-outline"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button
              onClick={() => navigate('/admin/bookings')}
              className="action-card"
            >
              <h3>Manage Bookings</h3>
              <p>View and manage all bookings</p>
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="action-card"
            >
              <h3>Manage Users</h3>
              <p>View and manage users</p>
            </button>
            <button
              onClick={() => navigate('/admin/phlebotomists')}
              className="action-card"
            >
              <h3>Manage Phlebotomists</h3>
              <p>View and assign phlebotomists</p>
            </button>
            <button
              onClick={() => navigate('/admin/content')}
              className="action-card"
            >
              <h3>Content Management</h3>
              <p>Manage FAQs and Terms</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
