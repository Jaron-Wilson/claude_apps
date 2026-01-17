const express = require('express');
const pool = require('../db/pool');
const { broadcastLocationUpdate } = require('../utils/websocket');

const router = express.Router();

// Share encrypted location
router.post('/share', async (req, res) => {
  const { encryptedData, expiresIn } = req.body;
  const userId = req.user.userId;

  if (!encryptedData) {
    return res.status(400).json({ error: 'Encrypted location data required' });
  }

  try {
    // Calculate expiration time if provided
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 1000);
    } else {
      // Default: expire after 24 hours
      const retentionHours = parseInt(process.env.LOCATION_RETENTION_HOURS) || 24;
      expiresAt = new Date(Date.now() + retentionHours * 60 * 60 * 1000);
    }

    const result = await pool.query(
      `INSERT INTO locations (user_id, encrypted_data, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, timestamp`,
      [userId, encryptedData, expiresAt]
    );

    // Broadcast to connected clients in user's circles
    broadcastLocationUpdate(userId, {
      userId,
      encryptedData,
      timestamp: result.rows[0].timestamp
    });

    res.json({
      message: 'Location shared successfully',
      locationId: result.rows[0].id,
      timestamp: result.rows[0].timestamp,
      expiresAt
    });

  } catch (error) {
    console.error('Location sharing error:', error);
    res.status(500).json({ error: 'Failed to share location' });
  }
});

// Get locations of circle members
router.get('/circle/:circleId', async (req, res) => {
  const { circleId } = req.params;
  const userId = req.user.userId;

  try {
    // Verify user is a member of this circle
    const membership = await pool.query(
      'SELECT id FROM circle_members WHERE circle_id = $1 AND user_id = $2',
      [circleId, userId]
    );

    if (membership.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this circle' });
    }

    // Get latest locations of all circle members (who have sharing enabled)
    const locations = await pool.query(
      `SELECT DISTINCT ON (l.user_id)
        l.user_id,
        u.username,
        l.encrypted_data,
        l.timestamp,
        l.expires_at
       FROM locations l
       JOIN circle_members cm ON l.user_id = cm.user_id
       JOIN users u ON l.user_id = u.id
       LEFT JOIN sharing_permissions sp ON sp.user_id = l.user_id AND sp.circle_id = cm.circle_id
       WHERE cm.circle_id = $1
         AND (l.expires_at IS NULL OR l.expires_at > CURRENT_TIMESTAMP)
         AND (sp.share_location IS NULL OR sp.share_location = true)
         AND (sp.expires_at IS NULL OR sp.expires_at > CURRENT_TIMESTAMP)
       ORDER BY l.user_id, l.timestamp DESC`,
      [circleId]
    );

    res.json({
      circleId: parseInt(circleId),
      locations: locations.rows
    });

  } catch (error) {
    console.error('Location fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Get user's own location history
router.get('/history', async (req, res) => {
  const userId = req.user.userId;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const result = await pool.query(
      `SELECT id, encrypted_data, timestamp, expires_at
       FROM locations
       WHERE user_id = $1
       ORDER BY timestamp DESC
       LIMIT $2`,
      [userId, limit]
    );

    res.json({ locations: result.rows });

  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch location history' });
  }
});

// Delete old/expired locations (cleanup)
router.delete('/cleanup', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM locations WHERE expires_at < CURRENT_TIMESTAMP'
    );

    res.json({
      message: 'Cleanup completed',
      deletedCount: result.rowCount
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Cleanup failed' });
  }
});

// Stop sharing location with a specific circle
router.post('/stop-sharing/:circleId', async (req, res) => {
  const { circleId } = req.params;
  const userId = req.user.userId;

  try {
    await pool.query(
      `INSERT INTO sharing_permissions (user_id, circle_id, share_location)
       VALUES ($1, $2, false)
       ON CONFLICT (user_id, circle_id)
       DO UPDATE SET share_location = false`,
      [userId, circleId]
    );

    res.json({ message: 'Location sharing stopped for this circle' });

  } catch (error) {
    console.error('Stop sharing error:', error);
    res.status(500).json({ error: 'Failed to stop sharing' });
  }
});

// Resume sharing location with a specific circle
router.post('/resume-sharing/:circleId', async (req, res) => {
  const { circleId } = req.params;
  const userId = req.user.userId;

  try {
    await pool.query(
      `INSERT INTO sharing_permissions (user_id, circle_id, share_location)
       VALUES ($1, $2, true)
       ON CONFLICT (user_id, circle_id)
       DO UPDATE SET share_location = true, expires_at = NULL`,
      [userId, circleId]
    );

    res.json({ message: 'Location sharing resumed for this circle' });

  } catch (error) {
    console.error('Resume sharing error:', error);
    res.status(500).json({ error: 'Failed to resume sharing' });
  }
});

module.exports = router;
