import { useState } from 'react';
import FileUpload from './components/FileUpload';
import FileLookup from './components/FileLookup';
import './App.css';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

  return (
    <div className="app-container">
      <div className="background-pattern"></div>
      
      <header className="app-header">
        <div className="header-logo">
            <svg className="header-logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          <h1 className="header-title">
            FileDrop
          </h1>
        </div>
        <p className="header-subtitle">
          A simple and secure place for your files.
        </p>
      </header>

      <main className="app-main">
        <FileUpload onUploadSuccess={handleUploadSuccess} />
        <FileLookup refreshKey={refreshKey} />
      </main>

      <footer className="app-footer">
          <div className="footer-logo">
            <div className="footer-logo-icon-wrapper">
              <svg className="footer-logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <span className="footer-title">FileDrop</span>
          </div>
          <p className="footer-text">
            A personal project for file storage and management.
          </p>
          <div className="footer-links">
            <span>Built with React & Spring Boot</span>
            <span>•</span>
            <span>Secure & Reliable</span>
          </div>
      </footer>
    </div>
  );
}

export default App;