const express = require('express');
const app = express();


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nasa-app', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB!');
});

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
  });
  
  const User = mongoose.model('User', userSchema);

  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  
  app.post('/register', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send('User already exists');
      }
  
      // Hash password and create new user
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const newUser = new User({ email, password: hashedPassword });
      await newUser.save();
  
      res.status(201).send('User created successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  });

  const jwt = require('jsonwebtoken');

  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).send('Invalid email or password');
      }
  
      // Compare password hashes
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).send('Invalid email or password');
      }
  
      // Generate JWT token and send to client
      const token = jwt.sign({ email }, 'secret');
      res.status(200).json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  });

  const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

  app.get('/image', authenticateToken, async (req, res) => {
    const apiKey = 'YzbvUkbxukWA42ZdCxVxjlE4cWySckrW5eZxKpIsEY';
    const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
  
    try {
      // Fetch today's NASA image
      const response = await fetch(apiUrl);
      const data = await response.json();
  
      // Send image data to client
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal server error');
    }
  });
  
  // Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (token == null) return res.sendStatus(401);
  
    jwt.verify(token, 'secret', (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  }
  
