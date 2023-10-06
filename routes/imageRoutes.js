
const express = require('express');
const router = express.Router();
const authenticateToken = require('../controller/authController');
const multer = require('multer');
const Image = require("../models/image")
const fs = require('fs');


router.use(authenticateToken);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
const upload = multer({ storage });


router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { filename, path } = req.file;
  const metadata = req.body;

  try {
    const image = new Image({ fileName:filename, imageUrl:path, metadata });
    await image.save();

    res.status(201).json({ message: 'Image uploaded successfully', image });
  } catch (error) {
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.message });
    } else if (error.name === 'MongoError' && error.code === 11000) {
      return res.status(409).json({ error: 'Image already exists' });
    }

    res.status(500).json({ error: 'Failed to upload image' });
  }
});


router.get('/', async (req, res) => {
    try {
      const images = await Image.find({}, { _id: 1, fileName:1, imageUrl:1, metadata: 1 });
  
      res.json(images);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to retrieve image list' });
    }
  });

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const image = await Image.findById(id);
    const imageUrl = image.imageUrl;
    if (image && fs.existsSync(imageUrl)) {
      const image = fs.readFileSync(imageUrl);
  
      res.setHeader('Content-Type', 'image/jpeg'); 
      res.end(image);
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  });

router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { filename, path } = req.file;
  const updatedMetadata = req.body;

  try {
    const image = await Image.findById(id);

    if (image.fileName && image.imageUrl) {
        const previousImagePath = image.imageUrl;
        if (fs.existsSync(previousImagePath)) {
          fs.unlinkSync(previousImagePath);
        }
      }

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    if (filename && path) {
      image.fileName = filename;
      image.imageUrl = path;
    }

    image.metadata = { ...image.metadata, ...updatedMetadata };

    await image.save();

    res.json({ message: 'Image and metadata updated successfully', image });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update image and metadata' });
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {

    const image = await Image.findById(id);

    const result = await Image.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    if (image.fileName && image.imageUrl) {
        const previousImagePath = image.imageUrl;
        if (fs.existsSync(previousImagePath)) {
          fs.unlinkSync(previousImagePath);
        }
      }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});


module.exports = router;
