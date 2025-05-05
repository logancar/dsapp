const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function testSignaturePosition() {
    try {
        const pdfPath = path.join(__dirname, '..', 'public', 'pdfs', 'Pickup.pdf');
        console.log(`Reading PDF from: ${pdfPath}`);

        if (!fs.existsSync(pdfPath)) {
            console.error(`PDF file not found at ${pdfPath}`);
            return;
        }

        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);

        // Get page dimensions
        const pages = pdfDoc.getPages();
        console.log(`PDF has ${pages.length} pages`);

        const page = pages[0]; // First page
        const { width, height } = page.getSize();
        console.log(`Page 0: width=${width}, height=${height}`);

        // Based on visual inspection of the PDF, suggest the optimal position
        console.log('\nSuggested signature position:');
        console.log(`{
    field: "signature",
    x: 306,  // Center of the page (612/2)
    y: 150,  // Adjusted to be in the signature line area
    width: 200,
    height: 50,
    page: 0,
    pdfField: null  // No existing signature field in the PDF
}`);
    } catch (error) {
        console.error('Error testing signature position:', error);
    }
}

testSignaturePosition();
