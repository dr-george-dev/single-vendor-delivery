const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary from environment variables (CLOUDINARY_URL or individual vars)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'single-vendor-delivery/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, crop: 'limit' }],
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Upload handler: multer-storage-cloudinary already uploads to Cloudinary
const uploadImage = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // multer-storage-cloudinary sets req.file.path to the uploaded URL and req.file.filename to public_id
    const url = req.file.path || req.file.location || null;
    const public_id = req.file.filename || req.file.public_id || null;

    return res.json({ url, public_id });
  } catch (error) {
    console.error('Cloudinary upload failed', error);
    return res.status(500).json({ message: 'Upload failed' });
  }
};

module.exports = { upload, uploadImage };
