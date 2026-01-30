# AI Guide - IXA Digital Project Blueprint

## 1. Project Overview

**Name:** IXA Digital  
**Type:** Full-stack digital agency website with CMS  
**Purpose:** Business website with contact forms, support ticket system, and admin management panel  
**System Type:** Single-page application (SPA) with REST API backend

---

## 2. Architecture

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Tailwind CSS + Shadcn/UI |
| Backend | Node.js + Express.js |
| Database | LowDB (JSON file-based) |
| Connection | REST API via `/api/*` endpoints |
| Rendering | Client-side SPA with React Router |

**Data Flow:**
```
Browser → React (port 3000 dev / served by Express prod) → Express API → LowDB JSON files
```

---

## 3. Server & Deployment

| Setting | Value |
|---------|-------|
| Server | Node.js with Express |
| Production Port | 3030 (configurable via PORT env) |
| Preview Port | 8001 (Kubernetes ingress routes /api to this) |
| Process Manager | PM2 (ecosystem.config.js) |
| Hosting Target | CloudPanel Node.js site |
| Dev Frontend Port | 3000 |

**Environment Variables:**
- `PORT` - Server port (default: 3030)
- `NODE_ENV` - Environment mode
- `JWT_SECRET` - JWT signing key
- `FRONTEND_URL` - Public URL for CORS/sitemap
- `REACT_APP_BACKEND_URL` - Frontend API base URL

**Startup Command:**
```bash
node server.js
# or with PM2:
pm2 start ecosystem.config.js
```

---

## 4. Routing Structure

### Public Routes (React Router)
| Path | Component | Purpose |
|------|-----------|---------|
| `/` | Home | Landing page |
| `/track-ticket` | TrackTicket | Customer ticket lookup |

### Admin Routes (Protected)
| Path | Component | Purpose |
|------|-----------|---------|
| `/admin/login` | AdminLogin | Authentication |
| `/admin/dashboard` | AdminDashboard | Statistics + submissions |
| `/admin/settings` | AdminSettings | System configuration |
| `/admin/tickets` | AdminTickets | Support ticket management |
| `/admin/content` | ContentEditor | CMS editor |

### API Routes (Express)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/` | No | Health check |
| GET | `/api/branding` | No | Logo/favicon URLs |
| GET | `/api/seo-config` | No | SEO metadata |
| GET | `/api/recaptcha-config` | No | reCAPTCHA site key |
| GET | `/api/page-content/:page` | No | CMS content |
| POST | `/api/contact` | No | Contact form |
| POST | `/api/support-ticket` | No | Create ticket |
| POST | `/api/track-ticket` | No | Track ticket (query params) |
| POST | `/api/ticket/:id/customer-reply` | No | Customer reply |
| GET | `/api/sitemap.xml` | No | XML sitemap |
| POST | `/api/admin/login` | No | Get JWT token |
| GET | `/api/admin/stats` | JWT | Dashboard stats |
| GET/PATCH/DELETE | `/api/admin/submissions/*` | JWT | Manage inquiries |
| GET/POST/PATCH/DELETE | `/api/admin/tickets/*` | JWT | Manage tickets |
| GET/PUT | `/api/admin/settings` | JWT | System settings |
| POST | `/api/admin/upload-logo` | JWT | Upload logo |
| POST | `/api/admin/upload-favicon` | JWT | Upload favicon |
| GET/PUT | `/api/admin/content/*` | JWT | CMS content |

---

## 5. Database System

| Setting | Value |
|---------|-------|
| Type | LowDB (JSON file storage) |
| Location | `/backend-node/database/` |
| Format | JSON files |

### Data Files
| File | Purpose | Structure |
|------|---------|-----------|
| `admins.json` | Admin users | `{ users: [{ id, email, username, password, created_at }] }` |
| `submissions.json` | Contact forms | `{ submissions: [{ id, name, email, phone, service, message, status, created_at }] }` |
| `tickets.json` | Support tickets | `{ tickets: [...], counter: number }` |
| `settings.json` | System config | `{ email, seo, branding, recaptcha }` |
| `content.json` | CMS content | `{ homepage: { hero, about, cta_section, footer } }` |

### Ticket Schema
```json
{
  "id": "string",
  "ticket_number": "TKT-XXXXXX",
  "customer_name": "string",
  "customer_email": "string",
  "customer_phone": "string",
  "category": "string",
  "subject": "string",
  "description": "string",
  "status": "open|in_progress|resolved|closed",
  "priority": "low|medium|high|urgent",
  "replies": [{ "author", "message", "is_admin", "created_at" }],
  "created_at": "ISO date",
  "updated_at": "ISO date"
}
```

