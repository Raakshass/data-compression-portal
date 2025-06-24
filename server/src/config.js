module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_FILE_TYPES: ['text/plain', 'image/jpeg', 'image/png', 'application/octet-stream']
};
