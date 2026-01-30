#!/bin/bash

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# IXA Digital - One-Click Setup Script
# For CloudPanel Node.js Deployment
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  IXA Digital - Setup Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📁 Script directory: $SCRIPT_DIR"
echo "📁 Project root: $PROJECT_ROOT"
echo ""

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 1: Check Node.js
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo "Step 1: Checking Node.js"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ! command -v node &> /dev/null; then
    echo "✗ Node.js is not installed."
    echo "  Please install Node.js 18+ first:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "  sudo apt-get install -y nodejs"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
echo "✓ Node.js v$(node -v | cut -d'v' -f2) detected"

if [ "$NODE_VERSION" -lt 18 ]; then
    echo "✗ Node.js 18 or higher is required."
    exit 1
fi

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 2: Check Directory Structure
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "Step 2: Checking Directory Structure"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if we're in the backend-node directory
if [ ! -f "$SCRIPT_DIR/server.js" ]; then
    echo "✗ server.js not found in $SCRIPT_DIR"
    echo "  Make sure this script is in the backend-node directory"
    exit 1
fi
echo "✓ Backend directory: $SCRIPT_DIR"

# Check for frontend directory
FRONTEND_DIR="$PROJECT_ROOT/frontend"
if [ ! -d "$FRONTEND_DIR" ]; then
    # Try sibling directory
    FRONTEND_DIR="$SCRIPT_DIR/../frontend"
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo "✗ Frontend directory not found"
    echo "  Expected at: $PROJECT_ROOT/frontend"
    exit 1
fi
FRONTEND_DIR="$(cd "$FRONTEND_DIR" && pwd)"
echo "✓ Frontend directory: $FRONTEND_DIR"

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 3: Install Backend Dependencies
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "Step 3: Installing Backend Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$SCRIPT_DIR"

if command -v yarn &> /dev/null; then
    echo "Using yarn..."
    yarn install --frozen-lockfile 2>/dev/null || yarn install
else
    echo "Using npm..."
    npm install
fi

echo "✓ Backend dependencies installed"

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 4: Create Environment File
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "Step 4: Setting Up Environment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "Creating .env file..."
    cat > "$SCRIPT_DIR/.env" << 'EOF'
# Server Configuration
PORT=3030
NODE_ENV=production

# JWT Secret - CHANGE THIS IN PRODUCTION!
JWT_SECRET=ixa-digital-secret-change-me-in-production

# Frontend URL (for CORS and sitemap)
FRONTEND_URL=https://ixadigital.com
EOF
    echo "✓ .env file created"
    echo "  ⚠️  Remember to update JWT_SECRET and FRONTEND_URL!"
else
    echo "✓ .env file already exists"
fi

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 5: Create Required Directories
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "Step 5: Creating Directories"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

mkdir -p "$SCRIPT_DIR/database"
mkdir -p "$SCRIPT_DIR/uploads/logos"
mkdir -p "$SCRIPT_DIR/uploads/favicons"

echo "✓ database/ directory ready"
echo "✓ uploads/logos/ directory ready"
echo "✓ uploads/favicons/ directory ready"

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 6: Install Frontend Dependencies
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "Step 6: Installing Frontend Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$FRONTEND_DIR"

if command -v yarn &> /dev/null; then
    yarn install --frozen-lockfile 2>/dev/null || yarn install
else
    npm install
fi

echo "✓ Frontend dependencies installed"

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 7: Build Frontend
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "Step 7: Building Frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Update frontend .env for production
if [ -f "$FRONTEND_DIR/.env" ]; then
    # Read FRONTEND_URL from backend .env
    FRONTEND_URL=$(grep FRONTEND_URL "$SCRIPT_DIR/.env" | cut -d '=' -f2)
    if [ -n "$FRONTEND_URL" ]; then
        sed -i "s|REACT_APP_BACKEND_URL=.*|REACT_APP_BACKEND_URL=$FRONTEND_URL|" "$FRONTEND_DIR/.env" 2>/dev/null || true
    fi
fi

if command -v yarn &> /dev/null; then
    yarn build
else
    npm run build
fi

echo "✓ Frontend built successfully"

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Step 8: Setup PM2
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "Step 8: Setting Up PM2"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$SCRIPT_DIR"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 globally..."
    npm install -g pm2
fi

echo "✓ PM2 v$(pm2 -v) detected"

# Stop existing instance if running
pm2 stop ixadigital 2>/dev/null || true
pm2 delete ixadigital 2>/dev/null || true

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

echo "✓ Application started with PM2"

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Setup Complete!
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  🌐 Application URL: http://localhost:3030"
echo "  🔐 Admin Panel:     http://localhost:3030/admin/login"
echo ""
echo "  📧 Default Admin Credentials:"
echo "     Email:    admin@ixadigital.com"
echo "     Password: admin123"
echo ""
echo "  ⚠️  IMPORTANT: Change these in production!"
echo ""
echo "  📋 PM2 Commands:"
echo "     View logs:    pm2 logs ixadigital"
echo "     Restart:      pm2 restart ixadigital"
echo "     Stop:         pm2 stop ixadigital"
echo "     Status:       pm2 status"
echo ""
echo "  💡 To enable auto-start on boot:"
echo "     pm2 startup"
echo "     pm2 save"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
