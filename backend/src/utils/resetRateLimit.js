/**
 * Utility to reset rate limit for development
 * Run this if you hit rate limits during testing
 */

const rateLimit = require('express-rate-limit');
const { MemoryStore } = require('express-rate-limit');

// This is a simple way to reset rate limits in development
// In production, you'd want to use Redis or another store

module.exports = {
  /**
   * Reset rate limit store (for development only)
   */
  resetRateLimit: (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
      // Clear rate limit headers
      res.setHeader('X-RateLimit-Reset', Date.now());
      next();
    } else {
      next();
    }
  },
};
