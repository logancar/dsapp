const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function listPdfFields() {
    try {
        const pdfPath = path.join(__dirname, '..', 'public', 'pdfs', 'Pickup.pdf');
        console.log(`Reading PDF from: ${pdfPath}`);
        
        if (!fs.existsSync(pdfPath)) {
            console.error(`PDF file not found at ${pdfPath}`);
            return;
        }
        
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        const form = pdfDoc.getForm();
        console.log('All AcroForm field names:');
        form.getFields().forEach(f => console.log(' –', f.getName(), '(Type:', f.constructor.name, ')'));
        
        // Get page dimensions for each page
        const pages = pdfDoc.getPages();
        console.log(`\nPDF has ${pages.length} pages`);
        
        pages.forEach((page, index) => {
            const { width, height } = page.getSize();
            console.log(`Page ${index}: width=${width}, height=${height}`);
        });

        // Try to get signature fields specifically
        try {
            console.log('\nLooking for signature fields:');
            const signatureFields = ['signature', 'signature1', 'Signature', 'Signature1'];
            
            for (const fieldName of signatureFields) {
                try {
                    const field = form.getField(fieldName);
                    if (field) {
                        console.log(`Found field: ${fieldName} (Type: ${field.constructor.name})`);
                        
                        // Try to get widget information
                        try {
                            const widget = field.acroField.getWidgets()[0];
                            if (widget) {
                                const rect = widget.getRectangle();
                                console.log(`  Position: x=${rect.x}, y=${rect.y}, width=${rect.width}, height=${rect.height}, page=${widget.P?.objectNumber}`);
                                
                                // Try to determine which page this field is on
                                const pageRef = widget.P;
                                if (pageRef) {
                                    for (let i = 0; i < pages.length; i++) {
                                        if (pages[i].ref.equals(pageRef)) {
                                            console.log(`  This field is on page ${i}`);
                                            break;
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            console.log(`  Could not get widget info: ${e.message}`);
                        }
                    }
                } catch (e) {
                    console.log(`Field ${fieldName} not found: ${e.message}`);
                }
            }
        } catch (e) {
            console.error('Error checking signature fields:', e);
        }
    } catch (error) {
        console.error('Error listing PDF fields:', error);
    }
}

listPdfFields();
