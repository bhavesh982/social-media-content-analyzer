const pdf = require('pdf-parse');

async function extractPDF(buffer) {
	const data = await pdf(buffer);
	return data.text;
}

module.exports = { extractPDF };
