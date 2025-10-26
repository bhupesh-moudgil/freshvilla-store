const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const { exec } = require('child_process');
const path = require('path');
const util = require('util');
const sharp = require('sharp');
const fs = require('fs').promises;

const execPromise = util.promisify(exec);

// @route   POST /api/upload/product-image
// @desc    Upload product image and commit to GitHub
// @access  Private (Admin only)
router.post('/product-image', protect, upload.single('image'), async (req, res) => {
  let uploadedFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    uploadedFilePath = req.file.path;
    
    // Validate and process image with sharp
    const metadata = await sharp(uploadedFilePath).metadata();
    
    // Validate dimensions (recommended: 220x220 to 800x800 max)
    const MAX_WIDTH = 800;
    const MAX_HEIGHT = 800;
    const RECOMMENDED_SIZE = 220; // Your existing product images are 220x220
    
    if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
      await fs.unlink(uploadedFilePath); // Delete uploaded file
      return res.status(400).json({
        success: false,
        message: `Image dimensions too large. Maximum: ${MAX_WIDTH}x${MAX_HEIGHT}px. Uploaded: ${metadata.width}x${metadata.height}px`
      });
    }
    
    // Auto-resize and compress to match existing product images (220x220, ~30KB)
    const processedFilename = req.file.filename;
    const processedPath = path.join(path.dirname(uploadedFilePath), processedFilename);
    
    await sharp(uploadedFilePath)
      .resize(RECOMMENDED_SIZE, RECOMMENDED_SIZE, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: 80,
        mozjpeg: true 
      })
      .toFile(processedPath + '.tmp');
    
    // Replace original with processed
    await fs.unlink(uploadedFilePath);
    await fs.rename(processedPath + '.tmp', uploadedFilePath);
    
    // Get final file size
    const stats = await fs.stat(uploadedFilePath);
    const finalSizeKB = Math.round(stats.size / 1024);
    
    const filename = req.file.filename;
    const imageUrl = `/images/products/${filename}`;
    const frontendPath = path.join(__dirname, '../../../freshvilla-customer-web');

    // Optional: Auto-commit to GitHub (can be disabled if you prefer manual commits)
    const autoCommit = process.env.AUTO_COMMIT_IMAGES === 'true';
    
    if (autoCommit) {
      try {
        // Git commands to commit and push the new image
        await execPromise(`cd ${frontendPath} && git add public/images/products/${filename}`);
        await execPromise(`cd ${frontendPath} && git commit -m "Add product image: ${filename}"`);
        await execPromise(`cd ${frontendPath} && git push`);
        
        console.log(`Image ${filename} committed and pushed to GitHub`);
      } catch (gitError) {
        console.error('Git commit error:', gitError);
        // Don't fail the upload if git fails - image is still saved locally
      }
    }

    res.json({
      success: true,
      message: 'Image uploaded and optimized successfully',
      data: {
        filename,
        imageUrl,
        path: req.file.path,
        originalSize: req.file.size,
        optimizedSize: stats.size,
        optimizedSizeKB: finalSizeKB,
        dimensions: `${RECOMMENDED_SIZE}x${RECOMMENDED_SIZE}`,
        format: 'JPEG',
        autoCommitted: autoCommit
      }
    });
  } catch (error) {
    // Clean up uploaded file if error occurs
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath).catch(() => {});
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Image upload failed'
    });
  }
});

// @route   POST /api/upload/multiple-images
// @desc    Upload multiple product images
// @access  Private (Admin only)
router.post('/multiple-images', protect, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedImages = req.files.map(file => ({
      filename: file.filename,
      imageUrl: `/images/products/${file.filename}`,
      size: file.size
    }));

    res.json({
      success: true,
      message: `${req.files.length} images uploaded successfully`,
      data: uploadedImages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Images upload failed'
    });
  }
});

module.exports = router;
