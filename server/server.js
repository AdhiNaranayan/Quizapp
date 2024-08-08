const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Room = require('./models/Room');
const socketHandler = require('./socket');
const cors = require('cors');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Route Imports
app.use('/api', require('./routes/routes'));

// Database Connection
const uri = 'mongodb://localhost:27017/quiz-app'
mongoose.connect(uri, {})
    .then(() => console.log('Successfully Connected to Database'))
    .catch((err) => console.error('Database connection error:', err));

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Socket.io Setup
io.on('connection', (socket) => {
    console.log('A user connected');
    socketHandler(io, socket);

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start Server
const PORT = process.env.PORT || 3200;
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/`);
});
