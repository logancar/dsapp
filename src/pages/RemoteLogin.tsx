import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./RemoteLogin.module.css";

function RemoteLogin() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Testing login codes
    const validTestCodes = [
      "TEST01", // General testing code
      "DEMO01", // Demo code
      "123456", // Simple numeric code
      "REMOTE"  // Easy to remember code
    ];

    // Check if the entered code is valid
    if (validTestCodes.includes(code.toUpperCase()) || code.length >= 6) {
      // Navigate to remote hub on successful login
      navigate("/remote-hub");
    } else {
      alert("Please enter a valid login code. Try: TEST01, DEMO01, 123456, or REMOTE");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={styles.title}>Dent Source Remote Drop-Off</h1>
          <p className={styles.subtitle}>Enter your login code to continue</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label htmlFor="code" className={styles.label}>
              Login Code:
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={handleInputChange}
              maxLength={10}
              className={styles.input}
              placeholder="Enter login code"
              autoComplete="off"
              required
            />
            <motion.button
              type="submit"
              className={styles.submitButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue
            </motion.button>
          </form>

          <motion.button
            className={styles.backButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
          >
            ← Back to Main Login
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default RemoteLogin;
