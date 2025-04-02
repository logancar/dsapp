const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

function getInitials(fullName) {
    return fullName
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .join('');
}

async function fillPdf(pdfType, formData, outputPath) {
    const pdfPaths = {
        rental: path.join(__dirname, "..", "public", "pdfs", "Rental.pdf"),
        pickup: path.join(__dirname, "..", "public", "pdfs", "Pickup.pdf"),
        dropoff: path.join(__dirname, "..", "public", "pdfs", "Dropoff.pdf"),
    };

    if (!pdfPaths[pdfType]) throw new Error("Invalid PDF type");

    const pdfBytes = fs.readFileSync(pdfPaths[pdfType]);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const form = pdfDoc.getForm();
    
    // Log all available form fields
    const formFields = form.getFields();
    console.log('Available PDF form fields:');
    formFields.forEach(field => {
        console.log(field.getName());
    });

    // Updated field mappings with actual PDF field names
    const fieldMappings = {
        pickup: {
            customerName: "Customer_Name",
            rentalAcknowledgement: "Rental_Initials_es_:signer:initials",
            reviewAcknowledgement: "Review_Initials_es_:signer:initials",
            date: "Date"
            // Remove signature field mapping since we're drawing it directly
        },
        rental: {
            customerName: "Customer_Name",
            customerPhone: "Customer_Phone",
            customerEmail: "Customer_Email",
            customerAddress: "Customer_Address",
            customerCity: "Customer_City",
            customerState: "Customer_State",
            customerZip: "Customer_Zip",
            cardHolderName: "Cardholder_Name",
            cardType: "Card_Type",
            cardHolderAddress: "Billing_Address",
            cardHolderCity: "Billing_City",
            cardHolderState: "Billing_State",
            cardHolderZip: "Billing_Zip",
            insuranceCompany: "Insurance_Company",
            claimNumber: "Claim_Number",
            dateOfLoss: "Date_of_Loss",
            vehicleDescription: "Vehicle_Description",
            vin: "VIN",
            date: "Date",
            // Add any additional PDF field mappings here
        },
        dropoff: {
            customerName: "Customer_Name",
            date: "Date"
        }
    };

    const mappedFields = fieldMappings[pdfType];

    // Add current date
    const currentDate = new Date().toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    });

    // Add signature positions for each form type
    const signaturePositions = {
        pickup: {
            x: 300,
            y: 200,
            width: 200,
            height: 50,
            page: 0  // First page
        },
        rental: {
            x: 300,
            y: 200,
            width: 200,
            height: 50,
            page: 0  // First page
        },
        dropoff: {
            x: 300,
            y: 200,
            width: 200,
            height: 50,
            page: 0  // First page
        }
    };

    // Fill form fields
    for (const key in formData) {
        if (key === 'signature') {
            console.log('Processing signature for form type:', pdfType);
            const signatureImage = await handleSignatureImage(pdfDoc, formData[key]);
            console.log('Signature image created');
            
            // Get the correct position for this form type
            const position = signaturePositions[pdfType];
            if (!position) {
                console.error('No signature position defined for form type:', pdfType);
                throw new Error(`Signature position not defined for form type: ${pdfType}`);
            }
            
            await addSignatureToPdf(pdfDoc, signatureImage, position);
            console.log('Signature added to PDF at position:', position);
        } else if (mappedFields[key]) {
            try {
                const field = form.getTextField(mappedFields[key]);
                if (field) {
                    if (key.includes('Acknowledgement')) {
                        // Handle initials
                        if (formData[key] && formData.customerName) {
                            field.setText(getInitials(formData.customerName));
                        }
                    } else {
                        // Handle regular text fields
                        field.setText(formData[key].toString());
                    }
                }
            } catch (error) {
                console.log(`Error filling field ${key}:`, error.message);
                // Continue with other fields even if one fails
            }
        }
    }

    // Add date if the field exists
    if (mappedFields.date) {
        try {
            const dateField = form.getTextField(mappedFields.date);
            if (dateField) {
                dateField.setText(currentDate);
            }
        } catch (error) {
            console.log('Error filling date field:', error.message);
        }
    }

    const filledPdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, filledPdfBytes);
}

async function handleSignatureImage(pdfDoc, signatureDataUrl) {
    // Convert data URL to image bytes
    const signatureData = signatureDataUrl.split(',')[1];
    const signatureBytes = Buffer.from(signatureData, 'base64');
    
    // Embed the image into the PDF
    const signatureImage = await pdfDoc.embedPng(signatureBytes);
    return signatureImage;
}

async function addSignatureToPdf(pdfDoc, signatureImage, position) {
    if (!position || typeof position.page !== 'number') {
        console.error('Invalid position object:', position);
        throw new Error('Invalid signature position configuration');
    }

    const pages = pdfDoc.getPages();
    if (position.page >= pages.length) {
        console.error(`Page ${position.page} does not exist in PDF`);
        throw new Error(`Invalid page number: ${position.page}`);
    }

    const targetPage = pages[position.page];
    
    targetPage.drawImage(signatureImage, {
        x: position.x,
        y: position.y,
        width: position.width,
        height: position.height
    });
}

module.exports = { fillPdf };
