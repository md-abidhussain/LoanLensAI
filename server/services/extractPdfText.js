const pdfParse = require('pdf-parse');

async function extractPdfText(pdfBuffer) {
  try {
    const data = await pdfParse(new Uint8Array(pdfBuffer));
    if (!data || !data.text) {
      throw new Error('failed to extract text from pdf');
    }
    return data.text.trim();
  } catch (err) {
    console.error('pdf parsing error', err.message);
    throw new Error('the pdf file is corrupt or could not be parsed');
  }
}

module.exports = extractPdfText;
