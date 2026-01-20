const pool = require('../config/database');
const logger = require('../utils/logger');
const nodemailer = require('nodemailer');
const config = require('../config/env');

// Email transporter (configure with your SMTP settings)
const emailTransporter = nodemailer.createTransport({
  host: config.SMTP_HOST || 'smtp.gmail.com',
  port: config.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

// SMS service (mock - integrate with Twilio, AWS SNS, etc.)
const sendSMS = async (phone, message) => {
  // In production, integrate with Twilio or AWS SNS
  // For now, log the SMS
  logger.info(`SMS to ${phone}: ${message}`);
  return { success: true, message: 'SMS sent (mock)' };
};

/**
 * Send email notification
 */
const sendEmail = async (to, subject, html, text = null) => {
  try {
    const mailOptions = {
      from: config.SMTP_FROM || 'noreply@tasheel.com',
      to: to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, ''),
    };

    const info = await emailTransporter.sendMail(mailOptions);
    logger.info('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Email send error:', error);
    throw error;
  }
};

/**
 * Get notification templates
 */
const getTemplate = (type, data = {}) => {
  const templates = {
    booking_confirmed: {
      subject: 'Booking Confirmed - Tasheel Healthcare',
      html: `
        <h2>Booking Confirmed</h2>
        <p>Dear ${data.user_name || 'User'},</p>
        <p>Your booking has been confirmed!</p>
        <p><strong>Booking Number:</strong> ${data.booking_number}</p>
        <p><strong>Date:</strong> ${data.booking_date}</p>
        <p><strong>Time:</strong> ${data.booking_time}</p>
        <p><strong>Collection Type:</strong> ${data.collection_type === 'home' ? 'Home Collection' : 'Walk-in'}</p>
        <p>We'll notify you when a phlebotomist is assigned.</p>
        <p>Thank you for choosing Tasheel Healthcare!</p>
      `,
    },
    phlebotomist_assigned: {
      subject: 'Phlebotomist Assigned - Tasheel Healthcare',
      html: `
        <h2>Phlebotomist Assigned</h2>
        <p>Dear ${data.user_name || 'User'},</p>
        <p>A phlebotomist has been assigned to your booking.</p>
        <p><strong>Booking Number:</strong> ${data.booking_number}</p>
        <p><strong>Phlebotomist:</strong> ${data.phlebotomist_name}</p>
        <p><strong>Phone:</strong> ${data.phlebotomist_phone}</p>
        ${data.eta ? `<p><strong>Estimated Arrival:</strong> ${data.eta} minutes</p>` : ''}
        <p>Please be ready for sample collection.</p>
      `,
    },
    report_ready: {
      subject: 'Your Lab Report is Ready - Tasheel Healthcare',
      html: `
        <h2>Lab Report Ready</h2>
        <p>Dear ${data.user_name || 'User'},</p>
        <p>Your lab report is now available!</p>
        <p><strong>Report Number:</strong> ${data.report_number}</p>
        <p><strong>Booking Number:</strong> ${data.booking_number}</p>
        <p>View your report: <a href="${data.report_url}">Click here</a></p>
        <p>You can also view your smart health insights and recommendations.</p>
      `,
    },
    payment_confirmed: {
      subject: 'Payment Confirmed - Tasheel Healthcare',
      html: `
        <h2>Payment Confirmed</h2>
        <p>Dear ${data.user_name || 'User'},</p>
        <p>Your payment has been confirmed successfully.</p>
        <p><strong>Booking Number:</strong> ${data.booking_number}</p>
        <p><strong>Amount:</strong> AED ${data.amount}</p>
        <p><strong>Transaction ID:</strong> ${data.transaction_id}</p>
        <p>Thank you for your payment!</p>
      `,
    },
    booking_reminder: {
      subject: 'Booking Reminder - Tasheel Healthcare',
      html: `
        <h2>Booking Reminder</h2>
        <p>Dear ${data.user_name || 'User'},</p>
        <p>This is a reminder for your upcoming booking.</p>
        <p><strong>Booking Number:</strong> ${data.booking_number}</p>
        <p><strong>Date:</strong> ${data.booking_date}</p>
        <p><strong>Time:</strong> ${data.booking_time}</p>
        <p>Please be ready for sample collection.</p>
      `,
    },
    otp: {
      subject: 'Your OTP Code - Tasheel Healthcare',
      html: `
        <h2>OTP Verification</h2>
        <p>Dear ${data.user_name || 'User'},</p>
        <p>Your OTP code is: <strong style="font-size: 24px;">${data.otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      `,
    },
  };

  return templates[type] || null;
};

/**
 * Send notification
 */
const sendNotification = async (userId, type, data, channels = ['email']) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get user details
    const userResult = await client.query(
      'SELECT email, phone, first_name, last_name FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];
    const user_name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';

    // Get notification preferences
    const prefsResult = await client.query(
      'SELECT * FROM user_notification_preferences WHERE user_id = $1',
      [userId]
    );

    const preferences = prefsResult.rows[0] || {
      email_enabled: true,
      sms_enabled: true,
      push_enabled: true,
    };

    // Get template
    const template = getTemplate(type, { ...data, user_name });

    if (!template) {
      throw new Error(`Template not found for type: ${type}`);
    }

    const results = {
      email: null,
      sms: null,
      push: null,
    };

    // Send email
    if (channels.includes('email') && preferences.email_enabled && user.email) {
      try {
        const emailResult = await sendEmail(user.email, template.subject, template.html);
        results.email = emailResult;

        // Log notification
        await client.query(
          `INSERT INTO notifications (
            user_id, type, channel, status, message, created_at
          ) VALUES ($1, $2, $3, $4, $5, NOW())`,
          [userId, type, 'email', 'sent', template.subject]
        );
      } catch (error) {
        logger.error('Email notification error:', error);
        await client.query(
          `INSERT INTO notifications (
            user_id, type, channel, status, message, error_message, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [userId, type, 'email', 'failed', template.subject, error.message]
        );
        results.email = { success: false, error: error.message };
      }
    }

    // Send SMS
    if (channels.includes('sms') && preferences.sms_enabled && user.phone) {
      try {
        const smsMessageText = template.html.replace(/<[^>]*>/g, '').substring(0, 160);
        const smsResult = await sendSMS(user.phone, smsMessageText);
        results.sms = smsResult;

        await client.query(
          `INSERT INTO notifications (
            user_id, type, channel, status, message, created_at
          ) VALUES ($1, $2, $3, $4, $5, NOW())`,
          [userId, type, 'sms', 'sent', smsMessageText]
        );
      } catch (error) {
        logger.error('SMS notification error:', error);
        await client.query(
          `INSERT INTO notifications (
            user_id, type, channel, status, message, error_message, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [userId, type, 'sms', 'failed', smsMessageText, error.message]
        );
        results.sms = { success: false, error: error.message };
      }
    }

    await client.query('COMMIT');

    return {
      success: true,
      results: results,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Send notification error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get user notifications
 */
const getUserNotifications = async (userId, filters = {}) => {
  try {
    const { page = 1, limit = 20, type, status } = filters;
    const offset = (page - 1) * limit;

    let query = `
      SELECT * FROM notifications
      WHERE user_id = $1
    `;

    const values = [userId];
    let paramCount = 2;

    if (type) {
      query += ` AND type = $${paramCount}`;
      values.push(type);
      paramCount++;
    }

    if (status) {
      query += ` AND status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Add pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    return {
      notifications: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Get user notifications error:', error);
    throw error;
  }
};

/**
 * Get notification preferences
 */
const getNotificationPreferences = async (userId) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_notification_preferences WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Create default preferences
      await pool.query(
        `INSERT INTO user_notification_preferences (
          user_id, email_enabled, sms_enabled, push_enabled
        ) VALUES ($1, true, true, true)`,
        [userId]
      );

      const newResult = await pool.query(
        'SELECT * FROM user_notification_preferences WHERE user_id = $1',
        [userId]
      );
      return newResult.rows[0];
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Get notification preferences error:', error);
    throw error;
  }
};

/**
 * Update notification preferences
 */
const updateNotificationPreferences = async (userId, preferences) => {
  try {
    const result = await pool.query(
      `UPDATE user_notification_preferences 
       SET email_enabled = $1,
           sms_enabled = $2,
           push_enabled = $3,
           booking_reminders = $4,
           report_alerts = $5,
           payment_alerts = $6,
           marketing_emails = $7,
           updated_at = NOW()
       WHERE user_id = $8
       RETURNING *`,
      [
        preferences.email_enabled !== undefined ? preferences.email_enabled : true,
        preferences.sms_enabled !== undefined ? preferences.sms_enabled : true,
        preferences.push_enabled !== undefined ? preferences.push_enabled : true,
        preferences.booking_reminders !== undefined ? preferences.booking_reminders : true,
        preferences.report_alerts !== undefined ? preferences.report_alerts : true,
        preferences.payment_alerts !== undefined ? preferences.payment_alerts : true,
        preferences.marketing_emails !== undefined ? preferences.marketing_emails : false,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      // Create preferences if they don't exist
      const insertResult = await pool.query(
        `INSERT INTO user_notification_preferences (
          user_id, email_enabled, sms_enabled, push_enabled,
          booking_reminders, report_alerts, payment_alerts, marketing_emails
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          userId,
          preferences.email_enabled !== undefined ? preferences.email_enabled : true,
          preferences.sms_enabled !== undefined ? preferences.sms_enabled : true,
          preferences.push_enabled !== undefined ? preferences.push_enabled : true,
          preferences.booking_reminders !== undefined ? preferences.booking_reminders : true,
          preferences.report_alerts !== undefined ? preferences.report_alerts : true,
          preferences.payment_alerts !== undefined ? preferences.payment_alerts : true,
          preferences.marketing_emails !== undefined ? preferences.marketing_emails : false,
        ]
      );
      return insertResult.rows[0];
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Update notification preferences error:', error);
    throw error;
  }
};

module.exports = {
  sendNotification,
  getUserNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendEmail,
  sendSMS,
};
