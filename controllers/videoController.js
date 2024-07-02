const Video = require('../models/videodb');

const likeVideo = async (req, res) => {
    try {
        const email = req.params.id;
        const videoId = req.params.pid;
        const video = await Video.findOne({ _id: videoId });
        if (!video) {
            return res.status(404).send('Video not found');
        }
        if (video.likedBy.includes(email)) {
            video.likedBy = video.likedBy.filter(user => user !== email);
        } else {
            if (video.dislikedBy.includes(email)) {
                video.dislikedBy = video.dislikedBy.filter(user => user !== email);
            }
            video.likedBy.push(email);
        }
        video.dislikes = video.dislikedBy.length;
        video.likes = video.likedBy.length;
        await video.save();
        res.status(200).json(video);
    } catch (err) {
        res.status(400).send(err);
    }
};

const dislikeVideo = async (req, res) => {
    try {
        const email = req.params.id;
        const videoId = req.params.pid;
        const video = await Video.findOne({ _id: videoId });
        if (!video) {
            return res.status(404).send('Video not found');
        }
        if (video.dislikedBy.includes(email)) {
            video.dislikedBy = video.dislikedBy.filter(user => user !== email);
        } else {
            if (video.likedBy.includes(email)) {
                video.likedBy = video.likedBy.filter(user => user !== email);
            }
            video.dislikedBy.push(email);
        }
        video.likes = video.likedBy.length;
        video.dislikes = video.dislikedBy.length;
        await video.save();
        res.status(200).json(video);
    } catch (err) {
        res.status(400).send(err);
    }
};

const getVideosForUser = async (req, res) => {
    try {
        const email = req.params.id;
        const videos = await Video.find({ email }).populate('comments');
        res.status(200).json(videos);
    } catch (err) {
        res.status(500).send(err);
    }
};

const getTopAndRandomVideos = async (req, res) => {
    try {
        const totalVideos = await Video.countDocuments();
        if (totalVideos < 20) {
            return res.status(204).send('Not enough videos');
        }
        
        const top10ViewedVideos = await Video.find().sort({ views: -1 }).limit(10);
        const randomVideos = await Video.aggregate([{ $sample: { size: 10 } }]);
        const combinedVideos = top10ViewedVideos.concat(randomVideos).sort(() => Math.random() - 0.5);
        res.status(200).json(combinedVideos);
    } catch (err) {
        res.status(500).send(err);
    }
};

const createVideo = async (req, res) => {
    try {
        const email = req.params.id;
        const { title, description, url, views } = req.body;
        const newVideo = new Video({ email, title, description, url, createdAt: new Date(), views: views || 0 });
        await newVideo.save();
        res.status(201).json(newVideo);
    } catch (err) {
        res.status(400).send(err);
    }
};

const getVideoById = async (req, res) => {
    try {
        const { id, pid } = req.params;
        const video = await Video.findOne({ email: id, _id: pid }).populate('comments');
        if (!video || video.email !== id) {
            return res.status(404).send('Video not found');
        }
        res.status(200).json(video);
    } catch (err) {
        res.status(500).send(err);
    }
};

const updateVideo = async (req, res) => {
    try {
        const { id, pid } = req.params;
        const updatedVideo = await Video.findOneAndUpdate({ email: id, _id: pid }, req.body, { new: true });
        if (!updatedVideo || updatedVideo.email !== id) {
            return res.status(404).send('Video not found');
        }
        res.status(200).json(updatedVideo);
    } catch (err) {
        res.status(400).send(err);
    }
};

const deleteVideo = async (req, res) => {
    try {
        const { id, pid } = req.params;
        const video = await Video.findOneAndDelete({ email: id, _id: pid });
        if (!video || video.email !== id) {
            return res.status(404).send('Video not found');
        }
        res.status(200).json({ message: 'Video deleted' });
    } catch (err) {
        res.status(500).send(err);
    }
};

module.exports = {
    likeVideo,
    dislikeVideo,
    getVideosForUser,
    getTopAndRandomVideos,
    createVideo,
    getVideoById,
    updateVideo,
    deleteVideo
};