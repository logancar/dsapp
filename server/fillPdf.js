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
            vin: "vin",

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

            // Signature
            signature: "signature1"
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
                x: 135,
                y: 607,
                width: 200,
                height: 50,
                page: 0
            }
        ],
        rental: [
            {
                field: "signaturePage1",
                x: 50,    // Far left
                y: 650,   // Very low on page
                width: 200,
                height: 50,
                page: 0
            },
            {
                field: "signaturePage2",
                x: 50,    // Far left
                y: 650,   // Very low on page
                width: 200,
                height: 50,
                page: 1
            },
            {
                field: "signaturePage3",
                x: 50,    // Far left
                y: 650,   // Very low on page
                width: 200,
                height: 50,
                page: 2
            }
        ],
        dropoff: [
            {
                field: "signature",
                x: 100,
                y: 150,
                width: 200,
                height: 50,
                page: 0
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

    // Fill form fields
    console.log('Starting to fill form fields...');
    for (const key in formData) {
        if (key === 'signature1' || key === 'signature2' || key === 'signature' ||
            key === 'signaturePage1' || key === 'signaturePage2' || key === 'signaturePage3') {
            console.log(`Processing signature field ${key} for form type:`, pdfType);
            const signatureImage = await handleSignatureImage(pdfDoc, formData[key]);
            console.log('Signature image created');

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

    // Get page dimensions
    const { width: pageWidth, height: pageHeight } = targetPage.getSize();
    console.log(`Page dimensions: width=${pageWidth}, height=${pageHeight}`);

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
    let yPos = pageHeight - position.y - position.height;

    console.log(`Calculated signature position: (${xPos}, ${yPos}) from original (${position.x}, ${position.y})`);
    console.log(`Page height: ${pageHeight}, Signature height: ${position.height}`);
    console.log(`Formula: yPos = pageHeight(${pageHeight}) - position.y(${position.y}) - position.height(${position.height}) = ${yPos}`);

    targetPage.drawImage(signatureImage, {
        x: xPos,
        y: yPos,
        width: position.width,
        height: position.height
    });

    console.log(`Signature drawn on page ${position.page} at position (${xPos}, ${yPos})`);
}

module.exports = { fillPdf };
