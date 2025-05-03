require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8081; // Use a different port for testing

// Basic middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/', (req, res) => {
    console.log('Test endpoint hit');
    res.json({ status: 'ok', message: 'Test server is running' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Test server running at http://0.0.0.0:${PORT}`);
}).on('error', (error) => {
    console.error('Test server failed to start:', error);
});
