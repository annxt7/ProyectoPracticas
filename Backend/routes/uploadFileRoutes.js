const express = require('express');
require('dotenv').config();
const uploadLimiter = require("../middlewares/fileLimiter");
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mis-colecciones', 
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  },
});

const upload = multer({ storage: storage });

// POST: /api/files/upload
router.post('/upload', verifyToken, uploadLimiter, upload.single('imagen'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No se ha subido ningún archivo" });
    }
    res.json({
      success: true,
      url: req.file.path 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;