class HuffmanNode {
  constructor(char, freq, left = null, right = null) {
    this.char = char;
    this.freq = freq;
    this.left = left;
    this.right = right;
  }

  isLeaf() {
    return this.left === null && this.right === null;
  }
}

class HuffmanCoding {
  constructor() {
    this.codes = {};
    this.root = null;
  }

  // Build frequency table
  buildFrequencyTable(data) {
    const freq = {};
    for (let i = 0; i < data.length; i++) {
      const char = data[i];
      freq[char] = (freq[char] || 0) + 1;
    }
    return freq;
  }

  // Build Huffman tree
  buildHuffmanTree(frequencies) {
    const heap = [];
    
    // Create leaf nodes for each character
    for (const [char, freq] of Object.entries(frequencies)) {
      heap.push(new HuffmanNode(char, freq));
    }

    // Sort by frequency
    heap.sort((a, b) => a.freq - b.freq);

    // Build tree bottom-up
    while (heap.length > 1) {
      const left = heap.shift();
      const right = heap.shift();
      
      const merged = new HuffmanNode(null, left.freq + right.freq, left, right);
      
      // Insert merged node in correct position
      let inserted = false;
      for (let i = 0; i < heap.length; i++) {
        if (merged.freq <= heap[i].freq) {
          heap.splice(i, 0, merged);
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        heap.push(merged);
      }
    }

    return heap[0];
  }

  // Generate codes from tree
  generateCodes(node, code = '', codes = {}) {
    if (node.isLeaf()) {
      codes[node.char] = code || '0'; // Handle single character case
      return codes;
    }

    if (node.left) {
      this.generateCodes(node.left, code + '0', codes);
    }
    if (node.right) {
      this.generateCodes(node.right, code + '1', codes);
    }

    return codes;
  }

  // Compress data
  compress(data) {
    const startTime = Date.now();

    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'No data to compress'
      };
    }

    try {
      // Build frequency table
      const frequencies = this.buildFrequencyTable(data);
      
      // Handle single character case
      if (Object.keys(frequencies).length === 1) {
        const char = Object.keys(frequencies)[0];
        const compressed = '0'.repeat(data.length);
        return {
          success: true,
          compressed: compressed,
          tree: { [char]: '0' },
          originalSize: data.length,
          compressedSize: Math.ceil(compressed.length / 8),
          compressionRatio: data.length / Math.ceil(compressed.length / 8),
          processingTime: Date.now() - startTime
        };
      }

      // Build Huffman tree
      this.root = this.buildHuffmanTree(frequencies);
      
      // Generate codes
      this.codes = this.generateCodes(this.root);

      // Encode data
      let compressed = '';
      for (let i = 0; i < data.length; i++) {
        compressed += this.codes[data[i]];
      }

      const originalSize = data.length;
      const compressedSize = Math.ceil(compressed.length / 8); // Convert bits to bytes
      const compressionRatio = originalSize / compressedSize;

      return {
        success: true,
        compressed: compressed,
        tree: this.codes,
        originalSize: originalSize,
        compressedSize: compressedSize,
        compressionRatio: compressionRatio,
        processingTime: Date.now() - startTime,
        algorithm: 'Huffman Coding'
      };

    } catch (error) {
      return {
        success: false,
        error: `Compression failed: ${error.message}`
      };
    }
  }

  // Decompress data
  decompress(compressedData, tree) {
    const startTime = Date.now();

    if (!compressedData || !tree) {
      return {
        success: false,
        error: 'Invalid compressed data or tree'
      };
    }

    try {
      // Build reverse lookup table
      const reverseTree = {};
      for (const [char, code] of Object.entries(tree)) {
        reverseTree[code] = char;
      }

      let decompressed = '';
      let currentCode = '';

      for (let i = 0; i < compressedData.length; i++) {
        currentCode += compressedData[i];
        
        if (reverseTree[currentCode]) {
          decompressed += reverseTree[currentCode];
          currentCode = '';
        }
      }

      return {
        success: true,
        decompressed: decompressed,
        originalSize: Math.ceil(compressedData.length / 8),
        decompressedSize: decompressed.length,
        processingTime: Date.now() - startTime,
        algorithm: 'Huffman Coding'
      };

    } catch (error) {
      return {
        success: false,
        error: `Decompression failed: ${error.message}`
      };
    }
  }
}

module.exports = HuffmanCoding;