---

## 6. Admin Panel Capabilities

### Admin CAN Edit
- Email notification settings (SMTP)
- SEO metadata (title, description, keywords, analytics)
- Branding (logo, favicon, company name)
- reCAPTCHA configuration
- Homepage content (hero, about, CTA, footer text)
- Ticket status and replies
- Submission status

### Admin CANNOT Change
- Application code structure
- Database schema
- Routing configuration
- Authentication system
- Admin credentials via UI (must edit JSON directly)

---

## 7. Content Management

**Storage:** `/backend-node/database/content.json`

**Editable Sections:**
- Hero: headline, subheadline, CTA buttons, stats
- About: title, subtitle, paragraphs
- CTA Section: headline, description, button text
- Footer: company description, social links

**Template System:** React components fetch content from API and render dynamically. Components are in `/frontend/src/components/`.

---

## 8. Assets & Branding

### Logo
- Upload endpoint: `POST /api/admin/upload-logo`
- Storage: `/backend-node/uploads/logos/`
- Formats: PNG, JPG, WebP, SVG (max 5MB)
- URL stored in: `settings.json → branding.logo_url`

### Favicon
- Upload endpoint: `POST /api/admin/upload-favicon`
- Storage: `/backend-node/uploads/favicons/`
- Formats: ICO, PNG, JPG, GIF, SVG (max 1MB)
- URL stored in: `settings.json → branding.favicon_url`

### Theme
- Colors: Red (#dc2626) primary, gray secondary
- Framework: Tailwind CSS
- Components: Shadcn/UI in `/frontend/src/components/ui/`

### Global Layout Components
- `Header.jsx` - Navigation with logo
- `Footer.jsx` - Links, contact info, social icons
- `WhatsAppButton.jsx` - Floating chat button

---

## 9. Security Model

| Aspect | Implementation |
|--------|----------------|
| Authentication | JWT (JSON Web Tokens) |
| Token Expiry | 24 hours |
| Password Storage | bcrypt hash |
| Session | Stateless (token in Authorization header) |
| Role System | Single admin role |
| CORS | Enabled for all origins |
| Headers | Helmet.js security headers |

**Auth Flow:**
1. POST `/api/admin/login` with username + password
2. Server validates credentials against `admins.json`
3. Server returns JWT token
4. Client stores token in localStorage
5. Client sends `Authorization: Bearer <token>` on protected requests

---

## 10. Build & Runtime Rules

### Required Files
- `/backend-node/server.js` - Entry point
- `/backend-node/database.js` - DB initialization
- `/backend-node/routes/*.js` - API routes
- `/backend-node/.env` - Environment config
- `/frontend/build/` - Production frontend (generated)

### Auto-Generated Files
- `/backend-node/database/*.json` - Created on first run
- `/backend-node/uploads/` - Created on first run
- `/frontend/build/` - Created by `yarn build`

### Build Steps
```bash
# Backend
cd backend-node
yarn install

# Frontend
cd frontend
yarn install
yarn build

# Combined (use setup.sh)
./backend-node/setup.sh
```

### Startup
```bash
# Development
cd backend-node && node server.js

# Production
pm2 start ecosystem.config.js
```

---

## 11. System Constraints

**DO NOT CHANGE:**
- Database type (must remain LowDB/JSON)
- Express server structure
- JWT authentication method
- API route prefix (`/api/*`)
- File upload storage locations
- React Router structure
- Tailwind/Shadcn UI framework

**SAFE TO MODIFY:**
- Component styling
- CMS content structure
- New API endpoints (follow existing patterns)
- New React pages (add routes in App.js)
- Email templates
- Validation rules

---

## 12. Integration Points

### Email (SMTP)
- Library: Nodemailer
- Config: `settings.json → email`
- Triggered on: contact form, ticket creation, replies

### reCAPTCHA v2
- Provider: Google
- Config: `settings.json → recaptcha`
- Site key exposed via `/api/recaptcha-config`
- Verification on: contact form, ticket creation

### External Assets
- Default logo: Hosted on Emergent CDN
- Fonts: System fonts via Tailwind

### No Payment Integration
- Not implemented

---

## Quick Reference

**Default Admin:** `admin@ixadigital.com` / `admin123`

**Key Directories:**
```
/backend-node/
├── server.js          # Main server
├── database.js        # LowDB setup
├── routes/            # API routes
├── database/          # JSON data
└── uploads/           # User uploads

/frontend/
├── src/components/    # React components
├── src/hooks/         # Custom hooks
└── build/             # Production build
```

**API Base URL:** Value of `REACT_APP_BACKEND_URL` environment variable
