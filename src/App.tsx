// src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

// Pages & Components
import HomePage from './HomePage';
import DashboardPage from './pages/DashboardPage';
import ThanksPage from './ThanksPage';
import RentalForm from './forms/RentalForm';
import PickupForm from './forms/PickupForm';
import DropoffForm from './forms/DropoffForm';
import TestConsentPopup from './pages/TestConsentPopup';

// Context Provider
import { ConsentProvider } from './context/ConsentContext';

// Global Styles
import './styles/global.css';

function App() {
  // Handle form submission
  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data);
    localStorage.setItem('formData', JSON.stringify(data));
    window.location.href = '/thankyou'; // Direct to thank you page
  };

  return (
    <ConsentProvider>
      <div className="app-container">
        <Router>
          <div className="page-container">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/rental-form" element={<RentalForm onSubmit={handleSubmit} />} />
              <Route path="/pickup-form" element={<PickupForm onSubmit={handleSubmit} />} />
              <Route path="/dropoff-form" element={<DropoffForm onSubmit={handleSubmit} />} />
              <Route path="/thankyou" element={<ThanksPage />} />
              <Route path="/test-consent" element={<TestConsentPopup />} />
            </Routes>
          </div>
        </Router>
      </div>
    </ConsentProvider>
  );
}

export default App;




