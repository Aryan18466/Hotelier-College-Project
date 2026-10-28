const express = require('express');
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Upload single or multiple images
router.post('/', protect, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'Please upload at least one image file' });
  }

  const fileUrls = req.files.map((file) => `/uploads/${file.filename}`);

  res.status(200).json({
    success: true,
    count: fileUrls.length,
    urls: fileUrls,
  });
});

module.exports = router;
