import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import styles from './SignatureField.module.css';

interface SignatureFieldProps {
  onSave: (signature: string) => void;
}

const SignatureField: React.FC<SignatureFieldProps> = ({ onSave }) => {
  const [hasSignature, setHasSignature] = useState(false);
  const signaturePadRef = useRef<SignatureCanvas>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize for responsive canvas
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setHasSignature(false);
    }
  };

  const handleSave = () => {
    if (signaturePadRef.current) {
      const canvas = signaturePadRef.current as any;
      if (!canvas.isEmpty()) {
        // Use toDataURL directly instead of getTrimmedCanvas
        const dataUrl = canvas.toDataURL('image/png');
        onSave(dataUrl);
      }
    }
  };

  // Calculate canvas width based on screen size
  const canvasWidth = windowWidth > 768 ? 500 : windowWidth - 60;

  return (
    <div className={styles.signatureContainer}>
      <SignatureCanvas
        ref={signaturePadRef}
        penColor="#3BB554"
        canvasProps={{
          className: styles.signatureCanvas,
          width: canvasWidth,
          height: 200
        }}
        onEnd={() => setHasSignature(true)}
      />
      <div className={styles.buttonContainer}>
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClear}
        >
          Clear
        </button>
        <button
          type="button"
          className={styles.saveButton}
          onClick={handleSave}
          disabled={!hasSignature}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default SignatureField;
