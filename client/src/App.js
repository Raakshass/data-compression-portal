import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import CompressionInterface from './components/CompressionInterface';
import './App.css';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileUploaded = (fileInfo) => {
    setUploadedFile(fileInfo);
    setError(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setShowSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000ms"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000ms"></div>
      </div>

      <div className="relative z-10 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Data Compression Portal
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Upload, compress, and optimize your files using advanced algorithms. 
              Experience the power of efficient data compression.
            </p>
          </div>

          {/* Success Notification */}
          {showSuccess && (
            <div className="mb-8 transform transition-all duration-500 ease-out">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Upload Successful</p>
                    <p className="text-sm opacity-90">Your file is ready for compression</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div className="mb-8 transform transition-all duration-500 ease-out">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">Error</p>
                    <p className="text-sm opacity-90">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-3xl shadow-xl border border-white border-opacity-20 p-8 lg:p-12 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Your File</h2>
              <p className="text-gray-600">Select a file to get started with compression</p>
            </div>
            
            <FileUpload 
              onFileUploaded={handleFileUploaded}
              onError={handleError}
            />
          </div>

          {/* File Info Section */}
          {uploadedFile && (
            <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-3xl shadow-xl border border-white border-opacity-20 p-8 lg:p-12 mb-8 transform transition-all duration-500 ease-out animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">File Ready</h2>
                <p className="text-gray-600">Your file has been uploaded and is ready for compression</p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{uploadedFile.originalName}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>Size: {uploadedFile.sizeFormatted}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        <span>Type: {uploadedFile.mimetype}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Compression Interface */}
          {uploadedFile && (
            <div className="transform transition-all duration-500 ease-out animate-fade-in">
              <CompressionInterface uploadedFile={uploadedFile} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
