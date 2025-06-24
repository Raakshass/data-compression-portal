import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';

const FileUpload = ({ onFileUploaded, onError }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const allowedTypes = [
    'text/plain', 'text/csv', 'application/json',
    'image/jpeg', 'image/png', 'image/gif', 'image/bmp',
    'application/pdf', 'application/octet-stream'
  ];

  const validateFile = useCallback((selectedFile) => {
    if (!selectedFile) return 'Please select a file';
    if (!allowedTypes.includes(selectedFile.type) && selectedFile.type !== '') {
      return 'Unsupported file format';
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      return 'File exceeds 50MB limit';
    }
    return null;
  }, [allowedTypes]);

  const handleFileSelect = useCallback((selectedFile) => {
    const error = validateFile(selectedFile);
    if (error) {
      onError?.(error);
      return;
    }
    setFile(selectedFile);
    onError?.(null);
  }, [validateFile, onError]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const clearFile = () => {
    setFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      if (response.data.success) {
        onFileUploaded?.(response.data.file);
        setTimeout(() => {
          clearFile();
        }, 1500);
      } else {
        onError?.(response.data.error || 'Upload failed');
      }
    } catch (error) {
      let errorMessage = 'Upload failed';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Upload timeout. Please try again.';
      }
      onError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main Upload Area */}
      <div className="relative">
        <div
          className={`
            relative border-2 border-dashed rounded-2xl transition-all duration-300 ease-out
            ${dragOver 
              ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 scale-[1.02]' 
              : file 
                ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50'
                : 'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50 hover:border-gray-400 hover:bg-gradient-to-br hover:from-gray-100 hover:to-slate-100'
            }
            ${uploading ? 'pointer-events-none' : 'cursor-pointer'}
            overflow-hidden
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" 
                 style={{
                   backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2px, transparent 0),
                                     radial-gradient(circle at 75px 75px, rgba(255,255,255,0.2) 2px, transparent 0)`,
                   backgroundSize: '100px 100px'
                 }}>
            </div>
          </div>

          <div className="relative p-8 lg:p-12">
            {!file ? (
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className={`
                    w-20 h-20 mx-auto rounded-full transition-all duration-500 ease-out
                    ${dragOver 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 scale-110 shadow-lg shadow-blue-200' 
                      : 'bg-gradient-to-br from-gray-400 to-slate-500 hover:scale-105 hover:shadow-md'
                    }
                    flex items-center justify-center
                  `}>
                    <svg 
                      className={`w-8 h-8 text-white transition-transform duration-300 ${dragOver ? 'scale-110' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                  </div>
                  {dragOver && (
                    <div className="absolute -inset-2 border-2 border-blue-400 rounded-full animate-ping opacity-30"></div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className={`text-xl font-semibold transition-colors duration-300 ${
                    dragOver ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {dragOver ? 'Drop your file here' : 'Upload your file'}
                  </h3>
                  <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                    Drag and drop your file here, or click to browse
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400">
                    <span className="px-2 py-1 bg-white bg-opacity-60 rounded-full">TXT</span>
                    <span className="px-2 py-1 bg-white bg-opacity-60 rounded-full">CSV</span>
                    <span className="px-2 py-1 bg-white bg-opacity-60 rounded-full">JSON</span>
                    <span className="px-2 py-1 bg-white bg-opacity-60 rounded-full">JPG</span>
                    <span className="px-2 py-1 bg-white bg-opacity-60 rounded-full">PNG</span>
                    <span className="px-2 py-1 bg-white bg-opacity-60 rounded-full">PDF</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    disabled={uploading}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                {uploading && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Uploading...</span>
                      <span className="text-sm text-gray-500">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      >
                        <div className="h-full bg-white bg-opacity-30 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.csv,.json,.jpg,.jpeg,.png,.gif,.bmp,.pdf"
            disabled={uploading}
          />
        </div>

        {/* Upload Button */}
        {file && !uploading && (
          <div className="mt-6">
            <button
              onClick={handleUpload}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-lg shadow-blue-200 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              <span className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload File</span>
              </span>
            </button>
          </div>
        )}
      </div>

      {/* File Size Limit Info */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">
          Maximum file size: 50MB
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
