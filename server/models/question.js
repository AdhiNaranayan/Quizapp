const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String },
    answers: [String],
    correctAnswer: { type: String }
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
