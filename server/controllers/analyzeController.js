// controllers/analyzeController.js
const fs = require('fs');

exports.analyze = async (req, res, next) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded. Use field name "file".' });
		}

		// Placeholder behavior: return basic file info. Real implementation
		// should parse PDFs, run OCR, and analyze content.
		const fileInfo = {
			originalname: req.file.originalname,
			mimetype: req.file.mimetype,
			size: req.file.size,
			path: req.file.path,
		};

		res.json({ message: 'File received', file: fileInfo });
	} catch (err) {
		next(err);
	}
};

module.exports = exports;
