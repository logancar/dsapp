const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function listPdfFields() {
    try {
        const pdfPath = path.join(__dirname, '..', 'public', 'pdfs', 'DropoffForm.pdf');
        console.log(`Reading PDF from: ${pdfPath}`);
        
        if (!fs.existsSync(pdfPath)) {
            console.error(`PDF file not found at ${pdfPath}`);
            return;
        }
        
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        
        console.log('All AcroForm field names:');
        fields.forEach(f => console.log(' –', f.getName(), '(Type:', f.constructor.name, ')'));
        
        console.log(`\nTotal fields: ${fields.length}`);
        
        // Get page count
        const pages = pdfDoc.getPages();
        console.log(`\nPDF has ${pages.length} pages`);
        
        // Get page dimensions
        pages.forEach((page, index) => {
            const { width, height } = page.getSize();
            console.log(`Page ${index}: width=${width}, height=${height}`);
        });
    } catch (error) {
        console.error('Error listing PDF fields:', error);
    }
}

listPdfFields();
