
const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/user');
const { validationResult, check } = require('express-validator');


router.post('/register', [
  check('email').isEmail().withMessage('Invalid email address'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'Email address is already registered' });
      }

      const user = await User.create({ email, password });
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });
  
  
  
router.post('/login', async (req, res) => {
const { email, password } = req.body;
try {
    const user = await User.findOne({ email });

    if (!user) {
    return res.status(401).json({ error: 'Authentication failed' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
    return res.status(401).json({ error: 'Authentication failed' });
    }

    const token = jwt.sign({ userId: user._id }, 'your-secret-key', {
    expiresIn: '1h', // Set an expiration time for the token
    });

    res.json({ token });
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Authentication failed' });
}
});

module.exports = router;