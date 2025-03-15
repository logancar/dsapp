import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import ConsentPopup from "../components/ConsentPopup";
import SignatureField from "../components/SignatureField";
import "../styles/global.css";

interface RentalFormProps {
  onSubmit: (data: any) => void;
}

export default function RentalForm({ onSubmit }: RentalFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const { name, email } = location.state || { name: '', email: '' };
  
  const [showConsent, setShowConsent] = useState(true);
  const [signature, setSignature] = useState<string | null>(null);
  
  useEffect(() => {
    const consentGiven = sessionStorage.getItem('consentGiven');
    if (consentGiven === 'true') {
      setShowConsent(false);
    }
  }, []);

  const handleConsentAccept = () => {
    sessionStorage.setItem('consentGiven', 'true');
    setShowConsent(false);
  };

  const handleSignatureSave = (signatureData: string) => {
    setSignature(signatureData);
  };

  const handleFormSubmit = (data: any) => {
    const formData = {
      ...data,
      signature: signature
    };
    
    onSubmit(formData);
  };

  return (
    <div className="form-container fade-in">
      {showConsent ? (
        <ConsentPopup 
          isOpen={showConsent} 
          onAccept={handleConsentAccept} 
          onDecline={() => navigate('/')} 
        />
      ) : (
        <>
          <div className="form-header">
            <h1>Rental Form</h1>
            <p>Complete your rental information below</p>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="form-section">
              <h3 className="form-section-title">Personal Details</h3>
              
              <div className="input-group">
                <label>Full Name</label>
                <input 
                  {...register("name", { required: "Name is required" })} 
                  defaultValue={name} 
                  placeholder="Enter your full name"
                />
                {errors.name && <span className="error-message">{errors.name.message as string}</span>}
              </div>

              <div className="form-row">
                <div className="input-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })} 
                    defaultValue={email} 
                    placeholder="your@email.com"
                  />
                  {errors.email && <span className="error-message">{errors.email.message as string}</span>}
                </div>

                <div className="input-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    {...register("phone", { 
                      required: "Phone number is required"
                    })} 
                    placeholder="(123) 456-7890"
                  />
                  {errors.phone && <span className="error-message">{errors.phone.message as string}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">Signature</h3>
              <SignatureField onSave={handleSignatureSave} />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={!signature}
            >
              Continue to Next Step
            </button>
          </form>
        </>
      )}
    </div>
  );
}
