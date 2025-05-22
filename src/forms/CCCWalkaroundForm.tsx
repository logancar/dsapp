import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './CCCWalkaroundForm.module.css';
import { submitForm } from '../services/api';
import { compressImages } from '../utils/imageCompression';

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
  overlayType: 'front' | 'corner' | 'side' | 'rear' | 'roof' | 'detail' | 'none';
  imageData?: string;
}

// Define the steps for the walkaround process
const PHOTO_STEPS: PhotoStep[] = [
  {
    id: 'intro',
    title: 'Welcome',
    instruction: "Let's begin a 360° walkaround of your vehicle. We'll guide you step-by-step to take clear photos from all angles. Tap \"Start\" when you're ready.",
    overlayType: 'none'
  },
  {
    id: 'front',
    title: 'FRONT',
    instruction: 'Take a photo of the FRONT of your vehicle. Stand directly in front of the bumper and capture the whole view.',
    overlayType: 'front'
  },
  {
    id: 'left_front',
    title: 'LEFT FRONT',
    instruction: 'Take a photo of the LEFT FRONT corner. Angle the shot to capture both the front and left side.',
    overlayType: 'corner'
  },
  {
    id: 'left_fender',
    title: 'LEFT FENDER',
    instruction: 'Take a photo of the LEFT FENDER. Focus on the area above the front left wheel.',
    overlayType: 'detail'
  },
  {
    id: 'left_side',
    title: 'LEFT SIDE',
    instruction: 'Take a full side view of the LEFT SIDE. Make sure the entire side is visible in the frame.',
    overlayType: 'side'
  },
  {
    id: 'left_quarter_panel',
    title: 'LEFT QUARTER PANEL',
    instruction: 'Take a photo of the LEFT QUARTER PANEL. This is the area above the rear left wheel.',
    overlayType: 'detail'
  },
  {
    id: 'left_rear',
    title: 'LEFT REAR',
    instruction: 'Take a photo of the LEFT REAR corner. Stand at an angle showing both the rear and left side.',
    overlayType: 'corner'
  },
  {
    id: 'rear',
    title: 'REAR',
    instruction: 'Take a clear photo of the REAR of your vehicle. Make sure the tailgate/trunk and bumper are visible.',
    overlayType: 'rear'
  },
  {
    id: 'right_rear',
    title: 'RIGHT REAR',
    instruction: 'Take a photo of the RIGHT REAR corner. Show both the back and right side.',
    overlayType: 'corner'
  },
  {
    id: 'right_quarter_panel',
    title: 'RIGHT QUARTER PANEL',
    instruction: 'Take a photo of the RIGHT QUARTER PANEL. Focus on the area above the rear right wheel.',
    overlayType: 'detail'
  },
  {
    id: 'right_side',
    title: 'RIGHT SIDE',
    instruction: 'Take a full side view of the RIGHT SIDE. Capture the entire passenger side of the vehicle.',
    overlayType: 'side'
  },
  {
    id: 'right_fender',
    title: 'RIGHT FENDER',
    instruction: 'Take a photo of the RIGHT FENDER. This is the area above the front right wheel.',
    overlayType: 'detail'
  },
  {
    id: 'right_front',
    title: 'RIGHT FRONT',
    instruction: 'Take a photo of the RIGHT FRONT corner. Angle the camera to show both the front and right side.',
    overlayType: 'corner'
  },
  {
    id: 'roof',
    title: 'ROOF',
    instruction: "Take a photo of the ROOF if possible. If not safely reachable, tap \"Skip\".",
    overlayType: 'roof'
  },
  {
    id: 'vin_odometer',
    title: 'VIN or ODOMETER',
    instruction: 'Take a close-up of the VIN or ODOMETER. Use the zoom if needed. Skip if not available.',
    overlayType: 'detail'
  },
  {
    id: 'review',
    title: 'Review Photos',
    instruction: "You've completed the walkaround! Please review your photos below. You can retake any before submitting.",
    overlayType: 'none'
  }
];

