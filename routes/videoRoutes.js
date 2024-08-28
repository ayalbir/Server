const express = require('express');
const authJWT = require('../models/auth');
const videoController = require('../controllers/videoController');

const router = express.Router();

router.patch('/api/users/:id/videos/:pid/likes', authJWT, videoController.likeVideo);
router.patch('/api/users/:id/videos/:pid/dislikes', authJWT, videoController.dislikeVideo);
router.get('/api/users/:id/videos', videoController.getVideosForUser);
router.get('/api/videos', videoController.getTopAndRandomVideos);
router.get('/api/suggestedvideos', videoController.getSuggestedVideos);
router.post('/api/users/:id/videos', authJWT, videoController.createVideo);
router.get('/api/users/:id/videos/:pid', videoController.getVideoById);
router.put('/api/users/:id/videos/:pid', authJWT, videoController.updateVideo);
router.patch('/api/users/:id/videos/:pid', authJWT, videoController.updateVideo);
router.patch('/api/videos/:pid/views', videoController.updateVideoViews);
router.delete('/api/users/:id/videos/:pid', authJWT, videoController.deleteVideo);

module.exports = router;