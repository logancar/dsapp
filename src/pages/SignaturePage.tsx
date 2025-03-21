import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConsentPopup from "../components/ConsentPopup";
// Import any other components you need for the signature page

export default function SignaturePage() {
  const navigate = useNavigate();
  const [showConsent, setShowConsent] = useState(true);
  
  const handleAccept = () => {
    setShowConsent(false);
  };
  
  const handleDecline = () => {
    navigate("/");
  };

  return (
    <div className="signature-page-container">
      {showConsent && (
        <ConsentPopup
          isOpen={showConsent}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}
      
      {!showConsent && (
        <div className="signature-content">
          <h1>Signature Page</h1>
          {/* Add your signature form or canvas component here */}
          {/* Example: <SignatureCanvas /> */}
          
          <button 
            className="submit-btn" 
            onClick={() => navigate("/thankyou")}
          >
            Submit Signature
          </button>
        </div>
      )}
    </div>
  );
}