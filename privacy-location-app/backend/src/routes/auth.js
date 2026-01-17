const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db/pool');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  const { username, email, password, publicKey } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password required' });
  }

  // Validate password strength
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, public_key)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, created_at`,
      [username, email, passwordHash, publicKey || null]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.username);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, email, password_hash, public_key FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.username);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        publicKey: user.public_key
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Update public key (for E2E encryption)
router.post('/update-key', async (req, res) => {
  const { userId, publicKey } = req.body;

  try {
    await pool.query(
      'UPDATE users SET public_key = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [publicKey, userId]
    );

    res.json({ message: 'Public key updated successfully' });
  } catch (error) {
    console.error('Key update error:', error);
    res.status(500).json({ error: 'Failed to update public key' });
  }
});

module.exports = router;
