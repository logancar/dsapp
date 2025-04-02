const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

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
    }
});

async function sendEmail(to, pdfPath, formType, isCustomer = false) {
    const subjectLines = {
        rental: "Rental Agreement",
        pickup: "Pickup Acknowledgement",
        dropoff: "Dropoff Form"
    };

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: to,
        subject: isCustomer 
            ? `Your ${subjectLines[formType]}` 
            : `New ${subjectLines[formType]} Submission`,
        text: isCustomer 
            ? `Thank you for completing the ${subjectLines[formType].toLowerCase()}. Please find your copy attached.`
            : `A new ${subjectLines[formType].toLowerCase()} has been submitted. Please find the document attached.`,
        attachments: [
            {
                filename: `${formType}-form.pdf`,
                path: pdfPath
            }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to", to);
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

// Verify connection configuration
transporter.verify(function(error, success) {
    if (error) {
        console.log("SMTP connection error:", error);
    } else {
        console.log("SMTP server is ready to take our messages");
    }
});

module.exports = { sendEmail };
