import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import wsClient from '../utils/websocket';

function Dashboard() {
  const { user, token } = useAuth();
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharingLocation, setSharingLocation] = useState(false);

  useEffect(() => {
    loadCircles();
    wsClient.connect(token);

    wsClient.on('location_update', handleLocationUpdate);

    return () => {
      wsClient.off('location_update', handleLocationUpdate);
    };
  }, [token]);

  const loadCircles = async () => {
    try {
      const response = await api.getCircles();
      setCircles(response.data.circles);
    } catch (error) {
      console.error('Failed to load circles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationUpdate = (data) => {
    console.log('Received location update:', data);
    // Handle real-time location updates here
  };

  const toggleLocationSharing = () => {
    setSharingLocation(!sharingLocation);
    // Implement location sharing toggle
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.username}!</h1>
        <p className="subtitle">Your privacy-first location sharing dashboard</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{circles.length}</h3>
            <p>Active Circles</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔐</div>
          <div className="stat-content">
            <h3>E2E</h3>
            <p>Encrypted</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-content">
            <h3>{sharingLocation ? 'ON' : 'OFF'}</h3>
            <p>Location Sharing</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/map" className="action-btn">
            <span className="icon">🗺️</span>
            <span>View Map</span>
          </Link>
          <Link to="/circles" className="action-btn">
            <span className="icon">➕</span>
            <span>Create Circle</span>
          </Link>
          <button onClick={toggleLocationSharing} className="action-btn">
            <span className="icon">📍</span>
            <span>{sharingLocation ? 'Stop Sharing' : 'Share Location'}</span>
          </button>
        </div>
      </div>

      <div className="circles-overview">
        <h2>Your Circles</h2>
        {loading ? (
          <p>Loading...</p>
        ) : circles.length === 0 ? (
          <div className="empty-state">
            <p>You haven't joined any circles yet.</p>
            <Link to="/circles" className="btn btn-primary">
              Create your first circle
            </Link>
          </div>
        ) : (
          <div className="circles-grid">
            {circles.map((circle) => (
              <div key={circle.id} className="circle-card">
                <h3>{circle.name}</h3>
                <p>{circle.member_count} members</p>
                <Link to={`/map?circle=${circle.id}`} className="btn btn-sm">
                  View on Map
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="privacy-notice">
        <div className="notice-icon">🔒</div>
        <div className="notice-content">
          <h3>Your Privacy Matters</h3>
          <p>
            All your location data is end-to-end encrypted. We never sell your data,
            and you have complete control over who sees your location.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
