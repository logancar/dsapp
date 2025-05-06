import React, { useRef, useState, useEffect } from 'react';
import styles from './CameraCapture.module.css';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  capturedImage?: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, capturedImage }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Detect iOS device
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  // Initialize camera when component mounts
  useEffect(() => {
    if (capturedImage) {
      // If we already have a captured image, don't start the camera
      setIsLoading(false);
      return;
    }

    const startCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // iOS specific constraints
        const constraints = {
          video: {
            facingMode: 'environment', // Prefer rear camera on mobile
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };

        console.log('Requesting camera with constraints:', constraints);
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Camera access granted, stream tracks:', mediaStream.getTracks().length);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.setAttribute('playsinline', 'true'); // Important for iOS
          videoRef.current.setAttribute('autoplay', 'true');

          // For iOS, we need to manually play the video
          if (isIOS) {
            try {
              await videoRef.current.play();
              console.log('Video playback started manually');
            } catch (playError) {
              console.error('Error playing video:', playError);
            }
          }

          setStream(mediaStream);
          setHasCamera(true);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setHasCamera(false);
        setError('Could not access camera. Please ensure you have granted camera permissions and are using a supported browser.');
      } finally {
        setIsLoading(false);
      }
    };

    startCamera();

    // Cleanup function to stop camera when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => {
          console.log('Stopping track:', track.kind, track.label);
          track.stop();
        });
      }
    };
  }, [capturedImage, isIOS]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      try {
        console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);

        // Set canvas dimensions to match video
        // If video dimensions are 0 (which can happen on iOS), use fallback dimensions
        const width = video.videoWidth || 1280;
        const height = video.videoHeight || 720;

        canvas.width = width;
        canvas.height = height;

        // Draw the current video frame to the canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // For iOS, we might need to handle the case where the video isn't actually playing
          if (isIOS && (video.videoWidth === 0 || video.videoHeight === 0)) {
            console.log('Using fallback for iOS camera capture');
            // Draw a placeholder for iOS devices when video dimensions are not available
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Camera capture not available', canvas.width / 2, canvas.height / 2);

            // Use file input as fallback
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.capture = 'environment';
            fileInput.click();

            fileInput.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  if (event.target?.result) {
                    onCapture(event.target.result as string);
                  }
                };
                reader.readAsDataURL(file);
              }
            };

            return;
          } else {
            // Normal flow for non-iOS or working iOS
            console.log('Drawing video to canvas');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          }

          // Convert canvas to data URL and pass to parent
          const imageData = canvas.toDataURL('image/jpeg', 0.8);
          console.log('Image captured, data URL length:', imageData.length);
          onCapture(imageData);

          // Stop the camera stream
          if (stream) {
            stream.getTracks().forEach(track => {
              console.log('Stopping track after capture:', track.kind);
              track.stop();
            });
            setStream(null);
          }
        }
      } catch (err) {
        console.error('Error capturing image:', err);
        // Fallback to file input
        setHasCamera(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onCapture(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (capturedImage) {
    return (
      <div className={styles.container}>
        <img
          src={capturedImage}
          alt="Captured"
          className={styles.capturedImage}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Accessing camera...</p>
        </div>
      ) : hasCamera ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={styles.videoFeed}
            onCanPlay={() => {
              console.log('Video can play now');
              setIsLoading(false);
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <button
            className={styles.captureButton}
            onClick={handleCapture}
          >
            <span className={styles.captureIcon}></span>
          </button>
        </>
      ) : (
        <div className={styles.fallbackContainer}>
          {error && <p className={styles.errorMessage}>{error}</p>}
          <p>Please take a photo using your camera:</p>
          <button
            className={styles.fallbackButton}
            onClick={() => {
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = 'image/*';
              fileInput.capture = 'environment';
              fileInput.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                if (target.files && target.files.length > 0) {
                  const file = target.files[0];
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    if (event.target?.result) {
                      onCapture(event.target.result as string);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              };
              fileInput.click();
            }}
          >
            Take Photo
          </button>
          <p className={styles.orText}>- or -</p>
          <p>Upload a photo from your device:</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className={styles.fileInput}
          />
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
