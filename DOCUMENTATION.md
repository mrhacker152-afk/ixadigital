# IXA Digital - CloudPanel Deployment Documentation

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [CloudPanel Initial Setup](#cloudpanel-initial-setup)
3. [Domain Configuration](#domain-configuration)
4. [Automated Installation](#automated-installation)
5. [Manual Installation (Alternative)](#manual-installation-alternative)
6. [Environment Configuration](#environment-configuration)
7. [Database Setup](#database-setup)
8. [SSL Certificate](#ssl-certificate)
9. [Admin Panel Access](#admin-panel-access)
10. [Post-Deployment Configuration](#post-deployment-configuration)
11. [Troubleshooting](#troubleshooting)
12. [Maintenance & Updates](#maintenance--updates)

---

## Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04 LTS or 22.04 LTS
- **RAM**: Minimum 2GB (4GB recommended)
- **CPU**: 2 cores (recommended)
- **Disk**: 20GB SSD minimum
- **CloudPanel**: Version 2.x installed

### Required Services
- Node.js 18.x or higher
- Python 3.11+
- MongoDB 6.0+
- Nginx (included with CloudPanel)
- Supervisor (for process management)

### Domain Setup
- Domain: `ixadigital.com`
- DNS A Record pointing to your server IP
- Wait 5-10 minutes for DNS propagation

---

## CloudPanel Initial Setup

### 1. Install CloudPanel (if not already installed)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install CloudPanel
curl -sS https://installer.cloudpanel.io/ce/v2/install.sh -o install.sh
sudo bash install.sh

# Access CloudPanel at: https://YOUR_SERVER_IP:8443
```

### 2. Create Database User

```bash
# Login to CloudPanel admin panel
# Go to: Databases → Add Database
# Create:
Database Name: ixadigital_db
Database User: ixadigital_user
Password: [Generate strong password]
```

---

## Domain Configuration

### 1. Add Site in CloudPanel

1. **Login to CloudPanel**: `https://YOUR_SERVER_IP:8443`
2. **Add Site**:
   - Domain Name: `ixadigital.com`
   - Site Type: `Node.js`
   - Node.js Version: `18.x`
3. **Enable SSL**: Let's Encrypt (after DNS propagates)

### 2. DNS Configuration

**Add these DNS records at your domain registrar:**

```
Type    Name    Value               TTL
A       @       YOUR_SERVER_IP      3600
A       www     YOUR_SERVER_IP      3600
CNAME   admin   ixadigital.com      3600
```

---

## Automated Installation

### Quick Setup Script

**Download and run the automated setup script:**

```bash
# Download setup script
wget https://raw.githubusercontent.com/YOUR_REPO/setup.sh -O setup.sh
chmod +x setup.sh

# Run setup
sudo ./setup.sh
```

**Or copy the setup.sh script from this repository and run:**

```bash
chmod +x setup.sh
sudo ./setup.sh
```

The script will:
- ✅ Install all dependencies
- ✅ Setup MongoDB
- ✅ Configure Python virtual environment
- ✅ Install Node.js packages
- ✅ Build frontend
- ✅ Configure Nginx
- ✅ Setup Supervisor
- ✅ Create systemd services

**Estimated time**: 10-15 minutes

---

## Manual Installation (Alternative)

### Step 1: Prepare Directory Structure

```bash
# Navigate to site directory
cd /home/ixadigital/htdocs/ixadigital.com

# Clone or upload your code
git clone YOUR_REPOSITORY_URL .

# Or upload via SFTP/SCP
```

### Step 2: Backend Setup

```bash
# Install Python dependencies
cd backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017/
DB_NAME=ixadigital_db
JWT_SECRET_KEY=$(openssl rand -hex 32)
FRONTEND_URL=https://ixadigital.com
EOF
```

### Step 3: Frontend Setup

```bash
# Install Node.js dependencies
cd ../frontend
npm install -g yarn
yarn install

# Create .env file
cat > .env << EOF
REACT_APP_BACKEND_URL=https://ixadigital.com
EOF

# Build production
yarn build
```

### Step 4: MongoDB Setup

```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database user
mongo
> use ixadigital_db
> db.createUser({
    user: "ixadigital_user",
    pwd: "YOUR_PASSWORD",
    roles: [{role: "readWrite", db: "ixadigital_db"}]
  })
> exit
```

### Step 5: Nginx Configuration

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/ixadigital.com

# Add configuration (see nginx.conf in repository)
# Link configuration
sudo ln -s /etc/nginx/sites-available/ixadigital.com /etc/nginx/sites-enabled/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### Step 6: Supervisor Configuration

```bash
# Create supervisor config
sudo nano /etc/supervisor/conf.d/ixadigital.conf

# Add configuration (see supervisor.conf in repository)
# Update supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start ixadigital:*
```

---

## Environment Configuration

### Backend Environment Variables

**File**: `/home/ixadigital/htdocs/ixadigital.com/backend/.env`

```env
# Database
MONGO_URL=mongodb://ixadigital_user:PASSWORD@localhost:27017/ixadigital_db
DB_NAME=ixadigital_db

# Security
JWT_SECRET_KEY=your-super-secret-key-here

# URLs
FRONTEND_URL=https://ixadigital.com

# Optional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend Environment Variables

**File**: `/home/ixadigital/htdocs/ixadigital.com/frontend/.env`

```env
REACT_APP_BACKEND_URL=https://ixadigital.com
REACT_APP_SITE_NAME=IXA Digital
```

---

## Database Setup

### MongoDB Connection String

```bash
# Update backend .env with proper MongoDB URL
MONGO_URL=mongodb://ixadigital_user:YOUR_PASSWORD@localhost:27017/ixadigital_db?authSource=ixadigital_db
```

### Initialize Database

```bash
# Backend will auto-initialize on first run
# Creates:
# - admin user (username: admin, password: IXADigital@2026)
# - default settings
# - required collections with indexes
```

---

## SSL Certificate

### Using Let's Encrypt (CloudPanel)

1. **In CloudPanel**:
   - Go to your site
   - Click on "SSL/TLS"
   - Click "Let's Encrypt"
   - Enter email address
   - Click "Install"

### Manual SSL Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d ixadigital.com -d www.ixadigital.com

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

---

## Admin Panel Access

### Default Credentials

**URL**: `https://ixadigital.com/admin/login`

```
Username: admin
Password: IXADigital@2026
```

**⚠️ IMPORTANT**: Change password immediately after first login!

### Change Admin Password

```bash
# Connect to MongoDB
mongo ixadigital_db

# Generate new password hash
# Use Python to generate bcrypt hash:
python3 -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto'); print(pwd_context.hash('YOUR_NEW_PASSWORD'))"

# Update in MongoDB
db.admins.updateOne(
  {username: "admin"},
  {$set: {password_hash: "HASH_FROM_ABOVE"}}
)
```

---

## Post-Deployment Configuration

### 1. Configure Email Notifications

1. Login to Admin Panel
2. Go to **Settings** → **Email Settings**
3. Configure Gmail SMTP:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: Your Gmail
   - Password: App Password (not regular password)
   - Enable notifications
4. Add recipient emails
5. Test email

### 2. Setup Google reCAPTCHA

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Register site:
   - Type: reCAPTCHA v2 "I'm not a robot"
   - Domains: `ixadigital.com`
3. Copy Site Key & Secret Key
4. In Admin Panel → **Settings** → **Security**:
   - Enable reCAPTCHA
   - Paste keys
   - Save

### 3. Configure SEO Settings

1. Admin Panel → **Settings** → **SEO & Analytics**
2. Add Google Analytics ID
3. Add Google Site Verification code
4. Update meta tags
5. Save settings

### 4. Upload Logo & Favicon

1. Admin Panel → **Settings** → **Branding**
2. Upload company logo (PNG/SVG, max 5MB)
3. Upload favicon (ICO/PNG, 16x16 or 32x32)
4. Update company name
5. Save

### 5. Customize Content

1. Admin Panel → **Edit Content**
2. Modify:
   - Hero section text
   - About section
   - CTA text
   - Footer information
3. Save changes

---

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
sudo tail -f /var/log/supervisor/ixadigital_backend.err.log

# Common issues:
# 1. MongoDB not running
sudo systemctl status mongod
sudo systemctl start mongod

# 2. Wrong Python path
which python3.11

# 3. Missing dependencies
cd /home/ixadigital/htdocs/ixadigital.com/backend
source venv/bin/activate
pip install -r requirements.txt

# Restart backend
sudo supervisorctl restart ixadigital:backend
```

### Frontend 502 Bad Gateway

```bash
# Check if backend is running
sudo supervisorctl status ixadigital:backend

# Check backend URL in frontend .env
cat /home/ixadigital/htdocs/ixadigital.com/frontend/.env

# Rebuild frontend
cd /home/ixadigital/htdocs/ixadigital.com/frontend
yarn build

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### MongoDB Connection Failed

```bash
# Check MongoDB status
sudo systemctl status mongod

# Check connection string
cat /home/ixadigital/htdocs/ixadigital.com/backend/.env

# Test connection
mongo "mongodb://ixadigital_user:PASSWORD@localhost:27017/ixadigital_db"

# Reset MongoDB user
mongo
> use ixadigital_db
> db.dropUser("ixadigital_user")
> db.createUser({
    user: "ixadigital_user",
    pwd: "NEW_PASSWORD",
    roles: [{role: "readWrite", db: "ixadigital_db"}]
  })
```

### SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew --force-renewal

# Check certificate status
sudo certbot certificates

# Test SSL
curl -I https://ixadigital.com
```

### Forms Not Submitting

```bash
# Check reCAPTCHA configuration
# Admin Panel → Settings → Security

# Check browser console for errors
# Check backend logs
sudo tail -f /var/log/supervisor/ixadigital_backend.err.log

# Test API endpoint
curl -X POST https://ixadigital.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"123","message":"Test"}'
```

---

## Maintenance & Updates

### Update Application Code

```bash
# Navigate to directory
cd /home/ixadigital/htdocs/ixadigital.com

# Pull latest changes
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo supervisorctl restart ixadigital:backend

# Update frontend
cd ../frontend
yarn install
yarn build

# Restart services
sudo supervisorctl restart ixadigital:*
```

### Backup Database

```bash
# Create backup directory
mkdir -p /home/ixadigital/backups

# Backup MongoDB
mongodump --db ixadigital_db --out /home/ixadigital/backups/backup_$(date +%Y%m%d_%H%M%S)

# Backup uploaded files
tar -czf /home/ixadigital/backups/uploads_$(date +%Y%m%d_%H%M%S).tar.gz \
  /home/ixadigital/htdocs/ixadigital.com/backend/static/uploads/

# Create automated backup cron
crontab -e
# Add: 0 2 * * * /path/to/backup_script.sh
```

### Restore Database

```bash
# Restore from backup
mongorestore --db ixadigital_db /home/ixadigital/backups/backup_TIMESTAMP/ixadigital_db/
```

### Monitor Application

```bash
# Check service status
sudo supervisorctl status

# Monitor logs in real-time
sudo tail -f /var/log/supervisor/ixadigital_*.log

# Check resource usage
htop

# Check disk space
df -h

# Check MongoDB status
sudo systemctl status mongod
```

### Update Dependencies

```bash
# Update backend dependencies
cd /home/ixadigital/htdocs/ixadigital.com/backend
source venv/bin/activate
pip list --outdated
pip install --upgrade PACKAGE_NAME

# Update frontend dependencies
cd ../frontend
yarn outdated
yarn upgrade PACKAGE_NAME

# Rebuild and restart
yarn build
sudo supervisorctl restart ixadigital:*
```

---

## Performance Optimization

### Enable Caching

**Already implemented:**
- ✅ GZip compression
- ✅ HTTP caching headers
- ✅ Static file caching
- ✅ Database indexing
- ✅ Code splitting

### Additional Optimizations

```bash
# Enable Nginx caching
sudo nano /etc/nginx/nginx.conf

# Add in http block:
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

# In server block:
location /api/ {
    proxy_cache my_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_key "$scheme$request_method$host$request_uri";
}
```

---

## Security Checklist

- ✅ Change default admin password
- ✅ Enable HTTPS/SSL
- ✅ Configure firewall (UFW)
- ✅ Setup reCAPTCHA
- ✅ Secure MongoDB with authentication
- ✅ Use environment variables for secrets
- ✅ Regular backups
- ✅ Keep software updated
- ✅ Monitor logs for suspicious activity
- ✅ Implement rate limiting (if needed)

---

## Support & Resources

### Documentation
- Full API Docs: `/app/API_DOCUMENTATION.md`
- Performance Guide: `/app/PERFORMANCE_OPTIMIZATIONS.md`
- PRD: `/app/memory/PRD.md`

### Useful Commands

```bash
# Restart all services
sudo supervisorctl restart ixadigital:*

# View all logs
sudo supervisorctl tail -f ixadigital:backend
sudo supervisorctl tail -f ixadigital:frontend

# Check status
sudo supervisorctl status

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# MongoDB shell
mongo ixadigital_db

# Check ports
sudo netstat -tulpn | grep -E ':(3000|8001|27017)'
```

### Common URLs
- **Homepage**: https://ixadigital.com
- **Admin Login**: https://ixadigital.com/admin/login
- **Track Ticket**: https://ixadigital.com/track-ticket
- **API**: https://ixadigital.com/api/

---

## Production Checklist

Before going live, ensure:

- [ ] Domain DNS configured correctly
- [ ] SSL certificate installed and working
- [ ] Admin password changed from default
- [ ] Email notifications configured and tested
- [ ] Google reCAPTCHA enabled
- [ ] Logo and favicon uploaded
- [ ] Content customized
- [ ] Database backups automated
- [ ] Monitoring setup
- [ ] All forms tested
- [ ] Mobile responsiveness checked
- [ ] SEO settings configured
- [ ] Google Analytics added
- [ ] Test email sending
- [ ] Test support ticket creation
- [ ] Test customer portal
- [ ] Performance tested (Google PageSpeed)

---

## Version Information

- **Application Version**: 3.0
- **Node.js**: 18.x
- **Python**: 3.11
- **MongoDB**: 6.0
- **Documentation Last Updated**: January 30, 2026

---

**Deployment Status**: ✅ Ready for Production

For issues or questions, check the troubleshooting section or review application logs.
EOF
echo "✅ Documentation created successfully"