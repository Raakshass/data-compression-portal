import React, { useState } from 'react';
import axios from 'axios';

const CompressionResults = ({ result, uploadedFile }) => {
  const [decompressing, setDecompressing] = useState(false);
  const [decompressResult, setDecompressResult] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleDecompress = async () => {
    setDecompressing(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/compression/decompress`, {
        fileId: result.compressedFileId
      });

      if (response.data.success) {
        setDecompressResult(response.data.result);
      } else {
        setError(response.data.error || 'Decompression failed');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Decompression failed');
    } finally {
      setDecompressing(false);
    }
  };

  const handleDownload = async (fileName, displayName) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/compression/download/${encodeURIComponent(fileName)}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', displayName || fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Download failed');
    }
  };

  if (!result) return null;

  return (
    <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-3xl shadow-xl border border-white border-opacity-20 p-8 lg:p-12 mt-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Compression Results</h2>
        <p className="text-gray-600">Your file has been successfully compressed</p>
      </div>

      {/* Compression Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-1">Algorithm</p>
            <p className="text-lg font-semibold text-gray-800">{result.algorithm}</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-1">Compression Ratio</p>
            <p className="text-lg font-semibold text-green-600">{result.compressionRatio.toFixed(2)}:1</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-1">Size Reduction</p>
            <p className="text-lg font-semibold text-purple-600">{result.compressionPercentage}%</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-1">Processing Time</p>
            <p className="text-lg font-semibold text-orange-600">{result.processingTime}ms</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-blue-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Original Size:</span>
            <span className="font-medium">{result.originalSize} bytes</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-gray-600">Compressed Size:</span>
            <span className="font-medium">{result.compressedSize} bytes</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => {
            // Use the exact compressedFileId returned from backend (which includes extension)
            handleDownload(result.compressedFileId, result.compressedFileId);
          }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <span className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download Compressed</span>
          </span>
        </button>

        <button
          onClick={handleDecompress}
          disabled={decompressing}
          className={`font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${
            decompressing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
          }`}
        >
          <span className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>{decompressing ? 'Decompressing...' : 'Test Decompression'}</span>
          </span>
        </button>

        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <span className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Compress Another File</span>
          </span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Decompression Results */}
      {decompressResult && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Decompression Successful!</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Processing Time:</span>
              <span className="ml-2 font-medium">{decompressResult.processingTime}ms</span>
            </div>
            <div>
              <span className="text-gray-600">Decompressed Size:</span>
              <span className="ml-2 font-medium">{decompressResult.decompressedSize} bytes</span>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => {
                // Extract original filename and extension from uploadedFile
                const originalName = uploadedFile.originalName;
                const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
                const originalExt = originalName.substring(originalName.lastIndexOf('.'));
                const decompressedName = `${nameWithoutExt}_decompressed${originalExt}`;
                handleDownload(decompressResult.decompressedFileId, decompressedName);
              }}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
            >
              Download Decompressed File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompressionResults;
