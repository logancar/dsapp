import { useState } from 'react';
import styles from './WalkaroundPhotoBooth.module.css';

interface WalkaroundPhotoBoothProps {
  onPhotosChange: (photos: { [key: string]: File | null }) => void;
  onValidationChange: (isValid: boolean) => void;
}

interface PhotoSlot {
  key: string;
  label: string;
  description: string;
}

const photoSlots: PhotoSlot[] = [
  { key: 'front', label: 'Front', description: 'Please upload a photo of the front of the vehicle' },
  { key: 'rear', label: 'Rear', description: 'Please upload a photo of the rear of the vehicle' },
  { key: 'driverSide', label: 'Driver Side', description: 'Please upload a photo of the driver side of the vehicle' },
  { key: 'passengerSide', label: 'Passenger Side', description: 'Please upload a photo of the passenger side of the vehicle' },
  { key: 'top', label: 'Top/Roof', description: 'Please upload a photo of the top/roof of the vehicle' }
];

function WalkaroundPhotoBooth({ onPhotosChange, onValidationChange }: WalkaroundPhotoBoothProps) {
  const [photos, setPhotos] = useState<{ [key: string]: File | null }>({
    front: null,
    rear: null,
    driverSide: null,
    passengerSide: null,
    top: null
  });

  const [previews, setPreviews] = useState<{ [key: string]: string | null }>({
    front: null,
    rear: null,
    driverSide: null,
    passengerSide: null,
    top: null
  });

  const handlePhotoUpload = (key: string, file: File | null) => {
    const newPhotos = { ...photos, [key]: file };
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);

    // Create preview URL
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviews(prev => ({ ...prev, [key]: previewUrl }));
    } else {
      setPreviews(prev => ({ ...prev, [key]: null }));
    }

    // Check if all photos are uploaded
    const allPhotosUploaded = Object.values(newPhotos).every(photo => photo !== null);
    onValidationChange(allPhotosUploaded);
  };

  const handleFileChange = (key: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
    }
    
    handlePhotoUpload(key, file);
  };

  const removePhoto = (key: string) => {
    // Revoke the preview URL to free memory
    if (previews[key]) {
      URL.revokeObjectURL(previews[key]!);
    }
    handlePhotoUpload(key, null);
  };

  const uploadedCount = Object.values(photos).filter(photo => photo !== null).length;

  return (
    <div className={styles.photoBoothContainer}>
      <h2 className={styles.title}>360° Vehicle Walkaround Photos</h2>
      <p className={styles.subtitle}>
        Please upload photos of your vehicle from all angles ({uploadedCount}/5 completed)
      </p>
      
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${(uploadedCount / 5) * 100}%` }}
        />
      </div>

      <div className={styles.photoGrid}>
        {photoSlots.map((slot) => (
          <div key={slot.key} className={styles.photoSlot}>
            <h3 className={styles.slotTitle}>{slot.label}</h3>
            <p className={styles.slotDescription}>{slot.description}</p>
            
            <div className={styles.uploadArea}>
              {previews[slot.key] ? (
                <div className={styles.previewContainer}>
                  <img 
                    src={previews[slot.key]!} 
                    alt={`${slot.label} view`}
                    className={styles.previewImage}
                  />
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removePhoto(slot.key)}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className={styles.uploadLabel}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(slot.key, e)}
                    className={styles.fileInput}
                  />
                  <div className={styles.uploadPlaceholder}>
                    <div className={styles.uploadIcon}>📷</div>
                    <span>Click to upload photo</span>
                  </div>
                </label>
              )}
            </div>
          </div>
        ))}
      </div>

      {uploadedCount === 5 && (
        <div className={styles.completionMessage}>
          ✅ All photos uploaded! You can now submit the form.
        </div>
      )}
    </div>
  );
}

export default WalkaroundPhotoBooth;
