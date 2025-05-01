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
            // Referral Sources
            google: "google",
            tv: "tv",
            sms: "sms",
            facebook: "facebook",
            hulu: "hulu",
            pandora: "pandora",
            waze: "waze",
            radio: "radio",
            ref: "ref",
            insta: "insta",
            fire: "fire",
            billboard: "billboard",
            mailer: "mailer",
            hanger: "hanger",
            internet: "internet",
            youtube: "youtube",
            prime: "prime",
            sales: "sales",

            // Authorization
            insuranceCo: "insuranceCo",
            vehicleDescription: "vehicleDescription",
            vin: "vin",
            claimNumber: "claimNumber",
            claimNumber2: "claimNumber2",
            dol: "dol",

            // Personal Information
            customerName: "customerName",
            customerPhone: "customerPhone",
            altPhone: "altPhone",
            address: "address",
            city: "city",
            state: "state",
            zip: "zip",
            customerEmail: "customerEmail",

            // Insurance Information
            insured: "insured",
            insuredPhone: "insuredPhone",
            provider: "provider",
            deductible: "deductible",

            // Questions
            estimateDone: "estimateDone",
            check: "check",
            referrer: "referrer",

            // Authorizations
            auth1: "auth1",
            auth2: "auth2",
            auth3: "auth3",
            auth4: "auth4",
            auth5: "auth5",
            auth6: "auth6",

            // Date
            date: "Date"
            // Signature fields (signature1 and signature2) are handled separately
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
        pickup: [
            {
                field: "signature1",
                x: 100,
                y: 150,
                width: 200,
                height: 50,
                page: 0
            },
            {
                field: "signature2",
                x: 100,
                y: 150,
                width: 200,
                height: 50,
                page: 0
            }
        ],
        rental: [
            {
                field: "signature",
                x: 300,
                y: 200,
                width: 200,
                height: 50,
                page: 0
            }
        ],
        dropoff: [
            {
                field: "signature",
                x: 300,
                y: 200,
                width: 200,
                height: 50,
                page: 0
            }
        ]
    };

    // Add debug logging
    console.log('PDF Type:', pdfType);
    console.log('Signature Position:', signaturePositions[pdfType]);

    // Fill form fields
    for (const key in formData) {
        if (key === 'signature1' || key === 'signature2' || key === 'signature') {
            console.log(`Processing ${key} for form type:`, pdfType);
            const signatureImage = await handleSignatureImage(pdfDoc, formData[key]);
            console.log('Signature image created');

            // Get the correct positions for this form type
            const positions = signaturePositions[pdfType];
            if (!positions || !Array.isArray(positions)) {
                console.error('No signature positions defined for form type:', pdfType);
                throw new Error(`Signature positions not defined for form type: ${pdfType}`);
            }

            // Find the position for this specific signature field
            const position = positions.find(pos => pos.field === key);
            if (!position) {
                console.error(`No position defined for signature field: ${key}`);
                continue; // Skip this signature field
            }

            console.log(`Using position for ${key}:`, JSON.stringify(position));
            await addSignatureToPdf(pdfDoc, signatureImage, position);
            console.log(`Signature ${key} added to PDF`);
        } else if (mappedFields[key]) {
            try {
                // For checkbox fields
                if (typeof formData[key] === 'boolean') {
                    try {
                        const checkboxField = form.getCheckBox(mappedFields[key]);
                        if (checkboxField) {
                            if (formData[key]) {
                                checkboxField.check();
                            } else {
                                checkboxField.uncheck();
                            }
                        }
                    } catch (checkboxError) {
                        console.log(`Field ${key} is not a checkbox:`, checkboxError.message);
                        // Try as a text field instead
                        const textField = form.getTextField(mappedFields[key]);
                        if (textField) {
                            textField.setText(formData[key].toString());
                        }
                    }
                }
                // For radio button fields (Yes/No questions)
                else if (key === 'estimateDone' || key === 'check' || key === 'referrer') {
                    try {
                        const radioField = form.getRadioGroup(mappedFields[key]);
                        if (radioField) {
                            radioField.select(formData[key]);
                        }
                    } catch (radioError) {
                        console.log(`Field ${key} is not a radio group:`, radioError.message);
                        // Try as a text field instead
                        const textField = form.getTextField(mappedFields[key]);
                        if (textField) {
                            textField.setText(formData[key].toString());
                        }
                    }
                }
                // For regular text fields
                else {
                    const textField = form.getTextField(mappedFields[key]);
                    if (textField) {
                        textField.setText(formData[key].toString());
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

    // Flatten the form before saving
    form.flatten();
    console.log('Form has been flattened');

    // Save the PDF with flattened form
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

    console.log(`Signature drawn on page ${position.page} at position (${position.x}, ${position.y})`);
}

module.exports = { fillPdf };
