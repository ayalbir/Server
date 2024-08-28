const jwt = require('jsonwebtoken');
const User = require('../models/userdb');

const registerUser = async (req, res) => {
    try {
      const { email, password, firstName, familyName, birthdate, gender, profileImage } = req.body;
      console.log("register:", req.body);
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('User already exists:', email);
        return res.status(401).send('User already exists');
      }
      const user = new User({ email, password, firstName, familyName, birthdate, gender, profileImage });
      console.log('User:', user);
      await user.save();
      res.status(201).send(user);
    } catch (err) {
      if (err.code === 11000) {
        console.log('Duplicate key error:', err.message);
        res.status(400).send('User with this email already exists');
      } else {
        console.log('Error saving user:', err);
        res.status(400).send(err);
      }
    }
  };
//
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().lean();
        for (let i = 0; i < users.length; i++) {
            users[i].birthdate = "";
        }
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
        res.status(201).send(user);
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
      const { email, password } = req.body;
      const user = await User.findOne({ email, password });
      if (!user) {
        return res.status(401).send('Invalid credentials');
      }
      const token = jwt.sign({ email: user.email }, 'secret', { expiresIn: '24h' });
      res.json({ token, user }); 
    } catch (err) {
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