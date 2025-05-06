require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require('path');
const fs = require('fs');
const { fillPdf } = require('./fillPdf'); // Fixed import name
const { createWalkaroundPdf } = require('./createWalkaroundPdf');
const { sendEmail } = require('./emailService');

const app = express();
const PORT = process.env.PORT || 8081; // Changed to 8081 to avoid conflicts

// Enhanced error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

// CORS configuration
const allowedOrigins = [
    'https://dentsourcekiosk.netlify.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174'
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc)
        if (!origin) return callback(null, true);

        // For development, allow all localhost origins
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
            console.log(`CORS allowed for development origin: ${origin}`);
            return callback(null, true);
        }

        if (allowedOrigins.indexOf(origin) === -1) {
            console.log(`CORS blocked for origin: ${origin}`);
            return callback(null, false);
        }

        console.log(`CORS allowed for origin: ${origin}`);
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204
}));

app.use(express.json());

// Middleware logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/', (req, res) => {
    console.log('Health check endpoint hit');
    res.json({ status: 'ok', message: 'Server is running' });
});

// Handle favicon.ico request
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Route to handle form submission
app.post("/submit-form", async (req, res) => {
    console.log('==== FORM SUBMISSION REQUEST RECEIVED ====');
    console.log('Request IP:', req.ip);
    console.log('Request headers:', req.headers);

    try {
        console.log('Parsing request body...');
        const { formData, pdfType, estimatorEmail } = req.body;

        // Log the form data for debugging
        console.log('Form data received:', JSON.stringify(formData, null, 2));
        console.log('PDF type:', pdfType);
        console.log('Estimator email:', estimatorEmail);

        // Validate required fields
        if (!formData || !pdfType || !estimatorEmail) {
            console.error('Missing required fields:', {
                hasFormData: !!formData,
                hasPdfType: !!pdfType,
                hasEstimatorEmail: !!estimatorEmail
            });
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
                details: {
                    hasFormData: !!formData,
                    hasPdfType: !!pdfType,
                    hasEstimatorEmail: !!estimatorEmail
                }
            });
        }

        console.log('Form Type:', pdfType);
        console.log('Estimator Email:', estimatorEmail);

        // Log form data with sensitive information redacted
        const redactedFormData = { ...formData };

        // Redact all signature fields
        const signatureFields = [
            'signature', 'signature1', 'signature2',
            'signaturePage1', 'signaturePage2', 'signaturePage3'
        ];

        signatureFields.forEach(field => {
            if (redactedFormData[field]) {
                redactedFormData[field] = '[SIGNATURE DATA REDACTED]';
            }
        });

        // Redact credit card information
        if (redactedFormData.cardNumber) {
            redactedFormData.cardNumber = 'XXXX-XXXX-XXXX-' +
                (redactedFormData.cardNumber.length > 4 ?
                 redactedFormData.cardNumber.slice(-4) : 'XXXX');
        }

        if (redactedFormData.cvc) {
            redactedFormData.cvc = 'XXX';
        }
        console.log('Form Data (redacted):', JSON.stringify(redactedFormData, null, 2));

        // Check if signature exists based on form type
        let hasRequiredSignatures = false;

        if (pdfType === 'walkaround') {
            // Walkaround photos don't require signatures
            console.log('Walkaround photos submission - no signatures required');
            hasRequiredSignatures = true;
        } else if (pdfType === 'rental') {
            // For rental form, check all three signatures
            if (formData.signaturePage1 && formData.signaturePage2 && formData.signaturePage3) {
                console.log('All three signatures found for rental form');
                hasRequiredSignatures = true;
            } else {
                console.log('Missing required signatures for rental form:', {
                    page1: !!formData.signaturePage1,
                    page2: !!formData.signaturePage2,
                    page3: !!formData.signaturePage3
                });
            }
        } else if (formData.signature || formData.signature1 || formData.signature2) {
            // For other forms, check any signature
            console.log('Signature data found for non-rental form');
            hasRequiredSignatures = true;
        }

        if (!hasRequiredSignatures) {
            console.warn('Required signature data missing in form submission');
            // Continue anyway, but log the warning
        }

        // Ensure output directory exists
        const outputDir = path.join(__dirname, "output");
        if (!fs.existsSync(outputDir)) {
            console.log('Creating output directory');
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const outputFilePath = path.join(outputDir, `${pdfType}_${Date.now()}.pdf`);
        console.log('Output file path:', outputFilePath);

        // Generate PDF
        console.log('Starting PDF generation');
        try {
            if (pdfType === 'walkaround') {
                // For walkaround photos, use the special photo PDF generator
                await createWalkaroundPdf(formData, outputFilePath);
            } else {
                // For regular forms, use the standard PDF filler
                await fillPdf(pdfType, formData, outputFilePath);
            }
            console.log('PDF generation completed');
        } catch (pdfError) {
            console.error('Error generating PDF:', pdfError);
            console.error('Error stack:', pdfError.stack);
            throw new Error(`PDF generation failed: ${pdfError.message}`);
        }

        // Verify PDF was created
        if (!fs.existsSync(outputFilePath)) {
            console.error('PDF file was not created at path:', outputFilePath);
            throw new Error('PDF file was not created');
        } else {
            const stats = fs.statSync(outputFilePath);
            console.log(`PDF file created successfully, size: ${stats.size} bytes`);
        }

        const emailPromises = [];
        console.log('Preparing to send emails');

        // Send to estimator
        console.log(`Sending email to estimator: ${estimatorEmail}`);
        emailPromises.push(
            sendEmail(estimatorEmail, outputFilePath, pdfType)
                .then(info => {
                    console.log(`Email sent successfully to estimator: ${estimatorEmail}`);
                    return info;
                })
                .catch(error => {
                    console.error(`Error sending email to estimator (${estimatorEmail}):`, error);
                    throw new Error(`Failed to send email to estimator: ${error.message}`);
                })
        );

        // Send to customer if email provided and not pickup form
        if (formData.email && pdfType !== 'pickup') {
            console.log(`Sending email to customer: ${formData.email}`);
            emailPromises.push(
                sendEmail(formData.email, outputFilePath, pdfType, true)
                    .then(info => {
                        console.log(`Email sent successfully to customer: ${formData.email}`);
                        return info;
                    })
                    .catch(error => {
                        console.error(`Error sending email to customer (${formData.email}):`, error);
                        throw new Error(`Failed to send email to customer: ${error.message}`);
                    })
            );
        }

        console.log('Waiting for all emails to be sent...');
        const emailResults = await Promise.all(emailPromises);
        console.log(`All emails sent successfully (${emailResults.length} total)`);

        // Clean up PDF file
        try {
            fs.unlinkSync(outputFilePath);
            console.log('Temporary PDF file cleaned up');
        } catch (cleanupError) {
            console.error('Error cleaning up PDF file:', cleanupError);
            // Don't throw error for cleanup failures
        }

        console.log('==== FORM SUBMISSION COMPLETED SUCCESSFULLY ====');
        res.json({
            success: true,
            message: "PDF generated and emails sent successfully!"
        });
    } catch (error) {
        console.error("==== ERROR PROCESSING FORM ====");
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

        res.status(500).json({
            success: false,
            message: "Error processing form",
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Add a test endpoint
app.get("/test", (req, res) => {
    res.json({
        status: "ok",
        message: "Server is running",
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err);
    console.error('Error Stack:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server starting...`);
    console.log(`PORT: ${PORT}`);
    console.log(`CORS_ORIGIN: ${process.env.CORS_ORIGIN}`);
    console.log(`Server running at http://0.0.0.0:${PORT}`);
}).on('error', (error) => {
    console.error('Server failed to start:', error);
    console.error('Error details:', error.message);
});

// Add server timeout handling
server.timeout = 120000; // 2 minutes
server.keepAliveTimeout = 65000; // slightly higher than 60 seconds
server.headersTimeout = 66000; // slightly higher than keepAliveTimeout
