# Privacy Location Share

A privacy-first location sharing app - an ethical alternative to Life360.

## Why This App?

Unlike commercial location sharing apps that sell your data, this app is built with privacy as the foundation:

- **End-to-End Encryption**: Your location data is encrypted on your device before being sent
- **No Data Selling**: Your data is never sold or shared with third parties
- **Self-Hosted Option**: Run your own server for complete control
- **Open Source**: Full transparency - see exactly what the app does
- **Minimal Data Retention**: Location data is only stored as long as needed
- **No Tracking or Analytics**: No third-party trackers or analytics

## Features

- 🔐 End-to-end encrypted location sharing
- 👥 Create private circles with friends and family
- 📍 Real-time location updates
- 🔔 Arrival/departure notifications
- 🚫 Privacy zones (hide location at specific places)
- ⏰ Temporary location sharing
- 🔋 Battery-efficient location tracking

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

See `/backend/README.md` and `/frontend/README.md` for setup instructions.

## Privacy Principles

1. **Data Minimization**: Only collect what's absolutely necessary
2. **User Control**: Users can delete their data anytime
3. **Transparency**: Open source and auditable
4. **Security by Design**: Encryption and security from the ground up
5. **No Monetization Through Data**: Free or subscription-based, never ad-supported

## License

MIT - Use it freely, modify it, self-host it!
