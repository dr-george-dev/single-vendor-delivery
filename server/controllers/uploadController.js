const path = require('path');
const multer = require('multer');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadImage = (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    return res.json({ url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Upload failed' });
  }
};

module.exports = { upload, uploadImage };
