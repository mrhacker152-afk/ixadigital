# IXA Digital - Node.js Backend Documentation

## Overview

IXA Digital is a complete digital agency website with:
- Public landing page
- Contact form with email notifications
- Support ticket system with customer portal
- Admin panel for content management
- SEO and branding controls

## Technology Stack

- **Backend:** Node.js with Express.js
- **Database:** LowDB (JSON file-based)
- **Frontend:** React with Tailwind CSS
- **Process Manager:** PM2

## Quick Start

### One-Click Setup

```bash
cd backend-node
chmod +x setup.sh
./setup.sh
```

This will:
1. Install all dependencies
2. Build the frontend
3. Start the server with PM2

### Manual Setup

```bash
# Backend
cd backend-node
yarn install
cp .env.example .env  # Edit as needed

# Frontend
cd ../frontend
yarn install
yarn build

# Start server
cd ../backend-node
node server.js
# Or with PM2:
pm2 start ecosystem.config.js
```

## Default Admin Credentials

- **URL:** http://localhost:3030/admin/login
- **Email:** admin@ixadigital.com
- **Password:** admin123

**⚠️ Change these credentials in production!**

## Environment Configuration

Edit `/backend-node/.env`:

```env
PORT=3030
NODE_ENV=production
JWT_SECRET=your-secure-secret-here
FRONTEND_URL=https://yourdomain.com
```

## API Endpoints

### Public APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/ | Health check |
| GET | /api/branding | Get logo/favicon |
| GET | /api/seo-config | SEO settings |
| GET | /api/recaptcha-config | reCAPTCHA site key |
| GET | /api/page-content/:page | Dynamic content |
| POST | /api/contact | Submit contact form |
| POST | /api/support-ticket | Create ticket |
| POST | /api/track-ticket | Track ticket (query params) |
| POST | /api/ticket/:id/customer-reply | Customer reply |
| GET | /api/sitemap.xml | Sitemap |

### Admin APIs (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/login | Authentication |
| GET | /api/admin/stats | Dashboard statistics |
| GET | /api/admin/submissions | List inquiries |
| PATCH | /api/admin/submissions/:id/status | Update status |
| DELETE | /api/admin/submissions/:id | Delete inquiry |
| GET | /api/admin/tickets | List tickets |
| GET | /api/admin/tickets/:id | Ticket details |
| POST | /api/admin/tickets/:id/reply | Reply to ticket |
| PATCH | /api/admin/tickets/:id/status | Update status |
| DELETE | /api/admin/tickets/:id | Delete ticket |
| GET | /api/admin/settings | Get settings |
| PUT | /api/admin/settings | Update settings |
| POST | /api/admin/settings/test-email | Test SMTP |
| POST | /api/admin/upload-logo | Upload logo |
| POST | /api/admin/upload-favicon | Upload favicon |
| GET | /api/admin/content/:page | Get content |
| PUT | /api/admin/content | Update content |

## Database Structure

JSON files are stored in `/backend-node/database/`:

- `admins.json` - Admin users
- `submissions.json` - Contact form entries
- `tickets.json` - Support tickets
- `settings.json` - System configuration
- `content.json` - CMS content

## File Uploads

Uploaded files are stored in `/backend-node/uploads/`:

- `logos/` - Website logos
- `favicons/` - Site favicons

Supported formats:
- **Logo:** PNG, JPG, WebP, SVG (max 5MB)
- **Favicon:** ICO, PNG, JPG, GIF, SVG (max 1MB)

## PM2 Commands

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
```

## CloudPanel Deployment

1. Create a Node.js site in CloudPanel
2. Upload the project files
3. Set the entry point to `backend-node/server.js`
4. Configure environment variables
5. Run `./backend-node/setup.sh`

## Security Notes

1. Change JWT_SECRET in production
2. Change default admin password
3. Enable reCAPTCHA for forms
4. Configure CORS properly
5. Use HTTPS in production

## Footer Credit

The footer includes a hardcoded credit:
> "Maintained & Developed By [Urbanesafe LLP](https://usafe.in)"

This credit line cannot be removed via the admin panel.

---

**Developed for CloudPanel deployment**
