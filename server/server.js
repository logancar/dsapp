require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

// Enhanced error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Don't exit the process
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    // Don't exit the process
});

// Keep-alive configuration
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

// CORS configuration
app.use(cors({
    origin: 'https://dentsourcekiosk.netlify.app',
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

// Route to handle form submission
app.post("/submit-form", async (req, res) => {
    try {
        console.log('Received form submission request');
        const { formData, pdfType, estimatorEmail } = req.body;
        
        // Log the received data
        console.log('Form Type:', pdfType);
        console.log('Estimator Email:', estimatorEmail);
        console.log('Form Data:', JSON.stringify(formData, null, 2));

        const outputFilePath = path.join(__dirname, "output", `${pdfType}_${Date.now()}.pdf`);

        // Log the output path
        console.log('Output file path:', outputFilePath);

        // Ensure output directory exists
        if (!fs.existsSync(path.join(__dirname, "output"))) {
            console.log('Creating output directory');
            fs.mkdirSync(path.join(__dirname, "output"));
        }

        // Fill the PDF
        console.log('Starting PDF generation');
        await fillPdf(pdfType, formData, outputFilePath);
        console.log('PDF generated successfully');

        // Send emails concurrently
        const emailPromises = [];
        
        console.log('Preparing to send emails');
        // Always send to estimator
        emailPromises.push(
            sendEmail(estimatorEmail, outputFilePath)
                .catch(error => {
                    console.error("Error sending email to estimator:", error);
                    throw error; // Re-throw to be caught in the main catch block
                })
        );

        // Send to customer if email is provided (not for pickup form)
        if (formData.email && pdfType !== 'pickup') {
            emailPromises.push(
                sendEmail(formData.email, outputFilePath)
                    .catch(error => {
                        console.error("Error sending email to customer:", error);
                        throw error; // Re-throw to be caught in the main catch block
                    })
            );
        }

        // Wait for all emails to be sent
        console.log('Waiting for emails to be sent');
        await Promise.all(emailPromises);
        console.log('All emails sent successfully');

        res.json({ 
            success: true, 
            message: "PDF generated and emails sent successfully!",
            pdfPath: outputFilePath
        });
    } catch (error) {
        console.error("Error processing form:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({ 
            success: false, 
            message: "Error processing form",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
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
