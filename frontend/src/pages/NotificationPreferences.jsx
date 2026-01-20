import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { notificationService } from '../services/notificationService';

const NotificationPreferences = () => {
  const { user } = useSelector((state) => state.auth);

  const [preferences, setPreferences] = useState({
    email_enabled: true,
    sms_enabled: true,
    push_enabled: true,
    booking_reminders: true,
    report_alerts: true,
    payment_alerts: true,
    marketing_emails: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await notificationService.getNotificationPreferences();
      if (response.data) {
        setPreferences(response.data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setPreferences({
      ...preferences,
      [key]: value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await notificationService.updateNotificationPreferences(preferences);
      setMessage('Preferences saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="notification-preferences-page">
      <div className="container">
        <h1>Notification Preferences</h1>
        <p className="page-description">
          Manage how you receive notifications from PickMyLab Healthcare
        </p>

        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="preferences-form">
          <div className="preferences-section">
            <h2>Notification Channels</h2>
            <p className="section-description">
              Choose how you want to receive notifications
            </p>

            <div className="preference-item">
              <div className="preference-info">
                <h3>Email Notifications</h3>
                <p>Receive notifications via email</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.email_enabled}
                  onChange={(e) => handleChange('email_enabled', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h3>SMS Notifications</h3>
                <p>Receive notifications via SMS</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.sms_enabled}
                  onChange={(e) => handleChange('sms_enabled', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h3>Push Notifications</h3>
                <p>Receive push notifications in the app</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.push_enabled}
                  onChange={(e) => handleChange('push_enabled', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="preferences-section">
            <h2>Notification Types</h2>
            <p className="section-description">
              Choose which types of notifications you want to receive
            </p>

            <div className="preference-item">
              <div className="preference-info">
                <h3>Booking Reminders</h3>
                <p>Get reminded about upcoming bookings</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.booking_reminders}
                  onChange={(e) => handleChange('booking_reminders', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h3>Report Alerts</h3>
                <p>Get notified when your lab reports are ready</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.report_alerts}
                  onChange={(e) => handleChange('report_alerts', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h3>Payment Alerts</h3>
                <p>Get notified about payment confirmations</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.payment_alerts}
                  onChange={(e) => handleChange('payment_alerts', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="preference-item">
              <div className="preference-info">
                <h3>Marketing Emails</h3>
                <p>Receive promotional emails and health tips</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={preferences.marketing_emails}
                  onChange={(e) => handleChange('marketing_emails', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationPreferences;
