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
import walkaroundImg from '../assets/walkaround.jpg';

interface LocationState {
  name?: string;
  email?: string;
  isCustomer?: boolean;
  estimatorEmail?: string;
}

function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;

  const { consentGiven, setConsentGiven } = useContext(ConsentContext);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  const isCustomer = locationState?.isCustomer || false;
  const userName = locationState?.name || 'Unknown';
  // For customers, use the linked estimator's email for form submissions
  const userEmail = isCustomer
    ? locationState?.estimatorEmail || 'info@autohail.group'
    : locationState?.email || 'info@autohail.group';

  // Forms in specific order for the 2x2 grid on mobile:
  // Top left: Drop Off, Top right: Rental, Bottom left: Pickup, Bottom right: Walkaround Photos
  const forms = [
    { id: 'dropoff', label: 'Drop Off Docs', img: dropoffImg, order: 1 },
    { id: 'rental', label: 'Rental Docs', img: rentalImg, order: 2 },
    { id: 'pickup', label: 'Pick Up Docs', img: pickupImg, order: 3 },
    { id: 'walkaround', label: 'Walkaround Photos', img: walkaroundImg, order: 4 },
  ];

  const handleClick = useCallback((formType: string) => {
    // Prevent customers from accessing rental docs
    if (isCustomer && formType === 'rental') {
      alert("Rental documents are not available for customer access.");
      return;
    }

    const targetRoute = `/${formType}-form`;
    if (consentGiven) {
      navigate(targetRoute, {
        state: {
          name: userName,
          email: userEmail,
          isCustomer: isCustomer,
          estimatorEmail: isCustomer ? userEmail : undefined
        },
      });
    } else {
      setPendingRoute(targetRoute);
      setIsPopupOpen(true);
    }
  }, [consentGiven, navigate, userName, userEmail, isCustomer]);

  const handleAccept = useCallback(() => {
    setConsentGiven(true);
    setIsPopupOpen(false);

    if (pendingRoute) {
      navigate(pendingRoute, {
        state: {
          name: userName,
          email: userEmail,
          isCustomer: isCustomer,
          estimatorEmail: isCustomer ? userEmail : undefined
        },
      });
      setPendingRoute(null);
    }
  }, [pendingRoute, navigate, userName, userEmail, isCustomer, setConsentGiven]);

  const handleOptOut = useCallback(() => {
    setIsPopupOpen(false);
    setPendingRoute(null);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.nameLabel}>
        Logged in as: <span className={styles.nameGreen}>{userName}</span>
      </div>
      <h2 className={styles.heading}>
        Welcome <span className={styles.nameGreen}>{userName}</span>.
        Please select which documents you would like to view.
      </h2>

      <div className={styles.thumbnails}>
        {forms.map((f) => (
          <motion.div
            key={f.id}
            className={`${styles.thumbnailCard} ${isCustomer && f.id === 'rental' ? styles.disabled : ''}`}
            whileHover={isCustomer && f.id === 'rental' ? {} : { scale: 1.05 }}
            whileTap={isCustomer && f.id === 'rental' ? {} : { scale: 0.95 }}
            onClick={() => handleClick(f.id)}
          >
            <img
              src={f.img}
              alt={f.label}
              className={`${styles.thumbnailImage} ${isCustomer && f.id === 'rental' ? styles.disabledImage : ''}`}
            />
            <p className={styles.thumbnailText}>{f.label}</p>
            {isCustomer && f.id === 'rental' && (
              <div className={styles.disabledOverlay}>
                Not Available
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Show estimator-only buttons */}
      {!isCustomer && (
        <div className={styles.estimatorButtons}>
          <motion.button
            className={styles.emailButton}
            onClick={() => navigate('/send-customer-email', {
              state: {
                name: userName,
                email: userEmail,
                isCustomer: false
              }
            })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className={styles.emailIcon}>✉️</span>
            Send Email to Customer
          </motion.button>

          <motion.button
            className={styles.submissionsButton}
            onClick={() => navigate('/estimator-submissions')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className={styles.submissionsIcon}>📋</span>
            Remote Submissions
          </motion.button>
        </div>
      )}

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


