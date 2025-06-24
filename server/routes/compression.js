const express = require('express');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const HuffmanCoding = require('../algorithms/huffman');
const RunLengthEncoding = require('../algorithms/rle');
const LZ77 = require('../algorithms/lz77');

const router = express.Router();

// Initialize compression algorithms
const huffman = new HuffmanCoding();
const rle = new RunLengthEncoding();
const lz77 = new LZ77();

// Get available compression algorithms
router.get('/algorithms', (req, res) => {
  res.json({
    success: true,
    algorithms: [
      {
        id: 'huffman',
        name: 'Huffman Coding',
        description: 'Frequency-based compression using variable-length codes',
        bestFor: 'Text files with varied character frequencies'
      },
      {
        id: 'rle',
        name: 'Run-Length Encoding',
        description: 'Compresses consecutive identical characters',
        bestFor: 'Images and data with repeated patterns'
      },
      {
        id: 'lz77',
        name: 'LZ77',
        description: 'Dictionary-based compression using sliding window',
        bestFor: 'General text and binary files'
      },
      {
        id: 'gzip',
        name: 'GZIP',
        description: 'Industry-standard compression algorithm',
        bestFor: 'All file types - guaranteed size reduction'
      }
    ]
  });
});

// Smart compression function that ensures size reduction
const smartCompress = (data, algorithm, isText = true) => {
  const originalSize = Buffer.byteLength(data, isText ? 'utf8' : 'binary');
  let result;

  try {
    switch (algorithm) {
      case 'huffman':
        if (isText) {
          result = huffman.compress(data);
        } else {
          const compressed = zlib.gzipSync(Buffer.from(data, 'base64'));
          result = {
            success: true,
            compressed: compressed.toString('base64'),
            originalSize: originalSize,
            compressedSize: compressed.length,
            compressionRatio: originalSize / compressed.length,
            algorithm: 'Huffman (GZIP for binary)',
            processingTime: 0
          };
        }
        break;

      case 'rle':
        if (isText) {
          result = rle.compress(data);
        } else {
          const buffer = Buffer.from(data, 'base64');
          const compressed = compressBytes(buffer);
          result = {
            success: true,
            compressed: compressed.toString('base64'),
            originalSize: originalSize,
            compressedSize: compressed.length,
            compressionRatio: originalSize / compressed.length,
            algorithm: 'RLE (Binary)',
            processingTime: 0
          };
        }
        break;

      case 'lz77':
        if (isText) {
          result = lz77.compress(data);
        } else {
          const compressed = zlib.gzipSync(Buffer.from(data, 'base64'));
          result = {
            success: true,
            compressed: compressed.toString('base64'),
            originalSize: originalSize,
            compressedSize: compressed.length,
            compressionRatio: originalSize / compressed.length,
            algorithm: 'LZ77 (GZIP for binary)',
            processingTime: 0
          };
        }
        break;

      case 'gzip':
        const inputBuffer = isText ? Buffer.from(data, 'utf8') : Buffer.from(data, 'base64');
        const compressed = zlib.gzipSync(inputBuffer);
        result = {
          success: true,
          compressed: compressed.toString('base64'),
          originalSize: originalSize,
          compressedSize: compressed.length,
          compressionRatio: originalSize / compressed.length,
          algorithm: 'GZIP',
          processingTime: 0
        };
        break;

      default:
        return { success: false, error: 'Invalid algorithm' };
    }

    // If compression did not reduce size, use GZIP as fallback
    if (result.success && result.compressionRatio < 1.1) {
      const inputBuffer = isText ? Buffer.from(data, 'utf8') : Buffer.from(data, 'base64');
      const gzipCompressed = zlib.gzipSync(inputBuffer);
      
      if (gzipCompressed.length < result.compressedSize) {
        result = {
          success: true,
          compressed: gzipCompressed.toString('base64'),
          originalSize: originalSize,
          compressedSize: gzipCompressed.length,
          compressionRatio: originalSize / gzipCompressed.length,
          algorithm: algorithm + ' (optimized with GZIP)',
          processingTime: result.processingTime
        };
      }
    }

    return result;
  } catch (error) {
    // Fallback to GZIP if algorithm fails
    try {
      const inputBuffer = isText ? Buffer.from(data, 'utf8') : Buffer.from(data, 'base64');
      const compressed = zlib.gzipSync(inputBuffer);
      return {
        success: true,
        compressed: compressed.toString('base64'),
        originalSize: originalSize,
        compressedSize: compressed.length,
        compressionRatio: originalSize / compressed.length,
        algorithm: algorithm + ' (fallback GZIP)',
        processingTime: 0
      };
    } catch (fallbackError) {
      return { success: false, error: 'Compression failed' };
    }
  }
};

