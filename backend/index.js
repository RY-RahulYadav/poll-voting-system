require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');

// Import routes
const userRoutes = require('./src/routes/userRoutes');
const pollRoutes = require('./src/routes/pollRoutes');
const voteRoutes = require('./src/routes/voteRoutes');

// Initialize Prisma Client
const prisma = new PrismaClient();

// Create Express app
const app = express();
const server = http.createServer(app);

// Create Socket.io server with CORS settings
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/votes', voteRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Join a poll room
  socket.on('join-poll', (pollId) => {
    socket.join(pollId);
    console.log(`User joined poll room: ${pollId}`);
  });

  // Leave a poll room
  socket.on('leave-poll', (pollId) => {
    socket.leave(pollId);
    console.log(`User left poll room: ${pollId}`);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Export io to be used in vote controller
module.exports.io = io;

// Health check route
app.get('/', (req, res) => {
  res.send('Polling App API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});