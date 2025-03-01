import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardPage.module.css';

function DashboardPage() {
  const navigate = useNavigate();

  // On thumbnail click, navigate to PDF with name param
  const handleClick = (pdfName: string) => {
    navigate(`/pdf/${pdfName}`);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Select a Form</h2>
      <div className={styles.thumbnails}>
        {['FormA','FormB','FormC'].map((pdfName) => (
          <motion.div
            key={pdfName}
            className={styles.thumbnailCard}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleClick(pdfName)}
          >
            <img
              src="https://via.placeholder.com/150"
              alt={`${pdfName} thumbnail`}
              className={styles.thumbnailImage}
            />
            <p className={styles.thumbnailText}>{pdfName}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
