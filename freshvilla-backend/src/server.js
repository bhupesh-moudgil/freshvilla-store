const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup for real-time features
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Join conversation room
  socket.on('join:conversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave:conversation', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`Socket ${socket.id} left conversation: ${conversationId}`);
  });

  // Handle new message
  socket.on('message:send', (data) => {
    io.to(`conversation:${data.conversationId}`).emit('message:new', data);
  });

  // Handle typing indicator
  socket.on('typing:start', (data) => {
    socket.to(`conversation:${data.conversationId}`).emit('typing:show', {
      userId: data.userId,
      userName: data.userName,
    });
  });

  socket.on('typing:stop', (data) => {
    socket.to(`conversation:${data.conversationId}`).emit('typing:hide', {
      userId: data.userId,
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Make io available to controllers
app.set('io', io);

// Start server
server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 FreshVilla Enterprise API Server                    ║
║                                                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}
║   Port: ${PORT}                                          
║   API Version: ${process.env.API_VERSION || 'v1'}        
║                                                           ║
║   📡 Server running at: http://localhost:${PORT}
║   🔌 Socket.IO ready for real-time features              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

module.exports = { server, io };
