#!/bin/bash

# Kabulig.net Deployment Script for Hostinger VPS
# This script should be run on the VPS

set -e

echo "🚀 Starting deployment of Kabulig.net..."

# Configuration
APP_NAME="kabulig"
APP_DIR="/var/www/$APP_NAME"
GIT_REPO="https://github.com/mjhub01/kabulig.git"
BRANCH="main"

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Install PostgreSQL if not installed
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
fi

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Create app directory
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Clone or pull repository
if [ -d "$APP_DIR/.git" ]; then
    echo "📥 Pulling latest changes..."
    cd $APP_DIR
    git pull origin $BRANCH
else
    echo "📥 Cloning repository..."
    git clone $GIT_REPO $APP_DIR
    cd $APP_DIR
    git checkout $BRANCH
fi

# Install dependencies
echo "📦 Installing dependencies..."
cd $APP_DIR
npm ci --production=false

# Setup environment file
if [ ! -f "$APP_DIR/.env" ]; then
    echo "⚙️  Creating .env file..."
    cp .env.production.example .env
    echo "⚠️  Please edit $APP_DIR/.env with your production values"
fi

# Run Prisma migrations
echo "🗄️  Running database migrations..."
cd $APP_DIR
npx prisma generate
npx prisma migrate deploy

# Build Next.js application
echo "🔨 Building Next.js application..."
cd $APP_DIR
npm run build

# Restart application with PM2
echo "🔄 Restarting application with PM2..."
cd $APP_DIR
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start npm --name "$APP_NAME" -- start
pm2 save
pm2 startup

# Setup Nginx configuration
echo "🌐 Setting up Nginx configuration..."
sudo cp $APP_DIR/nginx.conf /etc/nginx/sites-available/$APP_NAME
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "✅ Deployment completed successfully!"
echo "📝 Don't forget to:"
echo "   1. Edit $APP_DIR/.env with your production values"
echo "   2. Update nginx.conf with your domain"
echo "   3. Setup SSL certificate with Let's Encrypt"
