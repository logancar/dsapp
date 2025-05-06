import React, { useState } from 'react';
import styles from './CameraCapture.module.css';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  capturedImage?: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, capturedImage }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // If we already have a captured image, show it
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onCapture(event.target.result as string);
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const takePicture = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.capture = 'environment';

    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        setIsLoading(true);
        const file = target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            onCapture(event.target.result as string);
            setIsLoading(false);
          }
        };
        reader.readAsDataURL(file);
      }
    };

    fileInput.click();
  };

  return (
    <div className={styles.container}>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Processing image...</p>
        </div>
      ) : (
        <div className={styles.cameraPlaceholder}>
          <div className={styles.cameraIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className={styles.cameraText}>Tap to take a photo</p>
          <button
            className={styles.takePictureButton}
            onClick={takePicture}
          >
            Take Photo
          </button>

          <p className={styles.orText}>- or -</p>

          <label className={styles.uploadLabel}>
            Choose from gallery
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className={styles.fileInput}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;
