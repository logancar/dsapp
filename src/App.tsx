import { useState } from 'react';
import HomePage from './HomePage'; // import your new component
import styles from './App.module.css'; // optional if you have global container style

function App() {
  const [validated, setValidated] = useState(false);
  const [employeeID, setEmployeeID] = useState('');

  // Called when HomePage has a valid 4-digit code
  const handleIdSubmit = (id: string) => {
    console.log('Employee ID submitted:', id);
    setEmployeeID(id);
    setValidated(true);
  };

  if (!validated) {
    return <HomePage onIdSubmit={handleIdSubmit} />;
  }

  // If validated, show next screen or kiosk content
  return (
    <div className={styles.container}>
      <h2>Welcome, employee #{employeeID}!</h2>
      <p>This is the next kiosk screen (placeholder).</p>
    </div>
  );
}

export default App;
