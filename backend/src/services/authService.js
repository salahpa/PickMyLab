const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Hash password using bcrypt
 */
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      phone: user.phone,
      user_type: user.user_type,
    },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRES_IN,
    }
  );
};

/**
 * Register new user
 */
const register = async (userData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if email already exists
    const emailCheck = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [userData.email]
    );

    if (emailCheck.rows.length > 0) {
      throw new Error('Email already registered');
    }

    // Check if phone already exists
    const phoneCheck = await client.query(
      'SELECT id FROM users WHERE phone = $1',
      [userData.phone]
    );

    if (phoneCheck.rows.length > 0) {
      throw new Error('Phone number already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(userData.password);

    // Generate verification token
    const verificationToken = uuidv4();

    // Insert user
    const userResult = await client.query(
      `INSERT INTO users (
        email, phone, password_hash, first_name, last_name,
        date_of_birth, gender, user_type, verification_token, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, email, phone, first_name, last_name, user_type, created_at`,
      [
        userData.email,
        userData.phone,
        passwordHash,
        userData.first_name,
        userData.last_name,
        userData.date_of_birth || null,
        userData.gender || null,
        'patient', // Default user type
        verificationToken,
        false, // Not verified yet
      ]
    );

    const user = userResult.rows[0];

    // Create default notification preferences
    await client.query(
      `INSERT INTO user_notification_preferences (user_id)
       VALUES ($1)`,
      [user.id]
    );

    await client.query('COMMIT');

    // Generate token
    const token = generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type,
        is_verified: false,
      },
      token,
      verification_token: verificationToken,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Registration error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Login user
 */
const login = async (emailOrPhone, password) => {
  try {
    // Find user by email or phone
    const result = await pool.query(
      `SELECT id, email, phone, password_hash, first_name, last_name,
              user_type, is_active, is_verified, date_of_birth, gender
       FROM users
       WHERE email = $1 OR phone = $1`,
      [emailOrPhone]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Generate token
    const token = generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        first_name: user.first_name,
        last_name: user.last_name,
        user_type: user.user_type,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        is_verified: user.is_verified,
      },
      token,
    };
  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
};

/**
 * Get user profile
 */
const getProfile = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT id, email, phone, first_name, last_name, date_of_birth,
              gender, blood_type, profile_image_url, is_verified, created_at
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = result.rows[0];

    // Get medical info
    const medicalInfo = await pool.query(
      'SELECT allergies, medications, chronic_conditions, emergency_contact_name, emergency_contact_phone FROM user_medical_info WHERE user_id = $1',
      [userId]
    );

    // Get addresses
    const addresses = await pool.query(
      'SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [userId]
    );

    return {
      ...user,
      medical_info: medicalInfo.rows[0] || null,
      addresses: addresses.rows,
    };
  } catch (error) {
    logger.error('Get profile error:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
const updateProfile = async (userId, updateData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    const allowedFields = [
      'first_name',
      'last_name',
      'date_of_birth',
      'gender',
      'blood_type',
      'profile_image_url',
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = $${paramCount}`);
        updateValues.push(updateData[field]);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    updateValues.push(userId);
    const updateQuery = `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;

    const result = await client.query(updateQuery, updateValues);
    const user = result.rows[0];

    // Update medical info if provided
    if (updateData.allergies !== undefined || updateData.medications !== undefined || updateData.chronic_conditions !== undefined) {
      const medicalInfoCheck = await client.query(
        'SELECT id FROM user_medical_info WHERE user_id = $1',
        [userId]
      );

      if (medicalInfoCheck.rows.length > 0) {
        // Update existing
        const medicalFields = [];
        const medicalValues = [];
        let medParamCount = 1;

        if (updateData.allergies !== undefined) {
          medicalFields.push(`allergies = $${medParamCount}`);
          medicalValues.push(updateData.allergies);
          medParamCount++;
        }
        if (updateData.medications !== undefined) {
          medicalFields.push(`medications = $${medParamCount}`);
          medicalValues.push(updateData.medications);
          medParamCount++;
        }
        if (updateData.chronic_conditions !== undefined) {
          medicalFields.push(`chronic_conditions = $${medParamCount}`);
          medicalValues.push(updateData.chronic_conditions);
          medParamCount++;
        }

        medicalValues.push(userId);
        await client.query(
          `UPDATE user_medical_info SET ${medicalFields.join(', ')}, updated_at = NOW() WHERE user_id = $${medParamCount}`,
          medicalValues
        );
      } else {
        // Insert new
        await client.query(
          `INSERT INTO user_medical_info (user_id, allergies, medications, chronic_conditions)
           VALUES ($1, $2, $3, $4)`,
          [
            userId,
            updateData.allergies || null,
            updateData.medications || null,
            updateData.chronic_conditions || null,
          ]
        );
      }
    }

    await client.query('COMMIT');

    return user;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Update profile error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Generate OTP
 */
const generateOTP = () => {
  const length = config.OTP_LENGTH;
  return Math.floor(100000 + Math.random() * 900000).toString().substring(0, length);
};

/**
 * Send OTP (placeholder - integrate with SMS service)
 */
const sendOTP = async (phone) => {
  try {
    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + config.OTP_EXPIRY_MINUTES);

    // Store OTP in database (you can create an otp table or use Redis)
    // For now, we'll just return it (in production, send via SMS)
    logger.info(`OTP for ${phone}: ${otp} (expires in ${config.OTP_EXPIRY_MINUTES} minutes)`);

    // TODO: Integrate with SMS service (Twilio)
    // await sendSMS(phone, `Your Tasheel verification code is: ${otp}`);

    return {
      otp, // Remove this in production
      expires_at: expiresAt,
      message: 'OTP sent successfully',
    };
  } catch (error) {
    logger.error('Send OTP error:', error);
    throw error;
  }
};

/**
 * Verify OTP
 */
const verifyOTP = async (phone, otp) => {
  try {
    // In production, verify against stored OTP
    // For now, we'll just verify the format
    if (otp.length !== config.OTP_LENGTH) {
      throw new Error('Invalid OTP format');
    }

    // Find user
    const result = await pool.query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    if (result.rows.length === 0) {
      throw new Error('User not found');
    }

    // Mark user as verified
    await pool.query(
      'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE phone = $1',
      [phone]
    );

    return {
      verified: true,
      message: 'Phone number verified successfully',
    };
  } catch (error) {
    logger.error('Verify OTP error:', error);
    throw error;
  }
};

/**
 * Request password reset
 */
const forgotPassword = async (email) => {
  try {
    const result = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists for security
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    const resetToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    await pool.query(
      `UPDATE users 
       SET reset_password_token = $1, reset_password_expires = $2 
       WHERE email = $3`,
      [resetToken, expiresAt, email]
    );

    // TODO: Send email with reset link
    // await sendEmail(email, 'Password Reset', `Reset link: ${resetLink}`);

    logger.info(`Password reset token for ${email}: ${resetToken}`);

    return {
      message: 'If the email exists, a password reset link has been sent',
      reset_token: resetToken, // Remove in production
    };
  } catch (error) {
    logger.error('Forgot password error:', error);
    throw error;
  }
};

/**
 * Reset password
 */
const resetPassword = async (token, newPassword) => {
  try {
    const result = await pool.query(
      `SELECT id FROM users 
       WHERE reset_password_token = $1 
       AND reset_password_expires > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid or expired reset token');
    }

    const userId = result.rows[0].id;
    const passwordHash = await hashPassword(newPassword);

    await pool.query(
      `UPDATE users 
       SET password_hash = $1, 
           reset_password_token = NULL, 
           reset_password_expires = NULL 
       WHERE id = $2`,
      [passwordHash, userId]
    );

    return {
      message: 'Password reset successfully',
    };
  } catch (error) {
    logger.error('Reset password error:', error);
    throw error;
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPassword,
  generateToken,
};
