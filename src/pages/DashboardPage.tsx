import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useContext, useCallback } from 'react';
import styles from '../styles/DashboardPage.module.css';
import { ConsentContext } from '../context/ConsentContext';
import ConsentPopup from '../components/ConsentPopup';

// Import assets from the correct location
import rentalImg from '../assets/rental.jpg';
import dropoffImg from '../assets/dropoff.jpg';
import pickupImg from '../assets/pickup.jpg';

interface LocationState {
  name?: string;
  email?: string;
}

function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;

  const { consentGiven, setConsentGiven } = useContext(ConsentContext);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  const estimatorName = locationState?.name || 'Unknown';
  const estimatorEmail = locationState?.email || 'unknown@somewhere.com';

  const forms = [
    { id: 'rental', label: 'Rental Docs', img: rentalImg },
    { id: 'dropoff', label: 'Drop Off Docs', img: dropoffImg },
    { id: 'pickup', label: 'Pick Up Docs', img: pickupImg },
  ];

  const handleClick = useCallback((formType: string) => {
    const targetRoute = `/${formType}-form`;
    if (consentGiven) {
      navigate(targetRoute, {
        state: { name: estimatorName, email: estimatorEmail },
      });
    } else {
      setPendingRoute(targetRoute);
      setIsPopupOpen(true);
    }
  }, [consentGiven, navigate, estimatorName, estimatorEmail]);

  const handleAccept = useCallback(() => {
    setConsentGiven(true);
    setIsPopupOpen(false);

    if (pendingRoute) {
      navigate(pendingRoute, {
        state: { name: estimatorName, email: estimatorEmail },
      });
      setPendingRoute(null);
    }
  }, [pendingRoute, navigate, estimatorName, estimatorEmail, setConsentGiven]);

  const handleOptOut = useCallback(() => {
    setIsPopupOpen(false);
    setPendingRoute(null);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.nameLabel}>
        Logged in as: <span className={styles.nameGreen}>{estimatorName}</span>
      </div>
      <h2 className={styles.heading}>
        Welcome <span className={styles.nameGreen}>{estimatorName}</span>.
        Please select which documents you would like to view.
      </h2>

      <div className={styles.thumbnails}>
        {forms.map((f) => (
          <motion.div
            key={f.id}
            className={styles.thumbnailCard}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleClick(f.id)}
          >
            <img
              src={f.img}
              alt={f.label}
              className={styles.thumbnailImage}
            />
            <p className={styles.thumbnailText}>{f.label}</p>
          </motion.div>
        ))}
      </div>

      {isPopupOpen && (
        <ConsentPopup
          isOpen={true}
          onAccept={handleAccept}
          onDecline={handleOptOut}
        />
      )}
    </div>
  );
}

export default DashboardPage;


