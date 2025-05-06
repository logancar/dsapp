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

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, // Prefer rear camera on mobile
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
          setHasCamera(true);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setHasCamera(false);
        setError('Could not access camera. Please ensure you have granted camera permissions.');
      } finally {
        setIsLoading(false);
      }
    };

    startCamera();

    // Cleanup function to stop camera when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [capturedImage]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL and pass to parent
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
        
        // Stop the camera stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
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
            className={styles.videoFeed}
            onCanPlay={() => setIsLoading(false)}
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
          <p>Please upload a photo instead:</p>
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
