import React, { useState } from "react";
import SignatureField from "../components/SignatureField";  // Ensure this is the correct path

const SignaturePage: React.FC = () => {
  const [signature, setSignature] = useState<string | null>(null);

  const handleSignatureSave = (dataURL: string) => {
    setSignature(dataURL); // ✅ Save signature to state
  };

  return (
    <div className="signature-page">
      <h1>Signature Page</h1>
      
      {/* Signature field */}
      <SignatureField onSave={handleSignatureSave} />

      {/* Display saved signature for confirmation */}
      {signature && (
        <div style={{ marginTop: "20px" }}>
          <h3>Saved Signature:</h3>
          <img src={signature} alt="User Signature" style={{ border: "1px solid #ccc", padding: "5px" }} />
        </div>
      )}

      {/* Submit button only enabled when signature exists */}
      <button 
        onClick={() => alert("Signature submitted!")} 
        disabled={!signature} 
        style={{
          padding: "10px 20px",
          backgroundColor: signature ? "#4CAF50" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "5px",
          marginTop: "20px",
          cursor: signature ? "pointer" : "not-allowed",
        }}
      >
        Submit Signature
      </button>
    </div>
  );
};

export default SignaturePage;
