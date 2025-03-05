import { useState, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Page, pdfjs } from 'react-pdf';
import SignatureCanvas from 'react-signature-canvas';
import styles from './PDFPage.module.css';

// Load worker for PDF rendering
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Define PDF file paths
const pdfFiles: Record<string, string> = {
  Rental: '/pdfs/Rental.pdf',
  Pickup: '/pdfs/Pickup.pdf',
  Dropoff: '/pdfs/Dropoff.pdf',
};

function PDFPage() {
  const location = useLocation() as any;
  const { pdfName } = useParams();
  const navigate = useNavigate();

  // Get the logged-in estimator details
  const estimatorName = location.state?.name || 'Unknown';
  const estimatorEmail = location.state?.email || 'unknown@somewhere.com';

  // Show or hide the e-sign consent modal initially:
  const [showConsentModal, setShowConsentModal] = useState(true);

  // User input fields
  const [userEmail, setUserEmail] = useState('');
  const [phone, setPhone] = useState('');
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);

  // Get the correct PDF URL
  const pdfUrl = pdfFiles[pdfName as keyof typeof pdfFiles] || pdfFiles.Rental;

  // Handle Opt-Out (Manual Signing)
  const handleOptOut = () => {
    alert('You opted out of e-sign. Please request a paper form.');
    navigate('/dashboard', {
      state: { name: estimatorName, email: estimatorEmail },
    });
  };

  // Handle Sign & Submit
  const handleSignSubmit = async () => {
    try {
      if (!userEmail && !phone) {
        alert('Please provide an email or phone number before submitting.');
        return;
      }

      // ** Check if user signed (new method) **
      const sigCanvas = sigCanvasRef.current;
      if (!sigCanvas) {
        alert('Signature pad not available.');
        return;
      }
      const signatureDataURL = sigCanvas.getTrimmedCanvas().toDataURL('image/png');

      // ** Validate if signature is empty **
      const blankCanvas = document.createElement('canvas');
      blankCanvas.width = 500;
      blankCanvas.height = 200;
      if (signatureDataURL === blankCanvas.toDataURL()) {
        alert('Please sign before submitting.');
        return;
      }

      // Create new PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([800, 1100]);

      // Load existing PDF
      const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
      const existingPdf = await PDFDocument.load(existingPdfBytes);
      const copiedPages = await pdfDoc.copyPages(existingPdf, [0]);
      pdfDoc.addPage(copiedPages[0]);

      // Embed signature
      const sigBytes = await fetch(signatureDataURL).then(res => res.arrayBuffer());
      const sigImage = await pdfDoc.embedPng(sigBytes);
      page.drawImage(sigImage, {
        x: 40,
        y: 80,
        width: 200,
        height: 80,
      });

      // Add user info
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const dateStr = new Date().toLocaleString();

      page.drawText(`Estimator: ${estimatorName}`, { x: 40, y: 1050, font, size: 12, color: rgb(0, 0, 0) });
      page.drawText(`User Email: ${userEmail}`, { x: 40, y: 1030, font, size: 10, color: rgb(0, 0, 0) });
      page.drawText(`Phone: ${phone}`, { x: 40, y: 1010, font, size: 10, color: rgb(0, 0, 0) });
      page.drawText(`Date: ${dateStr}`, { x: 40, y: 990, font, size: 10, color: rgb(0, 0, 0) });

      // Save the finalized PDF
      const finalPdfBytes = await pdfDoc.save();
      console.log('PDF generated! byte length =', finalPdfBytes.length);

      // Navigate to Thank You page
      navigate('/thankyou');
    } catch (err) {
      console.error('Error in handleSignSubmit:', err);
    }
  };

  // E-sign consent modal
  if (showConsentModal) {
    return (
      <div className={styles.modalBackdrop}>
        <div className={styles.modalContent}>
          <h2 className={styles.modalTitle}>Electronic Signature Consent</h2>
          <p className={styles.modalText}>
            By continuing, you consent to sign electronically. (ESIGN Act disclaimer here)
          </p>
          <div className={styles.modalActions}>
            <button className={styles.acceptButton} onClick={() => setShowConsentModal(false)}>
              Accept & Continue
            </button>
            <button className={styles.optOutButton} onClick={handleOptOut}>
              Opt Out (Manual Sign)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.nameLabel}>
        Logged in as: <span className={styles.nameGreen}>{estimatorName}</span>
      </div>

      <h2 className={styles.heading}>{pdfName} Document</h2>

      {/* Embed PDF Viewer */}
      <div className={styles.pdfContainer}>
        <Document file={pdfUrl} className={styles.pdfViewer}>
          <Page pageNumber={1} width={800} />
        </Document>
      </div>

      {/* User input form */}
      <div className={styles.formSection}>
        <label className={styles.label}>
          Your Email:
          <input type="email" className={styles.input} value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
        </label>
        <label className={styles.label}>
          Your Phone (optional):
          <input type="tel" className={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
      </div>

      {/* Signature Canvas */}
      <div className={styles.sigSection}>
        <p>Sign Below:</p>
        <SignatureCanvas ref={sigCanvasRef} penColor="green" canvasProps={{ width: 500, height: 200, className: styles.sigCanvas }} />
      </div>

      <div className={styles.actionRow}>
        <button className={styles.signButton} onClick={handleSignSubmit}>
          Sign & Submit
        </button>
      </div>
    </div>
  );
}

export default PDFPage;
