const pool = require('../config/database');
const logger = require('../utils/logger');

/**
 * Middleware to log all API requests for audit purposes
 */
const auditLogger = async (req, res, next) => {
  const startTime = Date.now();

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    res.send = originalSend;
    return res.send(data);
  };

  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    const userId = req.user?.id || null;

    try {
      await pool.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          userId,
          `${req.method} ${req.path}`,
          null, // entity_type - can be extracted from route if needed
          null, // entity_id - can be extracted from params if needed
          req.ip || req.connection.remoteAddress,
          req.get('user-agent') || 'Unknown',
        ]
      );
    } catch (error) {
      // Don't fail the request if audit logging fails
      logger.error('Audit logging error:', error);
    }
  });

  next();
};

module.exports = auditLogger;
