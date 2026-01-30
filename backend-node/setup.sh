#!/bin/bash

# IXA Digital - Setup Script
# This script sets up and runs the Node.js application with PM2

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  IXA Digital - One-Click Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js $(node -v) detected"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18 or higher is required. Current: $(node -v)"
    exit 1
fi

# Navigate to backend-node directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 1: Installing Backend Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Install backend dependencies
if command -v yarn &> /dev/null; then
    yarn install --frozen-lockfile 2>/dev/null || yarn install
else
    npm install
fi

echo "✓ Backend dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
# Server Configuration
PORT=3030
NODE_ENV=production

# JWT Secret (change this in production!)
JWT_SECRET=ixa-digital-secret-change-this-in-production

# Frontend URL (for CORS and sitemap)
FRONTEND_URL=https://ixadigital.com
EOF
    echo "✓ .env file created"
fi

# Create required directories
mkdir -p database uploads/logos uploads/favicons
echo "✓ Required directories created"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 2: Building Frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Build frontend
cd ../frontend

# Update REACT_APP_BACKEND_URL for production
if [ -f ".env" ]; then
    # Read current FRONTEND_URL from backend .env
    FRONTEND_URL=$(grep FRONTEND_URL "$SCRIPT_DIR/.env" | cut -d '=' -f2)
    if [ -n "$FRONTEND_URL" ]; then
        sed -i "s|REACT_APP_BACKEND_URL=.*|REACT_APP_BACKEND_URL=$FRONTEND_URL|" .env 2>/dev/null || true
    fi
fi

if command -v yarn &> /dev/null; then
    yarn install --frozen-lockfile 2>/dev/null || yarn install
    yarn build
else
    npm install
    npm run build
fi

echo "✓ Frontend built successfully"

cd "$SCRIPT_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Step 3: Setting Up PM2"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 globally..."
    npm install -g pm2
fi

echo "✓ PM2 $(pm2 -v) detected"

# Stop existing instance if running
pm2 stop ixadigital 2>/dev/null || true
pm2 delete ixadigital 2>/dev/null || true

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot (optional - requires sudo)
echo ""
echo "To enable auto-start on system boot, run:"
echo "  pm2 startup"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Application: http://localhost:3030"
echo "  Admin Panel: http://localhost:3030/admin/login"
echo ""
echo "  Default Admin Credentials:"
echo "    Email: admin@ixadigital.com"
echo "    Password: admin123"
echo ""
echo "  PM2 Commands:"
echo "    View logs:    pm2 logs ixadigital"
echo "    Restart:      pm2 restart ixadigital"
echo "    Stop:         pm2 stop ixadigital"
echo "    Status:       pm2 status"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
