import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearError, logout } from '../../store/slices/authSlice';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.emailOrPhone || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const result = await dispatch(
        loginUser({
          emailOrPhone: formData.emailOrPhone,
          password: formData.password,
        })
      ).unwrap();

      if (result) {
        // Check user type and redirect accordingly
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.user_type === 'admin' || user.user_type === 'ops') {
          navigate('/admin');
        } else {
          setError('Access denied. Admin credentials required.');
          dispatch(logout());
        }
      }
    } catch (err) {
      setError(err || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-logo">
              <h1>PickMyLab</h1>
              <p>Admin Portal</p>
            </div>
          </div>
          
          <div className="admin-login-form-wrapper">
            <h2>Admin Login</h2>
            <p className="admin-login-subtitle">Sign in to access the admin dashboard</p>
            
            {error && <div className="error-message">{error}</div>}
            
            <form className="admin-login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="emailOrPhone">Email or Phone</label>
                <input
                  type="text"
                  id="emailOrPhone"
                  name="emailOrPhone"
                  placeholder="admin@pickmylab.com"
                  value={formData.emailOrPhone}
                  onChange={handleChange}
                  required
                  className="admin-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="admin-input"
                />
              </div>
              
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
              >
                Sign In
              </button>
            </form>
            
            <div className="admin-login-footer">
              <p>Patient login? <a href="/login">Go to patient portal</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