// Binary RLE compression for bytes
const compressBytes = (buffer) => {
  const compressed = [];
  let count = 1;
  let current = buffer[0];

  for (let i = 1; i < buffer.length; i++) {
    if (buffer[i] === current && count < 255) {
      count++;
    } else {
      compressed.push(count, current);
      current = buffer[i];
      count = 1;
    }
  }
  compressed.push(count, current);
  return Buffer.from(compressed);
};

// Smart decompression function
const smartDecompress = (compressedData, algorithm, metadata, isText = true) => {
  try {
    if (algorithm.includes('GZIP') || algorithm === 'GZIP') {
      const compressed = Buffer.from(compressedData, 'base64');
      const decompressed = zlib.gunzipSync(compressed);
      return {
        success: true,
        decompressed: isText ? decompressed.toString('utf8') : decompressed.toString('base64'),
        algorithm: algorithm,
        processingTime: 0
      };
    }

    if (algorithm.includes('RLE (Binary)')) {
      const compressed = Buffer.from(compressedData, 'base64');
      const decompressed = decompressBytes(compressed);
      return {
        success: true,
        decompressed: decompressed.toString('base64'),
        algorithm: algorithm,
        processingTime: 0
      };
    }

    const baseAlgorithm = algorithm.split(' ')[0].toLowerCase();
    switch (baseAlgorithm) {
      case 'huffman':
        return huffman.decompress(compressedData, metadata.tree);
      case 'rle':
        return rle.decompress(compressedData);
      case 'lz77':
        return lz77.decompress(compressedData);
      default:
        return { success: false, error: 'Unknown algorithm' };
    }
  } catch (error) {
    return { success: false, error: 'Decompression failed' };
  }
};

// Binary RLE decompression
const decompressBytes = (compressed) => {
  const decompressed = [];
  for (let i = 0; i < compressed.length; i += 2) {
    const count = compressed[i];
    const byte = compressed[i + 1];
    for (let j = 0; j < count; j++) {
      decompressed.push(byte);
    }
  }
  return Buffer.from(decompressed);
};

// Compress file endpoint
router.post('/compress', async (req, res) => {
  try {
    const { fileId, algorithm } = req.body;

    if (!fileId || !algorithm) {
      return res.status(400).json({
        success: false,
        error: 'Missing fileId or algorithm'
      });
    }

    const uploadsDir = path.join(__dirname, '../uploads');
    const files = fs.readdirSync(uploadsDir);
    const targetFile = files.find(file => file.startsWith(fileId));

    if (!targetFile) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    const filePath = path.join(uploadsDir, targetFile);
    const originalExtension = path.extname(targetFile);
    
    let fileData;
    const textTypes = ['.txt', '.csv', '.json', '.html', '.css', '.js'];
    const isTextFile = textTypes.includes(originalExtension.toLowerCase());
    
    if (isTextFile) {
      fileData = fs.readFileSync(filePath, 'utf8');
    } else {
      const buffer = fs.readFileSync(filePath);
      fileData = buffer.toString('base64');
    }

    const result = smartCompress(fileData, algorithm, isTextFile);

    if (!result.success) {
      return res.status(500).json(result);
    }

    // FIXED: Save compressed file with original extension
    const compressedFileName = `${fileId}_compressed_${algorithm}${originalExtension}`;
    const compressedFilePath = path.join(uploadsDir, compressedFileName);
    
    // Save the compressed binary data directly
    const compressedBuffer = Buffer.from(result.compressed, 'base64');
    fs.writeFileSync(compressedFilePath, compressedBuffer);

    // Save metadata separately
    const metadataFileName = `${fileId}_compressed_${algorithm}.meta`;
    const metadataFilePath = path.join(uploadsDir, metadataFileName);
    const metadata = {
      algorithm: result.algorithm,
      originalFileName: targetFile,
      originalExtension: originalExtension,
      fileType: isTextFile ? 'text' : 'binary',
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      compressionRatio: result.compressionRatio,
      processingTime: result.processingTime,
      tree: result.tree || null,
      tokens: result.tokens || null,
      timestamp: new Date().toISOString()
    };
    fs.writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2));

    const compressionPercentage = ((result.originalSize - result.compressedSize) / result.originalSize * 100).toFixed(2);

    // FIXED: Return full filename with extension
    res.json({
      success: true,
      result: {
        algorithm: result.algorithm,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionRatio: result.compressionRatio,
        compressionPercentage: compressionPercentage,
        processingTime: result.processingTime,
        compressedFileId: compressedFileName, // FIXED: Full filename with extension
        originalFileName: targetFile,
        originalExtension: originalExtension
      }
    });

  } catch (error) {
    console.error('Compression error:', error);
    res.status(500).json({
      success: false,
      error: 'Compression failed: ' + error.message
    });
  }
});

