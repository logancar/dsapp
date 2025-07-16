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

        // Get fields by page
        console.log('\n=== FIELDS BY PAGE ===');
        for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
            console.log(`\nPage ${pageIndex} fields:`);

            fields.forEach(field => {
                try {
                    const fieldName = field.getName();
                    const fieldType = field.constructor.name;

                    // Try to get the field's widget to determine which page it's on
                    const widgets = field.acroField.getWidgets();

                    widgets.forEach((widget, widgetIndex) => {
                        try {
                            // Get the page reference from the widget
                            const pageRef = widget.P;
                            const pageObj = pdfDoc.context.lookup(pageRef);

                            // Find which page this corresponds to
                            const targetPageIndex = pages.findIndex(page => page.ref === pageRef);

                            if (targetPageIndex === pageIndex) {
                                const rect = widget.getRectangle();
                                console.log(`  - ${fieldName} (${fieldType}) at x:${rect.x.toFixed(2)}, y:${rect.y.toFixed(2)}, w:${rect.width.toFixed(2)}, h:${rect.height.toFixed(2)}`);
                            }
                        } catch (e) {
                            // Skip widgets that can't be processed
                        }
                    });
                } catch (e) {
                    // Skip fields that can't be processed
                }
            });
        }
    } catch (error) {
        console.error('Error listing PDF fields:', error);
    }
}

listPdfFields();
