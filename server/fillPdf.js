const { PDFDocument } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

async function fillPdf(pdfType, formData, outputPath) {
    const pdfPaths = {
        rental: path.join(__dirname, "..", "public", "pdfs", "Rental.pdf"),
        pickup: path.join(__dirname, "..", "public", "pdfs", "Pickup.pdf"),
        dropoff: path.join(__dirname, "..", "public", "pdfs", "Dropoff.pdf"),
    };

    if (!pdfPaths[pdfType]) throw new Error("Invalid PDF type");

    const pdfBytes = fs.readFileSync(pdfPaths[pdfType]);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const form = pdfDoc.getForm();

    // Mapping fields to form fields
    const fieldMappings = {
        rental: { name: "Name", email: "Email", phone: "Phone", signature: "Signature" },
        pickup: { customerName: "Customer Name", partsOwed: "Parts Owed", dentSourceRep: "Dent Source Rep", date: "Date", signature: "Signature" },
        dropoff: { ownerName: "Owner Name", vin: "VIN", claimNumber: "Claim Number", insuranceProvider: "Insurance Provider", dateOfLoss: "Date of Loss", signature: "Signature" }
    };

    const fields = fieldMappings[pdfType];

    for (const key in formData) {
        if (form.getTextField(fields[key])) {
            form.getTextField(fields[key]).setText(formData[key]);
        }
    }

    const filledPdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, filledPdfBytes);
}

module.exports = { fillPdf };
