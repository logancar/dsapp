import { motion } from 'framer-motion';
import { useState } from 'react';
import styles from './HomePage.module.css';

interface HomePageProps {
  onIdSubmit: (id: string) => void;
}

function HomePage({ onIdSubmit }: HomePageProps) {
  const [employeeID, setEmployeeID] = useState('');

  // Append a digit unless we already have 4
  const handleInput = (digit: string) => {
    if (employeeID.length < 4) {
      setEmployeeID((prev) => prev + digit);
    }
  };

  // Clear the entire employeeID (or do backspacing if you want)
  const handleDelete = () => {
    setEmployeeID('');
  };

  // Submit once we have 4 digits
  const handleSubmit = () => {
    if (employeeID.length === 4) {
      onIdSubmit(employeeID);
      setEmployeeID(''); // reset if needed
    } else {
      alert('Please enter a 4-digit ID first.');
    }
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
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
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
          <button
            key={digit}
            onClick={() => handleInput(digit.toString())}
            className={styles.numpadButton}
          >
            {digit}
          </button>
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
  );
}

export default HomePage;
