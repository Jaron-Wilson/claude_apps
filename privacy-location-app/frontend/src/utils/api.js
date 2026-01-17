import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class API {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  // Auth
  post(url, data) {
    return this.client.post(url, data);
  }

  get(url, config) {
    return this.client.get(url, config);
  }

  put(url, data) {
    return this.client.put(url, data);
  }

  delete(url) {
    return this.client.delete(url);
  }

  // Location endpoints
  shareLocation(encryptedData, expiresIn = null) {
    return this.post('/location/share', { encryptedData, expiresIn });
  }

  getCircleLocations(circleId) {
    return this.get(`/location/circle/${circleId}`);
  }

  getLocationHistory(limit = 10) {
    return this.get(`/location/history?limit=${limit}`);
  }

  stopSharing(circleId) {
    return this.post(`/location/stop-sharing/${circleId}`);
  }

  resumeSharing(circleId) {
    return this.post(`/location/resume-sharing/${circleId}`);
  }

  // Circle endpoints
  createCircle(name) {
    return this.post('/circles', { name });
  }

  getCircles() {
    return this.get('/circles');
  }

  getCircleDetails(circleId) {
    return this.get(`/circles/${circleId}`);
  }

  addCircleMember(circleId, username) {
    return this.post(`/circles/${circleId}/members`, { username });
  }

  leaveCircle(circleId) {
    return this.delete(`/circles/${circleId}/leave`);
  }

  deleteCircle(circleId) {
    return this.delete(`/circles/${circleId}`);
  }
}

const api = new API();
export default api;
