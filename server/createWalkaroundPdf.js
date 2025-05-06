const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

/**
 * Creates a PDF document from walkaround photos
 * @param {Object} formData - The form data containing photos
 * @param {string} outputPath - The path where the PDF will be saved
 * @returns {Promise<void>}
 */
async function createWalkaroundPdf(formData, outputPath) {
    console.log('Creating walkaround PDF...');
    
    try {
        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        
        // Add a cover page
        const coverPage = pdfDoc.addPage([612, 792]); // Standard US Letter size
        
        // Add title and customer information to cover page
        coverPage.drawText('Vehicle Walkaround Photos', {
            x: 50,
            y: 700,
            size: 24,
            color: rgb(0, 0, 0)
        });
        
        // Add customer information
        const customerName = formData.userName || 'Unknown';
        const submittedDate = formData.submittedAt 
            ? new Date(formData.submittedAt).toLocaleDateString() 
            : new Date().toLocaleDateString();
        
        coverPage.drawText(`Customer: ${customerName}`, {
            x: 50,
            y: 650,
            size: 12,
            color: rgb(0, 0, 0)
        });
        
        coverPage.drawText(`Date: ${submittedDate}`, {
            x: 50,
            y: 630,
            size: 12,
            color: rgb(0, 0, 0)
        });
        
        // Add a note about the contents
        coverPage.drawText('This document contains photos from a vehicle walkaround inspection.', {
            x: 50,
            y: 590,
            size: 12,
            color: rgb(0, 0, 0)
        });
        
        // Process each photo
        const photoKeys = Object.keys(formData).filter(key => key.startsWith('photo_'));
        console.log(`Found ${photoKeys.length} photos to include in PDF`);
        
        // Sort the photo keys to ensure they appear in the correct order
        const orderedPhotoKeys = photoKeys.sort((a, b) => {
            const order = [
                'photo_front',
                'photo_left_front',
                'photo_left_fender',
                'photo_left_side',
                'photo_left_quarter_panel',
                'photo_left_rear',
                'photo_rear',
                'photo_right_rear',
                'photo_right_quarter_panel',
                'photo_right_side',
                'photo_right_fender',
                'photo_right_front',
                'photo_roof',
                'photo_vin_odometer'
            ];
            
            return order.indexOf(a) - order.indexOf(b);
        });
        
        // Add each photo to a new page
        for (const photoKey of orderedPhotoKeys) {
            const photoData = formData[photoKey];
            if (!photoData || typeof photoData !== 'string' || !photoData.startsWith('data:image')) {
                console.log(`Skipping invalid photo data for ${photoKey}`);
                continue;
            }
            
            try {
                // Extract the image data from the data URL
                const base64Data = photoData.split(',')[1];
                const imageBytes = Buffer.from(base64Data, 'base64');
                
                // Get the photo title (convert photo_left_front to LEFT FRONT)
                const photoTitle = photoKey.replace('photo_', '')
                    .split('_')
                    .map(word => word.toUpperCase())
                    .join(' ');
                
                // Embed the image in the PDF
                let image;
                if (photoData.includes('data:image/png')) {
                    image = await pdfDoc.embedPng(imageBytes);
                } else if (photoData.includes('data:image/jpeg') || photoData.includes('data:image/jpg')) {
                    image = await pdfDoc.embedJpg(imageBytes);
                } else {
                    console.log(`Unsupported image format for ${photoKey}, attempting to use as PNG`);
                    image = await pdfDoc.embedPng(imageBytes);
                }
                
                // Add a new page for the photo
                const page = pdfDoc.addPage([612, 792]); // Standard US Letter size
                
                // Calculate dimensions to fit the image on the page with margins
                const maxWidth = 512; // 612 - 100 (margins)
                const maxHeight = 642; // 792 - 150 (margins + title space)
                
                const { width, height } = image.scale(1);
                let scaledWidth = width;
                let scaledHeight = height;
                
                // Scale down the image if it's too large
                if (width > maxWidth || height > maxHeight) {
                    const widthRatio = maxWidth / width;
                    const heightRatio = maxHeight / height;
                    const scale = Math.min(widthRatio, heightRatio);
                    
                    scaledWidth = width * scale;
                    scaledHeight = height * scale;
                }
                
                // Center the image on the page
                const x = (612 - scaledWidth) / 2;
                const y = (792 - scaledHeight - 50) / 2; // Adjust for title space
                
                // Draw the photo title
                page.drawText(photoTitle, {
                    x: 50,
                    y: 750,
                    size: 18,
                    color: rgb(0, 0, 0)
                });
                
                // Draw the image
                page.drawImage(image, {
                    x,
                    y,
                    width: scaledWidth,
                    height: scaledHeight
                });
                
                console.log(`Added ${photoTitle} to PDF`);
            } catch (error) {
                console.error(`Error processing photo ${photoKey}:`, error);
            }
        }
        
        // Save the PDF
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, pdfBytes);
        
        console.log(`Walkaround PDF created successfully at ${outputPath}`);
    } catch (error) {
        console.error('Error creating walkaround PDF:', error);
        throw new Error(`Failed to create walkaround PDF: ${error.message}`);
    }
}

module.exports = { createWalkaroundPdf };
