const pdfModule = require('pdf-parse');
const PDFParseClass = pdfModule && typeof pdfModule.PDFParse === 'function' ? pdfModule.PDFParse : null;
const legacyPdfFn = typeof pdfModule === 'function'
  ? pdfModule
  : (pdfModule && typeof pdfModule.default === 'function' ? pdfModule.default : null);

async function extractPDF(buffer) {
  if (!buffer) {
    throw new Error('No PDF buffer received');
  }

  try {
    if (PDFParseClass) {
      const parser = new PDFParseClass({ data: buffer, verbosity: 0 });
      try {
        const result = await parser.getText();
        return (result && result.text) || '';
      } finally {
        if (typeof parser.destroy === 'function') {
          await parser.destroy();
        }
      }
    }

    if (legacyPdfFn) {
      const result = await legacyPdfFn(buffer);
      return (result && result.text) || '';
    }

    throw new Error('pdf-parse module did not expose a usable parser');
  } catch (err) {
    console.error('PDF Parse Error:', err);
    throw new Error('Failed to extract text from PDF');
  }
}

module.exports = { extractPDF };
