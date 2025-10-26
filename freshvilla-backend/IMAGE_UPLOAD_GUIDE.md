# Image Upload System - GitHub Integration

## Overview
This system allows admins to upload product images directly from the admin panel, which are then saved to the GitHub repository and can be automatically committed.

## How It Works

### 1. **Image Upload Flow**
```
Admin Panel (Frontend)
    ↓ (Upload Image)
Backend API (/api/upload/product-image)
    ↓ (Save to filesystem)
freshvilla-customer-web/public/images/products/
    ↓ (Optional: Auto-commit)
GitHub Repository
    ↓ (Deploy/Build)
Live Website (Images accessible)
```

### 2. **File Storage Location**
- Images are saved to: `freshvilla-customer-web/public/images/products/`
- Filename format: `originalname-timestamp-random.ext`
- Example: `banana-1699123456789-987654321.jpg`

### 3. **Image URL Format**
After upload, the image URL will be: `/images/products/filename.jpg`

This path is:
- Accessible directly in the React app (served from `/public`)
- Committed to GitHub and deployed with your code
- Available at: `https://yourdomain.com/images/products/filename.jpg`

## Configuration

### Enable Auto-Commit to GitHub

In your backend `.env` file:
```env
AUTO_COMMIT_IMAGES=true
```

**When enabled:**
- Each uploaded image is automatically committed to Git
- Changes are pushed to GitHub
- Commit message: "Add product image: filename.jpg"

**When disabled (default):**
- Images are saved locally
- You can manually commit them later with:
```bash
cd freshvilla-customer-web
git add public/images/products/*
git commit -m "Add product images"
git push
```

## Usage in Admin Panel

### Upload Product Image

1. Go to **Admin Dashboard** → **Products** → **Add/Edit Product**
2. Under "Product Image" section:
   - Click **Choose File** and select an image
   - Click **Upload Image** button
   - Wait for success message
3. The image URL will be automatically filled in the form
4. Complete the rest of the product form and save

### Supported Image Formats
- JPEG / JPG
- PNG
- GIF
- WebP

### File Size Limit
- Maximum: **5MB per image**

## API Endpoints

### Single Image Upload
```
POST /api/upload/product-image
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Body:
  image: File
```

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "filename": "banana-1699123456789-987654321.jpg",
    "imageUrl": "/images/products/banana-1699123456789-987654321.jpg",
    "size": 245678,
    "autoCommitted": false
  }
}
```

### Multiple Images Upload
```
POST /api/upload/multiple-images
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

Body:
  images: File[] (max 5 images)
```

## Security Features

1. **Authentication Required**: Only logged-in admins can upload
2. **File Type Validation**: Only image files allowed
3. **File Size Limit**: Maximum 5MB per file
4. **Unique Filenames**: Prevents overwrites with timestamp + random suffix
5. **Path Sanitization**: Prevents directory traversal attacks

## GitHub Auto-Commit Setup

For auto-commit to work, ensure:

1. **Git is configured** on your server:
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

2. **SSH keys or credentials** are set up for pushing to GitHub

3. **Working directory** has git initialized and remote configured

## Manual Commit Workflow (Recommended)

If you prefer manual control:

1. Set `AUTO_COMMIT_IMAGES=false` in `.env`
2. Upload images normally through admin panel
3. Periodically commit and push:
```bash
cd /path/to/freshvilla-customer-web
git add public/images/products/
git commit -m "Add new product images"
git push origin main
```

## Troubleshooting

### Images not showing after upload
- Check if file exists: `ls freshvilla-customer-web/public/images/products/`
- Verify the image URL in product data
- Ensure images are committed and deployed

### Auto-commit failing
- Check git configuration: `git config --list`
- Verify write permissions on frontend directory
- Check server logs for git errors
- Consider using manual commit workflow instead

### File size errors
- Reduce image size before uploading
- Use image optimization tools (TinyPNG, ImageOptim, etc.)
- Recommended: Images under 500KB for web

## Best Practices

1. **Optimize images** before uploading (compress, resize)
2. **Use descriptive filenames** (e.g., "organic-banana.jpg")
3. **Commit images in batches** rather than individually
4. **Keep image sizes reasonable** (under 1MB recommended)
5. **Use WebP format** for better compression
6. **Backup images** separately from code repository

## Alternative: Cloud Storage

For production at scale, consider using:
- **Cloudinary** (easier, built-in optimization)
- **AWS S3** (more control, cheaper at scale)
- **Google Cloud Storage**
- **Azure Blob Storage**

These services provide:
- Automatic image optimization
- CDN delivery
- No git repository bloat
- Better performance
