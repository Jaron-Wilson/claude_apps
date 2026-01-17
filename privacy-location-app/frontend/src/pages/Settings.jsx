import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function Settings() {
  const { user } = useAuth();
  const [autoShare, setAutoShare] = useState(false);
  const [shareInterval, setShareInterval] = useState(300); // seconds
  const [retentionHours, setRetentionHours] = useState(24);
  const [success, setSuccess] = useState('');

  const clearLocalData = () => {
    if (confirm('Are you sure you want to clear all local encryption keys? You will need to rejoin circles.')) {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('circle_key_')) {
          localStorage.removeItem(key);
        }
      });
      setSuccess('Local encryption keys cleared');
    }
  };

  const exportData = async () => {
    try {
      const response = await api.getLocationHistory(100);
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `location-data-${new Date().toISOString()}.json`;
      link.click();
      setSuccess('Data exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const deleteAllLocations = async () => {
    if (confirm('Are you sure you want to delete all your location history? This cannot be undone.')) {
      try {
        await api.delete('/location/cleanup');
        setSuccess('All location data deleted');
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="settings-section">
        <h2>Account Information</h2>
        <div className="info-grid">
          <div>
            <label>Username:</label>
            <span>{user?.username}</span>
          </div>
          <div>
            <label>Email:</label>
            <span>{user?.email}</span>
          </div>
          <div>
            <label>User ID:</label>
            <span>{user?.id}</span>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2>Location Sharing</h2>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={autoShare}
              onChange={(e) => setAutoShare(e.target.checked)}
            />
            Auto-share location in background
          </label>
          <p className="setting-description">
            Automatically share your location with circles at regular intervals
          </p>
        </div>

        {autoShare && (
          <div className="setting-item">
            <label>Share interval (seconds):</label>
            <input
              type="number"
              value={shareInterval}
              onChange={(e) => setShareInterval(parseInt(e.target.value))}
              min="60"
              max="3600"
            />
            <p className="setting-description">
              How often to share your location (60-3600 seconds)
            </p>
          </div>
        )}

        <div className="setting-item">
          <label>Data retention (hours):</label>
          <input
            type="number"
            value={retentionHours}
            onChange={(e) => setRetentionHours(parseInt(e.target.value))}
            min="1"
            max="168"
          />
          <p className="setting-description">
            How long to keep location history (1-168 hours)
          </p>
        </div>
      </div>

      <div className="settings-section">
        <h2>Privacy & Security</h2>
        <div className="action-buttons">
          <button onClick={clearLocalData} className="btn btn-secondary">
            Clear Encryption Keys
          </button>
          <p className="setting-description">
            Remove all locally stored encryption keys. You'll need to rejoin circles.
          </p>
        </div>
      </div>

      <div className="settings-section">
        <h2>Data Management</h2>
        <div className="action-buttons">
          <button onClick={exportData} className="btn btn-secondary">
            Export My Data
          </button>
          <button onClick={deleteAllLocations} className="btn btn-danger">
            Delete All Location History
          </button>
        </div>
        <p className="setting-description">
          Export your data or permanently delete your location history
        </p>
      </div>

      <div className="settings-section">
        <h2>About Privacy</h2>
        <div className="privacy-info">
          <p>
            <strong>🔐 End-to-End Encryption:</strong> Your location data is encrypted on your device before being sent to our servers.
          </p>
          <p>
            <strong>🚫 No Data Selling:</strong> We never sell your data to third parties. Ever.
          </p>
          <p>
            <strong>🗑️ Auto-Deletion:</strong> Location data is automatically deleted after the retention period.
          </p>
          <p>
            <strong>👁️ Open Source:</strong> This is an open-source project. You can review the code anytime.
          </p>
        </div>
      </div>

      {success && <div className="success-message">{success}</div>}
    </div>
  );
}

export default Settings;
