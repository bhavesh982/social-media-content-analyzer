const Tesseract = require('tesseract.js');

async function extractImage(input, mimetype) {
	// `input` can be a file path (string) or a Buffer (memoryStorage)
	// If it's a Buffer, convert to a data URL so Tesseract can recognize it reliably.
	let source = input;
	if (Buffer.isBuffer(input)) {
		// Try to derive an image MIME type; fall back to jpeg
		const type = mimetype || 'image/jpeg';
		source = `data:${type};base64,${input.toString('base64')}`;
	}

	const result = await Tesseract.recognize(source, 'eng');
	return result.data.text;
}

module.exports = { extractImage };
