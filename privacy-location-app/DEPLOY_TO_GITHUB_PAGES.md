# Quick Deploy to GitHub Pages

Deploy your Privacy Location app to GitHub Pages in 3 easy steps!

## What You Need First

1. **Deploy your backend** (GitHub Pages only hosts the frontend)
   - Recommended: [Railway.app](https://railway.app) (Free $5/month credit)
   - See full guide: [docs/GITHUB_PAGES_DEPLOY.md](docs/GITHUB_PAGES_DEPLOY.md)

2. **Your backend URL**
   - You'll need this for the frontend to connect
   - Example: `https://your-app.railway.app`

## Method 1: Automatic (Easiest) ⚡

This sets up automatic deployment - push code and it deploys automatically!

### Step 1: Enable GitHub Pages

1. Go to your repo on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select: **GitHub Actions**

### Step 2: Add Your Backend URLs

In your GitHub repo:
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - Name: `VITE_API_URL`, Value: `https://your-backend.railway.app/api`
   - Name: `VITE_WS_URL`, Value: `wss://your-backend.railway.app`

### Step 3: Push to Main Branch

```bash
git add .
git commit -m "Set up GitHub Pages"
git push origin main
```

**Done!** ✅ Your site will be live in 2-3 minutes at:
`https://yourusername.github.io/claude_apps/`

---

## Method 2: Use the Deploy Script 🚀

Run the automated deployment script:

```bash
cd privacy-location-app
./deploy-github-pages.sh
```

The script will:
- ✅ Build your frontend
- ✅ Configure for GitHub Pages
- ✅ Deploy automatically
- ✅ Give you the live URL

**Done!** Site live in 2-3 minutes!

---

## Method 3: Manual Deployment 🔧

For more control:

### Step 1: Build

```bash
cd privacy-location-app/frontend
npm install
npm run build
```

### Step 2: Configure Backend

Edit `dist/index.html` or rebuild with environment variables:

```bash
export VITE_API_URL=https://your-backend.railway.app/api
export VITE_WS_URL=wss://your-backend.railway.app
npm run build
```

### Step 3: Deploy

```bash
cd dist
git init
git add -A
git commit -m "Deploy"
git push -f https://github.com/yourusername/claude_apps.git main:gh-pages
```

### Step 4: Enable on GitHub

1. Go to your repo **Settings** → **Pages**
2. Source: **gh-pages** branch, **/ (root)** folder
3. Save

**Done!** Site live at: `https://yourusername.github.io/claude_apps/`

---

## Quick Backend Deployment (Railway)

Don't have a backend yet? Deploy in 5 minutes:

```bash
cd privacy-location-app/backend

# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add postgresql

# Deploy
railway up

# Set environment
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -hex 32)
railway variables set ENCRYPTION_KEY=$(openssl rand -hex 32)
railway variables set ALLOWED_ORIGINS=https://yourusername.github.io

# Initialize database
railway run npm run init-db

# Get your URL
railway open
```

Copy the Railway URL and use it in Step 2 above!

---

## Testing Your Deployment

1. **Visit your site**: `https://yourusername.github.io/claude_apps/`

2. **Check backend connection**:
   - Open browser console (F12)
   - Register a new account
   - If you see errors, check backend URL

3. **Test on mobile**:
   - Open the URL on your phone
   - Tap "Add to Home Screen"
   - Use like a native app!

---

## Common Issues

### "Can't connect to backend"

- ✅ Backend is running: `curl https://backend-url/health`
- ✅ Backend CORS includes your GitHub Pages URL
- ✅ Using `https://` and `wss://` (not http/ws)

### "Page not found on refresh"

Already fixed! The workflow handles this automatically.

### "Assets not loading"

Check `vite.config.js` has correct base path for your repo.

---

## Next Steps

- 📱 **Install on phone**: Visit the URL and "Add to Home Screen"
- 🔐 **Set up SSL**: GitHub Pages has HTTPS by default!
- 🌐 **Custom domain**: Add your own domain in Settings → Pages
- 📊 **Monitor**: Check Actions tab for deployment status

---

## Need Full Instructions?

See the complete guide: [docs/GITHUB_PAGES_DEPLOY.md](docs/GITHUB_PAGES_DEPLOY.md)

---

## Cost

- Frontend (GitHub Pages): **FREE** ✅
- Backend (Railway): **$5/month credit** (essentially free) ✅
- Custom domain: **$10-15/year** (optional)

**Total: $0/month** 🎉

Enjoy your privacy-focused location sharing app!
