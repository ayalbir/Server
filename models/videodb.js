const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    email: { type: String, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: false },
    url: { type: String, required: true },
    pic: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    likedBy: {type:[{ type: String, ref: 'User' } ], default: [] },
    dislikes: { type: Number, default: 0 },
    dislikedBy: {type:[{ type: String, ref: 'User' } ], default: [] },
    comments: {type:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' } ], default: []}
});

module.exports = mongoose.model('Video', videoSchema);