import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import styles from './SignatureField.module.css';

interface SignatureFieldProps {
  onSave: (signature: string) => void;
}

const SignatureField: React.FC<SignatureFieldProps> = ({ onSave }) => {
  const [hasSignature, setHasSignature] = useState(false);
  const signaturePadRef = useRef<SignatureCanvas>(null);

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

  return (
    <div className={styles.signatureContainer}>
      <SignatureCanvas
        ref={signaturePadRef}
        penColor="#3BB554"
        canvasProps={{
          className: styles.signatureCanvas,
          width: 500,
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
