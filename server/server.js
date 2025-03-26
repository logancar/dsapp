require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { fillPdf } = require("./fillPdf");
const { sendEmail } = require("./emailService");
const fs = require("fs");
const path = require("path");

const app = express();
// Use process.env.PORT for Railway deployment
const PORT = process.env.PORT || 5000;

// Configure CORS to accept requests from your frontend domain
app.use(cors({
    origin: ['https://dentsourcekiosk.netlify.app', 'http://localhost:5173'], // Add your Netlify domain
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: true
}));

app.use(bodyParser.json());

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
            message: "Error processing form"
        });
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
