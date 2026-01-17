# Deployment Guide

This guide covers deploying the Privacy Location App to various hosting platforms so you can access it from your phone or computer anywhere.

## Table of Contents

1. [Quick Deploy Options](#quick-deploy-options)
2. [Frontend Deployment](#frontend-deployment)
3. [Backend Deployment](#backend-deployment)
4. [Database Setup](#database-setup)
5. [Docker Deployment](#docker-deployment)
6. [Self-Hosting](#self-hosting)
7. [Mobile Access](#mobile-access)

---

## Quick Deploy Options

### Easiest: Use Free Hosting Services

**Frontend**: Netlify or Vercel (Free tier available)
**Backend**: Railway or Render (Free tier available)
**Database**: Included with Railway/Render

**Total Time**: ~30 minutes
**Cost**: Free (with limitations)

---

## Frontend Deployment

The frontend is a static React app that can be hosted on any static hosting service.

### Option 1: Netlify (Recommended for beginners)

#### Step 1: Prepare Your Code

```bash
cd privacy-location-app/frontend
```

#### Step 2: Deploy to Netlify

**Method A: Netlify CLI**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

**Method B: GitHub Integration**

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect your GitHub repo
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Base directory**: `privacy-location-app/frontend`

#### Step 3: Configure Environment Variables

In Netlify dashboard → Site settings → Environment variables:

```
VITE_API_URL=https://your-backend-url.com/api
VITE_WS_URL=wss://your-backend-url.com
```

#### Step 4: Custom Domain (Optional)

Netlify provides a free `.netlify.app` domain, or you can add your own:

- Site settings → Domain management → Add custom domain

---

### Option 2: Vercel

#### Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend directory
cd privacy-location-app/frontend
vercel --prod
```

#### Environment Variables

In Vercel dashboard → Project → Settings → Environment Variables:

```
VITE_API_URL=https://your-backend-url.com/api
VITE_WS_URL=wss://your-backend-url.com
```

---

### Option 3: GitHub Pages

```bash
cd privacy-location-app/frontend

# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
# "deploy": "vite build && gh-pages -d dist"

# Deploy
npm run deploy
```

**Note**: GitHub Pages doesn't support server-side routing well. You may need to use hash routing.

---

## Backend Deployment

The backend is a Node.js/Express app that needs a server environment.

### Option 1: Railway (Recommended)

Railway provides free PostgreSQL database included!

#### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

#### Step 2: Initialize and Deploy

```bash
cd privacy-location-app/backend

# Initialize Railway project
railway init

# Add PostgreSQL database
railway add postgresql

# Deploy
railway up
```

#### Step 3: Set Environment Variables

Railway auto-sets database variables. Add these manually:

```bash
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set ENCRYPTION_KEY=$(openssl rand -hex 32)
railway variables set NODE_ENV=production
railway variables set ALLOWED_ORIGINS=https://your-frontend-url.com
```

#### Step 4: Run Database Initialization

```bash
railway run npm run init-db
```

#### Step 5: Get Your Backend URL

```bash
railway open
```

Your backend will be at: `https://your-app.railway.app`

---

### Option 2: Render

#### Step 1: Create Render Account

Go to [render.com](https://render.com) and sign up

#### Step 2: Create PostgreSQL Database

1. Dashboard → New → PostgreSQL
2. Name it `privacy-location-db`
3. Note the Internal Database URL

#### Step 3: Create Web Service

1. Dashboard → New → Web Service
2. Connect your GitHub repo
3. Configure:
   - **Name**: `privacy-location-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `privacy-location-app/backend`

#### Step 4: Environment Variables

Add these in Render dashboard:

```
NODE_ENV=production
PORT=3000
DB_HOST=<from database info>
DB_PORT=5432
DB_NAME=privacy_location
DB_USER=<from database info>
DB_PASSWORD=<from database info>
JWT_SECRET=<generate random 32 char string>
ENCRYPTION_KEY=<generate random 32 char string>
ALLOWED_ORIGINS=https://your-frontend-url.com
LOCATION_RETENTION_HOURS=24
MAX_CIRCLE_SIZE=50
```

#### Step 5: Initialize Database

In Render dashboard → Shell:

```bash
npm run init-db
```

Your backend URL: `https://your-app.onrender.com`

---

### Option 3: Heroku

```bash
cd privacy-location-app/backend

# Install Heroku CLI and login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -hex 32)
heroku config:set ENCRYPTION_KEY=$(openssl rand -hex 32)
heroku config:set ALLOWED_ORIGINS=https://your-frontend-url.com

# Deploy
git push heroku main

# Initialize database
heroku run npm run init-db
```

---

## Database Setup

### Option 1: Managed Database (Recommended)

Most hosting providers offer managed PostgreSQL:

- **Railway**: Included free
- **Render**: $7/month for 1GB
- **Heroku**: Starts at $5/month
- **Neon**: Free tier available
- **Supabase**: Free tier available

### Option 2: External PostgreSQL

Use services like:
- ElephantSQL (Free tier: 20MB)
- Amazon RDS
- DigitalOcean Managed Databases

Configure with connection string:

```
postgres://username:password@host:5432/database
```

---

## Docker Deployment

Deploy everything with Docker Compose.

### Step 1: Set Up Environment

Create `.env` file in project root:

```env
# Database
DB_PASSWORD=your_secure_password_here

# Backend
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
ALLOWED_ORIGINS=http://localhost,http://your-domain.com
```

### Step 2: Build and Run

```bash
cd privacy-location-app

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: `http://localhost`
- Backend: `http://localhost:3000`
- Database: `localhost:5432`

### Step 3: Initialize Database

```bash
docker-compose exec backend npm run init-db
```

### Deploy to Production Server

1. **Install Docker** on your server (DigitalOcean, Linode, AWS EC2, etc.)

2. **Copy files**:
```bash
scp -r privacy-location-app user@your-server:/home/user/
```

3. **SSH to server** and run:
```bash
cd privacy-location-app
docker-compose up -d
```

4. **Set up HTTPS** with nginx and Let's Encrypt

---

## Self-Hosting

### Requirements

- Server with 1GB+ RAM
- Ubuntu 20.04+ or similar Linux
- Domain name (optional but recommended)

### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install nginx
sudo apt install -y nginx

# Install certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Set Up Database

```bash
sudo -u postgres psql

CREATE DATABASE privacy_location;
CREATE USER privacy_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE privacy_location TO privacy_user;
\q
```

### Step 3: Deploy Backend

```bash
# Clone or copy your code
cd /var/www
sudo git clone <your-repo>
cd privacy-location-app/backend

# Install dependencies
npm ci --only=production

# Set up environment
sudo nano .env
# Add your configuration

# Initialize database
npm run init-db

# Install PM2 for process management
sudo npm install -g pm2

# Start backend
pm2 start src/server.js --name privacy-location-api
pm2 save
pm2 startup
```

### Step 4: Deploy Frontend

```bash
cd /var/www/privacy-location-app/frontend

# Install and build
npm ci
npm run build

# Copy build to nginx directory
sudo cp -r dist/* /var/www/html/privacy-location/
```

### Step 5: Configure nginx

```bash
sudo nano /etc/nginx/sites-available/privacy-location
```

Add:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html/privacy-location;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/privacy-location /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Set Up SSL

```bash
sudo certbot --nginx -d your-domain.com
```

Your app is now live at `https://your-domain.com`!

---

## Mobile Access

### Progressive Web App (PWA)

The app is a PWA, so it can be installed on mobile devices!

#### On iPhone/iPad:

1. Open the website in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Tap "Add"

Now it works like a native app!

#### On Android:

1. Open the website in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home Screen"
4. Tap "Add"

### Features When Installed:

- Works offline (cached)
- Full-screen experience
- App icon on home screen
- Push notifications (coming soon)
- Background location sync

---

## Testing Your Deployment

### 1. Check Backend Health

```bash
curl https://your-backend-url.com/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### 2. Test API

```bash
# Register
curl -X POST https://your-backend-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"testpass123"}'
```

### 3. Test Frontend

Visit `https://your-frontend-url.com` and:
- Register an account
- Create a circle
- Share location (allow browser permission)
- Verify it appears on map

### 4. Test Mobile

- Visit site on phone
- Install as PWA
- Grant location permission
- Test all features

---

## Monitoring & Maintenance

### Logs

**Railway**:
```bash
railway logs
```

**Render**:
View in dashboard → Logs

**Self-hosted with PM2**:
```bash
pm2 logs privacy-location-api
```

### Database Backups

**Railway/Render**:
Automatic backups included

**Self-hosted**:
```bash
# Backup
pg_dump privacy_location > backup.sql

# Restore
psql privacy_location < backup.sql

# Automated daily backups
crontab -e
# Add: 0 2 * * * pg_dump privacy_location > /backups/backup-$(date +\%Y\%m\%d).sql
```

### Updates

```bash
# Pull latest code
git pull

# Backend
cd backend
npm install
pm2 restart privacy-location-api

# Frontend
cd frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/privacy-location/
```

---

## Costs

### Free Tier (with limitations):

- **Netlify**: 100GB bandwidth/month
- **Vercel**: 100GB bandwidth/month
- **Railway**: $5 credit/month (limited resources)
- **Render**: 750 hours/month free tier

### Recommended Paid:

- **Frontend**: $0 (Netlify/Vercel free tier is enough)
- **Backend**: $5-7/month (Railway/Render)
- **Database**: Included or $5-7/month
- **Total**: $5-15/month

### Self-Hosted:

- **DigitalOcean Droplet**: $6/month
- **Linode**: $5/month
- **AWS Lightsail**: $3.50/month
- **Domain**: $10-15/year

---

## Security Checklist

Before going live:

- [ ] Set strong JWT_SECRET and ENCRYPTION_KEY
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Configure CORS properly (ALLOWED_ORIGINS)
- [ ] Set up firewall rules
- [ ] Enable rate limiting
- [ ] Keep dependencies updated
- [ ] Set up monitoring/alerts
- [ ] Regular database backups
- [ ] Use environment variables (never commit secrets)
- [ ] Review security headers

---

## Troubleshooting

### "Can't connect to backend"

- Check backend is running: `curl https://backend-url/health`
- Verify VITE_API_URL in frontend env
- Check CORS settings (ALLOWED_ORIGINS)

### "Database connection failed"

- Verify database credentials
- Check if database is running
- Confirm database initialized: `npm run init-db`

### "Location not working"

- Must use HTTPS (not HTTP)
- Browser needs location permission
- Check browser console for errors

### "WebSocket connection failed"

- Check VITE_WS_URL is correct
- Use `wss://` for HTTPS sites
- Verify firewall allows WebSocket

---

## Next Steps

1. **Test thoroughly** on both desktop and mobile
2. **Invite friends** to test
3. **Monitor usage** and errors
4. **Set up backups**
5. **Consider custom domain**
6. **Add analytics** (privacy-respecting)
7. **Share with others!**

Your privacy-focused location app is now live and accessible from anywhere! 🎉
