const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

async function extractPdfFields(pdfPath) {
    console.log(`Extracting fields from: ${pdfPath}`);
    
    try {
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        const form = pdfDoc.getForm();
        const fields = form.getFields();
        
        console.log(`Found ${fields.length} fields in the PDF:`);
        fields.forEach((field, index) => {
            const fieldName = field.getName();
            const fieldType = field.constructor.name;
            console.log(`${index + 1}. ${fieldName} (${fieldType})`);
        });
    } catch (error) {
        console.error("Error extracting PDF fields:", error);
    }
}

// Path to the Rental PDF
const rentalPdfPath = path.join(__dirname, "..", "public", "pdfs", "Rental.pdf");

// Extract fields
extractPdfFields(rentalPdfPath);
