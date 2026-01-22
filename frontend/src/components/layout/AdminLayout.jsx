import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const AdminLayout = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/bookings', label: 'Bookings', icon: '📅' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/phlebotomists', label: 'Phlebotomists', icon: '💉' },
    { path: '/admin/tests', label: 'Tests', icon: '🧪' },
    { path: '/admin/categories', label: 'Categories', icon: '📁' },
    { path: '/admin/lab-partners', label: 'Lab Partners', icon: '🏥' },
    { path: '/admin/pricing', label: 'Pricing', icon: '💰' },
    { path: '/admin/content', label: 'Content', icon: '📝' },
  ];

  useEffect(() => {
    // Close mobile menu on route change
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-logo-link">
            <h2>PickMyLab</h2>
            <span className="admin-badge">Admin</span>
          </Link>
        </div>
        
        <nav className="admin-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            <div className="admin-user-avatar">
              {user?.first_name?.[0] || 'A'}
            </div>
            <div className="admin-user-details">
              <p className="admin-user-name">{user?.first_name || ''} {user?.last_name || ''}</p>
              <p className="admin-user-role">
                <span className="admin-role-badge">{user?.user_type || 'Admin'}</span>
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
      
      {mobileMenuOpen && (
        <div 
          className="admin-mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
      
      <main className="admin-main">
        <div className="admin-header">
          <div className="admin-header-content">
            <button 
              className="admin-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span>☰</span>
            </button>
            <h1 className="admin-page-title">
              {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
            </h1>
            <div className="admin-header-actions">
              <Link to="/" className="admin-btn admin-btn-outline admin-btn-sm" target="_blank">
                View Site
              </Link>
            </div>
          </div>
        </div>
        
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
