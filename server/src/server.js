const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const config = require('./config');

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// CORS configuration for deployment
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app-name.vercel.app' // Update this later
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API routes (we'll add these in next steps)
app.use('/api/upload', require('../routes/upload'));
app.use('/api/compression', require('../routes/compression'));

// Error handling middleware
app.use(require('../middleware/errorHandler'));

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
});
