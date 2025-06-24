class RunLengthEncoding {
  constructor() {
    this.name = 'Run-Length Encoding';
  }

  // Compress data using RLE
  compress(data) {
    const startTime = Date.now();

    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'No data to compress'
      };
    }

    try {
      let compressed = '';
      let count = 1;
      let currentChar = data[0];

      for (let i = 1; i < data.length; i++) {
        if (data[i] === currentChar && count < 255) {
          count++;
        } else {
          // Add count and character to compressed string
          compressed += String.fromCharCode(count) + currentChar;
          currentChar = data[i];
          count = 1;
        }
      }

      // Add the last run
      compressed += String.fromCharCode(count) + currentChar;

      const originalSize = data.length;
      const compressedSize = compressed.length;
      const compressionRatio = originalSize / compressedSize;

      return {
        success: true,
        compressed: compressed,
        originalSize: originalSize,
        compressedSize: compressedSize,
        compressionRatio: compressionRatio,
        processingTime: Date.now() - startTime,
        algorithm: 'Run-Length Encoding'
      };

    } catch (error) {
      return {
        success: false,
        error: `RLE compression failed: ${error.message}`
      };
    }
  }

  // Decompress RLE data
  decompress(compressedData) {
    const startTime = Date.now();

    if (!compressedData || compressedData.length === 0) {
      return {
        success: false,
        error: 'No data to decompress'
      };
    }

    if (compressedData.length % 2 !== 0) {
      return {
        success: false,
        error: 'Invalid RLE data format'
      };
    }

    try {
      let decompressed = '';

      for (let i = 0; i < compressedData.length; i += 2) {
        const count = compressedData.charCodeAt(i);
        const char = compressedData[i + 1];
        
        decompressed += char.repeat(count);
      }

      return {
        success: true,
        decompressed: decompressed,
        originalSize: compressedData.length,
        decompressedSize: decompressed.length,
        processingTime: Date.now() - startTime,
        algorithm: 'Run-Length Encoding'
      };

    } catch (error) {
      return {
        success: false,
        error: `RLE decompression failed: ${error.message}`
      };
    }
  }

  // Analyze data to predict RLE effectiveness
  analyzeData(data) {
    if (!data || data.length === 0) return { effectiveness: 0 };

    let runs = 0;
    let currentChar = data[0];
    let runLength = 1;
    let totalRunLength = 0;

    for (let i = 1; i < data.length; i++) {
      if (data[i] === currentChar) {
        runLength++;
      } else {
        runs++;
        totalRunLength += runLength;
        currentChar = data[i];
        runLength = 1;
      }
    }
    runs++; // Count the last run
    totalRunLength += runLength;

    const averageRunLength = totalRunLength / runs;
    const effectiveness = Math.max(0, (averageRunLength - 1) / averageRunLength);

    return {
      effectiveness: effectiveness,
      averageRunLength: averageRunLength,
      totalRuns: runs,
      recommendation: effectiveness > 0.3 ? 'Good for RLE' : 'Poor for RLE'
    };
  }
}

module.exports = RunLengthEncoding;
