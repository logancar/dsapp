import { useState, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import SignatureCanvas from 'react-signature-canvas';
import styles from './PDFPage.module.css';

/*
  A placeholder for a full-sized PDF.
  This will be replaced with actual PDF loading logic later.
*/
const pdfPlaceholderURL = 'https://placekitten.com/800/1100';

function PDFPage() {
  const location = useLocation() as any;
  const { pdfName } = useParams();
  const navigate = useNavigate();

  // Read the estimator's name & email from the dashboard state
  const estimatorName = location.state?.name || 'Unknown';
  const estimatorEmail = location.state?.email || 'unknown@somewhere.com';

  // Show/hide the e-sign consent modal at the start
  const [showConsentModal, setShowConsentModal] = useState(true);

  // User input fields
  const [userEmail, setUserEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Signature reference
  const sigCanvasRef = useRef<SignatureCanvas>(null);

  // If user opts out
  const handleOptOut = () => {
    alert('You opted out of e-sign. Please request a paper form.');
    navigate('/dashboard', {
      state: { name: estimatorName, email: estimatorEmail },
    });
  };

  // Sign & Submit
  const handleSignSubmit = async () => {
    try {
      if (!userEmail && !phone) {
        alert('Please provide an email or phone to receive a copy.');
        return;
      }

      // Get signature image safely
      const sigCanvas = sigCanvasRef.current;
      if (!sigCanvas) {
        alert('Signature pad not available.');
        return;
      }
      
      const signatureDataURL = sigCanvas.getTrimmedCanvas()
        ? sigCanvas.getTrimmedCanvas().toDataURL('image/png')
        : sigCanvas.toDataURL('image/png');

      // Create a new PDF doc
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([800, 1100]);

      // Embed the placeholder PDF
      const pdfBytes = await fetch(pdfPlaceholderURL).then(r => r.arrayBuffer());
      const pdfImage = await pdfDoc.embedJpg(pdfBytes);
      page.drawImage(pdfImage, {
        x: 0,
        y: 0,
        width: 800,
        height: 1100,
      });

      // Embed text fields
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const dateStr = new Date().toLocaleString();

      page.drawText(`Estimator: ${estimatorName}`, { x: 40, y: 1050, font, size: 12, color: rgb(1, 1, 1) });
      page.drawText(`Estimator Email: ${estimatorEmail}`, { x: 40, y: 1030, font, size: 10, color: rgb(1, 1, 1) });
      page.drawText(`User Email: ${userEmail}`, { x: 40, y: 1010, font, size: 10, color: rgb(1, 1, 1) });
      page.drawText(`Phone: ${phone}`, { x: 40, y: 990, font, size: 10, color: rgb(1, 1, 1) });
      page.drawText(`Date: ${dateStr}`, { x: 40, y: 970, font, size: 10, color: rgb(1, 1, 1) });
      page.drawText(`Doc: ${pdfName}`, { x: 40, y: 950, font, size: 10, color: rgb(1, 1, 1) });

      // Embed signature image
      const sigBytes = await fetch(signatureDataURL).then(r => r.arrayBuffer());
      const sigImage = await pdfDoc.embedPng(sigBytes);
      page.drawImage(sigImage, {
        x: 40,
        y: 880,
        width: 200,
        height: 80,
      });

      // Save the final PDF
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
            By continuing, you consent to sign electronically.
          </p>
          <div className={styles.modalActions}>
            <button 
              className={styles.acceptButton}
              onClick={() => setShowConsentModal(false)}
            >
              Accept & Continue
            </button>
            <button 
              className={styles.optOutButton}
              onClick={handleOptOut}
            >
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

      <h2 className={styles.heading}>{pdfName} Document (Placeholder)</h2>
      <p className={styles.subtext}>
        Below is a placeholder PDF. Fill out your details.
      </p>

      {/* Placeholder PDF preview */}
      <img src={pdfPlaceholderURL} alt="Placeholder PDF" className={styles.catImage} />

      {/* Input fields */}
      <div className={styles.formSection}>
        <label className={styles.label}>
          Your Email:
          <input
            type="email"
            className={styles.input}
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
        </label>
        <label className={styles.label}>
          Your Phone (optional):
          <input
            type="tel"
            className={styles.input}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
      </div>

      {/* Signature Section */}
      <div className={styles.sigSection}>
        <p>Sign Below:</p>
        <SignatureCanvas
          ref={sigCanvasRef}
          penColor="green"
          canvasProps={{
            width: 500,
            height: 200,
            className: styles.sigCanvas,
          }}
        />
      </div>

      {/* Submit button */}
      <div className={styles.actionRow}>
        <button 
          className={styles.signButton}
          onClick={handleSignSubmit}
        >
          Sign & Submit
        </button>
      </div>
    </div>
  );
}

export default PDFPage;
