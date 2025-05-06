const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

// Log SMTP configuration (without password)
console.log("SMTP Configuration:");
console.log(`- Host: ${process.env.SMTP_HOST}`);
console.log(`- Port: ${process.env.SMTP_PORT}`);
console.log(`- User: ${process.env.SMTP_USER}`);
console.log(`- Secure: false`);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    pool: true, // Use pooled connections
    maxConnections: 5,
    maxMessages: 100,
    tls: {
        rejectUnauthorized: false
    },
    debug: true, // Enable debug output
    logger: true // Log information about the mail
});

async function sendEmail(to, pdfPath, formType, isCustomer = false) {
    console.log(`Preparing to send email for ${formType} form to ${to}`);
    console.log(`PDF path: ${pdfPath}`);

    // Verify the PDF file exists
    if (!fs.existsSync(pdfPath)) {
        console.error(`PDF file does not exist at path: ${pdfPath}`);
        throw new Error(`PDF file not found at ${pdfPath}`);
    } else {
        const stats = fs.statSync(pdfPath);
        console.log(`PDF file exists, size: ${stats.size} bytes`);
    }

    const subjectLines = {
        rental: "Rental Agreement",
        pickup: "Pickup Acknowledgement",
        dropoff: "Dropoff Form",
        walkaround: "Vehicle Walkaround Photos"
    };

    // Customize email content based on form type
    let emailSubject, emailText, attachmentFilename;

    if (formType === 'walkaround') {
        emailSubject = isCustomer
            ? `Your Vehicle Walkaround Photos`
            : `New Vehicle Walkaround Photos Submission`;
        emailText = isCustomer
            ? `Thank you for completing the vehicle walkaround photos. Please find your photos attached as a PDF document.`
            : `A new set of vehicle walkaround photos has been submitted. Please find the photos attached as a PDF document.`;
        attachmentFilename = `vehicle-walkaround-photos.pdf`;
    } else {
        emailSubject = isCustomer
            ? `Your ${subjectLines[formType]}`
            : `New ${subjectLines[formType]} Submission`;
        emailText = isCustomer
            ? `Thank you for completing the ${subjectLines[formType].toLowerCase()}. Please find your copy attached.`
            : `A new ${subjectLines[formType].toLowerCase()} has been submitted. Please find the document attached.`;
        attachmentFilename = `${formType}-form.pdf`;
    }

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: to,
        subject: emailSubject,
        text: emailText,
        attachments: [
            {
                filename: attachmentFilename,
                path: pdfPath
            }
        ]
    };

    console.log("Mail options prepared:", {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject,
        attachments: mailOptions.attachments.map(a => ({ filename: a.filename, exists: fs.existsSync(a.path) }))
    });

    try {
        console.log("Sending email...");
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to", to);
        console.log("Message ID:", info.messageId);
        console.log("Response:", info.response);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        console.error("Error details:", error.message);
        if (error.stack) {
            console.error("Stack trace:", error.stack);
        }
        throw error;
    }
}

// Verify connection configuration
transporter.verify(function(error, success) {
    if (error) {
        console.error("SMTP connection error:", error);
        console.error("Error details:", error.message);
        if (error.stack) {
            console.error("Stack trace:", error.stack);
        }
    } else {
        console.log("SMTP server is ready to take our messages");
    }
});

module.exports = { sendEmail, transporter };
