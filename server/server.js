const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
require('dotenv').config();

const { initializeDatabase } = require('./models/db');
const authRoutes = require('./routes/authRoutes');
const logRoutes = require('./routes/logRoutes');
const logsRoutes = require('./routes/logsRoutes');

const app = express();
const server = http.createServer(app); // Create HTTP server

// Configure Socket.IO with CORS
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', // Frontend (React) Origin
    methods: ['GET', 'POST'],
    credentials: true, // Allow sending cookies and headers
  },
});

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());  // Built-in Express JSON parser
app.use(express.urlencoded({ extended: true })); // For form submissions

// Init Database
initializeDatabase();

// Routes
app.use('/auth', authRoutes);
app.use('/log', logRoutes);
app.use('/logs', logsRoutes);

app.get('/', (req, res) => {
  res.send('Mental Health Tracker API is running');
});

// WebSocket Events
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a unique room for each user based on their userId
  socket.on('joinRoom', (userId) => {
    socket.join(userId); // Each user will be in a room named by their userId
    console.log(`User ${userId} joined room`);
  });

  // Listen for log events and emit real-time updates
  socket.on('newLog', (log) => {
    io.to(log.userId).emit('newLog', log); // Emit to the specific user’s room
    console.log(`New log emitted to user ${log.userId}`);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Export the io instance to make it accessible in controllers
app.set('io', io);

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
