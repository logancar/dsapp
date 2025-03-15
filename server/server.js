require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { fillPdf } = require("./fillPdf");
const { sendEmail } = require("./emailService");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000; // Runs on port 5000

app.use(cors());
app.use(bodyParser.json());

// Route to handle form submission
app.post("/submit-form", async (req, res) => {
    try {
        const { formData, pdfType } = req.body; // Get form data and type
        const outputFilePath = path.join(__dirname, "output", `${pdfType}_${Date.now()}.pdf`);

        // Fill the PDF
        await fillPdf(pdfType, formData, outputFilePath);

        // Send the email with the filled PDF attached
        await sendEmail(formData.email, outputFilePath);

        res.json({ success: true, message: "PDF generated and emailed successfully!" });
    } catch (error) {
        console.error("Error processing form:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
