const Comment = require('../models/commentsdb');
const Video = require('../models/videodb');

const createComment = async (req, res) => {
    try {
        const { pid } = req.params;
        const { email, text , profilePicture } = req.body;
        const newComment = new Comment({ videoId: pid, email, text, profilePicture, createdAt: new Date() });
        await newComment.save();
        await Video.findOneAndUpdate({ _id: pid }, { $push: { comments: newComment._id } });
        res.status(201).json(newComment);
    } catch (err) {
        res.status(400).send(err);
    }
};

const getCommentById = async (req, res) => {
    try {
        const { cid } = req.params;
        const comment = await Comment.findOne({ _id: cid });
        if (!comment) {
            return res.status(404).send('Comment not found');
        }
        res.status(200).json(comment);
    } catch (err) {
        res.status(500).send(err);
    }
};

const updateComment = async (req, res) => {
    try {
        const { cid } = req.params;
        const updatedComment = await Comment.findOneAndUpdate({ _id: cid }, req.body, { new: true });
        if (!updatedComment) {
            return res.status(404).send('Comment not found');
        }
        res.status(200).json(updatedComment);
    } catch (err) {
        res.status(400).send(err);
    }
};

const getCommentsByVideoId = async (req, res) => {
    try {
        const { pid } = req.params;
        const comments = await Comment.find({ videoId: pid });
        res.status(200).json(comments);
    } catch (err) {
        res.status(500).send(err);
    }
};

const deleteComment = async (req, res) => {
    try {
        const { pid, cid } = req.params;
        const comment = await Comment.findOneAndDelete({ _id: cid, videoId: pid });
        if (!comment) {
            return res.status(404).send('Comment not found');
        }
        
        // Remove comment from the video's comments array
        await Video.findOneAndUpdate({ _id: pid }, { $pull: { comments: cid } });

        res.status(200).json({ message: 'Comment deleted' });
    } catch (err) {
        res.status(500).send(err);
    }
};

const deleteCommentsForEmail = async (req, res) => {
    try {
        const { email } = req.params;

        // Find all comments associated with the email
        const comments = await Comment.find({ email });

        if (comments.length === 0) {
            return res.status(404).json({ message: 'No comments found for this email' });
        }

        // Delete all comments associated with the email
        const commentIds = comments.map(comment => comment._id);
        await Comment.deleteMany({ email });

        // Remove references to these comments from the corresponding videos
        await Video.updateMany(
            { comments: { $in: commentIds } },
            { $pull: { comments: { $in: commentIds } } }
        );

        res.status(200).json({ message: `${comments.length} comment(s) deleted` });
    } catch (err) {
        res.status(500).send(err);
    }
};

module.exports = {
    createComment,
    getCommentById,
    updateComment,
    getCommentsByVideoId,
    deleteComment,
    deleteCommentsForEmail,
};