// Main component
const CCCWalkaroundForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  // State for tracking the current step
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [photoSteps, setPhotoSteps] = useState<PhotoStep[]>(PHOTO_STEPS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);

  // Camera state
  const [cameraInitialized, setCameraInitialized] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Refs
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Navigation
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LocationState;

  // User info
  const isCustomer = locationState?.isCustomer || false;
  const userName = locationState?.name || 'Unknown';
  const userEmail = isCustomer
    ? locationState?.estimatorEmail || 'info@autohail.group'
    : locationState?.email || 'info@autohail.group';

  // Current step
  const currentStep = photoSteps[currentStepIndex];
  const isIntroStep = currentStepIndex === 0;

  // Count completed photos
  const completedPhotos = photoSteps.filter(step =>
    step.imageData && step.id !== 'intro' && step.id !== 'review'
  ).length;

  // Calculate progress
  const totalSteps = photoSteps.length - 2; // Exclude intro and review
  const currentProgress = Math.min(currentStepIndex - 1, totalSteps);
  const progressPercentage = totalSteps > 0 ? (currentProgress / totalSteps) * 100 : 0;

  // Initialize camera when component mounts
  useEffect(() => {
    // Only initialize camera if we're past the intro step
    if (!isIntroStep && !cameraInitialized) {
      initializeCamera();
    }

    // Clean up function to stop camera when component unmounts
    return () => {
      stopCamera();
    };
  }, [isIntroStep, cameraInitialized]);

  // Function to initialize the camera
  const initializeCamera = async () => {
    setIsCameraLoading(true);
    setCameraError(null);

    try {
      console.log('Initializing camera...');

      // Try to get the video element
      if (!videoRef.current) {
        console.error('Video element not found');
        setCameraError('Video element not found');
        setIsCameraLoading(false);
        return;
      }

      console.log('Requesting camera access...');

      // First try with ideal settings for landscape orientation
      try {
        const constraints = {
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        };

        console.log('Using constraints:', JSON.stringify(constraints));

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        // Store the stream in the ref
        streamRef.current = stream;

        // Set the stream as the video source
        videoRef.current.srcObject = stream;

        // Add event listeners to detect when video is actually playing
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, video dimensions:',
            videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
          videoRef.current?.play().catch(e => console.error('Error playing video:', e));
        };

        videoRef.current.onplaying = () => {
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
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          // Add event listeners to detect when video is actually playing
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded (fallback), video dimensions:',
              videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
            videoRef.current?.play().catch(e => console.error('Error playing video:', e));
          };

          videoRef.current.onplaying = () => {
            console.log('Video is now playing (fallback)');
            // Mark camera as initialized only when video is actually playing
            setCameraInitialized(true);
            setIsCameraLoading(false);
          };
        }

        console.log('Camera initialized with fallback settings');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please make sure you have granted camera permissions.');
      setIsCameraLoading(false);
    }
  };

  // Function to stop the camera
  const stopCamera = () => {
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

  // Function to capture a photo
  const capturePhoto = () => {
    if (isCapturing) return; // Prevent multiple captures

    setIsCapturing(true);

    try {
      console.log('Capturing photo...');

      if (!videoRef.current || !videoRef.current.srcObject) {
        console.error('Video not ready');
        setIsCapturing(false);
        return;
      }

      // Create a canvas element to capture the current video frame
      const canvas = document.createElement('canvas');

      // Make sure we have valid dimensions
      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        console.error('Invalid video dimensions');
        setIsCapturing(false);
        return;
      }

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      // Draw the current video frame to the canvas
      const context = canvas.getContext('2d');
      if (context) {
        // Clear the canvas first
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the video frame
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Convert the canvas to a data URL
        const imageData = canvas.toDataURL('image/jpeg', 0.9);

        // Validate the image data
        if (imageData === 'data:,' || imageData.length < 1000) {
          console.error('Invalid image data captured');
          setIsCapturing(false);
          return;
        }

        console.log('Photo captured successfully, data URL length:', imageData.length);

        // Trigger shutter effect
        const shutterElement = document.getElementById('shutter-effect');
        if (shutterElement) {
          shutterElement.classList.add(styles.shutterFlash);
          setTimeout(() => {
            shutterElement.classList.remove(styles.shutterFlash);
          }, 200);
        }

        // Update the photo steps with the captured image
        const updatedSteps = [...photoSteps];
        updatedSteps[currentStepIndex] = {
          ...updatedSteps[currentStepIndex],
          imageData
        };
        setPhotoSteps(updatedSteps);

        // Automatically move to next step after capture
        setTimeout(() => {
          if (currentStepIndex < photoSteps.length - 2) { // Don't auto-advance to review step
            setCurrentStepIndex(currentStepIndex + 1);
          } else {
            setShowSummary(true);
          }
          setIsCapturing(false);
        }, 300); // Slight delay to allow shutter effect to complete
      } else {
        console.error('Could not get canvas context');
        setIsCapturing(false);
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      setIsCapturing(false);
    }
  };

  // Function to handle skipping optional steps
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

  // Function to handle retaking a photo
  const handleRetake = (index: number) => {
    setShowSummary(false);
    setCurrentStepIndex(index);
  };

  // Function to start the walkaround process
  const handleStart = () => {
    setCurrentStepIndex(1); // Move to first photo step
  };

  // Function to handle comment input
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
  };

  // Function to submit the walkaround photos
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

    if (!showCommentBox) {
      setShowCommentBox(true);
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
        comment: comment || ''
      };

      // If this is a customer, add their email to the form data
      if (isCustomer && locationState?.email) {
        formData.email = locationState.email;
      }

      // Collect photos to compress
      const photoData: Record<string, string> = {};
      photoSteps.forEach(step => {
        if (step.imageData && step.id !== 'intro' && step.id !== 'review') {
          photoData[`photo_${step.id}`] = step.imageData;
        }
      });

      // Compress all images before submission
      console.log('Compressing images before submission...');
      overlay.innerHTML = `
        <div style="color: white; font-size: 24px; margin-bottom: 20px;">Compressing photos...</div>
        <div style="width: 50px; height: 50px; border: 5px solid #3BB554; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
      `;

      try {
        const compressedPhotos = await compressImages(photoData, 1000, 0.6);
        console.log('Images compressed successfully');

        // Add compressed photos to form data
        Object.entries(compressedPhotos).forEach(([key, value]) => {
          formData[key] = value;
        });

        overlay.innerHTML = `
          <div style="color: white; font-size: 24px; margin-bottom: 20px;">Submitting photos...</div>
          <div style="width: 50px; height: 50px; border: 5px solid #3BB554; border-radius: 50%; border-top-color: transparent; animation: spin 1s linear infinite;"></div>
        `;
      } catch (compressionError) {
        console.error('Error compressing images:', compressionError);
        // Fall back to original images if compression fails
        Object.entries(photoData).forEach(([key, value]) => {
          formData[key] = value;
        });
      }

      // Submit the form
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
          navigate('/thankyou');
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
      <div className={styles.container}>
        <div className={styles.introContainer}>
          <h1 className={styles.introTitle}>Vehicle Walkaround Photos</h1>
          <p className={styles.introText}>{currentStep.instruction}</p>
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

  // Render the comment box screen
  if (showCommentBox) {
    return (
      <div className={styles.container}>
        <div className={styles.introContainer}>
          <h1 className={styles.introTitle}>Additional Comments</h1>
          <p className={styles.introText}>Is there anything you'd like to tell us about the condition of the vehicle?</p>
          <textarea
            className={styles.commentBox}
            value={comment}
            onChange={handleCommentChange}
            placeholder="Enter your comments here (optional)"
            rows={5}
          />
          <button
            className={styles.startButton}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    );
  }

  // Render the review screen
  if (showSummary) {
    return (
      <div className={styles.container}>
        <div className={styles.reviewContainer}>
          <h1 className={styles.reviewTitle}>Review Your Photos</h1>
          <p className={styles.reviewText}>
            You captured {completedPhotos} photos. Tap any photo to retake it.
          </p>

          <div className={styles.photoGrid}>
            {photoSteps.slice(1, -1).map((step, index) => (
              <div key={step.id} className={styles.photoGridItem}>
                <div className={styles.photoLabel}>{step.title}</div>
                {step.imageData ? (
                  <img
                    src={step.imageData}
                    alt={step.title}
                    className={styles.gridThumbnail}
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

          <div className={styles.reviewButtons}>
            <button
              className={styles.retakeAllButton}
              onClick={() => setCurrentStepIndex(1)}
            >
              Retake All
            </button>
            <button
              className={styles.continueButton}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render the camera view for capturing photos
  return (
    <div className={styles.container}>
      <div className={styles.cameraContainer}>
        {/* Progress indicator */}
        <div className={styles.progressContainer}>
          <span className={styles.progressText}>
            Step {currentStepIndex} of {totalSteps + 1}
          </span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Camera view */}
        <div className={styles.cameraView}>
          {/* Video element for camera feed */}
          <video
            ref={videoRef}
            className={styles.videoFeed}
            autoPlay
            playsInline
            muted
          ></video>

          {/* Shutter effect overlay */}
          <div id="shutter-effect" className={styles.shutterEffect}></div>

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
              <button
                className={styles.retryButton}
                onClick={() => {
                  setCameraError(null);
                  setCameraInitialized(false);
                  initializeCamera();
                }}
              >
                Retry Camera Access
              </button>
            </div>
          )}

          {/* Overlay guide based on current step */}
          {!cameraError && !isCameraLoading && (
            <div className={styles.overlayGuide}>
              {currentStep.overlayType === 'front' && <div className={styles.frontOverlay}></div>}
              {currentStep.overlayType === 'rear' && <div className={styles.rearOverlay}></div>}
              {currentStep.overlayType === 'corner' && <div className={styles.cornerOverlay}></div>}
              {currentStep.overlayType === 'side' && <div className={styles.sideOverlay}></div>}
              {currentStep.overlayType === 'roof' && <div className={styles.roofOverlay}></div>}
              {currentStep.overlayType === 'detail' && <div className={styles.detailOverlay}></div>}
            </div>
          )}

          {/* Instruction banner */}
          <div className={styles.instructionBanner}>
            <p className={styles.instructionText}>{currentStep.instruction}</p>
          </div>
        </div>

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

          {/* Capture button */}
          <button
            className={styles.captureButton}
            onClick={capturePhoto}
            disabled={isCapturing || isCameraLoading || !!cameraError}
          >
            <div className={styles.captureButtonInner}></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CCCWalkaroundForm;
