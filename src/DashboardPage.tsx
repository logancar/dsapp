import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './DashboardPage.module.css';

// Import your local images from the assets folder:
import rentalImg from './assets/rental.jpg';
import dropoffImg from './assets/dropoff.jpg';
import pickupImg from './assets/pickup.jpg';

function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation() as any;

  // The name was passed from HomePage in route state
  const estimatorName = location.state?.name || 'Unknown';

  // We'll define an array of forms with local images
  const forms = [
    { id: 'Rental',   label: 'Rental Forms',  img: rentalImg  },
    { id: 'DropOff',  label: 'Drop-Off Forms',img: dropoffImg },
    { id: 'PickUp',   label: 'Pick-Up Forms', img: pickupImg  },
  ];

  const handleClick = (pdfName: string) => {
    navigate(`/pdf/${pdfName}`);
  };

  return (
    <div className={styles.container}>
      {/* 
        Top-left label:
        "Logged in as: " in white,
        the estimator's name in green
      */}
      <div className={styles.nameLabel}>
        Logged in as: <span className={styles.nameGreen}>{estimatorName}</span>
      </div>

      <h2 className={styles.heading}>
        Welcome <span className={styles.nameGreen}>{estimatorName}</span>. Please select which documents you would like to view.
      </h2>

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
              alt={`${form.id} thumbnail`}
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
