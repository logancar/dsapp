import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";

/*
  We'll map each ID to { name, email } for placeholders.
  You can replace the name "Logan" with others for each ID if you like.
*/
const validIDs: Record<string, { name: string; email: string }> = {
  "1111": { name: "Logan", email: "logan@dent-source.com" },
  "2222": { name: "Miguel", email: "miguel@dent-source.com" },
  "3333": { name: "Zach", email: "zach@dent-source.com" },
  "9999": { name: "Jerimiah", email: "jerimiah@dent-source.com" },
  "4444": { name: "Matthew", email: "matt.n@dent-source.com" },
  "5555": { name: "Kristina", email: "kristina@dent-source.com" },
  "8310": { name: "Anna", email: "reception@dent-source.com" },
};

function HomePage() {
  const navigate = useNavigate();
  const [employeeID, setEmployeeID] = useState("");

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
      navigate("/dashboard", { state: { name: userInfo.name, email: userInfo.email } });
    } else {
      alert("Invalid 4-digit ID. Please try again.");
      setEmployeeID("");
    }
  };

  // Create a reusable NumpadButton component
  const NumpadButton = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => (
    <motion.button
      className={styles.numpadButton}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );

  return (
    <div className={styles.container}>
      <div className={styles.kiosk}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={styles.title}>Dent Source Kiosk</h1>
          <p className={styles.subtitle}>Enter Employee ID</p>

          <input
            className={styles.input} /* or styles.inputDisplay if your CSS uses that name */
            type="password"
            value={employeeID}
            placeholder="****"
            readOnly
          />

          <div className={styles.numpad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <NumpadButton key={num} onClick={() => handleInput(num.toString())}>
                {num}
              </NumpadButton>
            ))}
            <NumpadButton onClick={handleBackspace}>⌫</NumpadButton>
            <NumpadButton onClick={() => handleInput("0")}>0</NumpadButton>
            <NumpadButton onClick={handleSubmit}>✓</NumpadButton>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default HomePage;
