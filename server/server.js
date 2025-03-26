require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'https://dentsourcekiosk.netlify.app',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'Authorization'],
    credentials: false,
    optionsSuccessStatus: 204
}));

app.use(express.json());

// Add a health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Route to handle form submission
app.post("/submit-form", async (req, res) => {
    try {
        const { formData, pdfType, estimatorEmail } = req.body;
        const outputFilePath = path.join(__dirname, "output", `${pdfType}_${Date.now()}.pdf`);

        // Ensure output directory exists
        if (!fs.existsSync(path.join(__dirname, "output"))) {
            fs.mkdirSync(path.join(__dirname, "output"));
        }

        // Fill the PDF
        await fillPdf(pdfType, formData, outputFilePath);

        // Send emails concurrently
        const emailPromises = [];
        
        // Always send to estimator
        emailPromises.push(
            sendEmail(estimatorEmail, outputFilePath)
                .catch(error => console.error("Error sending email to estimator:", error))
        );

        // Send to customer if email is provided (not for pickup form)
        if (formData.email && pdfType !== 'pickup') {
            emailPromises.push(
                sendEmail(formData.email, outputFilePath)
                    .catch(error => console.error("Error sending email to customer:", error))
            );
        }

        // Wait for all emails to be sent
        await Promise.all(emailPromises);

        res.json({ 
            success: true, 
            message: "PDF generated and emails sent successfully!",
            pdfPath: outputFilePath
        });
    } catch (error) {
        console.error("Error processing form:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error processing form",
            error: error.message
        });
    }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server starting...`);
    console.log(`PORT: ${PORT}`);
    console.log(`CORS_ORIGIN: ${process.env.CORS_ORIGIN}`);
    console.log(`Server running at http://0.0.0.0:${PORT}`);
}).on('error', (error) => {
    console.error('Server failed to start:', error);
});
