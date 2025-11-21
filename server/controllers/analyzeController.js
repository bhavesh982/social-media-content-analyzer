// controllers/analyzeController.js
const fs = require('fs');
const pdfService = require('../services/pdfService');
const ocrService = require('../services/ocrService');
const ruleAnalyzer = require('../services/ruleAnalyzer');
const aiEnhancer = require('../services/aiEnhancer');

exports.analyze = async (req, res, next) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded. Use field name "file".' });
		}

		const fileInfo = {
			originalname: req.file.originalname,
			mimetype: req.file.mimetype,
			size: req.file.size,
			path: req.file.path,
		};

		let extractedText = '';

		if (req.file.mimetype === 'application/pdf') {
			const buffer = fs.readFileSync(req.file.path);
			extractedText = await pdfService.extractPDF(buffer);
		} else if (req.file.mimetype && req.file.mimetype.startsWith('image')) {
			extractedText = await ocrService.extractImage(req.file.path);
		} else {
			// try to read as text
			try {
				extractedText = fs.readFileSync(req.file.path, 'utf8');
			} catch (e) {
				extractedText = '';
			}
		}

		const analysis = ruleAnalyzer.analyzeText(extractedText || '');

		// Attempt AI enhancement, if configured
		let ai = null;
		try {
			ai = await aiEnhancer.enhanceWithAI(extractedText || '');
		} catch (e) {
			// swallow AI errors, keep analysis result
			console.error('AI enhancer failed:', e);
		}

		// Cleanup uploaded file (best-effort)
		fs.unlink(req.file.path, (err) => {
			if (err) console.warn('Failed to remove temp file:', req.file.path, err.message);
		});

		res.json({ message: 'File analyzed', file: fileInfo, text: extractedText, analysis, ai });
	} catch (err) {
		next(err);
	}
};

module.exports = exports;
