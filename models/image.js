const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  fileName: String,
  imageUrl: String,
  metadata: Object,
});

module.exports = mongoose.model('Image', imageSchema);