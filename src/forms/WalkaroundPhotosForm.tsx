import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './WalkaroundPhotosForm.module.css';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track camera initialization status
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  // Debug state for camera troubleshooting
  const [debugInfo, setDebugInfo] = useState<{
    videoWidth: number;
    videoHeight: number;
    readyState: number;
    hasStream: boolean;
    streamActive: boolean;
    trackCount: number;
  } | null>(null);

  // Periodically check camera status and update debug info
  useEffect(() => {
    if (cameraInitialized && !isIntroStep && !showSummary) {
      const checkInterval = setInterval(() => {
        const videoElement = document.getElementById('camera-feed') as HTMLVideoElement;
        if (videoElement && streamRef.current) {
          const tracks = streamRef.current.getTracks();
          setDebugInfo({
            videoWidth: videoElement.videoWidth,
            videoHeight: videoElement.videoHeight,
            readyState: videoElement.readyState,
            hasStream: !!videoElement.srcObject,
            streamActive: streamRef.current.active,
            trackCount: tracks.length
          });

          // If stream is not active or video is not playing, try to reinitialize
          if (!streamRef.current.active || videoElement.readyState < 2) {
            console.log('Camera stream is not active or video is not playing, reinitializing...');
            setCameraInitialized(false);
          }
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(checkInterval);
    }
  }, [cameraInitialized, isIntroStep, showSummary]);

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

          // Check if this is iOS
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
          console.log('Device is iOS:', isIOS);

          // Make sure video element has the required attributes for iOS
          // These need to be set as attributes directly in the DOM, not just as React props
          videoElement.setAttribute('autoplay', 'true');
          videoElement.setAttribute('playsinline', 'true');
          videoElement.setAttribute('muted', 'true');

          console.log('Requesting camera access...');

          // Try different camera constraints in sequence
          let stream: MediaStream | null = null;

          // Try with exact environment mode first (works on most Android devices)
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: { exact: "environment" }
              },
              audio: false
            });
            console.log('Successfully got stream with exact environment mode');
          } catch (exactError) {
            console.log('Exact environment mode failed, trying regular environment mode:', exactError);

            // Try with regular environment mode (works on some iOS devices)
            try {
              stream = await navigator.mediaDevices.getUserMedia({
                video: {
                  facingMode: "environment"
                },
                audio: false
              });
              console.log('Successfully got stream with regular environment mode');
            } catch (envError) {
              console.log('Environment mode failed, trying with ideal dimensions:', envError);

              // Try with ideal dimensions
              try {
                stream = await navigator.mediaDevices.getUserMedia({
                  video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                  },
                  audio: false
                });
                console.log('Successfully got stream with ideal dimensions');
              } catch (dimError) {
                console.log('Ideal dimensions failed, falling back to basic video:', dimError);

                // Last resort - just ask for any video
                try {
                  stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                  });
                  console.log('Successfully got stream with basic video constraints');
                } catch (basicError) {
                  console.error('All camera access attempts failed:', basicError);
                  setCameraError('Unable to access camera. Please check your camera permissions.');
                  setIsCameraLoading(false);
                  return;
                }
              }
            }
          }

          if (!stream) {
            console.error('Failed to get camera stream');
            setCameraError('Unable to access camera. Please check your camera permissions.');
            setIsCameraLoading(false);
            return;
          }

          // Store the stream in the ref
          streamRef.current = stream;

          // Set the stream as the video source
          videoElement.srcObject = stream;

          // Wait for canplay event before playing
          videoElement.addEventListener('canplay', function onCanPlay() {
            console.log('Video can play, attempting to play now');

            // Remove the event listener to avoid multiple calls
            videoElement.removeEventListener('canplay', onCanPlay);

            // Try to play the video
            const playPromise = videoElement.play();

            if (playPromise !== undefined) {
              playPromise.then(() => {
                console.log('Video playback started successfully');
              }).catch(playError => {
                console.error('Error playing video:', playError);

                // On iOS, autoplay might be blocked without user interaction
                if (isIOS) {
                  console.log('Adding touch event listener for iOS autoplay policy');
                  document.body.addEventListener('touchend', function playVideoOnTouch() {
                    videoElement.play().catch(e => console.error('Error on touch play:', e));
                    document.body.removeEventListener('touchend', playVideoOnTouch);
                  }, { once: true });
                }
              });
            }
          });

          // Add event listeners to detect when video is actually playing
          videoElement.onloadedmetadata = () => {
            console.log('Video metadata loaded, dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
          };

          videoElement.onplaying = () => {
            console.log('Video is now playing');
            setCameraInitialized(true);
            setIsCameraLoading(false);

            // Update debug info
            if (stream) {
              const tracks = stream.getTracks();
              setDebugInfo({
                videoWidth: videoElement.videoWidth,
                videoHeight: videoElement.videoHeight,
                readyState: videoElement.readyState,
                hasStream: !!videoElement.srcObject,
                streamActive: stream.active,
                trackCount: tracks.length
              });
            }
          };

          console.log('Camera stream setup completed');
        } catch (error) {
          console.error('Error accessing camera:', error);
          setCameraError('Unable to access camera. Please make sure you have granted camera permissions.');
          setIsCameraLoading(false);
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

      // Check if this is iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      console.log('Device is iOS:', isIOS);

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

      // Update debug info before capture
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        setDebugInfo({
          videoWidth: videoElement.videoWidth,
          videoHeight: videoElement.videoHeight,
          readyState: videoElement.readyState,
          hasStream: !!videoElement.srcObject,
          streamActive: streamRef.current.active,
          trackCount: tracks.length
        });
      }

      // Add a small delay before capturing to ensure frame is fully rendered
      // This is especially important on iOS devices
      console.log('Adding small delay before capture to ensure frame is rendered...');

      // Use setTimeout to delay the capture slightly
      setTimeout(() => {
        captureFrame(videoElement);
      }, 100);
    } catch (error) {
      console.error('Error capturing photo:', error);

      // Fall back to file input if there's an error
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  // Separate function to capture a frame from the video
  const captureFrame = (videoElement: HTMLVideoElement) => {
    try {
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

        try {
          // Draw the video frame
          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

          // Convert the canvas to a data URL
          const imageData = canvas.toDataURL('image/jpeg', 0.9);

          // Validate the image data
          if (imageData === 'data:,' || imageData.length < 1000) {
            console.error('Invalid image data captured');

            // Check if this is iOS
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

            if (isIOS) {
              // On iOS, try an alternative approach
              console.log('Trying alternative capture method for iOS');

              // Try again after a longer delay
              setTimeout(() => {
                try {
                  // Try with a different approach for iOS
                  // First, make sure the canvas is properly sized
                  canvas.width = videoElement.videoWidth || 640;
                  canvas.height = videoElement.videoHeight || 480;

                  // Clear the canvas
                  context.clearRect(0, 0, canvas.width, canvas.height);

                  // Draw the video frame with explicit dimensions
                  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

                  // Try with a higher quality setting
                  const retryImageData = canvas.toDataURL('image/jpeg', 1.0);

                  if (retryImageData !== 'data:,' && retryImageData.length >= 1000) {
                    console.log('iOS alternative capture successful');
                    handleCapture(retryImageData);
                  } else {
                    console.error('iOS alternative capture failed, falling back to file input');
                    if (fileInputRef.current) {
                      fileInputRef.current.click();
                    }
                  }
                } catch (retryError) {
                  console.error('Error in iOS alternative capture:', retryError);
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }
              }, 500);
              return;
            } else {
              console.error('Invalid image data captured, falling back to file input');
              console.log('Image data:', imageData.substring(0, 100) + '...');

              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
              return;
            }
          }

          console.log('Photo captured successfully, data URL length:', imageData.length);
          handleCapture(imageData);
        } catch (drawError) {
          console.error('Error drawing to canvas:', drawError);

          // Try with a different approach
          setTimeout(() => {
            try {
              // Try with a different source rectangle
              context.drawImage(videoElement, 0, 0, videoElement.videoWidth || 640, videoElement.videoHeight || 480, 0, 0, canvas.width, canvas.height);
              const retryImageData = canvas.toDataURL('image/jpeg', 0.9);

              if (retryImageData !== 'data:,' && retryImageData.length >= 1000) {
                console.log('Alternative capture method successful');
                handleCapture(retryImageData);
              } else {
                console.error('Alternative capture method failed, falling back to file input');
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }
            } catch (alternativeError) {
              console.error('Error in alternative capture method:', alternativeError);
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }
          }, 300);
        }
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

    // Directly trigger video.play() from user interaction (critical for iOS)
    setTimeout(() => {
      const videoElement = document.getElementById('camera-feed') as HTMLVideoElement;
      if (videoElement) {
        console.log('Attempting to play video directly from user interaction');
        videoElement.play().catch(err => {
          console.error("Play error on Start tap:", err);

          // If play fails, we'll try again with a user-visible button later
          setCameraError('Camera permission denied. Please try the "Retry Camera" button below.');
        });
      }
    }, 100); // Small delay to ensure the component has updated
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
            display: cameraError ? 'none' : 'block',
            backgroundColor: '#000',
            zIndex: 5,
            visibility: 'visible',
            opacity: 1
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

                  // Directly try to play the video (critical for iOS)
                  setTimeout(() => {
                    const videoElement = document.getElementById('camera-feed') as HTMLVideoElement;
                    if (videoElement && videoElement.srcObject) {
                      console.log('Attempting to play video from retry button');
                      videoElement.play().catch(err => console.error("Retry play error:", err));
                    }
                  }, 500);
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

        {/* Debug info overlay */}
        {debugInfo && (
          <div style={{
            position: 'absolute',
            top: '50px',
            left: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 30,
            maxWidth: '300px',
            wordBreak: 'break-word'
          }}>
            <div>Video Width: {debugInfo.videoWidth}</div>
            <div>Video Height: {debugInfo.videoHeight}</div>
            <div>Ready State: {debugInfo.readyState}</div>
            <div>Has Stream: {debugInfo.hasStream ? 'Yes' : 'No'}</div>
            <div>Stream Active: {debugInfo.streamActive ? 'Yes' : 'No'}</div>
            <div>Track Count: {debugInfo.trackCount}</div>
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

      {/* Retry camera button - especially for iOS */}
      {!isCameraLoading && !cameraError && (
        <button
          className={styles.retryCameraButton}
          onClick={() => {
            // Directly try to play the video (critical for iOS)
            const videoElement = document.getElementById('camera-feed') as HTMLVideoElement;
            if (videoElement) {
              console.log('Attempting to play video from retry camera button');
              videoElement.play().catch(err => console.error("Retry camera button error:", err));
            }
          }}
        >
          Retry Camera
        </button>
      )}

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
