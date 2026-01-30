# IXA Digital - Deployment Documentation

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Quick Start](#quick-start)
4. [Manual Installation](#manual-installation)
5. [Environment Configuration](#environment-configuration)
6. [Port Configuration](#port-configuration)
7. [Database Structure](#database-structure)
8. [Admin Panel Access](#admin-panel-access)
9. [API Reference](#api-reference)
10. [CloudPanel Deployment](#cloudpanel-deployment)
11. [PM2 Process Management](#pm2-process-management)
12. [Troubleshooting](#troubleshooting)
13. [Backup & Restore](#backup--restore)
14. [Security Checklist](#security-checklist)

---

## Overview

IXA Digital is a full-stack digital agency website featuring:
- Public landing page with contact form
- Support ticket system with customer portal
- Admin panel with CMS, settings, and ticket management
- Email notifications (SMTP)
- SEO and branding controls

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Node.js 18+ with Express.js |
| **Database** | LowDB (JSON file-based) |
| **Frontend** | React 18 + Tailwind CSS |
| **Process Manager** | PM2 |
| **Web Server** | Express static serving (or Nginx reverse proxy) |

### No External Dependencies
- ❌ No MongoDB required
- ❌ No Python required
- ❌ No Redis required
- ✅ Single Node.js process serves everything

---

## Quick Start

### One-Command Setup

```bash
cd backend-node
chmod +x setup.sh
./setup.sh
```

This script will:
1. Install backend dependencies
2. Install frontend dependencies
3. Build the React frontend
4. Start the server with PM2
5. Display access URLs

**Estimated time:** 3-5 minutes

---

## Manual Installation

### Step 1: Install Backend

```bash
cd backend-node
yarn install
# or: npm install
```

### Step 2: Configure Environment

```bash
# Create .env file
cp .env.example .env

# Edit configuration
nano .env
```

### Step 3: Install & Build Frontend

```bash
cd ../frontend
yarn install
yarn build
```

### Step 4: Start Server

```bash
cd ../backend-node

# Development (with auto-reload)
yarn dev

# Production
yarn start

# With PM2 (recommended for production)
pm2 start ecosystem.config.js
```

---

## Environment Configuration

### Backend Environment (`/backend-node/.env`)

```env
# Server
PORT=3030
NODE_ENV=production

# Security (CHANGE IN PRODUCTION!)
JWT_SECRET=your-secure-random-string-here

# URLs
FRONTEND_URL=https://yourdomain.com
```

### Frontend Environment (`/frontend/.env`)

```env
REACT_APP_BACKEND_URL=https://yourdomain.com
```

### Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3030 | Server port |
| `NODE_ENV` | No | development | Environment mode |
| `JWT_SECRET` | Yes | (insecure default) | JWT signing key |
| `FRONTEND_URL` | No | - | Public URL for CORS/sitemap |

---

## Port Configuration

### Default Ports

| Service | Port | Description |
|---------|------|-------------|
| **Production Server** | 3030 | Node.js Express (serves API + frontend) |
| **Development Frontend** | 3000 | React dev server (hot reload) |
| **Development API** | 8001 | Backend when running separately |

### Single-Port Architecture

In production, everything runs on **one port**:
- `/api/*` → Express API routes
- `/*` → React static files from `/frontend/build/`

```
https://yourdomain.com/          → React SPA
https://yourdomain.com/api/      → Express API
https://yourdomain.com/admin/    → React Admin (SPA route)
```

### Changing the Port

```bash
# Option 1: Environment variable
PORT=8080 node server.js

# Option 2: Edit .env file
PORT=8080

# Option 3: PM2 ecosystem config
# Edit ecosystem.config.js → env.PORT
```

---

## Database Structure

### Location

All data stored in: `/backend-node/database/`

### JSON Files

| File | Purpose |
|------|---------|
| `admins.json` | Admin user credentials |
| `submissions.json` | Contact form entries |
| `tickets.json` | Support tickets + counter |
| `settings.json` | Email, SEO, branding, reCAPTCHA |
| `content.json` | CMS content (hero, about, footer) |

### File Uploads

Uploaded files stored in: `/backend-node/uploads/`

| Directory | Purpose | Formats |
|-----------|---------|---------|
| `uploads/logos/` | Website logos | PNG, JPG, WebP, SVG (max 5MB) |
| `uploads/favicons/` | Site favicons | ICO, PNG, JPG, GIF, SVG (max 1MB) |

---

## Admin Panel Access

### Default Credentials

| Field | Value |
|-------|-------|
| **URL** | `http://localhost:3030/admin/login` |
| **Email** | `admin@ixadigital.com` |
| **Password** | `admin123` |

⚠️ **IMPORTANT:** Change credentials before production deployment!

### Changing Admin Password

Edit `/backend-node/database/admins.json`:

```bash
# Generate new bcrypt hash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_NEW_PASSWORD', 10).then(h => console.log(h))"

# Update admins.json with the new hash
```

Or delete the file and restart - a new admin will be created with default credentials.

---

## API Reference

### Public Endpoints (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/` | Health check |
| GET | `/api/branding` | Logo, favicon, company name |
| GET | `/api/seo-config` | SEO metadata |
| GET | `/api/recaptcha-config` | reCAPTCHA site key |
| GET | `/api/page-content/:page` | CMS content |
| POST | `/api/contact` | Submit contact form |
| POST | `/api/support-ticket` | Create support ticket |
| POST | `/api/track-ticket?ticket_number=X&customer_email=Y` | Track ticket |
| POST | `/api/ticket/:id/customer-reply?reply_message=X&customer_email=Y` | Customer reply |
| GET | `/api/sitemap.xml` | XML sitemap |

### Admin Endpoints (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Get JWT token |
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/submissions` | List contact submissions |
| PATCH | `/api/admin/submissions/:id/status?status=X` | Update status |
| DELETE | `/api/admin/submissions/:id` | Delete submission |
| GET | `/api/admin/tickets` | List all tickets |
| GET | `/api/admin/tickets/:id` | Get ticket details |
| POST | `/api/admin/tickets/:id/reply` | Admin reply |
| PATCH | `/api/admin/tickets/:id/status?status=X&priority=Y` | Update ticket |
| DELETE | `/api/admin/tickets/:id` | Delete ticket |
| GET | `/api/admin/settings` | Get all settings |
| PUT | `/api/admin/settings` | Update settings |
| POST | `/api/admin/settings/test-email` | Test SMTP |
| POST | `/api/admin/upload-logo` | Upload logo (multipart) |
| POST | `/api/admin/upload-favicon` | Upload favicon (multipart) |
| GET | `/api/admin/content/:page` | Get page content |
| PUT | `/api/admin/content` | Update page content |

### Authentication

```bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:3030/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@ixadigital.com","password":"admin123"}' \
  | jq -r '.token')

# Use token
curl http://localhost:3030/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"
```

---

## CloudPanel Deployment

### Step 1: Create Node.js Site

1. Login to CloudPanel
2. Add new site → Select "Node.js"
3. Enter domain: `ixadigital.com`
4. Node.js version: 18.x or higher

### Step 2: Upload Files

```bash
# Via Git
cd /home/cloudpanel/htdocs/ixadigital.com
git clone YOUR_REPO .

# Or via SFTP/SCP
scp -r ./backend-node ./frontend user@server:/home/cloudpanel/htdocs/ixadigital.com/
```

### Step 3: Configure & Start

```bash
cd /home/cloudpanel/htdocs/ixadigital.com/backend-node

# Install dependencies
yarn install

# Build frontend
cd ../frontend
yarn install
yarn build

# Start with PM2
cd ../backend-node
pm2 start ecosystem.config.js
pm2 save
```

### Step 4: Configure CloudPanel

Set these in CloudPanel Node.js settings:

| Setting | Value |
|---------|-------|
| Entry Point | `backend-node/server.js` |
| Port | 3030 |
| Node.js Version | 18.x |

### Step 5: SSL Certificate

1. In CloudPanel → Your Site → SSL/TLS
2. Click "Let's Encrypt"
3. Enter email and install

---

## PM2 Process Management

### Configuration File

`/backend-node/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'ixadigital',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3030
    }
  }]
};
```

### Common Commands

```bash
# Start
pm2 start ecosystem.config.js

# Stop
pm2 stop ixadigital

# Restart
pm2 restart ixadigital

# View logs
pm2 logs ixadigital

# Monitor
pm2 monit

# Save process list (survives reboot)
pm2 save

# Auto-start on boot
pm2 startup
```

---

## Troubleshooting

### Server Won't Start

```bash
# Check logs
pm2 logs ixadigital --lines 50

# Check if port is in use
lsof -i :3030

# Kill process on port
kill -9 $(lsof -t -i:3030)

# Start manually for debugging
cd backend-node
node server.js
```

### Database Errors

```bash
# Check database files exist
ls -la backend-node/database/

# Verify JSON is valid
cat backend-node/database/settings.json | jq .

# Reset database (creates fresh defaults)
rm -rf backend-node/database/*.json
node server.js
```

### Frontend Not Loading

```bash
# Check if build exists
ls -la frontend/build/

# Rebuild frontend
cd frontend
yarn build

# Check for build errors
yarn build 2>&1 | tail -50
```

### API Returns 401 Unauthorized

```bash
# Token expired - get new token
curl -X POST http://localhost:3030/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin@ixadigital.com","password":"admin123"}'

# Check JWT_SECRET matches between restarts
cat backend-node/.env | grep JWT_SECRET
```

### File Upload Fails

```bash
# Check upload directories exist
ls -la backend-node/uploads/

# Create if missing
mkdir -p backend-node/uploads/logos backend-node/uploads/favicons

# Check permissions
chmod 755 backend-node/uploads -R
```

---

## Backup & Restore

### Backup

```bash
# Create backup directory
mkdir -p ~/backups

# Backup database
cp -r backend-node/database ~/backups/database_$(date +%Y%m%d)

# Backup uploads
cp -r backend-node/uploads ~/backups/uploads_$(date +%Y%m%d)

# Backup environment
cp backend-node/.env ~/backups/env_$(date +%Y%m%d)
```

### Restore

```bash
# Restore database
cp -r ~/backups/database_YYYYMMDD/* backend-node/database/

# Restore uploads
cp -r ~/backups/uploads_YYYYMMDD/* backend-node/uploads/

# Restart server
pm2 restart ixadigital
```

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh - Run daily via cron

BACKUP_DIR="/home/backups/ixadigital"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

tar -czf $BACKUP_DIR/backup_$DATE.tar.gz \
  backend-node/database \
  backend-node/uploads \
  backend-node/.env

# Keep last 7 days
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete
```

Add to crontab: `0 2 * * * /path/to/backup.sh`

---

## Security Checklist

### Before Production

- [ ] Change default admin password
- [ ] Set strong `JWT_SECRET` in `.env`
- [ ] Enable HTTPS/SSL
- [ ] Configure reCAPTCHA (Admin → Settings → Security)
- [ ] Review CORS settings if needed
- [ ] Set `NODE_ENV=production`

### Recommended

- [ ] Set up automated backups
- [ ] Enable firewall (only allow 80, 443, SSH)
- [ ] Use PM2 for process management
- [ ] Monitor server resources
- [ ] Set up log rotation

### File Permissions

```bash
# Secure sensitive files
chmod 600 backend-node/.env
chmod 700 backend-node/database
chmod 755 backend-node/uploads
```

---

## Directory Structure

```
/app/
├── backend-node/           # Node.js backend
│   ├── server.js           # Main Express server
│   ├── database.js         # LowDB initialization
│   ├── package.json        # Dependencies
│   ├── ecosystem.config.js # PM2 configuration
│   ├── setup.sh            # One-click setup script
│   ├── .env                # Environment variables
│   ├── routes/             # API route handlers
│   │   ├── admin.js        # Admin endpoints
│   │   ├── api.js          # Health check
│   │   ├── public.js       # Public endpoints
│   │   └── upload.js       # File upload handlers
│   ├── database/           # LowDB JSON files
│   │   ├── admins.json
│   │   ├── content.json
│   │   ├── settings.json
│   │   ├── submissions.json
│   │   └── tickets.json
│   └── uploads/            # Uploaded files
│       ├── logos/
│       └── favicons/
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   └── App.js          # Main app with routes
│   ├── build/              # Production build (generated)
│   ├── package.json
│   └── .env
│
├── ai-guide.md             # AI-readable project blueprint
├── DOCUMENTATION.md        # This file
└── memory/
    └── PRD.md              # Product requirements
```

---

## Version Information

| Component | Version |
|-----------|---------|
| Application | 4.0 (Node.js Architecture) |
| Node.js | 18.x+ |
| Express | 4.18.x |
| React | 18.x |
| LowDB | 6.x |

**Last Updated:** January 30, 2026

---

## Quick Reference

### URLs (Default)

| Page | URL |
|------|-----|
| Homepage | http://localhost:3030/ |
| Admin Login | http://localhost:3030/admin/login |
| Admin Dashboard | http://localhost:3030/admin/dashboard |
| Track Ticket | http://localhost:3030/track-ticket |
| API Health | http://localhost:3030/api/ |

### Default Credentials

| Field | Value |
|-------|-------|
| Email | admin@ixadigital.com |
| Password | admin123 |

### Key Commands

```bash
# Start server
cd backend-node && node server.js

# Start with PM2
pm2 start ecosystem.config.js

# View logs
pm2 logs ixadigital

# Restart
pm2 restart ixadigital

# Build frontend
cd frontend && yarn build
```
