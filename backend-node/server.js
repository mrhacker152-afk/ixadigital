require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const fs = require('fs');

// Import database and routes
const { initAllDatabases } = require('./database');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3030;

// Create required directories
const directories = [
  path.join(__dirname, 'database'),
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads/logos'),
  path.join(__dirname, 'uploads/favicons')
];
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression()); // GZip compression
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (logos, favicons) with absolute path
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  etag: true
}));

// Initialize database before setting up routes
async function startServer() {
  try {
    // Initialize databases first
    await initAllDatabases();
    
    // Import routes after database is initialized
    const apiRoutes = require('./routes/api');
    const adminRoutes = require('./routes/admin');
    const publicRoutes = require('./routes/public');
    
    // API Routes
    app.use('/api', apiRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api', publicRoutes);

    // Serve React frontend (production build)
    const frontendBuildPath = path.join(__dirname, '../frontend/build');
    if (fs.existsSync(frontendBuildPath)) {
      app.use(express.static(frontendBuildPath, {
        maxAge: '1d',
        etag: true
      }));

      // SPA fallback - all non-API routes serve index.html
      app.get('*', (req, res) => {
        res.sendFile(path.join(frontendBuildPath, 'index.html'));
      });
    } else {
      app.get('*', (req, res) => {
        res.status(503).json({
          error: 'Frontend not built',
          message: 'Please run: cd frontend && yarn build'
        });
      });
    }

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error'
      });
    });

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 IXA Digital Server Running`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`   Port: ${PORT}`);
      console.log(`   URL: http://localhost:${PORT}`);
      console.log(`   Admin: http://localhost:${PORT}/admin/login`);
      console.log(`   API: http://localhost:${PORT}/api/`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`✓ Database: LowDB (JSON files)`);
      console.log(`✓ Storage: ${path.join(__dirname, 'database')}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
