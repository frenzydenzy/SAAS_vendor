#!/bin/bash

# SAAS Vendor - Quick Deployment Script
# Usage: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🚀 SAAS Vendor Backend - Deployment Script"
echo "=========================================="

# Check for Heroku CLI
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Install from: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

echo "✅ Heroku CLI found"

# Login check
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 Please login to Heroku..."
    heroku login
fi

echo "✅ Logged in to Heroku"

# Get app name
read -p "📱 Enter Heroku app name (or press Enter to create new): " APP_NAME

if [ -z "$APP_NAME" ]; then
    read -p "📱 Enter new app name (must be unique): " APP_NAME
    echo "🔧 Creating Heroku app: $APP_NAME"
    heroku create $APP_NAME
else
    echo "✅ Using existing app: $APP_NAME"
fi

# Prompt for environment variables
echo ""
echo "🔑 Setting up environment variables..."
echo "Leave blank to skip."
echo ""

read -p "MongoDB URI (mongodb+srv://...): " MONGODB_URI
[ -n "$MONGODB_URI" ] && heroku config:set MONGODB_URI="$MONGODB_URI" --app=$APP_NAME

read -p "SendGrid API Key: " SENDGRID_API_KEY
[ -n "$SENDGRID_API_KEY" ] && heroku config:set SENDGRID_API_KEY="$SENDGRID_API_KEY" --app=$APP_NAME

read -p "Cloudinary Cloud Name: " CLOUDINARY_CLOUD_NAME
[ -n "$CLOUDINARY_CLOUD_NAME" ] && heroku config:set CLOUDINARY_CLOUD_NAME="$CLOUDINARY_CLOUD_NAME" --app=$APP_NAME

read -p "Cloudinary API Key: " CLOUDINARY_API_KEY
[ -n "$CLOUDINARY_API_KEY" ] && heroku config:set CLOUDINARY_API_KEY="$CLOUDINARY_API_KEY" --app=$APP_NAME

read -p "Cloudinary API Secret: " CLOUDINARY_API_SECRET
[ -n "$CLOUDINARY_API_SECRET" ] && heroku config:set CLOUDINARY_API_SECRET="$CLOUDINARY_API_SECRET" --app=$APP_NAME

# Build and deploy
echo ""
echo "🔨 Building and deploying..."

npm run build
git add .
git commit -m "Deploy to Heroku" || true

echo "📤 Pushing to Heroku..."
git push heroku main

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your API is live at: https://$APP_NAME.herokuapp.com"
echo ""
echo "📋 Next steps:"
echo "1. Test health: curl https://$APP_NAME.herokuapp.com/api/health"
echo "2. View logs: heroku logs --tail --app=$APP_NAME"
echo "3. Share API URL with frontend team"
echo ""
