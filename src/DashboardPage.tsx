import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardPage.module.css';

// Import your images from src/assets
import dropoffImg from './assets/dropoff.jpg';
import rentalImg from './assets/rental.jpg';
import pickupImg from './assets/pickup.jpg';

function DashboardPage() {
  const navigate = useNavigate();

  // This function runs when a thumbnail is clicked
  const handleClick = (pdfName: string) => {
    navigate(`/pdf/${pdfName}`);
  };

  // Define your three forms with their images
  const forms = [
    { id: 'Rental',  img: rentalImg,  label: 'Rental'  },
    { id: 'Dropoff', img: dropoffImg, label: 'Drop Off' },
    { id: 'Pickup',  img: pickupImg,  label: 'Pick Up'  },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Select a Form</h2>
      <div className={styles.thumbnails}>
        {forms.map((form) => (
          <motion.div
            key={form.id}
            className={styles.thumbnailCard}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleClick(form.id)}
          >
            <img
              src={form.img}
              alt={`${form.label} thumbnail`}
              className={styles.thumbnailImage}
            />
            <p className={styles.thumbnailText}>{form.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
