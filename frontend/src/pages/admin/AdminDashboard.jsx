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
    if (!user) {
      navigate('/admin/login');
      return;
    }
    if (user.user_type !== 'admin' && user.user_type !== 'ops') {
      navigate('/admin/login');
      return;
    }
    loadStats();
  }, [dateRange, user, navigate]);

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
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-error">
        <p>Unable to load dashboard data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      {/* Stats Overview */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📅</div>
          <div className="admin-stat-content">
            <h3>Total Bookings</h3>
            <p className="admin-stat-value">{stats.bookings.total}</p>
            <div className="admin-stat-details">
              <span className="admin-stat-badge pending">{stats.bookings.pending} Pending</span>
              <span className="admin-stat-badge confirmed">{stats.bookings.confirmed} Confirmed</span>
              <span className="admin-stat-badge completed">{stats.bookings.completed} Completed</span>
            </div>
          </div>
        </div>

        <div className="admin-stat-card revenue">
          <div className="admin-stat-icon">💰</div>
          <div className="admin-stat-content">
            <h3>Total Revenue</h3>
            <p className="admin-stat-value">AED {parseFloat(stats.revenue.total || 0).toFixed(2)}</p>
            <p className="admin-stat-subtitle">{stats.revenue.paid_bookings} paid bookings</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">👥</div>
          <div className="admin-stat-content">
            <h3>Total Users</h3>
            <p className="admin-stat-value">{stats.users.patients}</p>
            <div className="admin-stat-details">
              <span className="admin-stat-badge">{stats.users.phlebotomists} Phlebotomists</span>
              <span className="admin-stat-badge">{stats.users.lab_staff} Lab Staff</span>
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">📊</div>
          <div className="admin-stat-content">
            <h3>Reports</h3>
            <p className="admin-stat-value">{stats.reports.total}</p>
            <p className="admin-stat-subtitle">{stats.reports.ready} ready for review</p>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="admin-filter-bar">
        <div className="admin-filter-group">
          <label>From Date</label>
          <input
            type="date"
            value={dateRange.from || ''}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="admin-input admin-input-sm"
          />
        </div>
        <div className="admin-filter-group">
          <label>To Date</label>
          <input
            type="date"
            value={dateRange.to || ''}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="admin-input admin-input-sm"
          />
        </div>
        <button 
          onClick={() => setDateRange({ from: null, to: null })} 
          className="admin-btn admin-btn-outline admin-btn-sm"
        >
          Clear Filter
        </button>
      </div>

      {/* Recent Bookings */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2>Recent Bookings</h2>
          <button 
            onClick={() => navigate('/admin/bookings')}
            className="admin-btn admin-btn-outline admin-btn-sm"
          >
            View All
          </button>
        </div>
        
        <div className="admin-table-wrapper">
          <table className="admin-table">
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
              {stats.recent_bookings && stats.recent_bookings.length > 0 ? (
                stats.recent_bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td><strong>{booking.booking_number}</strong></td>
                    <td>{booking.patient_name}</td>
                    <td>
                      <span className={`admin-status-badge ${booking.booking_status}`}>
                        {booking.booking_status}
                      </span>
                    </td>
                    <td>AED {parseFloat(booking.final_amount || 0).toFixed(2)}</td>
                    <td>{new Date(booking.created_at).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => navigate(`/admin/bookings`)}
                        className="admin-btn admin-btn-sm admin-btn-link"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="admin-table-empty">
                    No recent bookings
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-section">
        <h2>Quick Actions</h2>
        <div className="admin-actions-grid">
          <div 
            className="admin-action-card"
            onClick={() => navigate('/admin/bookings')}
          >
            <div className="admin-action-icon">📅</div>
            <h3>Manage Bookings</h3>
            <p>View and manage all bookings</p>
          </div>
          
          <div 
            className="admin-action-card"
            onClick={() => navigate('/admin/users')}
          >
            <div className="admin-action-icon">👥</div>
            <h3>Manage Users</h3>
            <p>View and manage users</p>
          </div>
          
          <div 
            className="admin-action-card"
            onClick={() => navigate('/admin/phlebotomists')}
          >
            <div className="admin-action-icon">💉</div>
            <h3>Manage Phlebotomists</h3>
            <p>View and assign phlebotomists</p>
          </div>
          
          <div 
            className="admin-action-card"
            onClick={() => navigate('/admin/tests')}
          >
            <div className="admin-action-icon">🧪</div>
            <h3>Manage Tests</h3>
            <p>Add, edit, and manage tests</p>
          </div>
          
          <div 
            className="admin-action-card"
            onClick={() => navigate('/admin/categories')}
          >
            <div className="admin-action-icon">📁</div>
            <h3>Manage Categories</h3>
            <p>Manage test categories</p>
          </div>
          
          <div 
            className="admin-action-card"
            onClick={() => navigate('/admin/lab-partners')}
          >
            <div className="admin-action-icon">🏥</div>
            <h3>Manage Lab Partners</h3>
            <p>Add and manage lab partners</p>
          </div>
          
          <div 
            className="admin-action-card"
            onClick={() => navigate('/admin/pricing')}
          >
            <div className="admin-action-icon">💰</div>
            <h3>Manage Pricing</h3>
            <p>Set prices for tests</p>
          </div>
          
          <div 
            className="admin-action-card"
            onClick={() => navigate('/admin/content')}
          >
            <div className="admin-action-icon">📝</div>
            <h3>Content Management</h3>
            <p>Manage FAQs and Terms</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
