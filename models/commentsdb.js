const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
    email: { type: String, ref: 'User', required: true },
    text: { type: String, required: true },
    profilePicture: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);