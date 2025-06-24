const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { fileFilter, generateFileName } = require('../middleware/fileValidation');
const config = require('../src/config');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: generateFileName
});

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE, // 50MB
    fieldSize: 52428800, // 50MB for field size
    files: 1 // Only one file at a time
  }
});

// File upload endpoint
router.post('/', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Handle Multer-specific errors
      let errorMessage = 'Upload error occurred';
      
      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          errorMessage = `File too large. Maximum size allowed is ${config.MAX_FILE_SIZE / (1024 * 1024)}MB`;
          break;
        case 'LIMIT_UNEXPECTED_FILE':
          errorMessage = 'Unexpected file field';
          break;
        case 'LIMIT_FILE_COUNT':
          errorMessage = 'Too many files. Only one file allowed';
          break;
        default:
          errorMessage = err.message;
      }
      
      return res.status(400).json({
        success: false,
        error: errorMessage,
        code: err.code
      });
    } else if (err) {
      // Handle other errors (like file type validation)
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Get file stats
    const fileStats = fs.statSync(req.file.path);
    
    // Return success response with file information
    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        id: req.file.filename.split('.')[0], // Use filename without extension as ID
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
        sizeFormatted: formatFileSize(req.file.size),
        uploadDate: new Date().toISOString(),
        path: req.file.path
      }
    });
  });
});

// Get file information endpoint
router.get('/:fileId', (req, res) => {
  const { fileId } = req.params;
  
  try {
    // Find file by ID (filename without extension)
    const files = fs.readdirSync(uploadsDir);
    const targetFile = files.find(file => file.startsWith(fileId));
    
    if (!targetFile) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    const filePath = path.join(uploadsDir, targetFile);
    const fileStats = fs.statSync(filePath);
    
    res.json({
      success: true,
      file: {
        id: fileId,
        filename: targetFile,
        size: fileStats.size,
        sizeFormatted: formatFileSize(fileStats.size),
        lastModified: fileStats.mtime.toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error retrieving file information'
    });
  }
});

// Helper function to format file size
function formatFileSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

module.exports = router;
