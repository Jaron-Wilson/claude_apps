require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const locationRoutes = require('./routes/location');
const circleRoutes = require('./routes/circle');
const { authenticateToken } = require('./middleware/auth');
const { handleWebSocket } = require('./utils/websocket');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/location', authenticateToken, locationRoutes);
app.use('/api/circles', authenticateToken, circleRoutes);

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  handleWebSocket(ws, req);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🔐 Privacy Location Server running on port ${PORT}`);
  console.log(`📍 WebSocket server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, server, wss };
