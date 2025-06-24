class LZ77 {
  constructor(windowSize = 4096, lookaheadSize = 18) {
    this.windowSize = windowSize;
    this.lookaheadSize = lookaheadSize;
    this.name = 'LZ77';
  }

  // Find the longest match in the search window
  findLongestMatch(data, currentPos) {
    const windowStart = Math.max(0, currentPos - this.windowSize);
    const windowEnd = currentPos;
    const lookaheadEnd = Math.min(data.length, currentPos + this.lookaheadSize);

    let bestMatch = { offset: 0, length: 0 };

    // Search for matches in the window
    for (let i = windowStart; i < windowEnd; i++) {
      let matchLength = 0;
      
      // Count matching characters
      while (
        currentPos + matchLength < lookaheadEnd &&
        data[i + matchLength] === data[currentPos + matchLength]
      ) {
        matchLength++;
      }

      // Update best match if this one is longer
      if (matchLength > bestMatch.length) {
        bestMatch = {
          offset: currentPos - i,
          length: matchLength
        };
      }
    }

    return bestMatch;
  }

  // Compress data using LZ77
  compress(data) {
    const startTime = Date.now();

    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'No data to compress'
      };
    }

    try {
      const compressed = [];
      let position = 0;

      while (position < data.length) {
        const match = this.findLongestMatch(data, position);

        if (match.length >= 3) {
          // Found a good match, encode as (offset, length, next_char)
          const nextChar = position + match.length < data.length 
            ? data[position + match.length] 
            : '';
          
          compressed.push({
            type: 'match',
            offset: match.offset,
            length: match.length,
            nextChar: nextChar
          });

          position += match.length + (nextChar ? 1 : 0);
        } else {
          // No good match found, encode as literal
          compressed.push({
            type: 'literal',
            char: data[position]
          });
          position++;
        }
      }

      // Convert to string representation
      let compressedString = '';
      for (const token of compressed) {
        if (token.type === 'literal') {
          compressedString += `L${token.char}`;
        } else {
          compressedString += `M${token.offset},${token.length},${token.nextChar}`;
        }
        compressedString += '|'; // Delimiter
      }

      const originalSize = data.length;
      const compressedSize = compressedString.length;
      const compressionRatio = originalSize / compressedSize;

      return {
        success: true,
        compressed: compressedString,
        tokens: compressed,
        originalSize: originalSize,
        compressedSize: compressedSize,
        compressionRatio: compressionRatio,
        processingTime: Date.now() - startTime,
        algorithm: 'LZ77'
      };

    } catch (error) {
      return {
        success: false,
        error: `LZ77 compression failed: ${error.message}`
      };
    }
  }

  // Decompress LZ77 data
  decompress(compressedData) {
    const startTime = Date.now();

    if (!compressedData || compressedData.length === 0) {
      return {
        success: false,
        error: 'No data to decompress'
      };
    }

    try {
      let decompressed = '';
      const tokens = compressedData.split('|').filter(token => token.length > 0);

      for (const token of tokens) {
        if (token.startsWith('L')) {
          // Literal character
          decompressed += token.substring(1);
        } else if (token.startsWith('M')) {
          // Match token
          const parts = token.substring(1).split(',');
          const offset = parseInt(parts[0]);
          const length = parseInt(parts[1]);
          const nextChar = parts[2];

          // Copy from the window
          const startPos = decompressed.length - offset;
          for (let i = 0; i < length; i++) {
            decompressed += decompressed[startPos + i];
          }

          // Add next character if present
          if (nextChar) {
            decompressed += nextChar;
          }
        }
      }

      return {
        success: true,
        decompressed: decompressed,
        originalSize: compressedData.length,
        decompressedSize: decompressed.length,
        processingTime: Date.now() - startTime,
        algorithm: 'LZ77'
      };

    } catch (error) {
      return {
        success: false,
        error: `LZ77 decompression failed: ${error.message}`
      };
    }
  }

  // Analyze data for LZ77 effectiveness
  analyzeData(data) {
    if (!data || data.length === 0) return { effectiveness: 0 };

    let totalMatches = 0;
    let totalMatchLength = 0;
    let position = 0;

    while (position < data.length) {
      const match = this.findLongestMatch(data, position);
      
      if (match.length >= 3) {
        totalMatches++;
        totalMatchLength += match.length;
        position += match.length;
      } else {
        position++;
      }
    }

    const effectiveness = totalMatchLength / data.length;
    const averageMatchLength = totalMatches > 0 ? totalMatchLength / totalMatches : 0;

    return {
      effectiveness: effectiveness,
      averageMatchLength: averageMatchLength,
      totalMatches: totalMatches,
      recommendation: effectiveness > 0.2 ? 'Good for LZ77' : 'Poor for LZ77'
    };
  }
}

module.exports = LZ77;
