import React, { useState, useEffect } from 'react';
import './FileLookup.css';

const FileLookup = ({ refreshKey }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(import.meta.env.VITE_API_LOOKUP_URL);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        setError('Could not fetch files. Please try again later.');
        console.error("Error fetching files:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [refreshKey]);

  const handleDelete = async (fileKey) => {
    if (!window.confirm(`Are you sure you want to delete "${fileKey}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BACKEND_URL}/api/delete/${fileKey}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete file.');
      }
      
      // On success, remove the file directly from the local state
      setFiles(currentFiles => currentFiles.filter(file => file.fileName !== fileKey));

    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error("Error deleting file:", error);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)} days ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    let icon;
    switch (extension) {
      case 'pdf':
        icon = (
            <svg className="file-item-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        );
        break;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        icon = (
            <svg className="file-item-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        );
        break;
      case 'doc':
      case 'docx':
        icon = (
            <svg className="file-item-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        );
        break;
      default:
        icon = (
            <svg className="file-item-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        );
    }
    return <div className={`file-item-icon ${extension}`}>{icon}</div>
  };

  const sortedFiles = [...files].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc' ? b.uploadTimestamp - a.uploadTimestamp : a.uploadTimestamp - b.uploadTimestamp;
    } else if (sortBy === 'name') {
      return sortOrder === 'desc' ? b.fileName.localeCompare(a.fileName) : a.fileName.localeCompare(b.fileName);
    } else if (sortBy === 'size') {
      return sortOrder === 'desc' ? b.size - a.size : a.size - b.size;
    }
    return 0;
  });

  return (
    <div className="lookup-container">
      <div className="lookup-card">
        <div className="lookup-header">
          <div className="lookup-header-info">
            <div className="lookup-header-icon-wrapper">
              <svg className="lookup-header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h2 className="lookup-title">File Library</h2>
              <p className="lookup-subtitle">Browse and manage your files</p>
            </div>
          </div>
          <div className="lookup-header-stats">
            <p className="lookup-stats-count">{files.length} Files</p>
            <p className="lookup-stats-label">Total stored</p>
          </div>
        </div>

        <div className="lookup-filters">
          <span className="filter-label">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="date">Upload Date</option>
            <option value="name">File Name</option>
            <option value="size">File Size</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="filter-button"
          >
            {sortOrder === 'desc' ? '↓' : '↑'}
          </button>
        </div>

        <div className="lookup-content">
          {isLoading ? (
            <div className="message-container">
              <div className="loading-spinner-large"></div>
              <p className="message-text">Loading files...</p>
            </div>
          ) : error ? (
            <div className="message-container">
              <div className="message-icon-wrapper error">
                <svg className="message-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="message-title">Error Loading Files</h3>
              <p className="message-text">{error}</p>
            </div>
          ) : files.length === 0 ? (
            <div className="message-container">
              <div className="message-icon-wrapper">
                <svg className="message-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="message-title">No Files Found</h3>
              <p className="message-text">Upload your first file to get started</p>
            </div>
          ) : (
            <div className="file-list">
              {sortedFiles.map((file) => (
                <div key={file.s3_url} className="file-item">
                  <div className="file-item-info">
                    {getFileIcon(file.fileName)}
                    <div>
                      <h3 className="file-item-name">{file.fileName}</h3>
                      <div className="file-item-meta">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{formatDate(file.uploadTimestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="file-item-actions">
                    <button
                      onClick={() => window.open(file.s3_url, '_blank')}
                      className="view-file-button"
                    >
                      View File
                    </button>
                    <button
                      onClick={() => handleDelete(file.fileName)}
                      className="delete-file-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileLookup;