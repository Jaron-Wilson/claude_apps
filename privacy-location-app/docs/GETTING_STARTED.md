# Getting Started with Privacy Location App

This guide will help you set up and run the Privacy Location App on your local machine.

## What You'll Need

- **Node.js** (version 16 or higher)
- **PostgreSQL** (version 12 or higher)
- **A modern web browser** (Chrome, Firefox, Safari, or Edge)
- **Terminal/Command Line** access

## Quick Start (5 minutes)

### Step 1: Install Prerequisites

#### Install Node.js
- Download from [nodejs.org](https://nodejs.org/)
- Verify installation: `node --version` (should show v16 or higher)

#### Install PostgreSQL
- **macOS**: `brew install postgresql`
- **Ubuntu/Debian**: `sudo apt install postgresql`
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### Step 2: Set Up the Database

```bash
# Start PostgreSQL (if not already running)
# macOS:
brew services start postgresql

# Ubuntu:
sudo service postgresql start

# Create the database
createdb privacy_location

# Or using psql:
psql -U postgres
CREATE DATABASE privacy_location;
\q
```

### Step 3: Set Up the Backend

```bash
# Navigate to backend folder
cd privacy-location-app/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and update database credentials
# Use your favorite text editor (nano, vim, code, etc.)
nano .env

# Initialize the database
npm run init-db

# Start the backend server
npm run dev
```

The backend should now be running on `http://localhost:3000`

### Step 4: Set Up the Frontend

Open a **new terminal window** and:

```bash
# Navigate to frontend folder
cd privacy-location-app/frontend

# Install dependencies
npm install

# Create environment file (optional - defaults work for local dev)
cp .env.example .env

# Start the frontend development server
npm run dev
```

The frontend should now be running on `http://localhost:5173`

### Step 5: Try It Out!

1. Open your browser to `http://localhost:5173`
2. Click "Register here" to create an account
3. Fill in username, email, and password
4. You'll be logged in automatically!

## First Steps After Login

### 1. Create Your First Circle

A "circle" is a group of people who can share locations with each other.

1. Click "Circles" in the navigation
2. Enter a circle name (e.g., "Family" or "Friends")
3. Click "Create Circle"

### 2. Add Members to Your Circle

1. Select your circle from the list
2. Enter a friend's username in "Add Member"
3. Click "Add Member"

*Note: Your friends need to register first before you can add them!*

### 3. Share Your Location

1. Click "Map" in the navigation
2. Allow location access when prompted by your browser
3. Select your circle from the dropdown
4. Click "Share My Location"

Your encrypted location will be shared with circle members!

### 4. View Circle Members' Locations

- Circle members' locations appear as red markers on the map
- Your location appears as a blue marker
- Click markers to see who they belong to
- Locations update in real-time!

## Understanding Privacy Features

### End-to-End Encryption

Your location is encrypted on your device BEFORE being sent to the server:

```
Your Device → Encrypt with AES-256 → Server → Other Devices → Decrypt
```

The server only sees encrypted data - it cannot read your actual coordinates!

### Encryption Keys

- Each circle has its own encryption key
- Keys are stored in your browser's localStorage
- Keys never leave your device
- If you clear browser data, you'll need to rejoin circles

### Data Retention

- Location data automatically deletes after 24 hours (configurable)
- You can manually delete your history anytime in Settings
- No permanent storage of your movements

## Advanced Configuration

### Backend Environment Variables

Edit `backend/.env`:

```env
# Server Settings
PORT=3000                    # Change server port
NODE_ENV=production          # Use in production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=privacy_location
DB_USER=your_username
DB_PASSWORD=your_password

# Security
JWT_SECRET=your_secret_here          # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=your_key_here         # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Features
LOCATION_RETENTION_HOURS=24          # Hours to keep location data
MAX_CIRCLE_SIZE=50                   # Maximum members per circle
ALLOWED_ORIGINS=http://localhost:5173 # Frontend URL
```

### Frontend Environment Variables

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api    # Backend API URL
VITE_WS_URL=ws://localhost:3000           # WebSocket URL
```

## Common Issues and Solutions

### "Database connection failed"

**Problem**: Backend can't connect to PostgreSQL

**Solutions**:
1. Make sure PostgreSQL is running: `pg_isready`
2. Check database credentials in `backend/.env`
3. Verify database exists: `psql -l`

### "Location not working"

**Problem**: Browser can't access your location

**Solutions**:
1. Allow location permission when prompted
2. Use HTTPS (required in production)
3. Check browser settings for location permissions
4. Try incognito/private mode

### "WebSocket connection failed"

**Problem**: Real-time updates not working

**Solutions**:
1. Make sure backend is running
2. Check `VITE_WS_URL` in frontend `.env`
3. Check browser console for errors
4. Disable browser extensions that block WebSockets

### "Encryption key error"

**Problem**: Can't decrypt location data

**Solutions**:
1. Clear browser localStorage (Settings → Clear Encryption Keys)
2. Leave and rejoin circles
3. Make sure all circle members use the same key

### Port already in use

**Problem**: Can't start backend/frontend

**Solutions**:
```bash
# Find and kill process using port 3000 (backend)
lsof -ti:3000 | xargs kill

# Find and kill process using port 5173 (frontend)
lsof -ti:5173 | xargs kill

# Or change the port in .env files
```

## Production Deployment

### Backend Deployment

1. **Choose a hosting provider**: Heroku, DigitalOcean, AWS, etc.
2. **Set up PostgreSQL database** on the hosting provider
3. **Set environment variables**:
   - `NODE_ENV=production`
   - `JWT_SECRET` (strong random value)
   - `ENCRYPTION_KEY` (strong random value)
   - Database credentials
   - `ALLOWED_ORIGINS` (your frontend URL)
4. **Enable HTTPS** (required for geolocation)
5. **Deploy the code**
6. **Run migrations**: `npm run init-db`

### Frontend Deployment

1. **Choose a hosting provider**: Netlify, Vercel, GitHub Pages, etc.
2. **Build the app**: `npm run build`
3. **Set environment variables**:
   - `VITE_API_URL` (your backend URL)
   - `VITE_WS_URL` (your WebSocket URL)
4. **Deploy the `dist` folder**
5. **Verify HTTPS is enabled** (required for geolocation)

### Important Production Checklist

- [ ] HTTPS enabled on both frontend and backend
- [ ] Strong random values for JWT_SECRET and ENCRYPTION_KEY
- [ ] Database backups configured
- [ ] CORS properly configured (ALLOWED_ORIGINS)
- [ ] Rate limiting enabled
- [ ] Monitoring and logging set up
- [ ] Regular security updates

## Testing the App

### Create a Second User

1. Open an incognito/private window
2. Register a different user
3. Create or join the same circle
4. Share locations from both accounts
5. Watch real-time updates!

### Test Encryption

1. Share your location
2. Check the browser Network tab (Developer Tools)
3. Look at the request to `/api/location/share`
4. The `encryptedData` field should be unintelligible gibberish
5. This proves your data is encrypted!

## Next Steps

- Read the full [README.md](../README.md) for architecture details
- Check [backend/README.md](../backend/README.md) for API documentation
- Check [frontend/README.md](../frontend/README.md) for frontend details
- Customize the app for your needs
- Star the project and share with friends!

## Getting Help

If you encounter issues:

1. Check this guide for common solutions
2. Review error messages in terminal and browser console
3. Check database logs
4. Search existing GitHub issues
5. Open a new issue with detailed error information

## Privacy Tips

1. **Use strong passwords** (at least 12 characters)
2. **Don't share circle keys** outside the app
3. **Regularly delete location history** in Settings
4. **Review circle members** periodically
5. **Use privacy zones** for sensitive locations (home, work)
6. **Self-host** for maximum privacy and control

Enjoy your privacy-focused location sharing app!
