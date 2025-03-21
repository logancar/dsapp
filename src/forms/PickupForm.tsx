// src/forms/PickupForm.tsx
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ConsentContext } from "../context/ConsentContext";
import "../styles/global.css";

interface PickupFormProps {
  onSubmit: (data: any) => void;
}

export default function PickupForm({ onSubmit }: PickupFormProps) {
  const { register, handleSubmit } = useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const { name, email } = location.state || { name: '', email: '' };
  const { consentGiven } = useContext(ConsentContext);

  // If no consent, redirect back to dashboard
  if (!consentGiven) {
    navigate("/dashboard");
    return null;
  }

  return (
    <div className="form-container">
      <h1>Pickup Form</h1>
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
    </div>
  );
}

