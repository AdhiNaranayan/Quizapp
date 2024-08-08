const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

router.post('/create-room', async (req, res) => {
    const { roomId, user } = req.body;
    const room = new Room({ roomId, users: [user], questions: [], scores: {} });
    await room.save();
    res.status(201).send(room);
});

router.get('/rooms', async (req, res) => {
    const rooms = await Room.find();
    res.send(rooms);
});

module.exports = router;
