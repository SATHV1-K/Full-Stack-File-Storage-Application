import React, { useState } from 'react';
import './FileUpload.css';

const FileUpload = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setStatusMessage('');
    }
  };
  
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };
  
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setStatusMessage('');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setStatusMessage('Error: Please select a file first!');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Uploading...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(import.meta.env.VITE_API_BACKEND_URL + '/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setStatusMessage(result.message || 'Upload successful!');
      onUploadSuccess();
    } catch (error) {
      setStatusMessage(`Error: Could not upload file. Is the backend running?`);
      console.error('There was a problem with the file upload:', error);
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
      setFileName('');
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFileName('');
    setStatusMessage('');
  };

  const dropzoneClassName = `
    file-drop-zone
    ${isDragOver ? 'drag-over' : ''}
    ${selectedFile ? 'has-file' : ''}
  `;

  const statusMessageClassName = `
    status-message
    ${statusMessage.includes('Error') ? 'error' : ''}
    ${statusMessage.includes('success') ? 'success' : ''}
  `;

  return (
    <div className="upload-container">
      <div className="upload-card">
        <div className="upload-header">
            <div className="upload-header-icon-wrapper">
              <svg className="upload-header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
          <div>
            <h2 className="upload-title">Upload Files</h2>
            <p className="upload-subtitle">Your personal file storage solution</p>
          </div>
        </div>

        <div className="upload-content">
          <form onSubmit={handleFormSubmit} className="upload-form">
            <div
              className={dropzoneClassName}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="file-info">
                  <div className="file-icon-wrapper success">
                      <svg className="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                  </div>
                  <div>
                    <p className="file-name">{fileName}</p>
                    <p className="file-size">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="file-remove-button"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="drop-zone-prompt">
                  <div className="file-icon-wrapper">
                      <svg className="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                  </div>
                  <div>
                    <p className="drop-zone-text-lg">
                      {isDragOver ? 'Drop your file here' : 'Choose a file or drag it here'}
                    </p>
                    <p className="drop-zone-text-sm">
                      Any file type, up to 10MB
                    </p>
                  </div>
                  <label className="browse-button">
                    <svg className="browse-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    Browse Files
                    <input
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                  </label>
                </div>
              )}
            </div>

            {statusMessage && (
              <div className={statusMessageClassName}>
                  {statusMessage.includes('Error') ? (
                    <svg className="status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : statusMessage.includes('success') ? (
                    <svg className="status-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="status-icon loading" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  <span className="status-text">{statusMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="upload-button"
            >
              {isLoading ? (
                <div className="loading-indicator">
                  <svg className="loading-spinner" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </div>
              ) : (
                'Upload File'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;