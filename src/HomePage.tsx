import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HomePage.module.css";

/*
  We'll map each ID to { name, email } for placeholders.
  You can replace the name "Logan" with others for each ID if you like.
*/
const validIDs: Record<string, { name: string; email: string }> = {
  "1111": { name: "Logan", email: "logan@autohail.group" },
  "2222": { name: "Miguel", email: "miguel@autohail.group" },
  "3333": { name: "Zach", email: "zach@autohail.group" },
  "9999": { name: "Lindsey", email: "lindsey@autohail.group" },
  "4444": { name: "Matthew", email: "matt.n@autohail.group" },
  "5555": { name: "Lindsey", email: "lindsey@autohail.group" },
  "8310": { name: "Receptionist", email: "receptionist@autohail.group" },
  "3015": { name: "Bobbi", email: "bobbi@autohail.group" },
  "2540": { name: "Torry", email: "torry@autohail.group" },
};

function HomePage() {
  const navigate = useNavigate();
  const [employeeID, setEmployeeID] = useState("");
  const [showCustomerLogin, setShowCustomerLogin] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    loginCode: ""
  });

  // Insert digit if we have <4
  const handleInput = (digit: string) => {
    if (employeeID.length < 4) {
      const newID = employeeID + digit;
      setEmployeeID(newID);

      // Auto-submit when we reach 4 digits
      if (newID.length === 4) {
        const userInfo = validIDs[newID];
        if (userInfo) {
          handleSubmit(newID);
        }
      }
    }
  };

  // Remove last digit (backspace)
  const handleBackspace = () => {
    if (employeeID.length > 0) {
      setEmployeeID((prev) => prev.slice(0, -1));
    }
  };

  // Handle keyboard input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault(); // Prevent default behavior

    // Handle numeric keys (0-9)
    if (/^[0-9]$/.test(e.key)) {
      handleInput(e.key);
    }
    // Handle backspace
    else if (e.key === 'Backspace') {
      handleBackspace();
    }
    // Handle Enter key
    else if (e.key === 'Enter') {
      handleSubmit(employeeID);
    }
  };

  // Submit once we have 4 digits and it's valid
  const handleSubmit = (id: string = employeeID) => {
    // Check if employeeID is in validIDs map
    const userInfo = validIDs[id];
    if (id.length === 4 && userInfo) {
      console.log(`ID: ${id} => Name: ${userInfo.name}, Email: ${userInfo.email}`);
      // Pass name & email in route state for the second page
      navigate("/dashboard", { state: { name: userInfo.name, email: userInfo.email } });
    } else {
      alert("Invalid 4-digit ID. Please try again.");
      setEmployeeID("");
    }
  };

  // Handle customer login form input changes
  const handleCustomerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Map estimator codes to their emails
  const estimatorCodes: Record<string, string> = {
    "DSMIGUEL": "miguel@autohail.group",
    "DSMATTHEW": "matt.n@autohail.group",
    "DSZACH": "zach@autohail.group",
    "DSLOGAN": "logan@autohail.group",
    "DSLINDSEY": "lindsey@autohail.group",
    "DSRECEPTIONIST": "receptionist@autohail.group",
    // Keep the original code as a fallback that goes to Logan
    "DENTSOURCE": "logan@autohail.group"
  };

  // Handle customer login submission
  const handleCustomerLogin = () => {
    const { firstName, lastName, email, loginCode } = customerInfo;

    // Basic validation
    if (!firstName || !lastName || !email || !loginCode) {
      alert("Please fill in all fields");
      return;
    }

    // Check if login code is valid (matches an estimator code)
    const estimatorEmail = estimatorCodes[loginCode.toUpperCase()];
    if (estimatorEmail) {
      // Navigate to dashboard with customer info and linked estimator
      navigate("/dashboard", {
        state: {
          name: `${firstName} ${lastName}`,
          email: email,
          isCustomer: true,
          estimatorEmail: estimatorEmail
        }
      });
    } else {
      alert("Invalid login code. Please try again.");
    }
  };

  // Toggle customer login modal
  const toggleCustomerLogin = () => {
    setShowCustomerLogin(prev => !prev);
    // Reset form when opening
    if (!showCustomerLogin) {
      setCustomerInfo({
        firstName: "",
        lastName: "",
        email: "",
        loginCode: ""
      });
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
            className={styles.input}
            type="password"
            value={employeeID}
            placeholder="****"
            onKeyDown={handleKeyDown}
            autoFocus
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

          <motion.button
            className={styles.customerLoginButton}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleCustomerLogin}
          >
            Customer Login
          </motion.button>
        </motion.div>
      </div>

      {/* Customer Login Modal */}
      {showCustomerLogin && (
        <div className={styles.modalOverlay}>
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className={styles.modalTitle}>Customer Login</h2>

            <div className={styles.formGroup}>
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={customerInfo.firstName}
                onChange={handleCustomerInputChange}
                className={styles.modalInput}
                autoComplete="off"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={customerInfo.lastName}
                onChange={handleCustomerInputChange}
                className={styles.modalInput}
                autoComplete="off"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={customerInfo.email}
                onChange={handleCustomerInputChange}
                className={styles.modalInput}
                autoComplete="off"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="loginCode">Login Code</label>
              <input
                type="password"
                id="loginCode"
                name="loginCode"
                value={customerInfo.loginCode}
                onChange={handleCustomerInputChange}
                className={styles.modalInput}
                autoComplete="off"
              />
            </div>

            <div className={styles.modalButtons}>
              <motion.button
                className={styles.cancelButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleCustomerLogin}
              >
                Cancel
              </motion.button>

              <motion.button
                className={styles.loginButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCustomerLogin}
              >
                Login
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
