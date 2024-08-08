const socket = io();
const roomsList = document.getElementById('rooms');
const createRoomButton = document.getElementById('create-room');
const gameDiv = document.getElementById('game');
const lobbyDiv = document.getElementById('lobby');
const questionP = document.getElementById('question');
const answerInput = document.getElementById('answerInput'); // Fixed ID to match HTML
const submitAnswerButton = document.getElementById('submit-answer');
const statusP = document.getElementById('status');

let currentRoomId;
let userName = prompt('Enter your name:') //|| 'Guest'; // Default to 'Guest' if no name provided

// Fetch existing rooms
const fetchRooms = async () => {
    try {
        const response = await fetch('/api/rooms');
        if (!response.ok) throw new Error('Failed to fetch rooms');
        const rooms = await response.json();
        roomsList.innerHTML = ''; // Clear existing list
        rooms.forEach(room => {
            const li = document.createElement('li');
            li.textContent = room.roomId;
            li.addEventListener('click', () => {
                currentRoomId = room.roomId;
                socket.emit('join-room', { roomId: currentRoomId, user: userName });
            });
            roomsList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching rooms:', error);
        statusP.textContent = 'Error fetching rooms. Please try again later.';
    }
};

// Create a new room
createRoomButton.addEventListener('click', async () => {
    const roomId = prompt('Enter room ID:');
    if (!roomId) {
        alert('Room ID is required!');
        return;
    }
    try {
        const response = await fetch('/api/create-room', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ roomId, users: [userName] }), // Fixed users to be an array
        });
        if (!response.ok) throw new Error('Failed to create room');
        const data = await response.json();
        currentRoomId = data.roomId;
        socket.emit('join-room', { roomId: currentRoomId, user: userName });
    } catch (error) {
        console.error('Error creating room:', error);
        statusP.textContent = 'Error creating room. Please try again later.';
    }
});

// Handle joining a room
socket.on('room-joined', (room) => {
    if (room.users.length === 2) {
        lobbyDiv.style.display = 'none';
        gameDiv.style.display = 'block';
    }
});

// Handle receiving a new question
socket.on('new-question', (question) => {
    questionP.textContent = question;
});

// Handle submitting an answer
submitAnswerButton.addEventListener('click', () => {
    const answer = answerInput.value.trim();
    if (!answer) {
        alert('Please enter an answer before submitting.');
        return;
    }
    socket.emit('submit-answer', { roomId: currentRoomId, user: userName, answer });
    answerInput.value = '';
});

// Handle game over
socket.on('game-over', (scores) => {
    statusP.textContent = `Game over! Scores: ${JSON.stringify(scores)}`;
    setTimeout(() => {
        lobbyDiv.style.display = 'block';
        gameDiv.style.display = 'none';
        fetchRooms(); // Refresh room list after game ends
    }, 5000);
});

// Initial fetch of rooms
fetchRooms();
