const jwt = require('jsonwebtoken');
const url = require('url');

// Store active WebSocket connections
const connections = new Map(); // userId -> Set of WebSocket connections

const handleWebSocket = (ws, req) => {
  // Extract token from query string
  const queryParams = url.parse(req.url, true).query;
  const token = queryParams.token;

  if (!token) {
    ws.close(4001, 'Authentication required');
    return;
  }

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      ws.close(4002, 'Invalid token');
      return;
    }

    const userId = decoded.userId;

    // Store connection
    if (!connections.has(userId)) {
      connections.set(userId, new Set());
    }
    connections.get(userId).add(ws);

    console.log(`WebSocket connected: User ${userId}`);

    // Handle messages from client
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        handleClientMessage(userId, data, ws);
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      const userConnections = connections.get(userId);
      if (userConnections) {
        userConnections.delete(ws);
        if (userConnections.size === 0) {
          connections.delete(userId);
        }
      }
      console.log(`WebSocket disconnected: User ${userId}`);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'WebSocket connection established',
      userId
    }));
  });
};

const handleClientMessage = (userId, data, ws) => {
  // Handle different message types
  switch (data.type) {
    case 'ping':
      ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      break;

    case 'location_update':
      // Location updates are handled via REST API
      // This is just for acknowledgment
      ws.send(JSON.stringify({
        type: 'ack',
        message: 'Location update received'
      }));
      break;

    default:
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Unknown message type'
      }));
  }
};

const broadcastLocationUpdate = async (userId, locationData) => {
  const pool = require('../db/pool');

  try {
    // Get all circles this user is part of
    const circleResult = await pool.query(
      'SELECT circle_id FROM circle_members WHERE user_id = $1',
      [userId]
    );

    const circleIds = circleResult.rows.map(row => row.circle_id);

    if (circleIds.length === 0) return;

    // Get all members of these circles
    const membersResult = await pool.query(
      `SELECT DISTINCT user_id FROM circle_members
       WHERE circle_id = ANY($1) AND user_id != $2`,
      [circleIds, userId]
    );

    const message = JSON.stringify({
      type: 'location_update',
      userId: locationData.userId,
      encryptedData: locationData.encryptedData,
      timestamp: locationData.timestamp
    });

    // Send to all connected members
    membersResult.rows.forEach(({ user_id }) => {
      const userConnections = connections.get(user_id);
      if (userConnections) {
        userConnections.forEach(ws => {
          if (ws.readyState === 1) { // OPEN
            ws.send(message);
          }
        });
      }
    });

  } catch (error) {
    console.error('Broadcast error:', error);
  }
};

const getActiveConnections = () => {
  return connections.size;
};

module.exports = {
  handleWebSocket,
  broadcastLocationUpdate,
  getActiveConnections
};
