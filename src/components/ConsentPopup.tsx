import React, { useEffect, useCallback } from 'react';
import '../styles/ConsentPopup.css';

interface ConsentPopupProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const ConsentPopup: React.FC<ConsentPopupProps> = ({ isOpen, onAccept, onDecline }) => {
  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (isOpen) {
        e.preventDefault();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('scroll', handleScroll, { passive: false });
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  const handleAccept = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAccept();
  }, [onAccept]);

  const handleDecline = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDecline();
  }, [onDecline]);

  if (!isOpen) return null;

  return (
    <div 
      className="consent-overlay show"
      onClick={handleDecline}
    >
      <div 
        className="consent-content"
        onClick={e => e.stopPropagation()}
      >
        <h2>Electronic Signature Consent</h2>
        <p>By continuing, you consent to electronically sign all documents...</p>
        <div className="consent-buttons">
          <button className="consent-button accept" onClick={handleAccept}>
            I Accept
          </button>
          <button className="consent-button cancel" onClick={handleDecline}>
            Opt Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ConsentPopup);
