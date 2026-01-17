import React, { useState, useEffect } from 'react';
import api from '../utils/api';

function Circles() {
  const [circles, setCircles] = useState([]);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [circleDetails, setCircleDetails] = useState(null);
  const [newCircleName, setNewCircleName] = useState('');
  const [newMemberUsername, setNewMemberUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCircles();
  }, []);

  useEffect(() => {
    if (selectedCircle) {
      loadCircleDetails(selectedCircle);
    }
  }, [selectedCircle]);

  const loadCircles = async () => {
    try {
      const response = await api.getCircles();
      setCircles(response.data.circles);
    } catch (error) {
      console.error('Failed to load circles:', error);
    }
  };

  const loadCircleDetails = async (circleId) => {
    setLoading(true);
    try {
      const response = await api.getCircleDetails(circleId);
      setCircleDetails(response.data);
    } catch (error) {
      console.error('Failed to load circle details:', error);
      setError('Failed to load circle details');
    } finally {
      setLoading(false);
    }
  };

  const createCircle = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newCircleName.trim()) {
      setError('Circle name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await api.createCircle(newCircleName);
      setSuccess('Circle created successfully!');
      setNewCircleName('');
      loadCircles();
      setSelectedCircle(response.data.circle.id);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create circle');
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newMemberUsername.trim() || !selectedCircle) {
      setError('Username is required');
      return;
    }

    setLoading(true);
    try {
      await api.addCircleMember(selectedCircle, newMemberUsername);
      setSuccess(`Added ${newMemberUsername} to circle!`);
      setNewMemberUsername('');
      loadCircleDetails(selectedCircle);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const leaveCircle = async (circleId) => {
    if (!confirm('Are you sure you want to leave this circle?')) {
      return;
    }

    try {
      await api.leaveCircle(circleId);
      setSuccess('Left circle successfully');
      setSelectedCircle(null);
      setCircleDetails(null);
      loadCircles();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to leave circle');
    }
  };

  const deleteCircle = async (circleId) => {
    if (!confirm('Are you sure you want to delete this circle? This cannot be undone.')) {
      return;
    }

    try {
      await api.deleteCircle(circleId);
      setSuccess('Circle deleted successfully');
      setSelectedCircle(null);
      setCircleDetails(null);
      loadCircles();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete circle');
    }
  };

  return (
    <div className="circles-page">
      <h1>Manage Circles</h1>

      <div className="circles-layout">
        <div className="circles-sidebar">
          <div className="create-circle-form">
            <h2>Create New Circle</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={createCircle}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Circle name (e.g., Family, Friends)"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                Create Circle
              </button>
            </form>
          </div>

          <div className="circles-list">
            <h3>Your Circles ({circles.length})</h3>
            {circles.length === 0 ? (
              <p className="empty-state">No circles yet. Create one above!</p>
            ) : (
              <ul>
                {circles.map((circle) => (
                  <li
                    key={circle.id}
                    className={selectedCircle === circle.id ? 'active' : ''}
                    onClick={() => setSelectedCircle(circle.id)}
                  >
                    <div className="circle-item">
                      <strong>{circle.name}</strong>
                      <span className="member-count">{circle.member_count} members</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="circle-details">
          {!selectedCircle ? (
            <div className="empty-state">
              <p>Select a circle to view details</p>
            </div>
          ) : loading ? (
            <div className="loading">Loading...</div>
          ) : circleDetails ? (
            <div>
              <div className="circle-header">
                <h2>{circleDetails.circle.name}</h2>
                <div className="circle-actions">
                  <button
                    onClick={() => leaveCircle(selectedCircle)}
                    className="btn btn-secondary"
                  >
                    Leave Circle
                  </button>
                  <button
                    onClick={() => deleteCircle(selectedCircle)}
                    className="btn btn-danger"
                  >
                    Delete Circle
                  </button>
                </div>
              </div>

              <div className="add-member-form">
                <h3>Add Member</h3>
                <form onSubmit={addMember}>
                  <div className="form-group">
                    <input
                      type="text"
                      placeholder="Enter username"
                      value={newMemberUsername}
                      onChange={(e) => setNewMemberUsername(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    Add Member
                  </button>
                </form>
              </div>

              <div className="members-list">
                <h3>Members ({circleDetails.members.length})</h3>
                <ul>
                  {circleDetails.members.map((member) => (
                    <li key={member.id}>
                      <div className="member-item">
                        <div>
                          <strong>{member.username}</strong>
                          <small>{member.email}</small>
                        </div>
                        <small className="joined-date">
                          Joined: {new Date(member.joined_at).toLocaleDateString()}
                        </small>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Circles;