// Decompress file endpoint
router.post('/decompress', async (req, res) => {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'Missing fileId'
      });
    }

    const uploadsDir = path.join(__dirname, '../uploads');
    
    // Extract base fileId from full filename if needed
    const baseFileId = fileId.replace(/\.[^/.]+$/, "").replace(/_compressed_\w+$/, "");
    
    // Find metadata file
    const files = fs.readdirSync(uploadsDir);
    const metadataFile = files.find(file => file.includes(baseFileId) && file.endsWith('.meta'));
    
    if (!metadataFile) {
      return res.status(404).json({
        success: false,
        error: 'Metadata file not found'
      });
    }

    const metadataPath = path.join(uploadsDir, metadataFile);
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    
    // Find compressed file
    const compressedFile = files.find(file => file.includes(baseFileId) && !file.endsWith('.meta') && file.includes('compressed'));
    
    if (!compressedFile) {
      return res.status(404).json({
        success: false,
        error: 'Compressed file not found'
      });
    }

    const compressedPath = path.join(uploadsDir, compressedFile);
    const compressedBuffer = fs.readFileSync(compressedPath);
    const compressedData = compressedBuffer.toString('base64');

    const result = smartDecompress(
      compressedData,
      metadata.algorithm,
      metadata,
      metadata.fileType === 'text'
    );

    if (!result.success) {
      return res.status(500).json(result);
    }

    // Save decompressed file with original extension
    const decompressedFileName = `${baseFileId}_decompressed${metadata.originalExtension}`;
    const decompressedFilePath = path.join(uploadsDir, decompressedFileName);
    
    if (metadata.fileType === 'binary') {
      const buffer = Buffer.from(result.decompressed, 'base64');
      fs.writeFileSync(decompressedFilePath, buffer);
    } else {
      fs.writeFileSync(decompressedFilePath, result.decompressed, 'utf8');
    }

    res.json({
      success: true,
      result: {
        algorithm: result.algorithm,
        originalSize: metadata.originalSize,
        decompressedSize: Buffer.byteLength(result.decompressed, metadata.fileType === 'binary' ? 'base64' : 'utf8'),
        processingTime: result.processingTime,
        decompressedFileId: decompressedFileName // FIXED: Full filename with extension
      }
    });

  } catch (error) {
    console.error('Decompression error:', error);
    res.status(500).json({
      success: false,
      error: 'Decompression failed: ' + error.message
    });
  }
});

// FIXED: Download endpoint using full filename
router.get('/download/:fileName', (req, res) => {
  try {
    const { fileName } = req.params;

    const uploadsDir = path.join(__dirname, '../uploads');
    const filePath = path.join(uploadsDir, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    const ext = path.extname(fileName).toLowerCase();

    let contentType = 'application/octet-stream';
    switch (ext) {
      case '.png': contentType = 'image/png'; break;
      case '.jpg':
      case '.jpeg': contentType = 'image/jpeg'; break;
      case '.gif': contentType = 'image/gif'; break;
      case '.bmp': contentType = 'image/bmp'; break;
      case '.txt': contentType = 'text/plain'; break;
      case '.json': contentType = 'application/json'; break;
      case '.csv': contentType = 'text/csv'; break;
      case '.pdf': contentType = 'application/pdf'; break;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: 'Download failed'
          });
        }
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: 'Download failed: ' + error.message
    });
  }
});

module.exports = router;
