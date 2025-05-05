const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function testSignaturePositions() {
    try {
        // Load the PDF
        const pdfPath = path.join(__dirname, '..', 'public', 'pdfs', 'DropoffForm.pdf');
        console.log(`Reading PDF from: ${pdfPath}`);
        
        if (!fs.existsSync(pdfPath)) {
            console.error(`PDF file not found at ${pdfPath}`);
            return;
        }
        
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        // Get form fields
        const form = pdfDoc.getForm();
        
        // Get signature fields
        try {
            const signature1 = form.getSignature('signature1');
            const signature2 = form.getSignature('signature2');
            
            console.log('Signature fields found:');
            
            if (signature1) {
                const widget1 = signature1.acroField.getWidgets()[0];
                if (widget1) {
                    const rect1 = widget1.getRectangle();
                    console.log(`Signature1: x=${rect1.x}, y=${rect1.y}, width=${rect1.width}, height=${rect1.height}, page=${widget1.P.objectNumber}`);
                }
            }
            
            if (signature2) {
                const widget2 = signature2.acroField.getWidgets()[0];
                if (widget2) {
                    const rect2 = widget2.getRectangle();
                    console.log(`Signature2: x=${rect2.x}, y=${rect2.y}, width=${rect2.width}, height=${rect2.height}, page=${widget2.P.objectNumber}`);
                }
            }
        } catch (e) {
            console.error('Error getting signature fields:', e);
        }
        
        // Create a test image
        const pages = pdfDoc.getPages();
        
        // Test drawing on page 1 (second page)
        const page1 = pages[1];
        const { width: width1, height: height1 } = page1.getSize();
        console.log(`Page 1 dimensions: width=${width1}, height=${height1}`);
        
        // Test drawing on page 3 (last page)
        const page3 = pages[3];
        const { width: width3, height: height3 } = page3.getSize();
        console.log(`Page 3 dimensions: width=${width3}, height=${height3}`);
        
        // Save the modified PDF
        const outputPath = path.join(__dirname, 'signature-test.pdf');
        const modifiedPdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, modifiedPdfBytes);
        console.log(`Test PDF saved to: ${outputPath}`);
    } catch (error) {
        console.error('Error testing signature positions:', error);
    }
}

testSignaturePositions();
