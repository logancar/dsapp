import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './WalkaroundPhotosForm.module.css';
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
  const [showSummary, setShowSummary] = useState(false);
  const [captureStartTime, setCaptureStartTime] = useState<number | null>(null);
  const [captureTime, setCaptureTime] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Count completed photos
  const completedPhotos = photoSteps.filter(step =>
    step.imageData && step.id !== 'intro' && step.id !== 'review'
  ).length;

  // Start timer when first photo is taken
  useEffect(() => {
    if (completedPhotos === 1 && captureStartTime === null) {
      setCaptureStartTime(Date.now());
    }

    if (completedPhotos > 0 && captureStartTime !== null) {
      setCaptureTime(Math.round((Date.now() - captureStartTime) / 1000));
    }
  }, [completedPhotos, captureStartTime]);

  // Track if camera has been initialized
  const [cameraInitialized, setCameraInitialized] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Track camera initialization status
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  // Initialize camera only once when component mounts and not in intro step
  useEffect(() => {
    // Only initialize camera if we're past the intro step and haven't initialized yet
    if (!isIntroStep && !cameraInitialized) {
      const initCamera = async () => {
        setIsCameraLoading(true);
        setCameraError(null);

        try {
          console.log('Initializing camera...');
          const videoElement = document.getElementById('camera-feed') as HTMLVideoElement;
          if (!videoElement) {
            console.error('Video element not found');
            setCameraError('Video element not found');
            setIsCameraLoading(false);
            return;
          }

          console.log('Requesting camera access...');

          // First try with ideal settings
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
              },
              audio: false
            });

            // Store the stream in the ref
            streamRef.current = stream;

            // Set the stream as the video source
            videoElement.srcObject = stream;

            // Add event listeners to detect when video is actually playing
            videoElement.onloadedmetadata = () => {
              console.log('Video metadata loaded, video dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
              videoElement.play().catch(e => console.error('Error playing video:', e));
            };

            videoElement.onplaying = () => {
              console.log('Video is now playing');
              // Mark camera as initialized only when video is actually playing
              setCameraInitialized(true);
              setIsCameraLoading(false);
            };

            console.log('Camera stream obtained successfully');
          } catch (error) {
            console.warn('Failed with ideal settings, trying fallback settings:', error);

            // Fallback to basic settings
            const stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false
            });

            // Store the stream in the ref
            streamRef.current = stream;

            // Set the stream as the video source
            videoElement.srcObject = stream;

            // Add event listeners to detect when video is actually playing
            videoElement.onloadedmetadata = () => {
              console.log('Video metadata loaded (fallback), video dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
              videoElement.play().catch(e => console.error('Error playing video:', e));
            };

            videoElement.onplaying = () => {
              console.log('Video is now playing (fallback)');
              // Mark camera as initialized only when video is actually playing
              setCameraInitialized(true);
              setIsCameraLoading(false);
            };

            console.log('Camera initialized with fallback settings');
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setCameraError('Unable to access camera. Please make sure you have granted camera permissions.');
          setIsCameraLoading(false);

          // Don't show alert, we'll display the error in the UI
        }
      };

      initCamera();
    }

    // Clean up function to stop camera when component unmounts
    return () => {
      if (streamRef.current) {
        console.log('Stopping camera stream...');
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => {
          console.log(`Stopping track: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
          track.stop();
        });
        streamRef.current = null;
      }
    };
  }, [isIntroStep, cameraInitialized]);

  const handleCapture = (imageData: string) => {
    const updatedSteps = [...photoSteps];
    updatedSteps[currentStepIndex] = {
      ...updatedSteps[currentStepIndex],
      imageData
    };
    setPhotoSteps(updatedSteps);

    // Automatically move to next step after capture
    if (currentStepIndex < photoSteps.length - 2) { // Don't auto-advance to review step
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File selected');
    const file = e.target.files?.[0];
    if (file) {
      console.log('Processing file:', file.name, 'type:', file.type, 'size:', file.size);

      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        console.error('Selected file is not an image');
        alert('Please select an image file');
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.error('File too large');
        alert('Image is too large. Please select an image under 10MB');
        return;
      }

      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          const imageData = event.target.result as string;
          console.log('File read successfully, data URL length:', imageData.length);

          // Validate the image data
          if (imageData === 'data:,' || imageData.length < 1000) {
            console.error('Invalid image data from file');
            alert('Could not read the selected image. Please try another image.');
            return;
          }

          handleCapture(imageData);
        }
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        alert('Error reading the selected image. Please try again.');
      };

      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
    }
  };

  const takePicture = () => {
    try {
      console.log('Taking picture...');
      const videoElement = document.getElementById('camera-feed') as HTMLVideoElement;

      // If video is not available or not playing, fall back to file input
      if (!videoElement || !videoElement.srcObject || videoElement.readyState < 2) {
        console.log('Video not ready, falling back to file input');
        console.log('Video element exists:', !!videoElement);
        console.log('Video has srcObject:', !!(videoElement && videoElement.srcObject));
        console.log('Video readyState:', videoElement?.readyState);

        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
        return;
      }

      // Log video dimensions
      console.log('Video dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);

      // Create a canvas element to capture the current video frame
      const canvas = document.createElement('canvas');

      // Make sure we have valid dimensions
      if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        console.error('Invalid video dimensions, falling back to file input');
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
        return;
      }

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      // Draw the current video frame to the canvas
      const context = canvas.getContext('2d');
      if (context) {
        // Clear the canvas first
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the video frame
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Convert the canvas to a data URL
        const imageData = canvas.toDataURL('image/jpeg', 0.9);

        // Validate the image data
        if (imageData === 'data:,' || imageData.length < 1000) {
          console.error('Invalid image data captured, falling back to file input');
          console.log('Image data:', imageData.substring(0, 100) + '...');

          if (fileInputRef.current) {
            fileInputRef.current.click();
          }
          return;
        }

        console.log('Photo captured successfully, data URL length:', imageData.length);
        handleCapture(imageData);
      } else {
        console.error('Could not get canvas context');
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      }
    } catch (error) {
      console.error('Error capturing photo:', error);

      // Fall back to file input if there's an error
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const handleSkip = () => {
    // Only allow skipping for roof and VIN/odometer steps
    if (currentStep.id === 'roof' || currentStep.id === 'vin_odometer') {
      if (currentStepIndex < photoSteps.length - 2) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        setShowSummary(true);
      }
    }
  };

  const handleRetake = (index: number) => {
    setShowSummary(false);
    setCurrentStepIndex(index);
  };

  const handleStart = () => {
    setCurrentStepIndex(1); // Move to first photo step
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

  // Render the intro screen
  if (isIntroStep) {
    return (
      <div className={styles.formContainer}>
        <h1 className={styles.centerHeading}>Vehicle Walkaround Photos</h1>
        <div className={styles.introContainer}>
          <h2>{currentStep.title}</h2>
          <p>{currentStep.instruction}</p>
          <button
            className={styles.startButton}
            onClick={handleStart}
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  // Render the summary screen
  if (showSummary) {
    return (
      <div className={styles.formContainer}>
        <h1 className={styles.centerHeading}>Vehicle Walkaround Photos</h1>

        <div className={styles.summaryContainer}>
          <h2 className={styles.summaryTitle}>
            Wow! That was fast.
          </h2>
          <p className={styles.summaryText}>
            You captured {completedPhotos} photos
            {captureTime ? ` in ${captureTime} seconds` : ''}.
          </p>

          <div className={styles.photoGrid}>
            {photoSteps.slice(1, -1).map((step, index) => (
              <div key={step.id} className={styles.photoGridItem}>
                {step.imageData ? (
                  <img
                    src={step.imageData}
                    alt={step.title}
                    className={styles.thumbnailImage}
                    onClick={() => handleRetake(index + 1)}
                  />
                ) : (
                  <div
                    className={styles.missingPhoto}
                    onClick={() => handleRetake(index + 1)}
                  >
                    <span className={styles.cameraIcon}>📷</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            className={styles.submitButton}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Done'}
          </button>
        </div>
      </div>
    );
  }

  // Render the camera view
  return (
    <div className={styles.cameraContainer}>
      {/* Thumbnail strip at the top */}
      <div className={styles.thumbnailStrip}>
        <span className={styles.photoCount}>{completedPhotos} Photos</span>
        {photoSteps.slice(1, currentStepIndex).map((step, index) => (
          step.imageData && (
            <img
              key={step.id}
              src={step.imageData}
              alt={step.title}
              className={styles.stripThumbnail}
              onClick={() => handleRetake(index + 1)}
            />
          )
        ))}
      </div>

      {/* Camera view */}
      <div className={styles.cameraView}>
        {/* Video element for camera feed */}
        <video
          id="camera-feed"
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
            display: cameraError ? 'none' : 'block'
          }}
        ></video>

        {/* Camera loading state */}
        {isCameraLoading && !cameraError && (
          <div className={styles.cameraLoadingOverlay}>
            <div className={styles.cameraLoadingSpinner}></div>
            <p className={styles.cameraLoadingText}>Accessing camera...</p>
          </div>
        )}

        {/* Camera error state */}
        {cameraError && (
          <div className={styles.cameraErrorOverlay}>
            <div className={styles.cameraErrorIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 9L9 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 9L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className={styles.cameraErrorText}>{cameraError}</p>
            <p className={styles.cameraErrorSubtext}>Tap the button below to use your photo gallery instead</p>
            <div className={styles.cameraErrorButtons}>
              <button
                className={styles.cameraErrorButton}
                onClick={() => {
                  // Reset camera error and try again
                  setCameraError(null);
                  setCameraInitialized(false);
                }}
              >
                Try Camera Again
              </button>
              <button
                className={styles.cameraErrorButton}
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute('capture');
                    fileInputRef.current.click();
                  }
                }}
              >
                Use Gallery
              </button>
            </div>
          </div>
        )}

        {/* Targeting overlay - only show when camera is working */}
        {!cameraError && !isCameraLoading && (
          <div className={styles.targetOverlay}>
            <div className={styles.targetBox}></div>
          </div>
        )}

        {/* Step title at the bottom */}
        <div className={styles.stepTitle}>
          {currentStep.title}
        </div>
      </div>

      {/* Review button - fixed position at top right */}
      <button
        className={styles.reviewButton}
        onClick={() => setShowSummary(true)}
      >
        Review All
      </button>

      {/* Camera controls */}
      <div className={styles.cameraControls}>
        {/* Skip button (only for optional steps) */}
        {(currentStep.id === 'roof' || currentStep.id === 'vin_odometer') && (
          <button
            className={styles.skipButton}
            onClick={handleSkip}
          >
            Skip
          </button>
        )}

        {/* Gallery button */}
        <button
          className={styles.galleryButton}
          onClick={() => {
            if (fileInputRef.current) {
              // Remove the capture attribute to open gallery
              fileInputRef.current.removeAttribute('capture');
              fileInputRef.current.click();
            }
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="white" strokeWidth="2"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="white"/>
            <path d="M6 16L8 14L10 16L14 12L18 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Hidden file input */}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />

        {/* Capture button */}
        <button
          className={styles.captureButton}
          onClick={takePicture}
        >
          <div className={styles.captureButtonInner}></div>
        </button>
      </div>

      {/* Next step instruction */}
      <div className={styles.nextStepInstruction}>
        <div className={styles.walkIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4C13.1046 4 14 3.10457 14 2C14 0.89543 13.1046 0 12 0C10.8954 0 10 0.89543 10 2C10 3.10457 10.8954 4 12 4Z" fill="white"/>
            <path d="M15 22L13 18L15 14L11 15L9 22M15 22H9M15 22L17 10L13 8M9 22L7 10L11 8M13 8L12 7L11 8M13 8L11 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className={styles.instructionText}>
          <div className={styles.walkToText}>walk to the</div>
          <div className={styles.nextStepTitle}>
            {currentStepIndex < photoSteps.length - 2
              ? photoSteps[currentStepIndex + 1].title
              : 'FINISH'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkaroundPhotosForm;
