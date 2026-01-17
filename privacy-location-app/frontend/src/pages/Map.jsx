import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import api from '../utils/api';
import { getCircleKey, decryptLocation, encryptLocation, createLocationData } from '../utils/encryption';
import wsClient from '../utils/websocket';

// Fix Leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ position, username, isCurrentUser }) {
  const markerIcon = isCurrentUser
    ? L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
    : L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

  return (
    <Marker position={position} icon={markerIcon}>
      <Popup>
        <div>
          <strong>{username}</strong>
          <br />
          {isCurrentUser ? '(You)' : ''}
        </div>
      </Popup>
    </Marker>
  );
}

function Map() {
  const [searchParams] = useSearchParams();
  const circleId = searchParams.get('circle');

  const [locations, setLocations] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [circles, setCircles] = useState([]);
  const [selectedCircle, setSelectedCircle] = useState(circleId || '');
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    loadCircles();
    getCurrentLocation();

    wsClient.on('location_update', handleRealtimeUpdate);

    return () => {
      wsClient.off('location_update', handleRealtimeUpdate);
    };
  }, []);

  useEffect(() => {
    if (selectedCircle) {
      loadCircleLocations(selectedCircle);
    }
  }, [selectedCircle]);

  const loadCircles = async () => {
    try {
      const response = await api.getCircles();
      setCircles(response.data.circles);
      if (response.data.circles.length > 0 && !selectedCircle) {
        setSelectedCircle(response.data.circles[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to load circles:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const loadCircleLocations = async (circleId) => {
    setLoading(true);
    try {
      const response = await api.getCircleLocations(circleId);
      const key = await getCircleKey(circleId);

      const decryptedLocations = await Promise.all(
        response.data.locations.map(async (loc) => {
          try {
            const decrypted = await decryptLocation(loc.encrypted_data, key);
            return {
              userId: loc.user_id,
              username: loc.username,
              position: {
                lat: decrypted.latitude,
                lng: decrypted.longitude,
              },
              timestamp: decrypted.timestamp,
            };
          } catch (error) {
            console.error('Failed to decrypt location:', error);
            return null;
          }
        })
      );

      setLocations(decryptedLocations.filter((loc) => loc !== null));
    } catch (error) {
      console.error('Failed to load locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const shareCurrentLocation = async () => {
    if (!currentPosition || !selectedCircle) {
      alert('Please select a circle and allow location access');
      return;
    }

    setSharing(true);
    try {
      const key = await getCircleKey(selectedCircle);
      const locationData = createLocationData(
        currentPosition.lat,
        currentPosition.lng,
        currentPosition.accuracy
      );
      const encrypted = await encryptLocation(locationData, key);

      await api.shareLocation(encrypted);
      alert('Location shared successfully!');
      loadCircleLocations(selectedCircle);
    } catch (error) {
      console.error('Failed to share location:', error);
      alert('Failed to share location');
    } finally {
      setSharing(false);
    }
  };

  const handleRealtimeUpdate = async (data) => {
    if (selectedCircle) {
      loadCircleLocations(selectedCircle);
    }
  };

  const defaultCenter = currentPosition
    ? [currentPosition.lat, currentPosition.lng]
    : [40.7128, -74.006]; // Default to NYC

  return (
    <div className="map-page">
      <div className="map-controls">
        <div className="control-group">
          <label>Select Circle:</label>
          <select
            value={selectedCircle}
            onChange={(e) => setSelectedCircle(e.target.value)}
          >
            <option value="">Choose a circle...</option>
            {circles.map((circle) => (
              <option key={circle.id} value={circle.id}>
                {circle.name} ({circle.member_count} members)
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={shareCurrentLocation}
          disabled={!selectedCircle || !currentPosition || sharing}
          className="btn btn-primary"
        >
          {sharing ? 'Sharing...' : 'Share My Location'}
        </button>

        <button onClick={getCurrentLocation} className="btn btn-secondary">
          Refresh My Location
        </button>
      </div>

      {loading && <div className="loading-overlay">Loading locations...</div>}

      <div className="map-container">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: '600px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {currentPosition && (
            <LocationMarker
              position={[currentPosition.lat, currentPosition.lng]}
              username="You"
              isCurrentUser={true}
            />
          )}

          {locations.map((loc) => (
            <LocationMarker
              key={loc.userId}
              position={[loc.position.lat, loc.position.lng]}
              username={loc.username}
              isCurrentUser={false}
            />
          ))}
        </MapContainer>
      </div>

      <div className="map-legend">
        <h3>Map Legend</h3>
        <p>🔵 Blue marker: Your location</p>
        <p>🔴 Red markers: Circle members' locations</p>
        <p>🔐 All locations are end-to-end encrypted</p>
      </div>
    </div>
  );
}

export default Map;
