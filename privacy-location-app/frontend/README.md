# Privacy Location App - Frontend

Privacy-first location sharing frontend built with React + Vite.

## Features

- Modern React with Hooks
- End-to-end encryption using Web Crypto API
- Real-time updates via WebSocket
- Interactive maps with Leaflet
- Responsive design
- Circle-based location sharing
- Privacy-focused UI/UX

## Tech Stack

- **React 18** - UI library
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Leaflet** - Interactive maps (OpenStreetMap)
- **Web Crypto API** - Client-side encryption
- **Axios** - HTTP client
- **WebSocket** - Real-time updates

## Prerequisites

- Node.js 16+
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` if needed:

```env
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

### 5. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable React components
│   │   └── Header.jsx
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Map.jsx
│   │   ├── Circles.jsx
│   │   └── Settings.jsx
│   ├── context/         # React context providers
│   │   └── AuthContext.jsx
│   ├── utils/           # Utility functions
│   │   ├── api.js       # API client
│   │   ├── encryption.js # E2E encryption
│   │   └── websocket.js # WebSocket client
│   ├── styles/          # CSS files
│   │   └── index.css
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## Features Guide

### Authentication

- **Register**: Create a new account with username, email, and password
- **Login**: Authenticate with username and password
- **JWT tokens**: Stored in localStorage, auto-expire after 7 days

### Location Sharing

1. **Grant location permission** when prompted by the browser
2. **Select a circle** to share with
3. **Click "Share My Location"** to encrypt and share your current location
4. **Real-time updates** show circle members' locations on the map

### Encryption

All location data is encrypted on your device before being sent to the server:

- **AES-256-GCM** encryption
- **Unique keys per circle** stored in localStorage
- **Web Crypto API** for secure key generation
- **Server can't read your coordinates** - only encrypted blobs

### Circles

- **Create circles** for different groups (Family, Friends, etc.)
- **Invite members** by username
- **Manage permissions** - stop/resume sharing per circle
- **Leave or delete** circles anytime

### Settings

- **View account info**
- **Configure auto-sharing**
- **Data retention settings**
- **Export your data** (GDPR compliance)
- **Delete location history**
- **Clear encryption keys**

## How Encryption Works

```javascript
// 1. Generate or retrieve circle encryption key
const key = await getCircleKey(circleId);

// 2. Create location data object
const locationData = {
  latitude: 40.7128,
  longitude: -74.0060,
  accuracy: 10,
  timestamp: new Date().toISOString()
};

// 3. Encrypt using Web Crypto API
const encrypted = await encryptLocation(locationData, key);

// 4. Send encrypted blob to server
await api.shareLocation(encrypted);

// The server stores the encrypted data
// but cannot decrypt it without the key!
```

## WebSocket Events

The app connects to WebSocket for real-time updates:

```javascript
// Connection with JWT token
wsClient.connect(token);

// Listen for location updates
wsClient.on('location_update', (data) => {
  // Receive encrypted location from circle member
  // Decrypt and update map
});

// Listen for connection status
wsClient.on('connected', () => {
  console.log('Real-time updates enabled');
});
```

## Maps Integration

Uses Leaflet with OpenStreetMap tiles:

- **No Google tracking** - OpenStreetMap is open-source
- **Custom markers** - Blue for you, Red for others
- **Interactive popups** - Show username and timestamp
- **Auto-centering** - Centers on your location

## Browser Compatibility

- Chrome 60+
- Firefox 57+
- Safari 11+
- Edge 79+

*Note: Requires Web Crypto API support*

## Privacy Features

- All location data encrypted on device
- No third-party analytics or trackers
- No ads
- Open source - audit the code yourself
- Local storage for encryption keys
- Auto-deletion of location history
- Data export functionality

## Development

### Adding a New Page

1. Create component in `src/pages/`
2. Add route in `App.jsx`
3. Add navigation link in `Header.jsx`

### Adding API Endpoints

1. Add method to `src/utils/api.js`
2. Use in components with `await api.yourMethod()`

### Styling

- Global styles in `src/styles/index.css`
- CSS variables for theming
- Responsive design with CSS Grid and Flexbox
- Mobile-first approach

## Deployment

### Static Hosting (Netlify, Vercel, etc.)

1. Build the app:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder

3. Configure environment variables on hosting platform:
   - `VITE_API_URL`: Your backend API URL
   - `VITE_WS_URL`: Your WebSocket URL

### Important: Update CORS

Make sure your backend allows requests from your frontend domain!

In backend `.env`:
```env
ALLOWED_ORIGINS=https://yourdomain.com
```

## Troubleshooting

### Location not working

- Check browser permissions
- Must use HTTPS in production (or localhost in dev)
- Some browsers block geolocation on HTTP

### WebSocket connection failed

- Check WebSocket URL in `.env`
- Ensure backend is running
- Check firewall settings

### Encryption errors

- Clear browser cache and localStorage
- Re-join circles to regenerate keys
- Check browser console for errors

### Map not loading

- Check internet connection (needs to load tiles)
- Check browser console for errors
- Verify Leaflet CSS is loaded

## License

MIT
