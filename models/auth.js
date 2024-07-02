const jwt = require('jsonwebtoken');

const authJWT = (req, res, next) => {
    console.log('authJWT headers:', JSON.stringify(req.headers));
    const authHeader = req.headers['authorization'];
    //const authHeader = req.headers['cookie'];
    console.log('authJWT authHeader:', authHeader);
    if (!authHeader) {
        return res.status(401).send('No token provided');
    }

    const token = authHeader.split(' ')[1]; 
    console.log('authJWT token:' + token);
    if (!token) {
        console.log('Invalid token format');
        return res.status(401).send('Invalid token format');
    }

    try {
        req.user = jwt.verify(token, 'secret');
        console.log('authJWT req.user:', req.user);
        next();
    } catch (err) {
        console.log('Invalid token:' + err);
        return res.status(401).send('Invalid token');
    }
};

module.exports = authJWT;