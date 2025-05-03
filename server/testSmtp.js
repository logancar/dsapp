require("dotenv").config();
const nodemailer = require("nodemailer");

async function testSmtpConnection() {
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
        debug: true,
        logger: true
    });

    try {
        const result = await transporter.verify();
        console.log("SMTP Connection Test Result:", result);
        return result;
    } catch (error) {
        console.error("SMTP Connection Error:", error);
        throw error;
    }
}

testSmtpConnection()
    .then(() => console.log("SMTP test completed successfully"))
    .catch(err => console.error("SMTP test failed:", err));
