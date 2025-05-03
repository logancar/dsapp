try {
    console.log("Starting debug server...");
    
    // Import dependencies
    const express = require("express");
    console.log("Express imported successfully");
    
    const cors = require("cors");
    console.log("CORS imported successfully");
    
    const path = require('path');
    console.log("Path imported successfully");
    
    const fs = require('fs');
    console.log("FS imported successfully");
    
    const { fillPdf } = require('./fillPdf');
    console.log("fillPdf imported successfully");
    
    const { sendEmail } = require('./emailService');
    console.log("emailService imported successfully");
    
    // Create Express app
    const app = express();
    console.log("Express app created");
    
    const PORT = process.env.PORT || 8080;
    console.log(`Port set to ${PORT}`);
    
    // Basic middleware
    app.use(express.json());
    console.log("JSON middleware added");
    
    // Test endpoint
    app.get('/', (req, res) => {
        console.log('Test endpoint hit');
        res.json({ status: 'ok', message: 'Debug server is running' });
    });
    
    // Start the server
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`Debug server running at http://0.0.0.0:${PORT}`);
    });
    
    console.log("Debug server started successfully");
} catch (error) {
    console.error("Error starting debug server:", error);
    console.error("Error stack:", error.stack);
}
