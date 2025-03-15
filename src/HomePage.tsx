import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

/*
  We'll map each ID to { name, email } for placeholders.
  You can replace the name "Logan" with others for each ID if you like.
*/
const validIDs: Record<string, { name: string; email: string }> = {
  '1111': { name: 'Logan', email: 'logan@dent-source.com' },
  '2222': { name: 'Miguel', email: 'miguel@dent-source.com' },
  '3333': { name: 'Zach', email: 'zach@dent-source.com' },
  '9999': { name: 'Jerimiah', email: 'jerimiah@dent-source.com' },
  '4444': { name: 'Matthew', email: 'matt.n@dent-source.com' },
  '5555': { name: 'Kristina', email: 'kristina@dent-source.com' },
  '8310': { name: 'Anna', email: 'reception@dent-source.com' },
};

function HomePage() {
  const navigate = useNavigate();
  const [employeeID, setEmployeeID] = useState('');

  // Insert digit if we have <4
  const handleInput = (digit: string) => {
    if (employeeID.length < 4) {
      setEmployeeID((prev) => prev + digit);
    }
  };

  // Remove last digit (backspace)
  const handleBackspace = () => {
    if (employeeID.length > 0) {
      setEmployeeID((prev) => prev.slice(0, -1));
    }
  };

  // Submit once we have 4 digits and it's valid
  const handleSubmit = () => {
    // Check if employeeID is in validIDs map
    const userInfo = validIDs[employeeID];
    if (employeeID.length === 4 && userInfo) {
      console.log(`ID: ${employeeID} => Name: ${userInfo.name}, Email: ${userInfo.email}`);
      // Pass name & email in route state for the second page
      navigate('/dashboard', { state: { name: userInfo.name, email: userInfo.email } });
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

        {/*
          4x3 numpad:
          Row1: 1 2 3
          Row2: 4 5 6
          Row3: 7 8 9
          Row4: Backspace 0 Submit
        */}
        <div className={styles.numpad}>
          {/* Row 1 */}
          <motion.button
            className={styles.numpadButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleInput('1')}
          >
            1
          </motion.button>
          <motion.button
            className={styles.numpadButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleInput('2')}
          >
            2
          </motion.button>
          <motion.button
            className={styles.numpadButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleInput('3')}
          >
            3
          </motion.button>

          {/* Row 2 */}
          <motion.button
            className={styles.numpadButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleInput('4')}
          >
            4
          </motion.button>
          <motion.button
            className={styles.numpadButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleInput('5')}
          >
            5
          </motion.button>
          <motion.button
            className={styles.numpadButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleInput('6')}
          >
            6
          </motion.button>

          {/* Row 3 */}
          <motion.button
            className={styles.numpadButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleInput('7')}
          >
            7
          </motion.button>
          <motion.button
            className={styles.numpadButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleInput('8')}
          >
            8
          </motion.button>
          <motion.button
            className={styles.numpadButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleInput('9')}
          >
            9
          </motion.button>

          {/* Row 4 => [Backspace, 0, Submit] */}
          <motion.button
            className={styles.numpadButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBackspace}
          >
            ⌫
          </motion.button>
          <motion.button
            className={styles.numpadButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleInput('0')}
          >
            0
          </motion.button>
          <motion.button
            className={styles.numpadButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
          >
            ✓
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default HomePage;
