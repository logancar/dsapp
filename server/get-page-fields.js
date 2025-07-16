const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

async function getFieldsByPage() {
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
        const pages = pdfDoc.getPages();
        
        console.log(`PDF has ${pages.length} pages and ${fields.length} fields\n`);
        
        // Create a map to store fields by page
        const fieldsByPage = {};
        for (let i = 0; i < pages.length; i++) {
            fieldsByPage[i] = [];
        }
        
        // Process each field
        fields.forEach(field => {
            try {
                const fieldName = field.getName();
                const fieldType = field.constructor.name;
                
                // Get the field's widgets (visual representations)
                const widgets = field.acroField.getWidgets();
                
                widgets.forEach(widget => {
                    try {
                        // Get the page reference
                        const pageRef = widget.P;
                        
                        // Find which page index this corresponds to
                        const pageIndex = pages.findIndex(page => {
                            return page.ref && page.ref.objectNumber === pageRef.objectNumber;
                        });
                        
                        if (pageIndex >= 0) {
                            const rect = widget.getRectangle();
                            fieldsByPage[pageIndex].push({
                                name: fieldName,
                                type: fieldType,
                                x: rect.x,
                                y: rect.y,
                                width: rect.width,
                                height: rect.height
                            });
                        }
                    } catch (e) {
                        console.log(`Could not process widget for field ${fieldName}: ${e.message}`);
                    }
                });
            } catch (e) {
                console.log(`Could not process field: ${e.message}`);
            }
        });
        
        // Print results
        for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
            console.log(`=== PAGE ${pageIndex} FIELDS ===`);
            const pageFields = fieldsByPage[pageIndex];
            
            if (pageFields.length === 0) {
                console.log('  No fields on this page\n');
            } else {
                pageFields.forEach(field => {
                    console.log(`  - ${field.name} (${field.type})`);
                    console.log(`    Position: x=${field.x.toFixed(2)}, y=${field.y.toFixed(2)}`);
                    console.log(`    Size: w=${field.width.toFixed(2)}, h=${field.height.toFixed(2)}\n`);
                });
            }
        }
        
        // Specifically show Page 2 (index 2) fields
        console.log('\n=== PAGE 2 SUMMARY (0-indexed) ===');
        const page2Fields = fieldsByPage[2];
        if (page2Fields.length === 0) {
            console.log('No fields found on page 2');
        } else {
            console.log(`Found ${page2Fields.length} fields on page 2:`);
            page2Fields.forEach(field => {
                console.log(`  - ${field.name} (${field.type})`);
            });
        }
        
    } catch (error) {
        console.error('Error processing PDF:', error);
    }
}

getFieldsByPage();
