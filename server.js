// server.js

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const videoRoutes = require('./routes/videoRoutes');
const commentsRoutes = require('./routes/commentRoutes');

const app = express();
const hostname = '127.0.0.1';
const port = 8080;

// Middleware setup
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
app.use(express.static('public'));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', './views');

// Use the routes
app.use('/', userRoutes);
app.use('/', videoRoutes);
app.use('/', commentsRoutes);


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/footube', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Start the server
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});