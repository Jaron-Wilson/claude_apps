# Privacy Location Share

A privacy-first location sharing app - an ethical alternative to Life360.

**✨ Access from anywhere: Phone, Tablet, or Computer!**
- Works as a **website** on any device
- Install as an **app** on iPhone, Android, or desktop
- Progressive Web App (PWA) - works like a native app

## Why This App?

Unlike commercial location sharing apps that sell your data, this app is built with privacy as the foundation:

- **End-to-End Encryption**: Your location data is encrypted on your device before being sent
- **No Data Selling**: Your data is never sold or shared with third parties
- **Self-Hosted Option**: Run your own server for complete control
- **Open Source**: Full transparency - see exactly what the app does
- **Minimal Data Retention**: Location data is only stored as long as needed
- **No Tracking or Analytics**: No third-party trackers or analytics

## Features

**Privacy & Security:**
- 🔐 End-to-end encrypted location sharing
- 🚫 Privacy zones (hide location at specific places)
- ⏰ Temporary location sharing
- 🗑️ Auto-deletion of old data

**Sharing & Social:**
- 👥 Create private circles with friends and family
- 📍 Real-time location updates via WebSocket
- 🔔 Arrival/departure notifications (coming soon)
- 💬 Circle-based permissions

**Mobile & Web:**
- 📱 Progressive Web App - install on any device
- 🌐 Works on iPhone, Android, and desktop browsers
- 📴 Offline support with service worker
- 🔋 Battery-efficient location tracking
- 🗺️ Interactive maps (OpenStreetMap - no tracking!)

## Architecture

```
┌─────────────┐         ┌─────────────┐
│   Mobile/   │◄───────►│   Backend   │
│   Web App   │  HTTPS  │   Server    │
└─────────────┘         └─────────────┘
      │                        │
      │ E2E Encryption         │ Encrypted DB
      ▼                        ▼
   Private Key            Encrypted Data
```

## Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL (encrypted storage)
- WebSocket for real-time updates
- JWT authentication

**Frontend:**
- React + TypeScript
- Leaflet for maps (OpenStreetMap)
- Service Worker for background updates

**Encryption:**
- AES-256 for data encryption
- RSA for key exchange
- TLS/SSL for transport

## Quick Start

### Local Development

See `/backend/README.md` and `/frontend/README.md` for detailed setup instructions.

**Quick start:**
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

### Deploy to the Web

Want to access from your phone or anywhere? See the **[Deployment Guide](docs/DEPLOYMENT.md)** for:

- **Netlify/Vercel** (Frontend) - Free hosting
- **Railway/Render** (Backend) - Free/low-cost hosting
- **Docker** - Self-hosting with one command
- **PWA Installation** - Install like a native app on any device

**Estimated time**: 30 minutes to deploy
**Cost**: Free tier available on most platforms

## Privacy Principles

1. **Data Minimization**: Only collect what's absolutely necessary
2. **User Control**: Users can delete their data anytime
3. **Transparency**: Open source and auditable
4. **Security by Design**: Encryption and security from the ground up
5. **No Monetization Through Data**: Free or subscription-based, never ad-supported

## License

MIT - Use it freely, modify it, self-host it!
