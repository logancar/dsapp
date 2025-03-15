import React, { useEffect } from "react";
import "../styles/ConsentPopup.css"; // Import the new CSS file

interface ConsentPopupProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const ConsentPopup: React.FC<ConsentPopupProps> = ({ isOpen, onAccept, onDecline }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`consent-overlay ${isOpen ? "show" : ""}`} onClick={onDecline}>
      <div className="consent-content" onClick={(e) => e.stopPropagation()}>
        <h2>Electronic Signature Consent</h2>
        <p>
          By continuing, you consent to electronically sign all documents related to your rental. 
          This helps us expedite your rental process and reduce paper waste.
        </p>
        <p>You can withdraw your consent at any time by contacting our customer service.</p>
        <div className="consent-buttons">
          <button className="consent-button accept" onClick={onAccept}>I Accept</button>
          <button className="consent-button cancel" onClick={onDecline}>Opt Out</button>
        </div>
      </div>
    </div>
  );
};

export default ConsentPopup;
