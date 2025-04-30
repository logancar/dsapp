require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require('path');
const fs = require('fs');
const { fillPdf } = require('./fillPdf'); // Fixed import name
const { sendEmail } = require('./emailService');

const app = express();
const PORT = process.env.PORT || 8080;

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
    'http://127.0.0.1:5173'
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc)
        if (!origin) return callback(null, true);

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
    try {
        console.log('Received form submission request');
        const { formData, pdfType, estimatorEmail } = req.body;

        // Validate required fields
        if (!formData || !pdfType || !estimatorEmail) {
            console.error('Missing required fields:', { formData, pdfType, estimatorEmail });
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
        console.log('Form Data:', JSON.stringify(formData, null, 2));

        // Ensure output directory exists
        const outputDir = path.join(__dirname, "output");
        if (!fs.existsSync(outputDir)) {
            console.log('Creating output directory');
            fs.mkdirSync(outputDir);
        }

        const outputFilePath = path.join(outputDir, `${pdfType}_${Date.now()}.pdf`);
        console.log('Output file path:', outputFilePath);

        // Generate PDF
        console.log('Starting PDF generation');
        await fillPdf(pdfType, formData, outputFilePath);
        console.log('PDF generated successfully');

        // Verify PDF was created
        if (!fs.existsSync(outputFilePath)) {
            throw new Error('PDF file was not created');
        }

        const emailPromises = [];
        console.log('Preparing to send emails');

        // Send to estimator
        emailPromises.push(
            sendEmail(estimatorEmail, outputFilePath, pdfType)
                .catch(error => {
                    console.error("Error sending email to estimator:", error);
                    throw new Error(`Failed to send email to estimator: ${error.message}`);
                })
        );

        // Send to customer if email provided and not pickup form
        if (formData.email && pdfType !== 'pickup') {
            emailPromises.push(
                sendEmail(formData.email, outputFilePath, pdfType, true)
                    .catch(error => {
                        console.error("Error sending email to customer:", error);
                        throw new Error(`Failed to send email to customer: ${error.message}`);
                    })
            );
        }

        console.log('Waiting for emails to be sent');
        await Promise.all(emailPromises);
        console.log('All emails sent successfully');

        // Clean up PDF file
        try {
            fs.unlinkSync(outputFilePath);
            console.log('Temporary PDF file cleaned up');
        } catch (cleanupError) {
            console.error('Error cleaning up PDF file:', cleanupError);
            // Don't throw error for cleanup failures
        }

        res.json({
            success: true,
            message: "PDF generated and emails sent successfully!"
        });
    } catch (error) {
        console.error("Error processing form:", error);
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
