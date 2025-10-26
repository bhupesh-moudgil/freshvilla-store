const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save to frontend public/images/products directory
    const uploadDir = path.join(__dirname, '../../../freshvilla-customer-web/public/images/products');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, nameWithoutExt + '-' + uniqueSuffix + ext);
  }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  // Only allow JPEG, PNG, and WebP for product images
  const allowedTypes = /jpeg|jpg|png|webp/;
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed. No GIF or other formats.'));
  }
};

// Configure multer with strict limits
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024, // 500KB limit (existing images are ~30KB average)
    files: 1 // Only one file at a time
  },
  fileFilter: fileFilter
});

module.exports = upload;
