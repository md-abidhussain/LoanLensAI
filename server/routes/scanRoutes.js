const express = require('express');
const router = express.Router();
const handleUpload = require('../middleware/uploadMiddleware');
const { createScan, getScans, getScanById } = require('../controllers/scanController');

router.post('/scan', handleUpload, createScan);
router.get('/scans', getScans);
router.get('/scans/:id', getScanById);

module.exports = router;
