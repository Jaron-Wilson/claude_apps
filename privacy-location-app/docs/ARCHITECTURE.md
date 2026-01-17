# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│                                                               │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │  React App   │  │  Web Crypto │  │  Leaflet Maps    │   │
│  │              │  │     API     │  │  (OpenStreetMap) │   │
│  └──────┬───────┘  └──────┬──────┘  └─────────────────┘   │
│         │                  │                                 │
│         │ E2E Encryption   │                                 │
│         ▼                  ▼                                 │
│  ┌─────────────────────────────────────┐                    │
│  │    Encrypted Location Data          │                    │
│  └─────────────┬───────────────────────┘                    │
└────────────────┼─────────────────────────────────────────────┘
                 │
                 │ HTTPS/WSS
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend Server                          │
│                                                               │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │  Express.js  │  │  WebSocket  │  │  JWT Auth        │   │
│  │  REST API    │  │  Server     │  │  Middleware      │   │
│  └──────┬───────┘  └──────┬──────┘  └─────────────────┘   │
│         │                  │                                 │
│         ▼                  ▼                                 │
│  ┌─────────────────────────────────────┐                    │
│  │  Business Logic & Routing           │                    │
│  └─────────────┬───────────────────────┘                    │
│                │                                             │
│                ▼                                             │
│  ┌─────────────────────────────────────┐                    │
│  │      PostgreSQL Database            │                    │
│  │  (Encrypted Location Storage)       │                    │
│  └─────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
App
├── AuthProvider (Context)
│   └── User Authentication State
│
├── Header (Navigation)
│
└── Routes
    ├── Login
    ├── Register
    ├── Dashboard
    │   ├── Stats Cards
    │   ├── Quick Actions
    │   └── Circles Overview
    ├── Map
    │   ├── MapContainer (Leaflet)
    │   ├── LocationMarkers
    │   └── Controls
    ├── Circles
    │   ├── Circle List
    │   ├── Create Circle Form
    │   └── Circle Details
    └── Settings
        ├── Account Info
        ├── Privacy Settings
        └── Data Management
```

### Backend Components

```
Server
├── Express App
│   ├── Middleware
│   │   ├── CORS
│   │   ├── Rate Limiting
│   │   └── JWT Authentication
│   │
│   ├── Routes
│   │   ├── /auth
│   │   │   ├── POST /register
│   │   │   ├── POST /login
│   │   │   └── POST /update-key
│   │   │
│   │   ├── /location
│   │   │   ├── POST /share
│   │   │   ├── GET /circle/:id
│   │   │   ├── GET /history
│   │   │   ├── POST /stop-sharing/:id
│   │   │   └── POST /resume-sharing/:id
│   │   │
│   │   └── /circles
│   │       ├── POST /
│   │       ├── GET /
│   │       ├── GET /:id
│   │       ├── POST /:id/members
│   │       ├── DELETE /:id/leave
│   │       └── DELETE /:id
│   │
│   └── WebSocket Server
│       ├── Connection Handler
│       ├── Authentication
│       └── Message Broadcasting
│
└── Database
    ├── Connection Pool
    └── Tables
        ├── users
        ├── circles
        ├── circle_members
        ├── locations
        ├── privacy_zones
        └── sharing_permissions
```

## Data Flow

### Location Sharing Flow

```
1. User Action
   │
   ├─► Browser Geolocation API
   │   └─► Returns: { latitude, longitude, accuracy }
   │
2. Client-Side Encryption
   │
   ├─► Get Circle Key from localStorage
   │   └─► If not exists: Generate new AES-256 key
   │
   ├─► Create Location Data Object
   │   └─► { latitude, longitude, accuracy, timestamp }
   │
   ├─► Encrypt with Web Crypto API
   │   └─► AES-256-GCM encryption
   │   └─► Returns: Base64 encrypted blob
   │
3. Send to Server
   │
   ├─► POST /api/location/share
   │   └─► Headers: { Authorization: "Bearer JWT_TOKEN" }
   │   └─► Body: { encryptedData: "..." }
   │
4. Server Processing
   │
   ├─► Verify JWT token
   │
   ├─► Store encrypted blob in database
   │   └─► Server CANNOT decrypt the data
   │
   └─► Broadcast via WebSocket
       └─► Send to all circle members
           └─► { type: 'location_update', encryptedData: "..." }
           │
5. Circle Members Receive
   │
   ├─► WebSocket message received
   │
   ├─► Get Circle Key from localStorage
   │
   ├─► Decrypt with Web Crypto API
   │   └─► AES-256-GCM decryption
   │
   ├─► Parse Location Data
   │   └─► { latitude, longitude, accuracy, timestamp }
   │
   └─► Update Map Marker
       └─► Display on Leaflet map
```

### Authentication Flow

```
1. Registration
   │
   ├─► User enters credentials
   │   └─► { username, email, password }
   │
   ├─► Frontend validates input
   │
   ├─► POST /api/auth/register
   │
   ├─► Backend validates
   │   ├─► Check if user exists
   │   ├─► Validate password strength
   │   └─► Hash password with bcrypt
   │
   ├─► Store in database
   │   └─► users table
   │
   ├─► Generate JWT token
   │   └─► Signed with JWT_SECRET
   │   └─► Expires in 7 days
   │
   └─► Return to client
       └─► { user, token }
       └─► Store in localStorage
       └─► Set Authorization header
       │
2. Subsequent Requests
   │
   ├─► Include Authorization header
   │   └─► "Bearer JWT_TOKEN"
   │
   ├─► Backend verifies token
   │   ├─► Verify signature
   │   ├─► Check expiration
   │   └─► Extract user ID
   │
   └─► Process request with user context
