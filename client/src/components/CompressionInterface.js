import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CompressionResults from './CompressionResults';

const CompressionInterface = ({ uploadedFile }) => {
  const [algorithms, setAlgorithms] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('');
  const [compressing, setCompressing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Fetch available algorithms on component mount
  useEffect(() => {
    const fetchAlgorithms = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/compression/algorithms`);
        if (response.data.success) {
          setAlgorithms(response.data.algorithms);
          setSelectedAlgorithm(response.data.algorithms[0]?.id || '');
        }
      } catch (error) {
        setError('Failed to load compression algorithms');
      }
    };

    fetchAlgorithms();
  }, [API_BASE_URL]);

  const handleCompress = async () => {
    if (!uploadedFile || !selectedAlgorithm) return;

    setCompressing(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/compression/compress`, {
        fileId: uploadedFile.id,
        algorithm: selectedAlgorithm
      });

      if (response.data.success) {
        setResult(response.data.result);
      } else {
        setError(response.data.error || 'Compression failed');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Compression failed');
    } finally {
      setCompressing(false);
    }
  };

  const handleNewCompression = () => {
    setResult(null);
    setError(null);
  };

  if (!uploadedFile) {
    return null;
  }

  // Show results if compression is complete
  if (result) {
    return (
      <>
        <CompressionResults result={result} uploadedFile={uploadedFile} />
        <div className="text-center mt-6">
          <button
            onClick={handleNewCompression}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Try Different Algorithm
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-3xl shadow-xl border border-white border-opacity-20 p-8 lg:p-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Compression Algorithm</h2>
        <p className="text-gray-600">Select an algorithm to compress your file</p>
      </div>

      {/* Algorithm Selection */}
      <div className="space-y-4 mb-8">
        {algorithms.map((algo) => (
          <div
            key={algo.id}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              selectedAlgorithm === algo.id
                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50'
                : 'border-gray-200 hover:border-gray-300 bg-gray-50'
            }`}
            onClick={() => setSelectedAlgorithm(algo.id)}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedAlgorithm === algo.id 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300'
              }`}>
                {selectedAlgorithm === algo.id && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{algo.name}</h3>
                <p className="text-sm text-gray-600">{algo.description}</p>
                <p className="text-xs text-blue-600 mt-1">Best for: {algo.bestFor}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compress Button */}
      <div className="text-center mb-6">
        <button
          onClick={handleCompress}
          disabled={compressing || !selectedAlgorithm}
          className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
            compressing || !selectedAlgorithm
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transform hover:scale-105 shadow-lg'
          }`}
        >
          {compressing ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Compressing...</span>
            </span>
          ) : (
            'Compress File'
          )}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default CompressionInterface;
