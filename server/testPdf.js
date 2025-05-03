const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

async function testPdfGeneration() {
    try {
        console.log("Testing PDF generation...");
        
        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);
        
        // Add some text to the page
        page.drawText('PDF Generation Test', {
            x: 50,
            y: 350,
            size: 30
        });
        
        // Save the PDF
        const pdfBytes = await pdfDoc.save();
        const outputPath = path.join(__dirname, "test-output.pdf");
        fs.writeFileSync(outputPath, pdfBytes);
        
        console.log(`Test PDF created at: ${outputPath}`);
        return true;
    } catch (error) {
        console.error("PDF Generation Error:", error);
        return false;
    }
}

testPdfGeneration()
    .then(result => console.log("PDF test result:", result))
    .catch(err => console.error("PDF test failed:", err));
