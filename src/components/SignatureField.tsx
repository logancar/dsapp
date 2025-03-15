import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";

interface SignatureFieldProps {
  onSave: (signatureData: string) => void;
}

// Extended type to fix the isEmpty() issue
interface ExtendedSignatureCanvas extends SignatureCanvas {
  isEmpty: () => boolean;
}

const SignatureField: React.FC<SignatureFieldProps> = ({ onSave }) => {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isSigned, setIsSigned] = useState(false);

  const cleanSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setIsSigned(false);
    }
  };

  const saveSignature = () => {
    if (sigCanvas.current) {
      const extendedCanvas = sigCanvas.current as unknown as ExtendedSignatureCanvas;
      if (extendedCanvas && !extendedCanvas.isEmpty()) {
        const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
        setIsSigned(true);
        onSave(dataURL);
      }
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <label style={{ display: "block", marginBottom: "8px", color: "#ABABAB" }}>
        Sign here
      </label>
      <div
        style={{
          border: "1px solid #2A2A2A",
          borderRadius: "12px",
          backgroundColor: "#151515", // ✅ Moved background color here
          overflow: "hidden",
          marginBottom: "16px",
        }}
      >
        <SignatureCanvas
          ref={sigCanvas}
          penColor="#FFFFFF"
          canvasProps={{
            width: 500,
            height: 200,
            className: "signature-canvas",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={cleanSignature}
          style={{
            padding: "8px 16px",
            backgroundColor: "#333",
            color: "#FFF",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
        <button
          onClick={saveSignature}
          style={{
            padding: "8px 16px",
            backgroundColor: isSigned ? "#4A90E2" : "#777",
            color: "#FFF",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default SignatureField;
