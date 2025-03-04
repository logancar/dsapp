// DashboardPage.tsx
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './DashboardPage.module.css';

// Suppose we want to display 3 forms with thumbnails
import rentalImg from './assets/rental.jpg';
import dropoffImg from './assets/dropoff.jpg';
import pickupImg from './assets/pickup.jpg';

function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation() as any;

  // The user’s name/email came from HomePage => Dashboard route
  const estimatorName = location.state?.name || 'Unknown';
  const estimatorEmail = location.state?.email || 'unknown@somewhere.com';

  // Our 3 forms
  const forms = [
    { id: 'Rental',   label: 'Rental Docs',  img: rentalImg  },
    { id: 'DropOff',  label: 'Drop Off Docs',img: dropoffImg },
    { id: 'PickUp',   label: 'Pick Up Docs', img: pickupImg  },
  ];

  const handleClick = (pdfName: string) => {
    // Pass the name/email so PDF page won't say "unknown"
    navigate(`/pdf/${pdfName}`, {
      state: {
        name: estimatorName,
        email: estimatorEmail,
      },
    });
  };

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
    </div>
  );
}

export default DashboardPage;
