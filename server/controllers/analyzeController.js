// controllers/analyzeController.js
const fs = require('fs');
const pdfService = require('../services/pdfService');
const ocrService = require('../services/ocrService');
const ruleAnalyzer = require('../services/ruleAnalyzer');
const aiEnhancer = require('../services/aiEnhancer');

exports.analyze = async (req, res, next) => {
	try {
		console.log('[analyze] req.file keys:', Object.keys(req.file || {}));
		console.log('[analyze] has buffer:', !!(req.file && req.file.buffer));
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded. Use field name "file".' });
		}

		const fileInfo = {
			originalname: req.file.originalname,
			mimetype: req.file.mimetype,
			size: req.file.size,
			path: req.file.path || null,
		};

		let extractedText = '';

		if (req.file.mimetype === 'application/pdf') {
			if (req.file.buffer) {
				extractedText = await pdfService.extractPDF(req.file.buffer);
			} else if (req.file.path) {
				const buffer = fs.readFileSync(req.file.path);
				extractedText = await pdfService.extractPDF(buffer);
			}
		} else if (req.file.mimetype && req.file.mimetype.startsWith('image')) {
			if (req.file.buffer) {
				extractedText = await ocrService.extractImage(req.file.buffer, req.file.mimetype);
			} else if (req.file.path) {
				extractedText = await ocrService.extractImage(req.file.path);
			}
		} else {
			// try to read as text
			try {
				if (req.file.buffer) {
					extractedText = req.file.buffer.toString('utf8');
				} else if (req.file.path) {
					extractedText = fs.readFileSync(req.file.path, 'utf8');
				}
			} catch (e) {
				extractedText = '';
			}
		}

		const analysis = ruleAnalyzer.analyzeText(extractedText || '');

		// Attempt AI enhancement, if configured
		let aiStructured = null;
		let aiRaw = null;
		try {
			const aiResult = await aiEnhancer.enhanceWithAI(extractedText || '');
			if (aiResult) {
				if (typeof aiResult === 'string') {
					aiRaw = aiResult;
				} else {
					aiRaw = aiResult.raw ?? null;
					if (aiResult.structured && typeof aiResult.structured === 'object' && !Array.isArray(aiResult.structured)) {
						aiStructured = aiResult.structured;
					}
				}
			}
		} catch (e) {
			// swallow AI errors, keep analysis result
			console.error('AI enhancer failed:', e);
		}

		// Cleanup uploaded file (best-effort) if it was stored on disk
		if (req.file.path) {
			fs.unlink(req.file.path, (err) => {
				if (err) console.warn('Failed to remove temp file:', req.file.path, err.message);
			});
		}

		res.json({
			message: 'File analyzed',
			file: fileInfo,
			text: extractedText,
			analysis,
			ai: aiStructured,
			aiRaw,
		});
	} catch (err) {
		next(err);
	}
};

module.exports = exports;
