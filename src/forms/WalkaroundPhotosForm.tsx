import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './WalkaroundPhotosForm.module.css';
import CameraCapture from '../components/CameraCapture';
import { submitForm } from '../services/api';

interface LocationState {
  name?: string;
  email?: string;
  isCustomer?: boolean;
  estimatorEmail?: string;
}

interface PhotoStep {
  id: string;
  title: string;
  instruction: string;
  imageData?: string;
}

const PHOTO_STEPS: PhotoStep[] = [
  {
    id: 'intro',
    title: 'Welcome',
    instruction: "Let's begin a quick walkaround of your vehicle. We'll guide you step-by-step to take clear photos from all angles. Tap \"Start\" when you're ready."
  },
  {
    id: 'front',
    title: 'FRONT',
    instruction: 'Take a photo of the FRONT of your vehicle. Stand directly in front of the bumper and capture the whole view.'
  },
  {
    id: 'left_front',
    title: 'LEFT FRONT',
    instruction: 'Take a photo of the LEFT FRONT corner. Angle the shot to capture both the front and left side.'
  },
  {
    id: 'left_fender',
    title: 'LEFT FENDER',
    instruction: 'Take a photo of the LEFT FENDER. Focus on the area above the front left wheel.'
  },
  {
    id: 'left_side',
    title: 'LEFT SIDE',
    instruction: 'Take a full side view of the LEFT SIDE. Make sure the entire side is visible in the frame.'
  },
  {
    id: 'left_quarter_panel',
    title: 'LEFT QUARTER PANEL',
    instruction: 'Take a photo of the LEFT QUARTER PANEL. This is the area above the rear left wheel.'
  },
  {
    id: 'left_rear',
    title: 'LEFT REAR',
    instruction: 'Take a photo of the LEFT REAR corner. Stand at an angle showing both the rear and left side.'
  },
  {
    id: 'rear',
    title: 'REAR',
    instruction: 'Take a clear photo of the REAR of your vehicle. Make sure the tailgate/trunk and bumper are visible.'
  },
  {
    id: 'right_rear',
    title: 'RIGHT REAR',
    instruction: 'Take a photo of the RIGHT REAR corner. Show both the back and right side.'
  },
  {
    id: 'right_quarter_panel',
    title: 'RIGHT QUARTER PANEL',
    instruction: 'Take a photo of the RIGHT QUARTER PANEL. Focus on the area above the rear right wheel.'
  },
  {
    id: 'right_side',
    title: 'RIGHT SIDE',
    instruction: 'Take a full side view of the RIGHT SIDE. Capture the entire passenger side of the vehicle.'
  },
  {
    id: 'right_fender',
    title: 'RIGHT FENDER',
    instruction: 'Take a photo of the RIGHT FENDER. This is the area above the front right wheel.'
  },
  {
    id: 'right_front',
    title: 'RIGHT FRONT',
    instruction: 'Take a photo of the RIGHT FRONT corner. Angle the camera to show both the front and right side.'
  },
  {
    id: 'roof',
    title: 'ROOF',
    instruction: "Take a photo of the ROOF if possible. If not safely reachable, tap \"Skip\"."
  },
  {
    id: 'vin_odometer',
    title: 'VIN or ODOMETER',
    instruction: 'Take a close-up of the VIN or ODOMETER. Use the zoom if needed. Skip if not available.'
  },
  {
    id: 'review',
    title: 'Review Photos',
    instruction: "You've completed the walkaround! Please review your photos below. You can retake any before submitting."
  }
];

const WalkaroundPhotosForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [photoSteps, setPhotoSteps] = useState<PhotoStep[]>(PHOTO_STEPS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const locationState = location.state as LocationState;

  const isCustomer = locationState?.isCustomer || false;
  const userName = locationState?.name || 'Unknown';
  // For customers, use the linked estimator's email for form submissions
  const userEmail = isCustomer
    ? locationState?.estimatorEmail || 'info@autohail.group'
    : locationState?.email || 'info@autohail.group';

  const currentStep = photoSteps[currentStepIndex];
  const isIntroStep = currentStepIndex === 0;
  const isReviewStep = currentStepIndex === photoSteps.length - 1;
  const isPhotoStep = !isIntroStep && !isReviewStep;
  const progress = (currentStepIndex / (photoSteps.length - 1)) * 100;

  const handleCapture = (imageData: string) => {
    const updatedSteps = [...photoSteps];
    updatedSteps[currentStepIndex] = {
      ...updatedSteps[currentStepIndex],
      imageData
    };
    setPhotoSteps(updatedSteps);
  };

  const handleNext = () => {
    if (isPhotoStep && !currentStep.imageData) {
      // If this is a photo step and no image has been captured, show an alert
      alert('Please take a photo before proceeding.');
      return;
    }

    if (currentStepIndex < photoSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSkip = () => {
    // Only allow skipping for roof and VIN/odometer steps
    if (currentStep.id === 'roof' || currentStep.id === 'vin_odometer') {
      handleNext();
    }
  };

  const handleRetake = (index: number) => {
    const updatedSteps = [...photoSteps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      imageData: undefined
    };
    setPhotoSteps(updatedSteps);

    // If we're in review mode, navigate to the step to retake
    if (isReviewStep) {
      setCurrentStepIndex(index);
    }
  };

  const handleSubmit = async () => {
    // Check if all required photos have been taken
    const missingPhotos = photoSteps.slice(1, -1).filter(step => {
      // Roof and VIN/odometer are optional
      if (step.id === 'roof' || step.id === 'vin_odometer') {
        return false;
      }
      return !step.imageData;
    });

    if (missingPhotos.length > 0) {
      alert(`Please take all required photos before submitting. Missing: ${missingPhotos.map(p => p.title).join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a loading overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      overlay.style.display = 'flex';
      overlay.style.flexDirection = 'column';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.zIndex = '9999';
      overlay.innerHTML = `
        <div style="color: white; font-size: 24px; margin-bottom: 20px;">Submitting photos...</div>
        <div style="width: 50px; height: 50px; border: 5px solid #3BB554; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
      `;

      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;

      document.head.appendChild(style);
      document.body.appendChild(overlay);

      // Prepare the form data
      const formData: Record<string, any> = {
        userName,
        userEmail,
        isCustomer,
        submittedAt: new Date().toISOString(),
      };

      // If this is a customer, add their email to the form data
      // so they can receive a copy of the photos
      if (isCustomer && locationState?.email) {
        formData.email = locationState.email;
      }

      // Add each photo with its ID as the key
      photoSteps.forEach(step => {
        if (step.imageData && step.id !== 'intro' && step.id !== 'review') {
          formData[`photo_${step.id}`] = step.imageData;
        }
      });

      // Submit the form - for customers, use the estimator's email
      // for the PDF to be sent to the estimator
      const result = await submitForm(
        formData,
        'walkaround',
        userEmail
      );

      if (result.success) {
        console.log('Photos submitted successfully');
        onSubmit(formData);

        // Redirect after a delay
        setTimeout(() => {
          window.location.href = '/thankyou';
        }, 1000);
      } else {
        console.error('Photo submission failed:', result.message);
        alert('Failed to submit photos. Please try again.');

        // Remove overlay
        document.body.removeChild(overlay);
        document.head.removeChild(style);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error submitting photos:', error);
      alert('Error submitting photos. Please try again.');
      setIsSubmitting(false);
    }
  };

  const renderIntroStep = () => (
    <div className={styles.stepContainer}>
      <div className={styles.instructionBox}>
        <h3 className={styles.instructionTitle}>{currentStep.title}</h3>
        <p className={styles.instructionText}>{currentStep.instruction}</p>
      </div>
      <div className={styles.buttonContainer}>
        <button
          className={`${styles.button} ${styles.primaryButton}`}
          onClick={handleNext}
        >
          Start
        </button>
      </div>
    </div>
  );

  const renderPhotoStep = () => (
    <div className={styles.stepContainer}>
      <div className={styles.instructionBox}>
        <h3 className={styles.instructionTitle}>{currentStep.title}</h3>
        <p className={styles.instructionText}>{currentStep.instruction}</p>
      </div>

      <CameraCapture
        onCapture={handleCapture}
        capturedImage={currentStep.imageData}
      />

      <div className={styles.buttonContainer}>
        <button
          className={`${styles.button} ${styles.secondaryButton}`}
          onClick={handlePrevious}
          disabled={isSubmitting}
        >
          Back
        </button>

        {(currentStep.id === 'roof' || currentStep.id === 'vin_odometer') && (
          <button
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Skip
          </button>
        )}

        {currentStep.imageData ? (
          <button
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={() => handleRetake(currentStepIndex)}
            disabled={isSubmitting}
          >
            Retake
          </button>
        ) : null}

        <button
          className={`${styles.button} ${styles.primaryButton} ${!currentStep.imageData && !(currentStep.id === 'roof' || currentStep.id === 'vin_odometer') ? styles.disabled : ''}`}
          onClick={handleNext}
          disabled={!currentStep.imageData && !(currentStep.id === 'roof' || currentStep.id === 'vin_odometer') || isSubmitting}
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className={styles.stepContainer}>
      <div className={styles.instructionBox}>
        <h3 className={styles.instructionTitle}>{currentStep.title}</h3>
        <p className={styles.instructionText}>{currentStep.instruction}</p>
      </div>

      <div className={styles.reviewGrid}>
        {photoSteps.slice(1, -1).map((step, index) => (
          <div key={step.id} className={styles.reviewItem}>
            {step.imageData ? (
              <>
                <img
                  src={step.imageData}
                  alt={step.title}
                  className={styles.reviewImage}
                />
                <div className={styles.reviewLabel}>{step.title}</div>
                <button
                  className={styles.retakeButton}
                  onClick={() => handleRetake(index + 1)}
                  disabled={isSubmitting}
                >
                  ↺
                </button>
              </>
            ) : (
              <div
                className={styles.reviewImage}
                style={{
                  backgroundColor: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  padding: '1rem',
                  textAlign: 'center'
                }}
                onClick={() => setCurrentStepIndex(index + 1)}
              >
                <div>{step.title}</div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  {step.id === 'roof' || step.id === 'vin_odometer' ? 'Optional' : 'Missing'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.buttonContainer}>
        <button
          className={`${styles.button} ${styles.secondaryButton}`}
          onClick={handlePrevious}
          disabled={isSubmitting}
        >
          Back
        </button>
        <button
          className={`${styles.button} ${styles.primaryButton}`}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit All Photos'}
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.centerHeading}>Vehicle Walkaround Photos</h1>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {isIntroStep && renderIntroStep()}
      {isPhotoStep && renderPhotoStep()}
      {isReviewStep && renderReviewStep()}
    </div>
  );
};

export default WalkaroundPhotosForm;
