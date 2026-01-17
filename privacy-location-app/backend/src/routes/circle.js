const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// Create a new circle
router.post('/', async (req, res) => {
  const { name } = req.body;
  const userId = req.user.userId;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Circle name required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Create circle
    const circleResult = await client.query(
      'INSERT INTO circles (name, created_by) VALUES ($1, $2) RETURNING *',
      [name.trim(), userId]
    );

    const circle = circleResult.rows[0];

    // Add creator as first member
    await client.query(
      'INSERT INTO circle_members (circle_id, user_id) VALUES ($1, $2)',
      [circle.id, userId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Circle created successfully',
      circle: {
        id: circle.id,
        name: circle.name,
        createdBy: circle.created_by,
        createdAt: circle.created_at
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Circle creation error:', error);
    res.status(500).json({ error: 'Failed to create circle' });
  } finally {
    client.release();
  }
});

// Get user's circles
router.get('/', async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT c.id, c.name, c.created_by, c.created_at,
              COUNT(cm.user_id) as member_count
       FROM circles c
       JOIN circle_members cm ON c.id = cm.circle_id
       WHERE c.id IN (
         SELECT circle_id FROM circle_members WHERE user_id = $1
       )
       GROUP BY c.id, c.name, c.created_by, c.created_at
       ORDER BY c.created_at DESC`,
      [userId]
    );

    res.json({ circles: result.rows });

  } catch (error) {
    console.error('Circles fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch circles' });
  }
});

// Get circle details and members
router.get('/:circleId', async (req, res) => {
  const { circleId } = req.params;
  const userId = req.user.userId;

  try {
    // Verify user is a member
    const membership = await pool.query(
      'SELECT id FROM circle_members WHERE circle_id = $1 AND user_id = $2',
      [circleId, userId]
    );

    if (membership.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this circle' });
    }

    // Get circle details
    const circleResult = await pool.query(
      'SELECT * FROM circles WHERE id = $1',
      [circleId]
    );

    // Get members
    const membersResult = await pool.query(
      `SELECT u.id, u.username, u.email, cm.joined_at
       FROM users u
       JOIN circle_members cm ON u.id = cm.user_id
       WHERE cm.circle_id = $1
       ORDER BY cm.joined_at`,
      [circleId]
    );

    res.json({
      circle: circleResult.rows[0],
      members: membersResult.rows
    });

  } catch (error) {
    console.error('Circle details fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch circle details' });
  }
});

// Add member to circle
router.post('/:circleId/members', async (req, res) => {
  const { circleId } = req.params;
  const { username } = req.body;
  const userId = req.user.userId;

  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  try {
    // Verify requesting user is circle creator or member
    const circle = await pool.query(
      'SELECT created_by FROM circles WHERE id = $1',
      [circleId]
    );

    if (circle.rows.length === 0) {
      return res.status(404).json({ error: 'Circle not found' });
    }

    const isMember = await pool.query(
      'SELECT id FROM circle_members WHERE circle_id = $1 AND user_id = $2',
      [circleId, userId]
    );

    if (isMember.rows.length === 0) {
      return res.status(403).json({ error: 'Only circle members can add others' });
    }

    // Check circle size limit
    const memberCount = await pool.query(
      'SELECT COUNT(*) as count FROM circle_members WHERE circle_id = $1',
      [circleId]
    );

    const maxSize = parseInt(process.env.MAX_CIRCLE_SIZE) || 50;
    if (parseInt(memberCount.rows[0].count) >= maxSize) {
      return res.status(400).json({ error: `Circle has reached maximum size of ${maxSize}` });
    }

    // Find user to add
    const userResult = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newUserId = userResult.rows[0].id;

    // Add to circle
    await pool.query(
      'INSERT INTO circle_members (circle_id, user_id) VALUES ($1, $2)',
      [circleId, newUserId]
    );

    res.json({
      message: 'Member added successfully',
      userId: newUserId,
      username
    });

  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'User is already a member' });
    }
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Leave circle
router.delete('/:circleId/leave', async (req, res) => {
  const { circleId } = req.params;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'DELETE FROM circle_members WHERE circle_id = $1 AND user_id = $2 RETURNING *',
      [circleId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Not a member of this circle' });
    }

    // Check if circle is now empty and delete it
    const remainingMembers = await pool.query(
      'SELECT COUNT(*) as count FROM circle_members WHERE circle_id = $1',
      [circleId]
    );

    if (parseInt(remainingMembers.rows[0].count) === 0) {
      await pool.query('DELETE FROM circles WHERE id = $1', [circleId]);
    }

    res.json({ message: 'Left circle successfully' });

  } catch (error) {
    console.error('Leave circle error:', error);
    res.status(500).json({ error: 'Failed to leave circle' });
  }
});

// Delete circle (creator only)
router.delete('/:circleId', async (req, res) => {
  const { circleId } = req.params;
  const userId = req.user.userId;

  try {
    const circle = await pool.query(
      'SELECT created_by FROM circles WHERE id = $1',
      [circleId]
    );

    if (circle.rows.length === 0) {
      return res.status(404).json({ error: 'Circle not found' });
    }

    if (circle.rows[0].created_by !== userId) {
      return res.status(403).json({ error: 'Only the creator can delete this circle' });
    }

    await pool.query('DELETE FROM circles WHERE id = $1', [circleId]);

    res.json({ message: 'Circle deleted successfully' });

  } catch (error) {
    console.error('Delete circle error:', error);
    res.status(500).json({ error: 'Failed to delete circle' });
  }
});

module.exports = router;
