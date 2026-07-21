const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Check if Cloudinary is configured
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

// Cloudinary storage
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'single-vendor-delivery/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, crop: 'limit' }],
  },
});

// Local storage fallback
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Use Cloudinary if configured, otherwise fall back to local storage
const storage = isCloudinaryConfigured ? cloudinaryStorage : localStorage;
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Uploaded file must be an image'));
    }
    cb(null, true);
  },
});

// Upload handler: works with both Cloudinary and local storage
const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let url, public_id;

    if (isCloudinaryConfigured) {
      // Cloudinary storage
      url = req.file.path || req.file.location;
      public_id = req.file.filename || req.file.public_id;
    } else {
      // Local storage fallback - construct absolute URL
      const protocol = req.protocol || 'http';
      const host = req.get('host') || 'localhost:5000';
      url = `${protocol}://${host}/uploads/${req.file.filename}`;
      public_id = req.file.filename;
    }

    if (!url) {
      return res.status(500).json({ message: 'Failed to generate image URL' });
    }

    return res.json({
      url,
      public_id,
      uploadedAt: new Date().toISOString(),
      storage: isCloudinaryConfigured ? 'cloudinary' : 'local',
    });
  } catch (error) {
    console.error('Upload failed:', error);
    return res.status(500).json({ message: `Upload failed: ${error.message}` });
  }
};

module.exports = { upload, uploadImage };
