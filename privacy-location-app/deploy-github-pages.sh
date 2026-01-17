#!/bin/bash

# GitHub Pages Deployment Script for Privacy Location App
# This script helps you deploy the frontend to GitHub Pages

set -e  # Exit on error

echo "🚀 Privacy Location App - GitHub Pages Deployment"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the privacy-location-app directory"
    exit 1
fi

# Check for required commands
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ git is required but not installed. Aborting." >&2; exit 1; }

echo "✅ Prerequisites check passed"
echo ""

# Get repository info
REPO_URL=$(git config --get remote.origin.url)
REPO_NAME=$(basename "$REPO_URL" .git)
GIT_USER=$(git config --get user.name)

echo "📦 Repository: $REPO_NAME"
echo "👤 Git user: $GIT_USER"
echo ""

# Ask for backend URL if not set
if [ -z "$VITE_API_URL" ]; then
    echo "🔧 Backend Configuration"
    echo "------------------------"
    read -p "Enter your backend API URL (e.g., https://your-app.railway.app/api): " BACKEND_API
    read -p "Enter your backend WebSocket URL (e.g., wss://your-app.railway.app): " BACKEND_WS

    export VITE_API_URL="$BACKEND_API"
    export VITE_WS_URL="$BACKEND_WS"
    echo ""
fi

# Ask for base path
echo "🌐 GitHub Pages Configuration"
echo "------------------------------"
echo "Your site will be at: https://$GIT_USER.github.io/$REPO_NAME/"
read -p "Is this correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    read -p "Enter custom base path (e.g., /my-app/): " CUSTOM_BASE
    export VITE_BASE_PATH="$CUSTOM_BASE"
else
    export VITE_BASE_PATH="/$REPO_NAME/"
fi

echo ""
echo "📋 Deployment Configuration:"
echo "  - Backend API: $VITE_API_URL"
echo "  - Backend WS: $VITE_WS_URL"
echo "  - Base Path: $VITE_BASE_PATH"
echo ""

read -p "Continue with deployment? (y/n): " PROCEED

if [ "$PROCEED" != "y" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "🔨 Building frontend..."
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the app
npm run build

echo "✅ Build complete!"
echo ""

# Prepare for deployment
echo "📤 Preparing deployment..."
cd dist

# Add .nojekyll to prevent Jekyll processing
touch .nojekyll

# Copy index.html to 404.html for SPA routing
cp index.html 404.html

# Initialize git in dist
git init
git add -A
git commit -m "Deploy to GitHub Pages - $(date)"

# Get the remote URL
REMOTE_URL=$(cd ../..; git config --get remote.origin.url)

echo "🚀 Deploying to GitHub Pages..."

# Push to gh-pages branch
git push -f "$REMOTE_URL" main:gh-pages

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your site should be live in 2-3 minutes at:"
echo "   https://$GIT_USER.github.io/$REPO_NAME/"
echo ""
echo "📋 Next steps:"
echo "   1. Go to your GitHub repo settings"
echo "   2. Navigate to Settings → Pages"
echo "   3. Ensure source is set to 'gh-pages' branch"
echo "   4. Enable 'Enforce HTTPS'"
echo ""
echo "💡 To update your site in the future:"
echo "   - Just run this script again, or"
echo "   - Push to main branch if using GitHub Actions"
echo ""

# Clean up
cd ../..
