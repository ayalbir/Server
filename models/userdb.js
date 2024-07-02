const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    { 
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        firstName: { type: String, required: true },
        familyName: { type: String, required: false },
        birthdate: { type: Date, required: true },
        gender: { type: String, required: true },
        profileImage: { type: String, required: true },
    });
const User = mongoose.model('users', userSchema);
module.exports = User;