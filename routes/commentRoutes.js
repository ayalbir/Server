const express = require('express');
const authJWT = require('../models/auth');
const commentController = require('../controllers/commentController');

const router = express.Router();

router.post('/api/videos/:pid/comments', authJWT, commentController.createComment);
router.get('/api/videos/:pid/comments', commentController.getCommentsByVideoId);  
router.get('/api/comments/:cid', commentController.getCommentById);
router.put('/api/comments/:cid', authJWT, commentController.updateComment);
router.patch('/api/comments/:cid', authJWT, commentController.updateComment);
router.delete('/api/videos/:pid/comments/:cid', authJWT, commentController.deleteComment);

module.exports = router;