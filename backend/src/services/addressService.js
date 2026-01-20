const pool = require('../config/database');
const logger = require('../utils/logger');

/**
 * Get all addresses for a user
 */
const getUserAddresses = async (userId) => {
  try {
    const result = await pool.query(
      `SELECT * FROM user_addresses 
       WHERE user_id = $1 
       ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    return result.rows;
  } catch (error) {
    logger.error('Get user addresses error:', error);
    throw error;
  }
};

/**
 * Create new address
 */
const createAddress = async (userId, addressData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // If this is set as default, unset other defaults
    if (addressData.is_default) {
      await client.query(
        'UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1',
        [userId]
      );
    }

    // Insert new address
    const result = await client.query(
      `INSERT INTO user_addresses (
        user_id, address_type, address_line1, address_line2,
        city, state, postal_code, country, latitude, longitude, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        userId,
        addressData.address_type || 'home',
        addressData.address_line1,
        addressData.address_line2 || null,
        addressData.city,
        addressData.state || null,
        addressData.postal_code || null,
        addressData.country || 'UAE',
        addressData.latitude || null,
        addressData.longitude || null,
        addressData.is_default || false,
      ]
    );

    await client.query('COMMIT');

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Create address error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update address
 */
const updateAddress = async (userId, addressId, updateData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify address belongs to user
    const verifyResult = await client.query(
      'SELECT id FROM user_addresses WHERE id = $1 AND user_id = $2',
      [addressId, userId]
    );

    if (verifyResult.rows.length === 0) {
      throw new Error('Address not found');
    }

    // If setting as default, unset other defaults
    if (updateData.is_default) {
      await client.query(
        'UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1 AND id != $2',
        [userId, addressId]
      );
    }

    // Build update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    const allowedFields = [
      'address_type',
      'address_line1',
      'address_line2',
      'city',
      'state',
      'postal_code',
      'country',
      'latitude',
      'longitude',
      'is_default',
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

    updateValues.push(addressId, userId);
    const updateQuery = `UPDATE user_addresses 
                         SET ${updateFields.join(', ')}, updated_at = NOW() 
                         WHERE id = $${paramCount} AND user_id = $${paramCount + 1} 
                         RETURNING *`;

    const result = await client.query(updateQuery, updateValues);

    await client.query('COMMIT');

    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Update address error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Delete address
 */
const deleteAddress = async (userId, addressId) => {
  try {
    const result = await pool.query(
      'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2 RETURNING id',
      [addressId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Address not found');
    }

    return {
      message: 'Address deleted successfully',
    };
  } catch (error) {
    logger.error('Delete address error:', error);
    throw error;
  }
};

module.exports = {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
