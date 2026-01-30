# IXA Digital - Product Requirements Document

## Project Overview
**Project Name:** IXA Digital Agency Website  
**Version:** 4.0 - Node.js Architecture  
**Date Updated:** January 30, 2026  
**Status:** ✅ Architectural Rebuild Complete

## Admin Credentials
**Portal:** `/admin/login`  
**Email:** `admin@ixadigital.com`  
**Password:** `admin123`

## Contact Information
- **Email:** ixadigitalcom@gmail.com
- **Phone:** +919436481775
- **WhatsApp:** +919436481775

---

## 🔄 Architecture Change (v4.0)

### Previous Stack (Deprecated)
- Python FastAPI backend
- MongoDB database
- Supervisor process manager

### Current Stack
- **Backend:** Node.js with Express.js (Port 8001)
- **Database:** LowDB (JSON files in `/backend-node/database/`)
- **Process Manager:** PM2 (for production)
- **Frontend:** React with Tailwind CSS (unchanged)

### Key Benefits
- Single-domain architecture (no API subdomains)
- Simplified deployment for CloudPanel
- No external database dependencies
- Easy backup (just copy JSON files)

---

## ✨ Key Features

### 🌐 Public Website
- Professional landing page with all sections
- Contact form with backend integration
- WhatsApp chat integration
- Mobile-first responsive design
- SEO optimized

### 🎫 Support Ticket System

#### Customer Features (Public)
- **Create Tickets** (Footer button)
- **Track Tickets** (`/track-ticket`)
  - Search by ticket number + email verification
  - View ticket status and priority
  - View complete conversation history
  - Reply to tickets directly
- **Email Notifications** (when configured)

#### Admin Features (Protected)
- **Ticket Management** (`/admin/tickets`)
  - View all tickets with filtering
  - Reply functionality
  - Status updates (Open → In Progress → Resolved → Closed)
  - Priority management
  - Delete tickets

### 📧 Email Notification System
- Configurable SMTP settings
- Multiple recipients support
- Test email functionality
- Auto-notifications for:
  - New contact submissions
  - New support tickets
  - Admin/customer replies

### 🔧 Admin Panel
- **Dashboard** - Real-time statistics
- **Settings** - Email, SEO, reCAPTCHA, Branding
- **Tickets** - Support ticket management
- **Content Editor** - CMS functionality
- **Branding** - Logo/Favicon uploads

### 🖼️ Logo & Favicon
- **Supported Formats:** ICO, PNG, JPG, JPEG, GIF, SVG
- **Logo Max Size:** 5MB
- **Favicon Max Size:** 1MB
- Uploads stored in `/backend-node/uploads/`

---

## 🛠 Technical Architecture

### Backend (Node.js/Express)
```
/backend-node/
├── server.js          # Main Express server
├── database.js        # LowDB initialization
├── routes/
│   ├── api.js         # Health check
│   ├── admin.js       # Admin endpoints
│   ├── public.js      # Public endpoints
│   └── upload.js      # File uploads
├── database/          # JSON data files
└── uploads/           # Uploaded files
```

### Frontend (React)
```
/frontend/src/
├── components/        # UI components
├── hooks/             # Custom hooks
└── data/              # Mock data
```

### Database (LowDB)
JSON files stored in `/backend-node/database/`:
- `admins.json` - Admin credentials
- `submissions.json` - Contact form entries
- `tickets.json` - Support tickets + counter
- `settings.json` - Email, SEO, branding, reCAPTCHA
- `content.json` - CMS content

---

## 📡 API Endpoints

### Public APIs
```
GET  /api/              - Health check
GET  /api/branding      - Logo/favicon URLs
GET  /api/seo-config    - SEO configuration
GET  /api/recaptcha-config - reCAPTCHA site key
GET  /api/page-content/:page - Dynamic content
POST /api/contact       - Contact form submission
POST /api/support-ticket - Create ticket
POST /api/track-ticket  - Track ticket (query params)
POST /api/ticket/:id/customer-reply - Customer reply
GET  /api/sitemap.xml   - Sitemap
```

### Admin APIs (Protected)
```
POST /api/admin/login   - Authentication

# Submissions
GET    /api/admin/submissions
PATCH  /api/admin/submissions/:id/status
DELETE /api/admin/submissions/:id

# Tickets
GET    /api/admin/tickets
GET    /api/admin/tickets/:id
POST   /api/admin/tickets/:id/reply
PATCH  /api/admin/tickets/:id/status
DELETE /api/admin/tickets/:id

# Settings
GET  /api/admin/settings
PUT  /api/admin/settings
POST /api/admin/settings/test-email

# Uploads
POST /api/admin/upload-logo
POST /api/admin/upload-favicon

# Content
GET /api/admin/content/:page
PUT /api/admin/content

# Stats
GET /api/admin/stats
```

---

## 🚀 Deployment

### CloudPanel (Target)
```bash
cd backend-node
chmod +x setup.sh
./setup.sh
```

### Manual Deployment
```bash
# Install dependencies
cd backend-node && yarn install
cd ../frontend && yarn install && yarn build

# Start server
cd ../backend-node
pm2 start ecosystem.config.js
```

### Environment Variables
```env
PORT=3030
NODE_ENV=production
JWT_SECRET=your-secure-secret
FRONTEND_URL=https://yourdomain.com
```

---

## 🔐 Security Features

✅ JWT authentication (24h expiry)  
✅ Password hashing (bcrypt)  
✅ Email verification for tickets  
✅ Protected admin routes  
✅ Input validation  
✅ CORS configuration  
✅ Helmet security headers  
✅ GZip compression  
✅ reCAPTCHA support (optional)

---

## 📝 Footer Credit

The following credit is **hardcoded** and cannot be removed:

```html
<p>Maintained & Developed By <a href="https://usafe.in" target="_blank">Urbanesafe LLP</a></p>
```

---

## ✅ Completed Items (v4.0)

- [x] Complete architectural rebuild to Node.js/Express
- [x] LowDB database implementation
- [x] All API endpoints ported
- [x] Logo/favicon upload fix
- [x] Admin authentication working
- [x] Support ticket system working
- [x] Contact form working
- [x] Customer portal working
- [x] Hardcoded footer credit added
- [x] PM2 setup script created
- [x] Documentation updated

---

## 📈 Future Enhancements

### High Priority
- [ ] File attachments for tickets
- [ ] Email template customization
- [ ] Admin password change in UI

### Medium Priority
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Automated responses

### Low Priority
- [ ] Two-factor authentication
- [ ] API rate limiting
- [ ] Audit logs

---

**Last Updated:** January 30, 2026  
**Version:** 4.0  
**Status:** ✅ Production Ready - Node.js Architecture
