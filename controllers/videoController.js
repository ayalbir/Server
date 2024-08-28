const Video = require('../models/videodb');
const net = require('net');


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

const getSuggestedVideos = async (req, res) => {
    try {
        const email = req.query.email;

        let recommendedVideoIds = [];
        let receivedData = '';

        if (email && email !== 'null' && email !== 'noConnectedUser') {
            // Create a TCP client to send data to the C++ server
            const client = new net.Socket();

            client.connect(5555, '192.168.135.128', () => {
                console.log('Connected to C++ server');

                // Send the command to get recommendations
                const command = `GET_RECOMMENDATIONS ${email}`;
                client.write(command);
            });

            client.on('data', (data) => {
                receivedData += data.toString();
            });

            await new Promise((resolve) => {
                client.on('close', () => {
                    console.log('Connection to C++ server closed');
                    recommendedVideoIds = receivedData.trim().split(' ').filter(id => id); // Split and filter out empty strings
                    resolve();
                });
            });
        }

        // Fetch video IDs based on recommended IDs
        let finalVideoIds = recommendedVideoIds;

        // If there are fewer than 10 recommended videos, fill up with the most viewed video IDs
        if (finalVideoIds.length < 10) {
            const additionalVideoIds = await Video.find({ _id: { $nin: recommendedVideoIds } })
                .sort({ views: -1 })
                .limit(10 - finalVideoIds.length)
                .select('_id'); // Select only the _id field

            finalVideoIds = finalVideoIds.concat(additionalVideoIds.map(video => video._id.toString()));
        }

        res.status(200).json(finalVideoIds);
    } catch (err) {
        res.status(500).send(err);
    }
};

const getTopAndRandomVideos = async (req, res) => {
    try {
        const email = req.query.email;
        if (
            email != '' && email != null && email != 'null' && email != 'noConnectedUser'
        ) {
            // Create a TCP client to send data to C++ server
            const client = new net.Socket();

            client.connect(5555, '192.168.135.128', () => {
               // console.log('Connected to C++ server');

                // Send the command in the format expected by the C++ server
                const command = `GET_RECOMMENDATIONS ${email}`;
                client.write(command);
            });

            client.on('data', (data) => {
                console.log('Received from C++ server:', data.toString());
                client.destroy(); // Close the connection after receiving data
            });

            /*
            client.on('close', () => {
                console.log('Connection to C++ server closed');
            });
            */
        }
        const totalVideos = await Video.countDocuments();
        if (totalVideos < 20) {
            const videos = await Video.find();
            return res.status(200).json(videos);
        }

        const top10ViewedVideos = await Video.find().sort({ views: -1 }).limit(10);
        const top10ViewedVideoIds = top10ViewedVideos.map(video => video._id);

        const randomVideos = await Video.aggregate([
            { $match: { _id: { $nin: top10ViewedVideoIds } } },
            { $sample: { size: 10 } }
        ]);

        const combinedVideos = top10ViewedVideos.concat(randomVideos).sort(() => Math.random() - 0.5);
        res.status(200).json(combinedVideos);
    } catch (err) {
        res.status(500).send(err);
    }
};

const createVideo = async (req, res) => {
    try {
        const { email, title, description, url, pic, views } = req.body;
        const newVideo = new Video({ email, title, description, url, pic, createdAt: new Date(), views: views || 0 });
        await newVideo.save();
        res.status(201).json(newVideo);
    } catch (err) {
        res.status(400).send(err);
    }
};

const getVideoById = async (req, res) => {
    try {
        const { pid } = req.params;
        const video = await Video.findOne({ _id: pid }).populate('comments');
        if (!video) {
            return res.status(404).send('Video not found');
        }
        res.status(200).json(video);
    } catch (err) {
        res.status(500).send(err);
    }
};

const updateVideo = async (req, res) => {
    try {
        const { pid } = req.params;
        const updatedVideo = await Video.findOneAndUpdate({ _id: pid }, req.body, { new: true });
        if (!updatedVideo) {
            return res.status(404).send('Video not found');
        }
        res.status(200).json(updatedVideo);
    } catch (err) {
        res.status(400).send(err);
    }
};

const deleteVideo = async (req, res) => {
    try {
        const { pid } = req.params;
        const video = await Video.findOneAndDelete({ _id: pid });
        if (!video) {
            return res.status(404).send('Video not found');
        }

        res.status(200).json({ message: 'Video and associated comments deleted' });
    } catch (err) {
        res.status(500).send(err);
    }
};


const updateVideoViews = async (req, res) => {
    try {
        const { pid } = req.params;
        const { email } = req.body;

        // Update the video views in the MongoDB database
        const updatedVideo = await Video.findOneAndUpdate(
            { _id: pid },
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!updatedVideo) {
            return res.status(404).send('Video not found');
        }

        // Create a TCP client to send data to C++ server
        const client = new net.Socket();

        if (
            email != '' && email != null && email != 'null' && email != 'noConnectedUser'
        )
        {
                    client.connect(5555, '192.168.135.128', () => {
            console.log('Connected to C++ server');

            // Send the command in the format expected by the C++ server
            const command = `UPDATE_VIEW ${email} ${pid}`;
            client.write(command);
        });

        client.on('data', (data) => {
            console.log('Received from C++ server:', data.toString());
            client.destroy(); // Close the connection after receiving data
        });

        client.on('close', () => {
            console.log('Connection to C++ server closed');
        });
        }

        res.status(200).json(updatedVideo);
    } catch (err) {
        res.status(400).send(err);
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
    deleteVideo,
    updateVideoViews,
    getSuggestedVideos,
};