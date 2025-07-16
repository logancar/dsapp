import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DropoffForm from '../forms/DropoffForm';
import CCCWalkaroundForm from '../forms/CCCWalkaroundForm';
import styles from './DropOffOnlyForm.module.css';

interface DropOffOnlyFormProps {
  onSubmit: (data: any) => void;
}

interface DropoffFormData {
  // This should match the interface from DropoffForm
  [key: string]: any;
}

function DropOffOnlyForm({ onSubmit }: DropOffOnlyFormProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'form' | 'popup' | 'photos' | 'complete'>('form');
  const [formData, setFormData] = useState<DropoffFormData | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  // const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form completion - show popup instead of direct navigation
  const handleFormSubmit = (data: DropoffFormData) => {
    console.log('Drop-off form completed:', data);
    setFormData(data);
    setShowPopup(true);
    // Prevent the default redirect by intercepting here
    // Scroll to top when showing popup
    window.scrollTo(0, 0);
  };

  // Handle proceeding to photos
  const handleProceedToPhotos = () => {
    setShowPopup(false);
    setCurrentStep('photos');
    window.scrollTo(0, 0);
  };

  // Handle photo completion
  const handlePhotoSubmit = (photoData: any) => {
    console.log('Photos completed:', photoData);
    setCurrentStep('complete');

    // Bundle form and photo data
    const bundledData = {
      formData: formData,
      photoData: photoData,
      writerId: 'TEST123',
      submissionTime: new Date().toISOString(),
      submissionType: 'drop-off-only'
    };

    console.log('=== DROP-OFF ONLY SUBMISSION ===');
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

  return (
    <div className={styles.container}>
      {currentStep === 'form' && (
        <div className={styles.stepContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>Drop-Off Only</h1>
            <p className={styles.subtitle}>Complete the form below to schedule your vehicle drop-off</p>
            <button
              className={styles.backButton}
              onClick={handleBackToHub}
            >
              ← Back to Remote Hub
            </button>
          </div>

          {/* Use the existing DropoffForm component */}
          <DropoffForm onSubmit={handleFormSubmit} />
        </div>
      )}

      {/* Popup to direct user to photo session */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <div className={styles.popupIcon}>📷</div>
            <h2 className={styles.popupTitle}>Form Submitted Successfully!</h2>
            <p className={styles.popupMessage}>
              Now let's take some photos of your vehicle. You'll be guided through a 360° walkaround to capture all angles.
            </p>
            <div className={styles.popupButtons}>
              <button
                className={styles.proceedButton}
                onClick={handleProceedToPhotos}
              >
                Start Photo Session
              </button>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'photos' && (
        <div className={styles.stepContainer}>
          {/* Use the existing CCCWalkaroundForm component */}
          <CCCWalkaroundForm onSubmit={handlePhotoSubmit} />
        </div>
      )}

      {currentStep === 'complete' && (
        <div className={styles.stepContainer}>
          <div className={styles.completionContainer}>
            <div className={styles.successIcon}>✅</div>
            <h1 className={styles.successTitle}>Drop-Off Submitted Successfully!</h1>
            <p className={styles.successMessage}>
              Your drop-off request and vehicle photos have been submitted. You will be redirected shortly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DropOffOnlyForm;
