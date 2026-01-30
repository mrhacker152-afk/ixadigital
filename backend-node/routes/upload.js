const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { databases } = require('../database');

// Configure multer for logo uploads
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/logos';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `logo_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, WebP, and SVG allowed.'));
    }
  }
});

// Configure multer for favicon uploads
const faviconStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/favicons';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname).toLowerCase();
    
    // Handle .ico files properly
    if (file.mimetype === 'image/x-icon' || file.mimetype === 'image/vnd.microsoft.icon') {
      ext = '.ico';
    }
    
    const uniqueName = `favicon_${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

const faviconUpload = multer({
  storage: faviconStorage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/svg+xml'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Supported: ICO, PNG, JPG, GIF, SVG'));
    }
  }
});

// Upload logo handler
exports.uploadLogo = [
  logoUpload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ detail: 'No file uploaded' });
      }
      
      const fileUrl = `/uploads/logos/${req.file.filename}`;
      
      // Update settings
      await databases.settings.read();
      databases.settings.data.branding.logo_url = fileUrl;
      await databases.settings.write();
      
      console.log(`✓ Logo uploaded: ${req.file.filename}`);
      
      res.json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
        message: 'Logo uploaded successfully'
      });
    } catch (error) {
      console.error('Logo upload error:', error);
      res.status(500).json({ detail: error.message });
    }
  }
];

// Upload favicon handler
exports.uploadFavicon = [
  faviconUpload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ detail: 'No file uploaded' });
      }
      
      const fileUrl = `/uploads/favicons/${req.file.filename}`;
      
      // Update settings
      await databases.settings.read();
      databases.settings.data.branding.favicon_url = fileUrl;
      await databases.settings.write();
      
      console.log(`✓ Favicon uploaded: ${req.file.filename} (${req.file.mimetype})`);
      
      res.json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
        message: 'Favicon uploaded successfully'
      });
    } catch (error) {
      console.error('Favicon upload error:', error);
      res.status(500).json({ detail: error.message });
    }
  }
];
