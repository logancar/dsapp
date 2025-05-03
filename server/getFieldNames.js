const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function getFieldNames() {
  try {
    const pdfPath = path.join(__dirname, '..', 'public', 'pdfs', 'Pickup.pdf');
    console.log(`Reading PDF from: ${pdfPath}`);
    
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log('Fields in Pickup.pdf:');
    fields.forEach(field => {
      console.log(`- ${field.getName()}`);
    });
  } catch (error) {
    console.error('Error reading PDF fields:', error);
  }
}

getFieldNames();
