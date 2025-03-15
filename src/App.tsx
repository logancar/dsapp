import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import DashboardPage from "./DashboardPage";
import ThanksPage from "./ThanksPage";
import RentalForm from "./forms/RentalForm";
import PickupForm from "./forms/PickupForm";
import DropoffForm from "./forms/DropoffForm";
import SignaturePage from "./pages/SignaturePage";
import "./styles/global.css"; 

function App() {
  // Handle form submission
  const handleSubmit = (data: any) => {
    console.log("Form submitted:", data);
    localStorage.setItem("formData", JSON.stringify(data));

    // Redirect to the signature page instead of cycling through forms
    window.location.href = "/signature";
  };

  return (
    <div className="app-container">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/rental-form" element={<RentalForm onSubmit={handleSubmit} />} />
          <Route path="/pickup-form" element={<PickupForm onSubmit={handleSubmit} />} />
          <Route path="/dropoff-form" element={<DropoffForm onSubmit={handleSubmit} />} />
          <Route path="/signature" element={<SignaturePage />} />
          <Route path="/thankyou" element={<ThanksPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
