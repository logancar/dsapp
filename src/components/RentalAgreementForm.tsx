import { useState } from 'react';
import styles from './RentalAgreementForm.module.css';

interface RentalAgreementFormProps {
  onComplete: (data: RentalAgreementData) => void;
  onValidationChange: (isValid: boolean) => void;
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

function RentalAgreementForm({ onComplete, onValidationChange }: RentalAgreementFormProps) {
  const [formData, setFormData] = useState<RentalAgreementData>({
    photoId: null,
    cardInfo: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    },
    agreementAccepted: false,
    signature: ''
  });

  const [photoIdPreview, setPhotoIdPreview] = useState<string | null>(null);
  const [showCardInfo, setShowCardInfo] = useState(false);

  // Handle photo ID upload
  const handlePhotoIdUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPhotoIdPreview(previewUrl);
    } else {
      setPhotoIdPreview(null);
    }

    const newFormData = { ...formData, photoId: file };
    setFormData(newFormData);
    updateValidation(newFormData);
    onComplete(newFormData);
  };

  // Handle card info changes
  const handleCardInfoChange = (field: string, value: string) => {
    const newCardInfo = { ...formData.cardInfo, [field]: value };
    const newFormData = { ...formData, cardInfo: newCardInfo };
    setFormData(newFormData);
    updateValidation(newFormData);
    onComplete(newFormData);
  };

  // Handle agreement checkbox
  const handleAgreementChange = (checked: boolean) => {
    const newFormData = { ...formData, agreementAccepted: checked };
    setFormData(newFormData);
    updateValidation(newFormData);
    onComplete(newFormData);
  };

  // Handle signature
  const handleSignatureChange = (signature: string) => {
    const newFormData = { ...formData, signature };
    setFormData(newFormData);
    updateValidation(newFormData);
    onComplete(newFormData);
  };

  // Update validation
  const updateValidation = (data: RentalAgreementData) => {
    const isValid = data.photoId !== null && data.agreementAccepted && data.signature.length > 0;
    onValidationChange(isValid);
  };

  // Remove photo ID
  const removePhotoId = () => {
    if (photoIdPreview) {
      URL.revokeObjectURL(photoIdPreview);
    }
    setPhotoIdPreview(null);
    const newFormData = { ...formData, photoId: null };
    setFormData(newFormData);
    updateValidation(newFormData);
    onComplete(newFormData);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Rental Agreement & Verification</h2>
      <p className={styles.subtitle}>Please complete the rental requirements below</p>

      {/* Photo ID Upload */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Photo ID (Required)</h3>
        <p className={styles.sectionDescription}>Upload a clear photo of your driver's license or government-issued ID</p>
        
        <div className={styles.uploadArea}>
          {photoIdPreview ? (
            <div className={styles.previewContainer}>
              <img 
                src={photoIdPreview} 
                alt="Photo ID"
                className={styles.previewImage}
              />
              <button
                type="button"
                className={styles.removeButton}
                onClick={removePhotoId}
              >
                ✕
              </button>
            </div>
          ) : (
            <label className={styles.uploadLabel}>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoIdUpload}
                className={styles.fileInput}
              />
              <div className={styles.uploadPlaceholder}>
                <div className={styles.uploadIcon}>🆔</div>
                <span>Click to upload Photo ID</span>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Optional Card Information */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Payment Information (Optional)</h3>
        <p className={styles.sectionDescription}>You can add payment information now or provide it later</p>
        
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setShowCardInfo(!showCardInfo)}
        >
          {showCardInfo ? 'Hide' : 'Add'} Payment Information
        </button>

        {showCardInfo && (
          <div className={styles.cardForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Cardholder Name</label>
                <input
                  type="text"
                  value={formData.cardInfo?.cardholderName || ''}
                  onChange={(e) => handleCardInfoChange('cardholderName', e.target.value)}
                  className={styles.input}
                  placeholder="Full name on card"
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Card Number</label>
                <input
                  type="text"
                  value={formData.cardInfo?.cardNumber || ''}
                  onChange={(e) => handleCardInfoChange('cardNumber', e.target.value)}
                  className={styles.input}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Expiry Date</label>
                <input
                  type="text"
                  value={formData.cardInfo?.expiryDate || ''}
                  onChange={(e) => handleCardInfoChange('expiryDate', e.target.value)}
                  className={styles.input}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>CVV</label>
                <input
                  type="text"
                  value={formData.cardInfo?.cvv || ''}
                  onChange={(e) => handleCardInfoChange('cvv', e.target.value)}
                  className={styles.input}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rental Agreement */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Rental Agreement</h3>
        <div className={styles.agreementText}>
          <p>By checking the box below, I acknowledge and agree to the following:</p>
          <ul>
            <li>I am at least 21 years old and have a valid driver's license</li>
            <li>I understand the rental terms and conditions</li>
            <li>I am responsible for any damage to the rental vehicle</li>
            <li>I will return the vehicle in the same condition</li>
            <li>I authorize Dent Source to charge my payment method for rental fees</li>
            <li>I understand additional charges may apply for late returns or damages</li>
          </ul>
        </div>
        
        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            id="agreement"
            checked={formData.agreementAccepted}
            onChange={(e) => handleAgreementChange(e.target.checked)}
            className={styles.checkbox}
          />
          <label htmlFor="agreement" className={styles.checkboxLabel}>
            I agree to the rental terms and conditions
          </label>
        </div>
      </div>

      {/* Signature */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Digital Signature (Required)</h3>
        <p className={styles.sectionDescription}>Please sign your name below</p>
        
        <div className={styles.signatureArea}>
          <input
            type="text"
            value={formData.signature}
            onChange={(e) => handleSignatureChange(e.target.value)}
            className={styles.signatureInput}
            placeholder="Type your full name here"
          />
        </div>
      </div>

      {/* Validation Status */}
      {formData.photoId && formData.agreementAccepted && formData.signature && (
        <div className={styles.validationMessage}>
          ✅ Rental agreement completed! You can now proceed to vehicle photos.
        </div>
      )}
    </div>
  );
}

export default RentalAgreementForm;
