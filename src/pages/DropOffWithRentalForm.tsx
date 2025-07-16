import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DropoffForm from '../forms/DropoffForm';
import RentalAgreementForm from '../components/RentalAgreementForm';
import CCCWalkaroundForm from '../forms/CCCWalkaroundForm';
import styles from './DropOffWithRentalForm.module.css';

interface DropOffWithRentalFormProps {
  onSubmit: (data: any) => void;
}

interface DropoffFormData {
  [key: string]: any;
}

interface RentalAgreementData {
  photoId: File | null;
  cardInfo?: {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardholderName?: string;
  };
  agreementAccepted: boolean;
  signature: string;
}

function DropOffWithRentalForm({ onSubmit }: DropOffWithRentalFormProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'form' | 'popup' | 'rental' | 'photos' | 'complete'>('form');
  const [formData, setFormData] = useState<DropoffFormData | null>(null);
  const [rentalData, setRentalData] = useState<RentalAgreementData | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [rentalFormValid, setRentalFormValid] = useState(false);
  // const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form completion - show popup instead of direct navigation
  const handleFormSubmit = (data: DropoffFormData) => {
    console.log('Drop-off form completed:', data);
    setFormData(data);
    setShowPopup(true);
    window.scrollTo(0, 0);
  };

  // Handle proceeding to rental agreement
  const handleProceedToRental = () => {
    setShowPopup(false);
    setCurrentStep('rental');
    window.scrollTo(0, 0);
  };

  // Handle rental agreement completion
  const handleRentalComplete = (data: RentalAgreementData) => {
    setRentalData(data);
  };

  // Handle rental form validation
  const handleRentalValidation = (isValid: boolean) => {
    setRentalFormValid(isValid);
  };

  // Handle proceeding to photos
  const handleProceedToPhotos = () => {
    if (!rentalFormValid) {
      alert('Please complete all required rental agreement fields before proceeding.');
      return;
    }
    setCurrentStep('photos');
    window.scrollTo(0, 0);
  };

  // Handle photo completion
  const handlePhotoSubmit = (photoData: any) => {
    console.log('Photos completed:', photoData);
    setCurrentStep('complete');
    
    // Bundle all data together
    const bundledData = {
      formData: formData,
      rentalData: rentalData,
      photoData: photoData,
      writerId: 'TEST123',
      submissionTime: new Date().toISOString(),
      submissionType: 'drop-off-with-rental'
    };

    console.log('=== DROP-OFF + RENTAL SUBMISSION ===');
    console.log('Complete bundled data:', bundledData);
    
    // Call the original onSubmit callback
    onSubmit(bundledData);
    
    // Redirect to thank you page after a delay
    setTimeout(() => {
      navigate('/thankyou');
    }, 3000);
  };

  // Handle back to remote hub
  const handleBackToHub = () => {
    navigate('/remote-hub');
  };

  // Handle back to form
  const handleBackToForm = () => {
    setCurrentStep('form');
    window.scrollTo(0, 0);
  };

  return (
    <div className={styles.container}>
      {currentStep === 'form' && (
        <div className={styles.stepContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>Drop-Off + Rental</h1>
            <p className={styles.subtitle}>Complete the form below to schedule your vehicle drop-off and rental</p>
            <button 
              className={styles.backButton}
              onClick={handleBackToHub}
            >
              ← Back to Remote Hub
            </button>
          </div>
          
          <DropoffForm onSubmit={handleFormSubmit} />
        </div>
      )}

      {/* Popup to direct user to rental agreement */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <div className={styles.popupIcon}>🚗🔄</div>
            <h2 className={styles.popupTitle}>Form Submitted Successfully!</h2>
            <p className={styles.popupMessage}>
              Now let's set up your rental agreement. You'll need to upload your photo ID and agree to the rental terms.
            </p>
            <div className={styles.popupButtons}>
              <button
                className={styles.proceedButton}
                onClick={handleProceedToRental}
              >
                Continue to Rental Agreement
              </button>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'rental' && (
        <div className={styles.stepContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>Rental Agreement</h1>
            <p className={styles.subtitle}>Complete the rental requirements below</p>
            <button 
              className={styles.backButton}
              onClick={handleBackToForm}
            >
              ← Back to Form
            </button>
          </div>

          <RentalAgreementForm 
            onComplete={handleRentalComplete}
            onValidationChange={handleRentalValidation}
          />

          <div className={styles.submitSection}>
            <button
              className={`${styles.proceedButton} ${!rentalFormValid ? styles.disabled : ''}`}
              disabled={!rentalFormValid}
              onClick={handleProceedToPhotos}
            >
              Continue to Vehicle Photos
            </button>
          </div>
        </div>
      )}

      {currentStep === 'photos' && (
        <div className={styles.stepContainer}>
          <CCCWalkaroundForm onSubmit={handlePhotoSubmit} />
        </div>
      )}

      {currentStep === 'complete' && (
        <div className={styles.stepContainer}>
          <div className={styles.completionContainer}>
            <div className={styles.successIcon}>✅</div>
            <h1 className={styles.successTitle}>Drop-Off + Rental Submitted Successfully!</h1>
            <p className={styles.successMessage}>
              Your drop-off request, rental agreement, and vehicle photos have been submitted. You will be redirected shortly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DropOffWithRentalForm;
