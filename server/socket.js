const Room = require('./models/Room');
const Question = require('./models/Question');

module.exports = (io, socket) => {
    socket.on('join-room', async ({ roomId, user }) => {
        console.log(`User ${user} is joining room ${roomId}`);

        let room;
        try {
            room = await Room.findOne({ roomId });
            if (!room) {
                socket.emit('error', 'Room not found');
                return;
            }
            if (room.users.includes(user)) {
                socket.emit('error', 'User already in the room');
                return;
            }
            if (room.users.length >= 2) {
                socket.emit('error', 'Room is full');
                return;
            }

            room.users.push(user);
            await room.save();

            socket.join(roomId);
            io.to(roomId).emit('room-joined', room);

            if (room.users.length === 2) {
                try {
                    // Fetch questions from MongoDB
                    const questions = await Question.find().limit(5).exec();
                    if (questions.length < 5) {
                        socket.emit('error', 'Not enough questions available');
                        return;
                    }

                    room.questions = questions.map(q => ({
                        questionId: q._id, // Reference question by ID, ensure it is an ObjectId
                        question: q.question,
                        answer: q.correctAnswer,
                        answered: false
                    }));
                    room.scores.set(String(room.users[0]), 0); // Ensure keys are strings
                    room.scores.set(String(room.users[1]), 0); // Ensure keys are strings
                    await room.save();

                    let questionIndex = 0;
                    const sendQuestion = () => {
                        if (questionIndex < room.questions.length) {
                            io.to(roomId).emit('new-question', room.questions[questionIndex].question);
                            questionIndex++;
                            setTimeout(sendQuestion, 10000);
                        } else {
                            endGame(roomId);
                        }
                    };
                    sendQuestion();
                } catch (err) {
                    socket.emit('error', 'An error occurred while fetching questions');
                    console.error(err);
                }
            }
        } catch (err) {
            console.error('Error handling join-room:', err);
            socket.emit('error', 'An unexpected error occurred');
        }
    });

    socket.on('submit-answer', async ({ roomId, user, answer }) => {
        console.log(`User ${user} submitted answer for room ${roomId}`);

        let room;
        try {
            room = await Room.findOne({ roomId });
            if (!room) {
                socket.emit('error', 'Room not found');
                return;
            }

            const currentQuestionIndex = room.questions.findIndex(q => !q.answered);
            if (currentQuestionIndex === -1) {
                socket.emit('error', 'No current question available');
                return;
            }

            const currentQuestion = room.questions[currentQuestionIndex];

            if (currentQuestion.answer === answer) {
                room.scores.set(String(user), (room.scores.get(String(user)) || 0) + 10); // Ensure keys are strings
                room.questions[currentQuestionIndex].answered = true;
                await room.save();
            }
        } catch (err) {
            console.error('Error handling submit-answer:', err);
            socket.emit('error', 'An unexpected error occurred');
        }
    });

    const endGame = async (roomId) => {
        console.log(`Ending game for room ${roomId}`);

        try {
            const room = await Room.findOne({ roomId });
            if (room) {
                io.to(roomId).emit('game-over', room.scores);
                await Room.deleteOne({ roomId });
            }
        } catch (err) {
            console.error('Error ending game:', err);
        }
    };
};