```

### WebSocket Connection Flow

```
1. Client Initiates
   │
   ├─► Get JWT token from localStorage
   │
   ├─► Connect to WebSocket
   │   └─► ws://localhost:3000?token=JWT_TOKEN
   │
2. Server Authenticates
   │
   ├─► Extract token from query string
   │
   ├─► Verify JWT token
   │   ├─► If invalid: Close connection (4002)
   │   └─► If valid: Accept connection
   │
   ├─► Store connection in Map
   │   └─► connections.set(userId, Set([ws]))
   │
   └─► Send welcome message
       └─► { type: 'connected', userId }
       │
3. Real-Time Updates
   │
   ├─► Location shared by user A
   │
   ├─► Server queries user A's circles
   │
   ├─► Gets all members of those circles
   │
   ├─► For each connected member:
   │   └─► ws.send({ type: 'location_update', ... })
   │
   └─► Client receives and processes
       │
4. Disconnection
   │
   ├─► Connection closed
   │
   └─► Remove from connections Map
       └─► connections.get(userId).delete(ws)
```

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│    users    │
│─────────────│
│ id (PK)     │◄─────┐
│ username    │      │
│ email       │      │
│ password    │      │
│ public_key  │      │
└─────────────┘      │
       ▲             │
       │             │
       │             │
┌──────┴──────┐      │
│   circles   │      │
│─────────────│      │
│ id (PK)     │      │
│ name        │      │
│ created_by  │──────┘
└─────┬───────┘
      │
      │
┌─────▼──────────┐
│ circle_members │
│────────────────│
│ id (PK)        │
│ circle_id (FK) │◄────┐
│ user_id (FK)   │──┐  │
└────────────────┘  │  │
                    │  │
┌───────────────────▼──▼──┐
│      locations          │
│─────────────────────────│
│ id (PK)                 │
│ user_id (FK)            │
│ encrypted_data          │
│ timestamp               │
│ expires_at              │
└─────────────────────────┘
```

## Security Architecture

### Encryption Layers

```
Layer 1: End-to-End Encryption (E2EE)
├─► Client-side encryption with Web Crypto API
├─► AES-256-GCM algorithm
├─► Unique keys per circle
├─► Keys never leave the device
└─► Server cannot decrypt

Layer 2: Transport Encryption
├─► HTTPS for all HTTP requests
├─► WSS (WebSocket Secure) for real-time updates
└─► TLS 1.2+

Layer 3: Authentication
├─► JWT tokens for API authentication
├─► bcrypt for password hashing (10 rounds)
├─► Token expiration (7 days)
└─► Secure token storage (localStorage)

Layer 4: Database Security
├─► Server-side encryption at rest (optional)
├─► Prepared statements (SQL injection prevention)
├─► Row-level security (PostgreSQL)
└─► Regular backups
```

### Privacy by Design

```
Principle 1: Data Minimization
└─► Only collect: location, timestamp, accuracy
    └─► No device info, IP tracking, or analytics

Principle 2: Purpose Limitation
└─► Data used ONLY for location sharing
    └─► No third-party sharing or selling

Principle 3: Transparency
└─► Open source code
└─► Clear privacy policy
└─► User-auditable

Principle 4: User Control
└─► Users can:
    ├─► Delete data anytime
    ├─► Export data
    ├─► Stop sharing per circle
    └─► Control retention period

Principle 5: Security by Default
└─► Encryption enabled by default
└─► Auto-deletion of old data
└─► Secure defaults for all settings
```

## Performance Considerations

### Frontend Optimization

```
1. Code Splitting
   └─► Lazy load routes with React.lazy()

2. Efficient Re-renders
   └─► React.memo for expensive components
   └─► useCallback for event handlers

3. Map Performance
   └─► Marker clustering for many locations
   └─► Debounce location updates

4. WebSocket Reconnection
   └─► Exponential backoff
   └─► Max 5 retry attempts
```

### Backend Optimization

```
1. Database Indexing
   ├─► Index on locations(user_id, timestamp)
   └─► Index on circle_members(circle_id, user_id)

2. Connection Pooling
   └─► PostgreSQL connection pool (max 20)

3. Rate Limiting
   └─► 100 requests per 15 minutes per IP

4. Data Cleanup
   └─► Auto-delete expired locations
   └─► Scheduled cleanup job
```

## Scalability

### Horizontal Scaling

```
Load Balancer
     │
     ├─► Backend Server 1
     ├─► Backend Server 2
     └─► Backend Server 3
          │
          └─► Shared PostgreSQL (with replication)
```

### WebSocket Scaling

```
Option 1: Sticky Sessions
└─► Route same user to same server

Option 2: Redis Pub/Sub
└─► Share WebSocket messages across servers
    ├─► Server 1 publishes to Redis
    ├─► Server 2 subscribes to Redis
    └─► Broadcasts to local connections
```

## Technology Choices

### Why React?
- Component-based architecture
- Large ecosystem
- Good performance with Virtual DOM
- Hooks for state management

### Why Express?
- Minimal and flexible
- Large middleware ecosystem
- WebSocket support
- Easy to understand

### Why PostgreSQL?
- ACID compliance
- JSON support for flexible schemas
- Excellent indexing
- Row-level security

### Why Web Crypto API?
- Built into browsers
- Hardware-accelerated
- Secure random number generation
- Standardized

### Why Leaflet?
- Open source
- No tracking (unlike Google Maps)
- Extensive plugin ecosystem
- Lightweight

## Future Enhancements

- [ ] Mobile apps (React Native)
- [ ] Push notifications
- [ ] Geofencing alerts
- [ ] Location history heatmaps
- [ ] Two-factor authentication
- [ ] End-to-end encrypted messaging
- [ ] Offline support with service workers
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] Redis caching layer
