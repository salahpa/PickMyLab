import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../store/slices/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

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
          navigate('/');
        }
      }
    } catch (err) {
      setError(err || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="login-form-container">
          <h2>Login to Your Account</h2>
          {error && <div className="error-message">{error}</div>}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="emailOrPhone">Email or Phone</label>
              <input
                type="text"
                id="emailOrPhone"
                name="emailOrPhone"
                placeholder="Enter your email or phone"
                value={formData.emailOrPhone}
                onChange={handleChange}
                required
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <p className="form-footer">
              Don't have an account? <a href="/register">Sign up</a>
            </p>
            <p className="form-footer">
              <a href="/forgot-password">Forgot password?</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
