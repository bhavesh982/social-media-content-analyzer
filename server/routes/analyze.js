// routes/analyze.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const analyzeController = require('../controllers/analyzeController');

// store uploads in a temporary uploads/ directory
const upload = multer({ dest: 'uploads/' });

// POST /analyze - accepts a single file field named `file`
router.post('/', upload.single('file'), analyzeController.analyze);

module.exports = router;
