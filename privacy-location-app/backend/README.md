# Privacy Location App - Backend

Privacy-first location sharing backend server with end-to-end encryption.

## Features

- 🔐 JWT-based authentication
- 📍 Encrypted location storage
- 👥 Circle-based location sharing
- ⚡ Real-time WebSocket updates
- 🔒 End-to-end encryption support
- 🗄️ PostgreSQL database
- 🚫 Privacy zones support

## Prerequisites

- Node.js 16+
- PostgreSQL 12+
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb privacy_location
```

Or using psql:

```sql
CREATE DATABASE privacy_location;
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=privacy_location
DB_USER=your_username
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_here
ENCRYPTION_KEY=your_encryption_key_here

ALLOWED_ORIGINS=http://localhost:3001,http://localhost:5173
```

**Important:** Generate strong random values for `JWT_SECRET` and `ENCRYPTION_KEY`:

```bash
# Generate secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Initialize Database

Run the database initialization script:

```bash
npm run init-db
```

This creates all necessary tables:
- users
- circles
- circle_members
- locations
- privacy_zones
- sharing_permissions

### 5. Start the Server

Development mode (with auto-reload):

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The server will start on `http://localhost:3000` (or your configured PORT).

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/update-key` - Update public encryption key

### Location Sharing

- `POST /api/location/share` - Share encrypted location
- `GET /api/location/circle/:circleId` - Get circle members' locations
- `GET /api/location/history` - Get own location history
- `DELETE /api/location/cleanup` - Clean up expired locations
- `POST /api/location/stop-sharing/:circleId` - Stop sharing with circle
- `POST /api/location/resume-sharing/:circleId` - Resume sharing with circle

### Circles (Groups)

- `POST /api/circles` - Create new circle
- `GET /api/circles` - Get user's circles
- `GET /api/circles/:circleId` - Get circle details
- `POST /api/circles/:circleId/members` - Add member to circle
- `DELETE /api/circles/:circleId/leave` - Leave circle
- `DELETE /api/circles/:circleId` - Delete circle (creator only)

### WebSocket

Connect to WebSocket for real-time updates:

```javascript
ws://localhost:3000?token=YOUR_JWT_TOKEN
```

WebSocket message types:
- `connected` - Connection established
- `location_update` - Real-time location update from circle member
- `ping`/`pong` - Keep-alive

## Security Features

### End-to-End Encryption

Location data is encrypted on the client before being sent to the server. The server only stores encrypted blobs and cannot read the actual coordinates.

### Data Retention

Locations automatically expire after 24 hours (configurable via `LOCATION_RETENTION_HOURS`).

### Rate Limiting

API endpoints are rate-limited to 100 requests per 15 minutes per IP.

### Privacy Zones

Users can define privacy zones where their location is automatically hidden from circle members.

## Database Schema

```
users
  ├── id (PK)
  ├── username (unique)
  ├── email (unique)
  ├── password_hash
  ├── public_key (for E2E encryption)
  └── timestamps

circles
  ├── id (PK)
  ├── name
  ├── created_by (FK -> users)
  └── timestamps

circle_members
  ├── id (PK)
  ├── circle_id (FK -> circles)
  ├── user_id (FK -> users)
  └── joined_at

locations
  ├── id (PK)
  ├── user_id (FK -> users)
  ├── encrypted_data (encrypted lat/lng/accuracy)
  ├── timestamp
  └── expires_at

privacy_zones
  ├── id (PK)
  ├── user_id (FK -> users)
  ├── name
  ├── encrypted_coordinates
  ├── radius_meters
  └── created_at

sharing_permissions
  ├── id (PK)
  ├── user_id (FK -> users)
  ├── circle_id (FK -> circles)
  ├── share_location (boolean)
  └── expires_at
```

## Development

### Running Tests

```bash
npm test
```

### Database Migrations

To reset the database:

```bash
dropdb privacy_location
createdb privacy_location
npm run init-db
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong secrets for JWT_SECRET and ENCRYPTION_KEY
3. Enable HTTPS (use reverse proxy like nginx)
4. Set up database backups
5. Configure proper CORS origins
6. Set up monitoring and logging
7. Use a process manager (PM2, systemd)

### Example PM2 Configuration

```bash
pm2 start src/server.js --name privacy-location-api
pm2 save
pm2 startup
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| DB_HOST | PostgreSQL host | localhost |
| DB_PORT | PostgreSQL port | 5432 |
| DB_NAME | Database name | privacy_location |
| DB_USER | Database user | - |
| DB_PASSWORD | Database password | - |
| JWT_SECRET | JWT signing secret | - |
| ENCRYPTION_KEY | Server-side encryption key | - |
| ALLOWED_ORIGINS | CORS allowed origins | * |
| LOCATION_RETENTION_HOURS | Hours to keep locations | 24 |
| MAX_CIRCLE_SIZE | Max members per circle | 50 |

## Troubleshooting

### Database Connection Errors

- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Ensure database exists: `psql -l`

### Port Already in Use

Change the PORT in `.env` or kill the process:

```bash
lsof -ti:3000 | xargs kill
```

## License

MIT
