import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import ConsentPopup from "../components/ConsentPopup";
import "../styles/global.css";  // Import global styles

interface DropoffFormProps {
  onSubmit: (data: any) => void;
}

export default function DropoffForm({ onSubmit }: DropoffFormProps) {
  const { register, handleSubmit } = useForm();
  const location = useLocation();
  const { name, email } = location.state || { name: '', email: '' };
  const [showConsent, setShowConsent] = useState(true);

  return (
    <div className="form-container">
      {showConsent ? (
        <ConsentPopup 
          isOpen={showConsent} 
          onAccept={() => setShowConsent(false)} 
          onDecline={() => (window.location.href = "/")} 
        />
      ) : (
        <>
          <h1>Dropoff Form</h1>
          <p>Estimator: {name}</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-group">
              <label>Name:</label>
              <input {...register("name", { required: true })} defaultValue={name} />
            </div>

            <div className="input-group">
              <label>Email:</label>
              <input type="email" {...register("email", { required: true })} defaultValue={email} />
            </div>

            <div className="input-group">
              <label>Phone:</label>
              <input type="tel" {...register("phone", { required: true })} />
            </div>

            <button type="submit" className="submit-btn">Submit</button>
          </form>
        </>
      )}
    </div>
  );
}
