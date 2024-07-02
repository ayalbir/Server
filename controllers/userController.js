const jwt = require('jsonwebtoken');
const User = require('../models/userdb');

const registerUser = async (req, res) => {
    try {
        const { email, password, firstName, familyName, birthdate, gender, profileImage } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email); 
            return res.status(400).send('User already exists');
        }
        const user = new User({ email, password, firstName, familyName, birthdate, gender, profileImage });
        await user.save();
        res.status(201).send(user);
    } catch (err) {
        console.log('Error saving user:', err); 
        res.status(400).send(err);
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).send(err);
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.id });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user);
    } catch (err) {
        res.status(500).send(err);
    }
};

const updateUser = async (req, res) => {
    try {
        console.log("req param:" + req.params.id + ':' + req.body);
        const updateData = req.body;
        if (req.file) {
            updateData.profileImage = req.file.path;
        }
        const user = await User.updateOne({ email: req.params.id }, updateData, { new: true });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user);
    } catch (err) {
        res.status(400).send(err);
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ email: req.params.id });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send(user);
    } catch (err) {
        res.status(500).send(err);
    }
};

const generateToken = async (req, res) => {
    try {
        console.log("generateToken: req body:" + req.body.email + ':' + req.body.password);
        const user = await User.findOne({ email: req.body.email, password: req.body.password });
        if (!user) {
            return res.status(401).send('Invalid credentials');
        }
        const token = jwt.sign({ email: user.email }, 'secret', { expiresIn: '24h' });
        res.json({ 'token': token });
        console.log("token:" + token);
    } catch (err) {
        console.log('Error generating token:', err);
        res.status(400).send(err);
    }
};

module.exports = {
    registerUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    generateToken
};