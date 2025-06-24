const path = require('path');
const config = require('../src/config');

// Allowed file types for compression
const allowedMimeTypes = [
  'text/plain',
  'text/csv',
  'application/json',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/bmp',
  'application/pdf',
  'application/octet-stream'
];

const fileFilter = (req, file, cb) => {
  // Check file type
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not supported. Allowed types: ${allowedMimeTypes.join(', ')}`), false);
  }
};

const generateFileName = (req, file, cb) => {
  // Generate unique filename to prevent conflicts
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const fileExt = path.extname(file.originalname);
  const fileName = `${file.fieldname}-${uniqueSuffix}${fileExt}`;
  cb(null, fileName);
};

module.exports = {
  fileFilter,
  generateFileName,
  allowedMimeTypes
};
