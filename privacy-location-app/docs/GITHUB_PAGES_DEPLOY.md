# GitHub Pages Deployment Guide

Deploy your Privacy Location app frontend to GitHub Pages for **free hosting**!

## Important Notes

- **GitHub Pages hosts ONLY the frontend** (the website)
- **You still need to deploy the backend separately** (see backend options below)
- Your site will be live at: `https://username.github.io/repo-name/`
- Custom domains are supported (optional)

## Prerequisites

- GitHub account
- Git installed locally
- Your code pushed to a GitHub repository

## Deployment Methods

Choose one:
- [Method 1: Automatic (GitHub Actions)](#method-1-automatic-github-actions-recommended) - Recommended
- [Method 2: Manual Deploy](#method-2-manual-deploy)

---

## Method 1: Automatic (GitHub Actions) - Recommended

This sets up automatic deployment whenever you push to the main branch.

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**, select:
   - Source: **GitHub Actions**
4. Click **Save**

### Step 2: Set Up Backend URL

You need to tell the frontend where your backend is hosted.

**Option A: Use GitHub Secrets (Recommended)**

1. In your repo, go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add two secrets:
   - Name: `VITE_API_URL`, Value: `https://your-backend-url.com/api`
   - Name: `VITE_WS_URL`, Value: `wss://your-backend-url.com`

**Option B: Edit the workflow file**

Edit `.github/workflows/deploy.yml` and change:
```yaml
VITE_API_URL: ${{ secrets.VITE_API_URL || 'https://your-backend-url.com/api' }}
VITE_WS_URL: ${{ secrets.VITE_WS_URL || 'wss://your-backend-url.com' }}
```

Replace the URLs with your actual backend URLs.

### Step 3: Configure Base Path

**Important:** GitHub Pages serves your site at a subdirectory unless you use a custom domain.

Your URL will be: `https://username.github.io/repo-name/`

The workflow is already configured to handle this automatically! No changes needed.

If you want to use a custom domain (like `privacylocation.com`), skip to [Custom Domain](#custom-domain-optional) section.

### Step 4: Push and Deploy

```bash
# Make sure you're on the main branch
git checkout main

# Push your code (if not already pushed)
git add .
git commit -m "Set up GitHub Pages deployment"
git push origin main
```

The GitHub Action will automatically:
1. Build your frontend
2. Deploy to GitHub Pages
3. Your site will be live in 2-3 minutes!

### Step 5: Check Deployment

1. Go to **Actions** tab in your GitHub repo
2. Watch the deployment progress
3. When complete, visit: `https://username.github.io/repo-name/`

---

## Method 2: Manual Deploy

Deploy manually from your local machine.

### Step 1: Install Dependencies

```bash
cd privacy-location-app/frontend
npm install
```

### Step 2: Configure Base Path

If your repo is named `claude_apps`, set the base path:

```bash
export VITE_BASE_PATH=/claude_apps/
```

Or edit `vite.config.js`:
```javascript
const base = '/claude_apps/';
```

### Step 3: Configure Backend URL

Create `.env.production`:

```bash
cd privacy-location-app/frontend
nano .env.production
```

Add:
```env
VITE_API_URL=https://your-backend-url.com/api
VITE_WS_URL=wss://your-backend-url.com
```

### Step 4: Build and Deploy

```bash
# Build the app
npm run build

# Deploy to GitHub Pages branch
cd dist

# Initialize git in dist folder
git init
git add -A
git commit -m "Deploy to GitHub Pages"

# Force push to gh-pages branch
git push -f https://github.com/username/repo-name.git main:gh-pages

# Go back to project root
cd ../..
```

### Step 5: Enable GitHub Pages

1. Go to your repo on GitHub
2. **Settings** → **Pages**
3. Under **Source**:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click **Save**

Your site will be live at: `https://username.github.io/repo-name/`

---

## Backend Deployment

GitHub Pages only hosts the frontend. Deploy your backend to one of these:

### Recommended: Railway (Free $5/month credit)

```bash
cd privacy-location-app/backend

# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add postgresql
railway up

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set ENCRYPTION_KEY=$(openssl rand -hex 32)
railway variables set ALLOWED_ORIGINS=https://username.github.io

# Initialize database
railway run npm run init-db

# Get your backend URL
railway open
```

Your backend URL will be: `https://your-app.railway.app`

### Alternative: Render.com (Free tier)

1. Go to [render.com](https://render.com)
2. Create a **Web Service** from your GitHub repo
3. Settings:
   - **Root Directory**: `privacy-location-app/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables (see backend README)
5. Create a PostgreSQL database
6. Connect and initialize: `npm run init-db`

### Alternative: Heroku

```bash
cd privacy-location-app/backend
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
git push heroku main
heroku run npm run init-db
```

---

## Custom Domain (Optional)

Use your own domain instead of `username.github.io`.

### Step 1: Buy a Domain

Buy from: Namecheap, GoDaddy, Google Domains, Cloudflare, etc.

### Step 2: Configure DNS

Add these DNS records:

**For apex domain (example.com):**
```
Type: A
Name: @
Value: 185.199.108.153
Value: 185.199.109.153
Value: 185.199.110.153
Value: 185.199.111.153
```

**For subdomain (www.example.com or app.example.com):**
```
Type: CNAME
Name: www (or app)
Value: username.github.io
```

### Step 3: Configure GitHub Pages

1. In your repo: **Settings** → **Pages**
2. Under **Custom domain**, enter: `example.com`
3. Check **Enforce HTTPS** (wait a few minutes for SSL)

### Step 4: Update Vite Config

Edit `frontend/vite.config.js`:
```javascript
const base = '/'; // Use root for custom domain
```

Rebuild and redeploy.

### Step 5: Update Backend CORS

Update your backend's `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS=https://example.com,https://www.example.com
```

---

## Troubleshooting

### "Failed to load resource" errors

**Problem:** Frontend can't connect to backend

**Solution:**
1. Check backend is running: `curl https://backend-url/health`
2. Verify `VITE_API_URL` and `VITE_WS_URL` are correct
3. Check backend CORS settings include your GitHub Pages URL
4. Open browser console to see exact error

### "404 when refreshing page"

**Problem:** SPA routing doesn't work on GitHub Pages

**Solution:** This is already handled by copying `index.html` to `404.html` in the build. If you still see issues:

1. Check `404.html` exists in your `gh-pages` branch
2. Verify you're using React Router with `BrowserRouter` (not `HashRouter`)
3. The workflow automatically handles this

### "Assets not loading" or broken CSS

**Problem:** Incorrect base path

**Solution:**
1. Check `vite.config.js` has correct base path
2. For `username.github.io/repo-name/`, use: `base: '/repo-name/'`
3. For custom domain, use: `base: '/'`
4. Rebuild after changing

### "Mixed content error" (HTTP/HTTPS)

**Problem:** Frontend is HTTPS, backend is HTTP

**Solution:**
- Backend MUST use HTTPS
- Railway/Render provide HTTPS automatically
- For self-hosted, set up SSL with Let's Encrypt

### Deployment is slow or fails

**Problem:** GitHub Actions timing out

**Solution:**
1. Check **Actions** tab for error logs
2. Ensure `package-lock.json` is committed
3. Try manual deployment method instead

---

## Updating Your Site

### With GitHub Actions (Automatic)

Just push to main:
```bash
git add .
git commit -m "Update site"
git push origin main
```

Site updates automatically in 2-3 minutes.

### Manual Method

```bash
cd privacy-location-app/frontend
npm run build
cd dist
git init
git add -A
git commit -m "Update"
git push -f https://github.com/username/repo.git main:gh-pages
```

---

## Performance Tips

1. **Enable caching** - GitHub Pages does this automatically
2. **Compress images** before adding to repo
3. **Use CDN for Leaflet** - already configured
4. **Monitor bundle size** - keep under 1MB if possible

---

## Security

GitHub Pages sites are **public by default**. This is fine because:
- Frontend code should be public anyway
- Backend handles all authentication
- Encryption keys are never in frontend code
- No secrets in frontend

**Never commit:**
- `.env` files
- API keys or secrets
- Backend credentials

---

## Cost

- **GitHub Pages**: FREE
- **Backend (Railway)**: $5/month credit (free tier)
- **Backend (Render)**: FREE tier available
- **Custom Domain**: $10-15/year (optional)

**Total: $0-5/month** 🎉

---

## Complete Example

Here's a full deployment example:

```bash
# 1. Clone/navigate to your repo
cd claude_apps/privacy-location-app

# 2. Deploy backend to Railway
cd backend
railway login
railway init
railway add postgresql
railway up
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set ENCRYPTION_KEY=$(openssl rand -hex 32)
railway variables set ALLOWED_ORIGINS=https://yourusername.github.io
railway run npm run init-db
# Note your backend URL: https://yourapp.railway.app

# 3. Configure frontend
cd ../frontend

# 4. Set up GitHub Secrets (do this in GitHub UI)
# VITE_API_URL = https://yourapp.railway.app/api
# VITE_WS_URL = wss://yourapp.railway.app

# 5. Push to GitHub (triggers deployment)
cd ../..
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main

# 6. Wait 2-3 minutes, then visit:
# https://yourusername.github.io/claude_apps/
```

Done! Your app is live! 🚀

---

## Need Help?

- Check **Actions** tab for deployment logs
- Review browser console for errors
- Verify backend is running: `curl https://backend-url/health`
- Check CORS settings in backend
- Ensure HTTPS is enabled

Your privacy-focused location sharing app is now accessible to anyone with the link!
