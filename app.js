const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, 
              { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});


const authRoutes = require('./routes/authRoutes');
const imageRoutes = require('./routes/imageRoutes');

app.use('/auth', authRoutes); 
app.use('/images', imageRoutes); 

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

var server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

module.exports = server