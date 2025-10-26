# Image Upload Limits & Specifications

## ✅ Updated Limits (Based on Your Existing Product Images)

### Current Product Image Analysis:
- **Dimensions**: 220x220 pixels
- **Average Size**: ~30KB
- **Format**: JPEG
- **Total Products Analyzed**: 18 images

---

## 🔒 Strict Upload Limits

### File Size:
- **Maximum**: 500KB (reduced from 5MB)
- **Average Expected**: 30-50KB after optimization
- **Reason**: Your existing images are ~30KB, so 500KB provides 16x buffer

### Dimensions:
- **Maximum**: 800x800 pixels
- **Auto-Resized To**: 220x220 pixels (matches existing products)
- **Fit**: Cover (centered crop)
- **Reason**: All your product images are consistently 220x220px

### File Formats:
- ✅ **JPEG** (.jpg, .jpeg)
- ✅ **PNG** (.png)
- ✅ **WebP** (.webp)
- ❌ **GIF** - NOT ALLOWED (removed)
- ❌ **SVG** - NOT ALLOWED
- ❌ **BMP, TIFF** - NOT ALLOWED

### MIME Type Validation:
Only these MIME types are accepted:
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`

---

## 🎯 Automatic Image Processing

When you upload an image, the system automatically:

1. **Validates Format**: Only JPEG, PNG, WebP allowed
2. **Validates Size**: Rejects files over 500KB
3. **Validates Dimensions**: Rejects images larger than 800x800px
4. **Auto-Resizes**: Converts to 220x220px (matches existing products)
5. **Auto-Optimizes**: Compresses to JPEG at 80% quality with mozjpeg
6. **Saves**: Stores in `public/images/products/` with unique filename

### Result:
- Consistent 220x220px images
- Optimized file size (~30-50KB)
- Professional JPEG quality
- No manual editing needed

---

## 🚫 What Gets Rejected

### ❌ File Too Large:
```
Error: File size exceeds 500KB limit
Your file: 1.2MB
Action: Compress or resize image before uploading
```

### ❌ Dimensions Too Large:
```
Error: Image dimensions too large. Maximum: 800x800px. Uploaded: 1920x1080px
Action: Resize image to under 800x800px
```

### ❌ Wrong Format:
```
Error: Only JPEG, PNG, and WebP images are allowed. No GIF or other formats.
Action: Convert to JPEG, PNG, or WebP
```

### ❌ Invalid MIME Type:
```
Error: Invalid file type
Action: Ensure file is a valid image
```

---

## 📋 Upload Requirements Checklist

Before uploading, ensure your image:
- [ ] Is in JPEG, PNG, or WebP format
- [ ] Is under 500KB in size
- [ ] Is under 800x800 pixels (will be auto-resized to 220x220px)
- [ ] Is a clear product photo with good lighting
- [ ] Has no text overlay or watermarks (optional)

---

## 🛡️ Security Features

1. **Extension Validation**: Checks file extension
2. **MIME Type Validation**: Verifies actual file type
3. **Content Validation**: Uses Sharp to validate image content
4. **Size Limits**: Enforced at multiple levels
5. **Dimension Limits**: Prevents memory issues
6. **Unique Filenames**: Prevents overwrites and conflicts
7. **Auto-Cleanup**: Deletes file if validation fails
8. **Admin-Only Access**: Requires authentication

---

## 💡 Recommendations

### For Best Results:
1. **Pre-optimize images** before upload
   - Use tools like TinyPNG, ImageOptim, or Squoosh
   - Aim for under 100KB before upload

2. **Recommended dimensions**:
   - Exactly 220x220px (will match existing products perfectly)
   - Or up to 800x800px (will be auto-resized)

3. **Use JPEG format**:
   - Best compression for photos
   - Matches your existing products
   - Smaller file sizes

4. **Square images work best**:
   - Product centered in frame
   - White or transparent background
   - Good lighting and focus

---

## 📊 Comparison: Before vs After

### Before (Original 5MB limit):
- ❌ No dimension validation
- ❌ No auto-optimization
- ❌ Allowed GIF files
- ❌ Could upload 5MB files
- ❌ Inconsistent image sizes

### After (New Strict Limits):
- ✅ Max 500KB (10x smaller limit)
- ✅ Max 800x800px dimensions
- ✅ Auto-resize to 220x220px
- ✅ Auto-optimize to ~30KB
- ✅ Only JPEG, PNG, WebP
- ✅ Validates file content
- ✅ Consistent product images

---

## 🔧 Technical Details

### Sharp Image Processing:
```javascript
sharp(image)
  .resize(220, 220, {
    fit: 'cover',
    position: 'center'
  })
  .jpeg({ 
    quality: 80,
    mozjpeg: true 
  })
```

### Multer Configuration:
```javascript
{
  fileSize: 500 * 1024,    // 500KB
  files: 1                 // One file at a time
}
```

### Dimension Validation:
```javascript
MAX_WIDTH: 800px
MAX_HEIGHT: 800px
RECOMMENDED_SIZE: 220px (square)
```

---

## ⚠️ Important Notes

1. **All uploaded images are automatically resized to 220x220px** to match your existing product catalog
2. **Original uploaded file is replaced** with optimized version
3. **Images are converted to JPEG** regardless of upload format
4. **File size after processing**: Typically 25-50KB
5. **Repository size impact**: Minimal (~30KB per product)

---

## 🎨 Example Workflow

1. Admin selects product image (e.g., 2MB, 2000x2000px PNG)
2. System validates: ❌ Too large (>500KB)
3. Admin compresses image to 400KB
4. Admin uploads again
5. System validates: ✅ Passes (400KB, 2000x2000px)
6. System auto-resizes: 2000x2000px → 220x220px
7. System optimizes: 400KB → 35KB JPEG
8. Result: Perfect 220x220px, 35KB product image matching your catalog

---

## 📞 Troubleshooting

### "File too large" error:
- Compress image before upload
- Use online tools: TinyPNG, Squoosh.app
- Or use image editor to reduce quality

### "Dimensions too large" error:
- Resize image to under 800x800px
- Or just upload anyway - system auto-resizes to 220x220px

### Upload succeeds but image looks wrong:
- Check original image quality
- Ensure product is centered
- Use square images for best results

---

**Last Updated**: November 2024
**Version**: 2.0 with Strict Limits & Auto-Optimization
