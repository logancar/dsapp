import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

const validIDs: Record<string, string> = {
  '1111': 'logan@dent-source.com',
  '2222': 'logan@dent-source.com',
  '3333': 'logan@dent-source.com',
  '4444': 'logan@dent-source.com',
  '5555': 'logan@dent-source.com',
  '6666': 'logan@dent-source.com',
};

function HomePage() {
  const navigate = useNavigate();
  const [employeeID, setEmployeeID] = useState('');

  const handleInput = (digit: string) => {
    if (employeeID.length < 4) {
      setEmployeeID((prev) => prev + digit);
    }
  };

  const handleDelete = () => {
    setEmployeeID('');
  };

  const handleSubmit = () => {
    if (employeeID.length === 4 && validIDs[employeeID]) {
      console.log(`ID ${employeeID} is valid. Email placeholder: ${validIDs[employeeID]}`);
      // For now, just navigate to /dashboard
      navigate('/dashboard');
    } else {
      alert('Invalid 4-digit ID. Please try again.');
      setEmployeeID('');
    }
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.kiosk}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className={styles.title}>Dent Source Kiosk</h1>
        <p className={styles.subtitle}>Enter Employee ID</p>

        <input
          className={styles.input}
          type="password"
          value={employeeID}
          placeholder="****"
          readOnly
        />

        <div className={styles.numpad}>
          {[1,2,3,4,5,6,7,8,9,0].map(digit => (
            <motion.button
              key={digit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleInput(digit.toString())}
              className={styles.numpadButton}
            >
              {digit}
            </motion.button>
          ))}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.clearButton}
            onClick={handleDelete}
          >
            Clear
          </button>
          <button
            className={styles.submitButton}
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default HomePage;
