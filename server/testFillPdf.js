const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

async function testFillPdf() {
    try {
        console.log("Testing PDF form filling...");

        // Check if the DropoffForm.pdf file exists
        const pdfPath = path.join(__dirname, "..", "public", "pdfs", "DropoffForm.pdf");
        if (!fs.existsSync(pdfPath)) {
            console.error(`PDF file not found at: ${pdfPath}`);
            return false;
        }

        console.log(`Found PDF file at: ${pdfPath}`);

        // Load the PDF
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);

        // Get the form
        const form = pdfDoc.getForm();

        // Log all available form fields
        const formFields = form.getFields();
        console.log('Available PDF form fields:');
        formFields.forEach(field => {
            console.log(`- ${field.getName()} (${field.constructor.name})`);
        });

        // Try to fill a field if any exist
        if (formFields.length > 0) {
            try {
                const firstField = formFields[0];
                console.log(`Attempting to fill field: ${firstField.getName()}`);

                if (firstField.constructor.name === 'PDFTextField') {
                    const textField = form.getTextField(firstField.getName());
                    textField.setText('Test Value');
                    console.log(`Successfully filled text field: ${firstField.getName()}`);
                } else if (firstField.constructor.name === 'PDFCheckBox') {
                    const checkBox = form.getCheckBox(firstField.getName());
                    checkBox.check();
                    console.log(`Successfully checked checkbox: ${firstField.getName()}`);
                }
            } catch (fieldError) {
                console.error(`Error filling field: ${fieldError.message}`);
            }
        }

        // Save the PDF
        const outputPath = path.join(__dirname, "test-filled.pdf");
        const filledPdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, filledPdfBytes);

        console.log(`Test filled PDF created at: ${outputPath}`);
        return true;
    } catch (error) {
        console.error("PDF Filling Error:", error);
        return false;
    }
}

testFillPdf()
    .then(result => console.log("PDF fill test result:", result))
    .catch(err => console.error("PDF fill test failed:", err));
