const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

async function testVin2Field() {
    try {
        // Path to the PDF
        const pdfPath = path.join(__dirname, "..", "public", "pdfs", "DropoffForm.pdf");
        console.log(`Reading PDF from: ${pdfPath}`);
        
        // Load the PDF
        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        
        // Get the form
        const form = pdfDoc.getForm();
        
        // List all fields to verify vin2 exists
        console.log('All fields in the PDF:');
        const fields = form.getFields();
        fields.forEach(field => {
            console.log(`- ${field.getName()} (${field.constructor.name})`);
            
            // Get more info about text fields
            if (field.constructor.name === 'PDFTextField') {
                try {
                    const textField = form.getTextField(field.getName());
                    console.log(`  Current value: "${textField.getText()}"`);
                    
                    // Try to get field position
                    try {
                        const widget = textField.acroField.getWidgets()[0];
                        if (widget) {
                            const rect = widget.getRectangle();
                            console.log(`  Position: x=${rect.x}, y=${rect.y}, width=${rect.width}, height=${rect.height}`);
                            
                            // Try to determine which page this field is on
                            const pages = pdfDoc.getPages();
                            for (let i = 0; i < pages.length; i++) {
                                if (widget.P && pages[i].ref.equals(widget.P)) {
                                    console.log(`  This field is on page ${i}`);
                                    break;
                                }
                            }
                        }
                    } catch (posError) {
                        console.log(`  Could not get field position: ${posError.message}`);
                    }
                } catch (e) {
                    console.log(`  Error getting text field info: ${e.message}`);
                }
            }
        });
        
        // Try to set the vin2 field
        try {
            const vin2Field = form.getTextField('vin2');
            if (vin2Field) {
                const testVin = "1HGCM82633A123456";
                vin2Field.setText(testVin);
                console.log(`Successfully set vin2 field to "${testVin}"`);
            } else {
                console.log('Could not find vin2 field');
            }
        } catch (e) {
            console.error('Error setting vin2 field:', e.message);
        }
        
        // Save the modified PDF
        const outputPath = path.join(__dirname, "test-vin2-output.pdf");
        const modifiedPdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, modifiedPdfBytes);
        console.log(`Modified PDF saved to: ${outputPath}`);
        
    } catch (error) {
        console.error("Error testing vin2 field:", error);
    }
}

testVin2Field();
