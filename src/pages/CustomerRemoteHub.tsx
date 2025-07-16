import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import styles from "./CustomerRemoteHub.module.css";

function CustomerRemoteHub() {
  const navigate = useNavigate();

  const handleDropOffOnly = () => {
    navigate("/drop-off-only");
  };

  const handleDropOffWithRental = () => {
    navigate("/drop-off-with-rental");
  };

  const handleBackToLogin = () => {
    navigate("/remote-login");
  };

  return (
    <div className={styles.container}>
      <div className={styles.hubCard}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={styles.title}>Welcome to the Dent Source Remote Kiosk</h1>
          <p className={styles.subtitle}>Choose your drop-off option below to get started.</p>

          <div className={styles.optionsContainer}>
            <motion.button
              className={styles.optionButton}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDropOffOnly}
            >
              <div className={styles.buttonContent}>
                <div className={styles.buttonIcon}>🚗</div>
                <div className={styles.buttonText}>
                  <h3 className={styles.buttonTitle}>Start Drop-Off Only</h3>
                  <p className={styles.buttonDescription}>
                    Drop off your vehicle for repair services
                  </p>
                </div>
              </div>
            </motion.button>

            <motion.button
              className={styles.optionButton}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDropOffWithRental}
            >
              <div className={styles.buttonContent}>
                <div className={styles.buttonIcon}>🚗🔄</div>
                <div className={styles.buttonText}>
                  <h3 className={styles.buttonTitle}>Start Drop-Off + Rental</h3>
                  <p className={styles.buttonDescription}>
                    Drop off your vehicle and get a rental car
                  </p>
                </div>
              </div>
            </motion.button>
          </div>

          <motion.button
            className={styles.backButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackToLogin}
          >
            ← Back to Login
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default CustomerRemoteHub;
