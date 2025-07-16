const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
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
        dropoff: path.join(__dirname, "..", "public", "pdfs", "DropoffForm.pdf"),
    };

    // Log the PDF paths for debugging
    console.log('PDF Paths:');
    for (const [type, path] of Object.entries(pdfPaths)) {
        console.log(`- ${type}: ${path} (exists: ${fs.existsSync(path)})`);
    }

    if (!pdfPaths[pdfType]) throw new Error("Invalid PDF type");

    const pdfBytes = fs.readFileSync(pdfPaths[pdfType]);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const form = pdfDoc.getForm();

    // Log all available form fields
    const formFields = form.getFields();
    console.log('Available PDF form fields:');
    formFields.forEach(field => {
        const fieldName = field.getName();
        console.log(`Field: ${fieldName} (Type: ${field.constructor.name})`);

        // Try to get more info about text fields
        if (field.constructor.name === 'PDFTextField') {
            try {
                const textField = form.getTextField(fieldName);
                console.log(`  - Text field: ${fieldName}, Current value: "${textField.getText()}"`);

                // Try to get field position and dimensions
                try {
                    const widget = textField.acroField.getWidgets()[0];
                    if (widget) {
                        const rect = widget.getRectangle();
                        console.log(`  - Position: x=${rect.x}, y=${rect.y}, width=${rect.width}, height=${rect.height}`);
                    }
                } catch (posError) {
                    console.log(`  - Could not get field position: ${posError.message}`);
                }
            } catch (e) {
                console.log(`  - Error getting text field info: ${e.message}`);
            }
        }

        // Try to get info about signature fields
        if (fieldName.toLowerCase().includes('signature')) {
            console.log(`  - Found potential signature field: ${fieldName}`);
        }
    });

    // Updated field mappings with actual PDF field names
    const fieldMappings = {
        pickup: {
            // Completion section
            customerName: "Customer_Name",

            // Acknowledgments with initials
            rentalInitials: "Rental_Initials_es_:signer:initials",
            reviewsInitials: "Review_Initials_es_:signer:initials",

            // Date
            date: "Date"
            // Signature field is handled separately
            // Note: Parts Owed doesn't have a field in the PDF
        },
        rental: {
            // Customer Information (Page 1)
            customerName: "customerName",
            customerPhone: "customerPhone",
            customerEmail: "customerEmail",
            customerAddress: "customerAddress", // Try multiple possible field names for address
            address: "customerAddress", // Alternative mapping

            // Card Holder Information (Page 1)
            cardHolderName: "cardholderName",
            cardHolderAddress: "cardholderStreet",
            cardHolderPhone: "cardholderPhone",
            cardHolderEmail: "cardholderEmail",

            // Card Information (Page 1)
            cardNumber: "cardNumber",
            expirationDate: "expDate",
            cvc: "cvc",

            // Card type checkboxes
            visaCard: "visa",
            amexCard: "americanExpress",
            masterCard: "masterCard",
            discoverCard: "discoverCard",

            // Acknowledgements (Page 2)
            acknowledgement1: "ack1",
            acknowledgement2: "ack2",
            acknowledgement3: "ack3",
            acknowledgement4: "ack4",
            acknowledgement5: "ack5",
            acknowledgement6: "ack6",

            // Insurance Information (Page 3)
            insuranceCompany: "insuranceCompany",
            claimNumber: "claimNumber",
            dateOfLoss: "dateofLoss",
            vehicleOwnerPrintedName: "vehicleOwner",

            // Signatures and Dates
            signaturePage1: "signature1",
            signaturePage2: "signature2",
            signaturePage3: "signature3",
            datePage1: "todayDate1",
            datePage2: "todayDate2",
            datePage3: "todayDate3",
        },
        dropoff: {
            // New fields
            howDidhear: "howDidhear",
            referralAddress: "referralAddress",
            referralPhone: "referralPhone",
            referralEmail: "referralEmail",
            dropDate: "dropDate",
            location: "location",
            estimator: "estimator",

            // Personal Information
            name: "customerName",
            phone: "customerPhone",
            altPhone: "altPhone",
            address: "address",
            city: "city",
            state: "state",
            zip: "zip",
            email: "customerEmail",

            // Vehicle Information
            vehicleDescription: "vehicleDescription",
            vin: "vin", // VIN field on page 2
            vin2: "vin2", // VIN field on page 3

            // Insurance Information
            insuranceCompany: "insuranceCo",
            claimNumber: "claimNumber",
            dateOfLoss: "dol",
            insuredName: "insuredName",
            provider: "provider",
            deductible: "deductible",

            // Repair Authorization
            repairPermission: "auth1",
            additionalRepairs: "auth2",
            payment: "auth3",
            totalLoss: "auth4",
            failureToPay: "auth5",
            reviews: "auth6",

            // Referral Sources
            "referralSources.google": "google",
            "referralSources.waze": "waze",
            "referralSources.mailer": "mailer",
            "referralSources.tvCommercial": "tv",
            "referralSources.radioCommercial": "radio",
            "referralSources.doorHanger": "hanger",
            "referralSources.textMessage": "sms",
            "referralSources.referral": "ref",
            "referralSources.internet": "internet",
            "referralSources.facebook": "facebook",
            "referralSources.instagram": "instagram",
            "referralSources.youtube": "youtube",
            "referralSources.hulu": "hulu",
            "referralSources.fireStick": "fire",
            "referralSources.prime": "prime",
            "referralSources.pandora": "pandora",
            "referralSources.billboard": "billboard",
            "referralSources.outsideSales": "sales",

            // Insurance Questions
            hasEstimate: "estimateDone",
            hasReceivedCheck: "check",

            // Signatures
            signature: "signature1",
            signature2: "signature2"
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
                field: "signature",
                x: 153,  // Moved left by 50% from center (306/2)
                y: 150,  // Adjusted to be in the signature line area
                width: 200,
                height: 50,
                page: 0,
                pdfField: null  // No existing signature field in the PDF
            }
        ],
        rental: [
            {
                field: "signaturePage1",
                x: 71.3123,  // Use exact coordinates from the actual signature1 field
                y: 104.161,  // Use exact coordinates from the actual signature1 field
                width: 215.4667,
                height: 22.063,
                page: 0,
                pdfField: "signature1"  // Use the existing signature1 field in the PDF
            },
            {
                field: "signaturePage2",
                x: 77.7421,  // Use exact coordinates from the actual signature2 field
                y: 154.43,   // Use exact coordinates from the actual signature2 field
                width: 227.2369,
                height: 32,
                page: 1,
                pdfField: "signature2"  // Use the existing signature2 field in the PDF
            },
            {
                field: "signaturePage3",
                x: 61.3753,  // Use exact coordinates from the actual signature3 field
                y: 335.049,  // Use exact coordinates from the actual signature3 field
                width: 314.8367,
                height: 32,
                page: 2,
                pdfField: "signature3"  // Use the existing signature3 field in the PDF
            }
        ],
        dropoff: [
            {
                field: "signature",
                x: 63.4912,  // Use exact coordinates from the actual signature1 field
                y: 457.798,  // Increased by 65 pixels total (20 + 45) to move signature up
                width: 150,
                height: 32,
                page: 1,  // Second page (0-indexed as page 1)
                pdfField: "signature1"  // Use the existing signature1 field in the PDF
            },
            {
                field: "signature2",  // Match the key to the field name in the PDF
                x: 104.728,  // Use exact coordinates from the actual signature2 field
                y: 28.8695,  // Use exact coordinates from the actual signature2 field
                width: 150,
                height: 32,
                page: 3,  // Last page (0-indexed as page 3)
                pdfField: "signature2"  // Use the existing signature2 field in the PDF
            }
        ]
    };

    // Add debug logging
    console.log('PDF Type:', pdfType);
    console.log('Signature Position:', signaturePositions[pdfType]);
    console.log('Form field mappings:', mappedFields);
    console.log('Form data keys:', Object.keys(formData));

    // Log nested referralSources if present
    if (formData.referralSources) {
        console.log('Referral sources keys:', Object.keys(formData.referralSources));
    }

    // Validate required fields for rental form
    if (pdfType === 'rental') {
        const requiredFields = [
            // Page 1
            'customerName', 'customerPhone', 'customerEmail',
            // Card holder fields are now optional
            'cardType', 'cardNumber', 'expirationDate', 'cvc',
            'signaturePage1',

            // Page 2
            'acknowledgement1', 'acknowledgement2', 'acknowledgement3',
            'acknowledgement4', 'acknowledgement5', 'acknowledgement6',
            'signaturePage2',

            // Page 3
            'insuranceCompany', 'claimNumber', 'dateOfLoss',
            'signaturePage3'
        ];

        const missingFields = requiredFields.filter(field => !formData[field]);
        if (missingFields.length > 0) {
            console.warn('Missing required fields:', missingFields);
            // Continue anyway but log the warning
        }
    }

    // Log the output path
    console.log('Output path:', outputPath);

    // Log all form fields in the PDF
    console.log('All PDF form fields:');
    formFields.forEach(field => {
        try {
            const fieldName = field.getName();
            const fieldType = field.constructor.name;
            console.log(`- ${fieldName} (${fieldType})`);

            // For text fields, try to get the current value
            if (fieldType === 'PDFTextField') {
                try {
                    const textField = form.getTextField(fieldName);
                    console.log(`  Current value: "${textField.getText()}"`);
                } catch (e) {
                    console.log(`  Error getting text value: ${e.message}`);
                }
            }
        } catch (e) {
            console.log(`Error processing field: ${e.message}`);
        }
    });

    // Special handling for customer address in rental form
    if (pdfType === 'rental' && formData.customerAddress) {
        console.log('Attempting to directly set customer address:', formData.customerAddress);
        // Try multiple possible field names for customer address
        const addressFieldNames = [
            'customerAddress', 'CustomerAddress', 'address', 'Address',
            'addr', 'Addr', 'street', 'Street', 'streetAddress', 'StreetAddress'
        ];

        let addressFieldFound = false;
        for (const fieldName of addressFieldNames) {
            try {
                const textField = form.getTextField(fieldName);
                if (textField) {
                    textField.setText(formData.customerAddress);
                    console.log(`Successfully set address field ${fieldName} to "${formData.customerAddress}"`);
                    addressFieldFound = true;
                    break;
                }
            } catch (e) {
                console.log(`Could not set address field ${fieldName}: ${e.message}`);
            }
        }

        if (!addressFieldFound) {
            console.log('Could not find any address field in the PDF');
        }
    }

    // Special handling for address in dropoff form
    if (pdfType === 'dropoff' && formData.address) {
        console.log('Attempting to directly set address in dropoff form:', formData.address);
        // Try multiple possible field names for address
        const addressFieldNames = [
            'address', 'Address', 'customerAddress', 'CustomerAddress',
            'addr', 'Addr', 'street', 'Street', 'streetAddress', 'StreetAddress'
        ];

        let addressFieldFound = false;
        for (const fieldName of addressFieldNames) {
            try {
                const textField = form.getTextField(fieldName);
                if (textField) {
                    textField.setText(formData.address);
                    console.log(`Successfully set address field ${fieldName} to "${formData.address}"`);
                    addressFieldFound = true;
                    break;
                }
            } catch (e) {
                console.log(`Could not set address field ${fieldName}: ${e.message}`);
            }
        }

        if (!addressFieldFound) {
            console.log('Could not find any address field in the PDF for dropoff form');
        }
    }

    // DIRECT APPROACH FOR VIN2 FIELD - SIMPLIFIED
    if (pdfType === 'dropoff' && formData.vin) {
        console.log('DIRECT APPROACH: Setting vin2 field to match vin field');

        // Always set vin2 in formData to match vin
        formData.vin2 = formData.vin;
        console.log('Set formData.vin2 =', formData.vin2);

        // Direct approach - just set the field
        try {
            const vin2Field = form.getTextField('vin2');
            if (vin2Field) {
                vin2Field.setText(formData.vin);
                console.log('Successfully set vin2 field directly');

                // Log the field's properties for debugging
                try {
                    const widget = vin2Field.acroField.getWidgets()[0];
                    if (widget) {
                        const rect = widget.getRectangle();
                        console.log(`vin2 field position: x=${rect.x}, y=${rect.y}, width=${rect.width}, height=${rect.height}`);
                    }
                } catch (posError) {
                    console.log(`Could not get vin2 field position: ${posError.message}`);
                }
            } else {
                console.log('Could not find vin2 field directly - this should not happen as we verified it exists');
            }
        } catch (e) {
            console.error('Error setting vin2 field directly:', e.message);
        }
    }

    // Fill form fields
    console.log('Starting to fill form fields...');
    console.log('Form data keys:', Object.keys(formData));

    // For dropoff form, duplicate the signature to signature2 field for the last page
    if (pdfType === 'dropoff' && formData.signature) {
        console.log('Duplicating signature to signature2 for last page');
        formData.signature2 = formData.signature;
        console.log('Signature duplicated. Keys available:', Object.keys(formData).filter(k => k.includes('signature')));
    }

    // Make absolutely sure vin2 is set in formData
    if (pdfType === 'dropoff' && formData.vin) {
        formData.vin2 = formData.vin;
        console.log('Ensuring vin2 is set in formData for the main form filling loop:', formData.vin2);

        // Double-check that we can access the vin2 field
        try {
            const vin2Field = form.getTextField('vin2');
            if (vin2Field) {
                console.log('vin2 field exists and is accessible in the form');
            } else {
                console.log('WARNING: vin2 field does not exist in the form - this should not happen');
            }
        } catch (e) {
            console.error('Error accessing vin2 field:', e.message);
        }
    }

    // Handle the new fields for dropoff form
    if (pdfType === 'dropoff') {
        // Set dropDate to today's date if not provided
        if (!formData.dropDate) {
            formData.dropDate = currentDate;
            console.log('Setting dropDate to current date:', formData.dropDate);
        }

        // Verify the new fields exist in the PDF
        const newFields = ['howDidhear', 'referralAddress', 'referralPhone', 'referralEmail', 'dropDate', 'location', 'estimator'];

        for (const fieldName of newFields) {
            try {
                const field = form.getTextField(fieldName);
                if (field) {
                    console.log(`Field ${fieldName} exists in the PDF`);

                    // Make sure the field has a value in formData
                    if (!formData[fieldName] && fieldName !== 'dropDate') { // dropDate is handled separately
                        formData[fieldName] = fieldName === 'howDidhear' ? 'Not specified' : '';
                        console.log(`Set default value for ${fieldName}:`, formData[fieldName]);
                    }
                } else {
                    console.log(`WARNING: Field ${fieldName} does not exist in the PDF`);
                }
            } catch (e) {
                console.error(`Error accessing ${fieldName} field:`, e.message);
            }
        }
    }

    for (const key in formData) {
        if (key === 'signature1' || key === 'signature2' || key === 'signature' ||
            key === 'signaturePage1' || key === 'signaturePage2' || key === 'signaturePage3') {
            console.log(`Processing signature field ${key} for form type:`, pdfType);
            console.log(`Signature data length: ${formData[key]?.length || 0} characters`);
            const signatureImage = await handleSignatureImage(pdfDoc, formData[key]);
            console.log(`Signature image created for ${key}`);

            // First, try to find any existing signature fields in the PDF
            let existingSignatureField = null;
            let signatureFieldName = null;

            // Map the signature keys to potential field names in the PDF
            const potentialFieldNames = [];
            if (key === 'signaturePage1' || key === 'signature1') {
                potentialFieldNames.push('signature1', 'Signature1', 'signature', 'Signature', 'sig1', 'Sig1');
            } else if (key === 'signaturePage2' || key === 'signature2') {
                potentialFieldNames.push('signature2', 'Signature2', 'sig2', 'Sig2');
            } else if (key === 'signaturePage3' || key === 'signature3') {
                potentialFieldNames.push('signature3', 'Signature3', 'sig3', 'Sig3');
            }

            // Try to find any of these fields
            for (const fieldName of potentialFieldNames) {
                try {
                    const field = form.getField(fieldName);
                    if (field) {
                        existingSignatureField = field;
                        signatureFieldName = fieldName;
                        console.log(`Found existing signature field: ${fieldName}`);
                        break;
                    }
                } catch (e) {
                    // Field not found, continue to next one
                }
            }

            // If we found an existing signature field, try to get its position
            if (existingSignatureField) {
                try {
                    const widget = existingSignatureField.acroField.getWidgets()[0];
                    if (widget) {
                        const rect = widget.getRectangle();
                        console.log(`Using existing signature field position: x=${rect.x}, y=${rect.y}, width=${rect.width}, height=${rect.height}`);

                        // Use the existing field's position
                        await addSignatureToPdf(pdfDoc, signatureImage, {
                            x: rect.x,
                            y: rect.y,
                            width: rect.width,
                            height: rect.height,
                            page: widget.P.objectNumber
                        });
                        console.log(`Signature ${key} added to PDF at existing field position`);
                        continue; // Skip to next field
                    }
                } catch (e) {
                    console.log(`Could not use existing signature field: ${e.message}`);
                    // Fall back to manual positioning
                }
            }

            // Fall back to manual positioning
            // Get the correct positions for this form type
            const positions = signaturePositions[pdfType];
            if (!positions || !Array.isArray(positions)) {
                console.error('No signature positions defined for form type:', pdfType);
                throw new Error(`Signature positions not defined for form type: ${pdfType}`);
            }

            // Find the position for this specific signature field
            let position;
            if (pdfType === 'rental') {
                // For rental form, map the signature fields to the correct positions
                if (key === 'signaturePage1') {
                    position = positions[0];
                } else if (key === 'signaturePage2') {
                    position = positions[1];
                } else if (key === 'signaturePage3') {
                    position = positions[2];
                }
            } else {
                // For other forms, use the field name directly
                position = positions.find(pos => pos.field === key);
            }

            if (!position) {
                console.error(`No position defined for signature field: ${key}`);
                continue; // Skip this signature field
            }

            // If the position has a pdfField property, try to use the existing PDF field
            if (position.pdfField) {
                try {
                    console.log(`Trying to use existing PDF signature field: ${position.pdfField}`);
                    const signatureField = form.getSignature(position.pdfField);

                    if (signatureField) {
                        console.log(`Found existing signature field: ${position.pdfField}`);
                        // We can't directly set the signature image to the field,
                        // so we'll still use our manual positioning but with the field's coordinates

                        try {
                            const widget = signatureField.acroField.getWidgets()[0];
                            if (widget) {
                                const rect = widget.getRectangle();
                                console.log(`Using existing signature field position: x=${rect.x}, y=${rect.y}, width=${rect.width}, height=${rect.height}, page=${widget.P.objectNumber}`);

                                // Use the existing field's position but keep our manual page number
                                const updatedPosition = {
                                    ...position,
                                    x: rect.x,
                                    y: rect.y,
                                    width: rect.width,
                                    height: rect.height
                                };

                                await addSignatureToPdf(pdfDoc, signatureImage, updatedPosition);
                                console.log(`Signature ${key} added to PDF using existing field position`);
                                continue;
                            }
                        } catch (e) {
                            console.log(`Could not get widget for signature field: ${e.message}`);
                        }
                    }
                } catch (e) {
                    console.log(`Could not use existing signature field: ${e.message}`);
                }
            }

            console.log(`Using manual position for ${key}:`, JSON.stringify(position));
            await addSignatureToPdf(pdfDoc, signatureImage, position);
            console.log(`Signature ${key} added to PDF using manual position`);
        } else if (mappedFields[key]) {
            try {
                // Special handling for credit card type
                if (key === 'cardType') {
                    try {
                        console.log(`Processing card type: ${formData[key]}`);
                        // Check the appropriate checkbox based on the card type
                        const cardType = formData[key];

                        // Try to check all checkboxes first to see which ones exist
                        try {
                            const checkboxFields = [
                                // Primary field names
                                'Visa_Checkbox', 'Amex_Checkbox', 'MC_Checkbox', 'Discover_Checkbox',
                                // Alternative field names
                                'Visa', 'Amex', 'MasterCard', 'Discover'
                            ];

                            for (const checkboxName of checkboxFields) {
                                try {
                                    const checkbox = form.getCheckBox(checkboxName);
                                    if (checkbox) {
                                        console.log(`Found checkbox: ${checkboxName}`);
                                    }
                                } catch (e) {
                                    console.log(`Checkbox ${checkboxName} not found`);
                                }
                            }

                            // Also try to find all text fields that might be related to card type
                            const textFields = [
                                'Other_Card_Type', 'Other_Type', 'CardType', 'Card_Type'
                            ];

                            for (const fieldName of textFields) {
                                try {
                                    const textField = form.getTextField(fieldName);
                                    if (textField) {
                                        console.log(`Found text field: ${fieldName}`);
                                    }
                                } catch (e) {
                                    console.log(`Text field ${fieldName} not found`);
                                }
                            }
                        } catch (e) {
                            console.log('Error checking available checkboxes:', e.message);
                        }

                        // Now try to check the appropriate one
                        // Function to try checking a checkbox with multiple possible field names
                        const tryCheckCheckbox = async (possibleFieldNames) => {
                            for (const fieldName of possibleFieldNames) {
                                try {
                                    const checkbox = form.getCheckBox(fieldName);
                                    if (checkbox) {
                                        checkbox.check();
                                        console.log(`Successfully checked ${fieldName} checkbox`);
                                        return true;
                                    }
                                } catch (e) {
                                    console.log(`Could not check ${fieldName}: ${e.message}`);
                                }
                            }
                            return false;
                        };

                        // Function to try setting a text field with multiple possible field names
                        const trySetTextField = async (possibleFieldNames, value) => {
                            for (const fieldName of possibleFieldNames) {
                                try {
                                    const textField = form.getTextField(fieldName);
                                    if (textField) {
                                        textField.setText(value);
                                        console.log(`Successfully set ${fieldName} to "${value}"`);
                                        return true;
                                    }
                                } catch (e) {
                                    console.log(`Could not set ${fieldName}: ${e.message}`);
                                }
                            }
                            return false;
                        };

                        if (cardType === 'Visa') {
                            await tryCheckCheckbox(['Visa_Checkbox', 'Visa']);
                        } else if (cardType === 'American Express') {
                            await tryCheckCheckbox(['Amex_Checkbox', 'Amex']);
                        } else if (cardType === 'Master Card') {
                            await tryCheckCheckbox(['MC_Checkbox', 'MasterCard']);
                        } else if (cardType === 'Discover Card') {
                            await tryCheckCheckbox(['Discover_Checkbox', 'Discover']);
                        } else {
                            // For other card types, try to write to a text field
                            const success = await trySetTextField(['Other_Card_Type', 'Other_Type', 'CardType', 'Card_Type'], cardType);

                            // If we couldn't find a specific field, try to set a generic card type field
                            if (!success) {
                                await trySetTextField(['CardType', 'Card_Type'], cardType);
                            }
                        }

                        // Also try to set a generic card type field with the value
                        await trySetTextField(['CardType', 'Card_Type'], cardType);
                    } catch (cardTypeError) {
                        console.log(`Error setting card type:`, cardTypeError.message);
                    }
                }
                // Special handling for acknowledgements in rental form
                else if (pdfType === 'rental' && key.startsWith('acknowledgement')) {
                    try {
                        console.log(`Processing acknowledgement field ${key} with value ${formData[key]}`);

                        // Try multiple possible field names for this acknowledgement
                        const possibleFieldNames = [
                            mappedFields[key],                    // Primary mapping
                            `Acknowledgement${key.slice(-1)}`,    // Acknowledgement1, Acknowledgement2, etc.
                            `Ack${key.slice(-1)}`,               // Ack1, Ack2, etc.
                            `Checkbox${key.slice(-1)}`            // Checkbox1, Checkbox2, etc.
                        ];

                        console.log(`Trying field names for ${key}:`, possibleFieldNames);

                        let checkboxFound = false;

                        // Try each possible field name as a checkbox
                        for (const fieldName of possibleFieldNames) {
                            if (!fieldName) continue; // Skip undefined field names

                            try {
                                const checkboxField = form.getCheckBox(fieldName);
                                if (checkboxField) {
                                    // Force check all acknowledgements for rental form
                                    checkboxField.check();
                                    console.log(`Successfully checked ${fieldName} checkbox for ${key}`);
                                    checkboxFound = true;
                                    break;
                                }
                            } catch (e) {
                                console.log(`Could not check ${fieldName} for ${key}: ${e.message}`);
                            }
                        }

                        // If no checkbox was found, try as text fields
                        if (!checkboxFound) {
                            console.log(`No checkbox found for ${key}, trying as text field`);

                            for (const fieldName of possibleFieldNames) {
                                if (!fieldName) continue; // Skip undefined field names

                                try {
                                    const textField = form.getTextField(fieldName);
                                    if (textField) {
                                        textField.setText('Yes');
                                        console.log(`Set text field ${fieldName} for ${key} to 'Yes'`);
                                        break;
                                    }
                                } catch (e) {
                                    console.log(`Could not set text field ${fieldName} for ${key}: ${e.message}`);
                                }
                            }
                        }
                    } catch (ackError) {
                        console.log(`Error processing acknowledgement ${key}:`, ackError.message);
                    }
                }
                // For other checkbox fields
                else if (typeof formData[key] === 'boolean') {
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
                // Special handling for vin2 field
                else if (key === 'vin2' && pdfType === 'dropoff') {
                    console.log('Special handling for vin2 field in main loop');
                    try {
                        // Direct approach - just set the field
                        const textField = form.getTextField('vin2');
                        if (textField) {
                            textField.setText(formData[key]);
                            console.log('Successfully set vin2 field in main loop');
                        } else {
                            console.log('Could not find vin2 field in main loop - this should not happen');
                        }
                    } catch (e) {
                        console.log('Error setting vin2 field in main loop:', e.message);
                    }
                }
                // Special handling for new fields
                else if (['howDidhear', 'referralAddress', 'referralPhone', 'referralEmail', 'dropDate', 'location', 'estimator'].includes(key) && pdfType === 'dropoff') {
                    console.log(`Special handling for ${key} field in main loop`);
                    try {
                        // Direct approach - just set the field
                        const textField = form.getTextField(key);
                        if (textField) {
                            textField.setText(formData[key] || '');
                            console.log(`Successfully set ${key} field in main loop to "${formData[key]}"`);
                        } else {
                            console.log(`Could not find ${key} field in main loop - this should not happen`);
                        }
                    } catch (e) {
                        console.log(`Error setting ${key} field in main loop:`, e.message);
                    }
                }
                // For regular text fields
                else {
                    const primaryFieldName = mappedFields[key];
                    console.log(`Filling text field: ${key} with value: "${formData[key]}"`);

                    // Try multiple possible field names for this field
                    let possibleFieldNames = [
                        primaryFieldName,                      // Primary mapping
                        key,                                   // The key itself
                        key.charAt(0).toUpperCase() + key.slice(1), // Capitalized key
                        key.toUpperCase(),                     // Uppercase key
                        key.toLowerCase()                      // Lowercase key
                    ];

                    // Special handling for address fields
                    if (key === 'customerAddress' || key === 'address') {
                        possibleFieldNames = [
                            ...possibleFieldNames,
                            'customerAddress',
                            'CustomerAddress',
                            'CUSTOMERADDRESS',
                            'address',
                            'Address',
                            'ADDRESS',
                            'customer_address',
                            'customer-address',
                            'addr',
                            'Addr',
                            'ADDR',
                            'street',
                            'Street',
                            'STREET',
                            'streetAddress',
                            'StreetAddress',
                            'STREETADDRESS'
                        ];
                    }

                    // Filter out undefined or empty field names
                    const validFieldNames = possibleFieldNames.filter(name => name);

                    console.log(`Trying field names for ${key}:`, validFieldNames);

                    let fieldFound = false;

                    // Try each possible field name
                    for (const fieldName of validFieldNames) {
                        try {
                            const textField = form.getTextField(fieldName);
                            if (textField) {
                                textField.setText(formData[key].toString());
                                console.log(`Successfully set ${fieldName} to "${formData[key]}"`);
                                fieldFound = true;
                                break;
                            }
                        } catch (e) {
                            console.log(`Could not set ${fieldName}: ${e.message}`);
                        }
                    }

                    if (!fieldFound) {
                        console.log(`No text field found for ${key} with any of the tried names`);
                    }
                }
            } catch (error) {
                console.log(`Error filling field ${key}:`, error.message);
                // Continue with other fields even if one fails
            }
        } else if (key === 'referralSources' && typeof formData[key] === 'object') {
            // Handle nested referralSources object
            for (const referralKey in formData[key]) {
                const fullKey = `referralSources.${referralKey}`;
                if (mappedFields[fullKey]) {
                    try {
                        const value = formData[key][referralKey];
                        if (typeof value === 'boolean') {
                            try {
                                const checkboxField = form.getCheckBox(mappedFields[fullKey]);
                                if (checkboxField) {
                                    if (value) {
                                        checkboxField.check();
                                    } else {
                                        checkboxField.uncheck();
                                    }
                                }
                            } catch (checkboxError) {
                                console.log(`Field ${fullKey} is not a checkbox:`, checkboxError.message);
                                // Try as a text field instead
                                const textField = form.getTextField(mappedFields[fullKey]);
                                if (textField) {
                                    textField.setText(value.toString());
                                }
                            }
                        } else if (value !== null && value !== undefined) {
                            const textField = form.getTextField(mappedFields[fullKey]);
                            if (textField) {
                                textField.setText(value.toString());
                            }
                        }
                    } catch (error) {
                        console.log(`Error filling referral field ${fullKey}:`, error.message);
                        // Continue with other fields even if one fails
                    }
                }
            }
        }
    }

    // Add date fields for rental form
    if (pdfType === 'rental') {
        try {
            // Add dates to all three pages
            const dateFields = [
                { key: 'datePage1', page: 1, alternateNames: ['Date_Page1', 'Date1', 'Date_1', 'Date'] },
                { key: 'datePage2', page: 2, alternateNames: ['Date_Page2', 'Date2', 'Date_2'] },
                { key: 'datePage3', page: 3, alternateNames: ['Date_Page3', 'Todays_Date_Page3', 'Date3', 'Date_3'] }
            ];

            for (const dateField of dateFields) {
                console.log(`Processing date field for page ${dateField.page}`);

                // Try the primary field name first
                const primaryFieldName = mappedFields[dateField.key];

                // Combine all possible field names
                const possibleFieldNames = [
                    primaryFieldName,
                    ...dateField.alternateNames
                ].filter(name => name); // Filter out undefined or empty names

                console.log(`Trying date field names:`, possibleFieldNames);

                let dateFieldFound = false;

                // Try each possible field name
                for (const fieldName of possibleFieldNames) {
                    try {
                        const field = form.getTextField(fieldName);
                        if (field) {
                            field.setText(currentDate);
                            console.log(`Set date field ${fieldName} to ${currentDate}`);
                            dateFieldFound = true;
                            break;
                        }
                    } catch (e) {
                        console.log(`Could not set date field ${fieldName}: ${e.message}`);
                    }
                }

                if (!dateFieldFound) {
                    console.log(`No date field found for page ${dateField.page} with any of the tried names`);
                }
            }
        } catch (error) {
            console.log('Error filling rental date fields:', error.message);
        }
    }
    // Add date for other forms
    else if (mappedFields.date) {
        try {
            const dateField = form.getTextField(mappedFields.date);
            if (dateField) {
                dateField.setText(currentDate);
            }
        } catch (error) {
            console.log('Error filling date field:', error.message);
        }
    }

    // Final check for vin2 field and new fields before flattening
    if (pdfType === 'dropoff') {
        // Check vin2 field
        try {
            const vin2Field = form.getTextField('vin2');
            if (vin2Field) {
                const currentValue = vin2Field.getText();
                console.log(`Final check: vin2 field value before flattening: "${currentValue}"`);

                // If it's empty, try setting it one more time
                if (!currentValue && formData.vin) {
                    vin2Field.setText(formData.vin);
                    console.log(`Final attempt: Set vin2 field to "${formData.vin}"`);
                }
            }
        } catch (e) {
            console.log('Error in final vin2 check:', e.message);
        }

        // Check new fields
        const newFields = ['howDidhear', 'referralAddress', 'referralPhone', 'referralEmail', 'dropDate', 'location', 'estimator'];

        for (const fieldName of newFields) {
            try {
                const field = form.getTextField(fieldName);
                if (field) {
                    const currentValue = field.getText();
                    console.log(`Final check: ${fieldName} field value before flattening: "${currentValue}"`);

                    // If it's empty, try setting it one more time
                    if (!currentValue && formData[fieldName]) {
                        field.setText(formData[fieldName]);
                        console.log(`Final attempt: Set ${fieldName} field to "${formData[fieldName]}"`);
                    }

                    // Special handling for dropDate - always ensure it has today's date
                    if (fieldName === 'dropDate' && !currentValue) {
                        field.setText(currentDate);
                        console.log(`Final attempt: Set dropDate field to today's date: "${currentDate}"`);
                    }
                }
            } catch (e) {
                console.log(`Error in final ${fieldName} check:`, e.message);
            }
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
    if (!signatureDataUrl || typeof signatureDataUrl !== 'string') {
        console.error('Invalid signature data:', typeof signatureDataUrl);
        throw new Error('Invalid signature data provided');
    }

    try {
        // Check if the signature data is a valid data URL
        if (!signatureDataUrl.startsWith('data:image')) {
            console.error('Signature data is not a valid data URL');
            throw new Error('Invalid signature data format');
        }

        // Convert data URL to image bytes
        const signatureData = signatureDataUrl.split(',')[1];
        if (!signatureData) {
            console.error('Could not extract base64 data from signature');
            throw new Error('Invalid signature data format');
        }

        const signatureBytes = Buffer.from(signatureData, 'base64');

        // Embed the image into the PDF
        const signatureImage = await pdfDoc.embedPng(signatureBytes);
        return signatureImage;
    } catch (error) {
        console.error('Error processing signature image:', error);
        throw new Error(`Failed to process signature: ${error.message}`);
    }
}

async function addSignatureToPdf(pdfDoc, signatureImage, position) {
    console.log('=== ADDING SIGNATURE TO PDF ===');
    console.log('Position object:', JSON.stringify(position));

    if (!position || typeof position.page !== 'number') {
        console.error('Invalid position object:', position);
        throw new Error('Invalid signature position configuration');
    }

    const pages = pdfDoc.getPages();
    console.log(`PDF has ${pages.length} pages. Trying to add signature to page ${position.page}`);

    if (position.page >= pages.length) {
        console.error(`Page ${position.page} does not exist in PDF with ${pages.length} pages`);
        throw new Error(`Invalid page number: ${position.page}`);
    }

    const targetPage = pages[position.page];
    console.log(`Successfully got page ${position.page}`);

    // Get page dimensions
    const { width: pageWidth, height: pageHeight } = targetPage.getSize();
    console.log(`Page ${position.page} dimensions: width=${pageWidth}, height=${pageHeight}`);

    // Calculate absolute position (handle negative coordinates)
    // For x: negative means from right edge, positive means from left edge
    // For y: in PDF coordinates, 0 is bottom, pageHeight is top
    let xPos = position.x;
    if (position.x < 0) {
        // Convert negative x to position from right edge
        xPos = pageWidth + position.x;
    }

    // Ensure position is within page bounds
    xPos = Math.max(0, Math.min(xPos, pageWidth - position.width));

    // For y position, we need to adjust based on page height
    // In PDF, y=0 is at the bottom, but we want to position from the top
    let yPos;

    // In PDF coordinates, (0,0) is bottom-left, and y increases upward
    // Our position.y is specified from the bottom of the page
    // So we can use position.y directly without transformation
    yPos = position.y;

    // Special handling for signature2 on the last page of DropoffForm
    if (position.pdfField === 'signature2') {
        console.log(`Using exact coordinates for signature2 field: x=${position.x}, y=${position.y}`);
    } else {
        console.log(`Using direct y-coordinate: ${yPos} (from bottom of page)`);
    }

    console.log(`Calculated signature position: (${xPos}, ${yPos}) from original (${position.x}, ${position.y})`);
    console.log(`Page height: ${pageHeight}, Signature height: ${position.height}`);

    // No conditional needed since we're using the same formula for all pages
    console.log(`Using PDF native coordinates with y-origin at bottom: yPos = ${yPos}`);
    console.log(`Signature will be placed ${yPos} units from the bottom of the page`);

    try {
        targetPage.drawImage(signatureImage, {
            x: xPos,
            y: yPos,
            width: position.width,
            height: position.height
        });
        console.log(`✅ Signature successfully drawn on page ${position.page} at position (${xPos}, ${yPos})`);
    } catch (error) {
        console.error(`❌ Error drawing signature on page ${position.page}:`, error.message);
        throw error;
    }
}

module.exports = { fillPdf };
