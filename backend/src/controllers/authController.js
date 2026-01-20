const authService = require('../services/authService');
const logger = require('../utils/logger');

/**
 * Register new user
 */
const register = async (req, res, next) => {
  try {
    const { email, phone, password, first_name, last_name, date_of_birth, gender } = req.body;

    // Validation
    if (!email || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email, phone, and password are required',
        },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 6 characters',
        },
      });
    }

    const result = await authService.register({
      email,
      phone,
      password,
      first_name,
      last_name,
      date_of_birth,
      gender,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Register controller error:', error);

    if (error.message === 'Email already registered' || error.message === 'Phone number already registered') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_ENTRY',
          message: error.message,
        },
      });
    }

    next(error);
  }
};

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;

    const emailOrPhone = email || phone;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email/phone and password are required',
        },
      });
    }

    const result = await authService.login(emailOrPhone, password);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Login controller error:', error);

    if (error.message === 'Invalid credentials' || error.message === 'Account is deactivated') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_FAILED',
          message: error.message,
        },
      });
    }

    next(error);
  }
};

/**
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await authService.getProfile(userId);

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    logger.error('Get profile controller error:', error);
    next(error);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    const updatedProfile = await authService.updateProfile(userId, updateData);

    res.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    logger.error('Update profile controller error:', error);
    next(error);
  }
};

/**
 * Send OTP
 */
const sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Phone number is required',
        },
      });
    }

    const result = await authService.sendOTP(phone);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Send OTP controller error:', error);
    next(error);
  }
};

/**
 * Verify OTP
 */
const verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Phone and OTP are required',
        },
      });
    }

    const result = await authService.verifyOTP(phone, otp);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Verify OTP controller error:', error);

    if (error.message === 'Invalid OTP format' || error.message === 'User not found') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }

    next(error);
  }
};

/**
 * Forgot password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required',
        },
      });
    }

    const result = await authService.forgotPassword(email);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Forgot password controller error:', error);
    next(error);
  }
};

/**
 * Reset password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Token and password are required',
        },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 6 characters',
        },
      });
    }

    const result = await authService.resetPassword(token, password);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Reset password controller error:', error);

    if (error.message === 'Invalid or expired reset token') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
    }

    next(error);
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
};
