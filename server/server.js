const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { setIO } = require('./utils/socket');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const connectDB = require('./config/database');
const app = require('./app');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP server from Express app
const httpServer = createServer(app);

// Attach Socket.io to HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io middleware to verify JWT from handshake.auth.token
io.use(async (socket, next) => {
  try {
    const token = socket.handshake?.auth?.token;

    if (!token) {
      return next(new Error('No token'));
    }

    // Verify token and fetch user details
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return next(new Error('User not found'));
    }

    // Attach minimal user info to socket.data for handlers
    socket.data.user = {
      id: user._id,
      name: user.name,
      email: user.email
    };

    return next();
  } catch (err) {
    console.error('Socket auth error:', err.message || err);
    return next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log("✅ User connected:", socket.data?.user?.email || socket.id);

  socket.on('disconnect', (reason) => {
    console.log("❌ User disconnected:", socket.data?.user?.email || socket.id, "(", reason, ")");
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log("🚀 Server running on http://localhost:" + PORT);
  console.log("🔌 Socket.io ready for connections");
});

// Make io available to controllers
setIO(io);