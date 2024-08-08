// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const roomSchema = new Schema({
//     roomId: { type: String, required: true, unique: true },
//     users: [{ type: String }],
//     questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
//     scores: { type: Map, of: Number }
// });

// module.exports = mongoose.model('Room', roomSchema);

const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    users: [String],
    questions: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
        question: { type: String, required: true },
        answer: { type: String, required: true },
        answered: { type: Boolean, default: false }
    }],
    scores: { type: Map, of: Number } // Use Map for dynamic key-value pairs
});

module.exports = mongoose.model('Room', RoomSchema);
