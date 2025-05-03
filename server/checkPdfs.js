const fs = require('fs');
const path = require('path');

// Check if the PDF files exist in the expected locations
const pdfPaths = {
    rental: path.join(__dirname, "..", "public", "pdfs", "Rental.pdf"),
    pickup: path.join(__dirname, "..", "public", "pdfs", "Pickup.pdf"),
    dropoff: path.join(__dirname, "..", "public", "pdfs", "DropoffForm.pdf"),
};

console.log('Checking PDF files...');
for (const [type, filePath] of Object.entries(pdfPaths)) {
    const exists = fs.existsSync(filePath);
    console.log(`- ${type}: ${filePath} (exists: ${exists})`);
    
    if (exists) {
        const stats = fs.statSync(filePath);
        console.log(`  Size: ${stats.size} bytes`);
    } else {
        console.log('  MISSING FILE!');
        
        // Check if the directory exists
        const dir = path.dirname(filePath);
        console.log(`  Directory ${dir} exists: ${fs.existsSync(dir)}`);
        
        // List files in the directory if it exists
        if (fs.existsSync(dir)) {
            console.log('  Files in directory:');
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                console.log(`    - ${file}`);
            });
        }
    }
}

// Check if the public/pdfs directory exists
const pdfsDir = path.join(__dirname, "..", "public", "pdfs");
console.log(`\nChecking if pdfs directory exists: ${pdfsDir}`);
console.log(`Directory exists: ${fs.existsSync(pdfsDir)}`);

// Check if the public directory exists
const publicDir = path.join(__dirname, "..", "public");
console.log(`\nChecking if public directory exists: ${publicDir}`);
console.log(`Directory exists: ${fs.existsSync(publicDir)}`);

// List all directories from the server directory up to the root
let currentDir = __dirname;
console.log('\nDirectory structure:');
while (currentDir !== path.parse(currentDir).root) {
    console.log(`- ${currentDir} (exists: ${fs.existsSync(currentDir)})`);
    
    // List files in the directory
    if (fs.existsSync(currentDir)) {
        const files = fs.readdirSync(currentDir);
        console.log('  Files:');
        files.forEach(file => {
            const filePath = path.join(currentDir, file);
            const isDir = fs.existsSync(filePath) && fs.statSync(filePath).isDirectory();
            console.log(`    - ${file}${isDir ? '/' : ''}`);
        });
    }
    
    currentDir = path.dirname(currentDir);
}

// Search for PDF files in the project
console.log('\nSearching for PDF files in the project...');
function findPdfFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        
        if (fs.statSync(filePath).isDirectory()) {
            findPdfFiles(filePath, fileList);
        } else if (path.extname(file).toLowerCase() === '.pdf') {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

try {
    const pdfFiles = findPdfFiles(path.join(__dirname, '..'));
    console.log(`Found ${pdfFiles.length} PDF files:`);
    pdfFiles.forEach(file => {
        console.log(`- ${file}`);
    });
} catch (error) {
    console.error('Error searching for PDF files:', error);
}
