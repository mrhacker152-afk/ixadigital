const express = require('express');
const router = express.Router();

// Health check
router.get('/', (req, res) => {
  res.json({ message: 'IXA Digital API', version: '3.0.0', status: 'operational' });
});

module.exports = router;
