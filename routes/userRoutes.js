const express = require('express');
const router = express.Router();
const multer = require('multer');
const authJWT = require('../models/auth.js');
const userController = require('../controllers/userController');;


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/', (req, res, next) => {
  console.log('Register route hit');
  next();
}, userController.registerUser);

router.get('/api/users', userController.getAllUsers);
router.post('/api/users', userController.registerUser);
router.post('/api/tokens', userController.generateToken);
router.get('/api/users/:id', authJWT, userController.getUserById);
router.put('/api/users/:id', authJWT, userController.updateUser);
router.patch('/api/users/:id', authJWT, userController.updateUser);
router.delete('/api/users/:id', authJWT, userController.deleteUser);

module.exports = router;