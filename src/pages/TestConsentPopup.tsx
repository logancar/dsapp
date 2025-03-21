// src/pages/TestConsentPopup.tsx

import { useState } from "react"; // <-- Removed default React import
import ConsentPopup from "../components/ConsentPopup";

export default function TestConsentPopup() {
  const [showConsent, setShowConsent] = useState(false);

  return (
    <div style={{ marginTop: "50px", textAlign: "center" }}>
      <h1>Test Consent Popup</h1>
      <button onClick={() => setShowConsent(!showConsent)}>
        Toggle Consent Popup
      </button>

      {showConsent && (
        <ConsentPopup
          isOpen={showConsent}
          onAccept={() => {
            console.log("Accepted in Test");
            setShowConsent(false);
          }}
          onDecline={() => {
            console.log("Declined in Test");
            setShowConsent(false);
          }}
        />
      )}
    </div>
  );
}
