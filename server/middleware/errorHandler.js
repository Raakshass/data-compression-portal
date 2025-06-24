const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err);

  // Default error
  let error = {
    success: false,
    error: 'Internal Server Error'
  };

  // Multer errors
  if (err.code && err.code.startsWith('LIMIT_')) {
    error.error = err.message;
    return res.status(400).json(error);
  }

  // File type errors
  if (err.message && err.message.includes('not supported')) {
    error.error = err.message;
    return res.status(400).json(error);
  }

  // Generic server error
  res.status(500).json(error);
};

module.exports = errorHandler;
