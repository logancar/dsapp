import { useForm } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import SignatureField from '../components/SignatureField';
import { useLocation } from 'react-router-dom';
import styles from './PickupForm.module.css';
import { submitForm, testServerConnection } from '../services/api';

interface PickupFormData {
  // Completion section
  customerName: string;

  // Acknowledgments with initials
  rentalInitials: string;
  reviewsInitials: string;

  // Parts Owed section
  partsOwed: string;

  // Signature and date
  signature: string;
  date: string;

  [key: string]: unknown;
}

interface LocationState {
  name?: string;
  email?: string;
}

export default function PickupForm({ onSubmit }: { onSubmit: (data: PickupFormData) => void }) {
  const { register, handleSubmit, setValue, watch } = useForm<PickupFormData>({
    defaultValues: {
      customerName: '',
      rentalInitials: '',
      reviewsInitials: '',
      partsOwed: '',
      date: new Date().toLocaleDateString()
    }
  });

  const signatureSectionRef = useRef<HTMLDivElement>(null);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const { email: estimatorEmail } = location.state as LocationState;
  const [serverConnected, setServerConnected] = useState<boolean | null>(null);

  // Test server connection when component mounts
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        const isConnected = await testServerConnection();
        setServerConnected(isConnected);
        console.log('Server connection test result:', isConnected ? 'Connected' : 'Not connected');
      } catch (error) {
        console.error('Error testing server connection:', error);
        setServerConnected(false);
      }
    };

    checkServerConnection();
  }, []);

  const scrollToSignature = () => {
    if (signatureSectionRef.current) {
      const yOffset = -100;
      const element = signatureSectionRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  };

  // Function to generate initials from customer name
  const generateInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  };

  // Update initials when customer name changes
  useEffect(() => {
    const customerName = watch('customerName');
    if (customerName) {
      const initials = generateInitials(customerName);
      setValue('rentalInitials', initials);
      setValue('reviewsInitials', initials);
    }
  }, [watch('customerName'), setValue]);

  const handleSignatureSave = (signatureDataUrl: string) => {
    console.log('Signature saved, setting state...');
    setValue('signature', signatureDataUrl);
    setSignatureSaved(true);
    console.log('signatureSaved should now be true');
    setTimeout(scrollToSignature, 100);
  };

  const onSubmitForm = async (data: PickupFormData) => {
    console.log('Submit button clicked, starting submission process');
    console.log('Form data to be submitted:', data);
    console.log('Signature saved status:', signatureSaved);
    console.log('Estimator email:', estimatorEmail);

    // Set the current date
    setValue('date', new Date().toLocaleDateString());

    setIsSubmitting(true);
    try {
      console.log('Calling submitForm API function');
      const result = await submitForm(data, 'pickup', estimatorEmail || 'info@autohail.group');
      console.log('API response received:', result);

      if (result.success) {
        console.log('Form submitted successfully');
        onSubmit(data);
        window.location.href = '/thankyou';
      } else {
        console.error('Form submission failed:', result.message);
        alert('Failed to submit form. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      console.error('Error details:', error instanceof Error ? error.stack : 'Unknown error');
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.centerHeading}>Pick Up Form</h1>

      {serverConnected === false && (
        <div style={{
          backgroundColor: '#ffdddd',
          color: '#d32f2f',
          padding: '10px',
          margin: '10px 0',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          Warning: Cannot connect to the server. Form submission may not work.
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmitForm)}
        autoComplete="off"
      >
        <div className={styles.formStep}>
          {/* Completion Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionHeading}>Completion</h3>
            <div className={styles.completionText}>
              <p>
                I, <input
                  type="text"
                  {...register('customerName')}
                  className={styles.inlineInput}
                  placeholder="Your Full Name"
                />, have inspected my vehicle and am accepting the vehicle as repairs have been completed.
              </p>
            </div>
          </div>

          {/* Rental Car Coverage Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionHeading}>Rental Car Coverage</h3>
            <div className={styles.acknowledgementRow}>
              <p>
                I understand that the vehicle is of no charge to me, the customer, however, D S Rentals LLC will invoice my insurance company directly. If I receive any form of payment associated with this claim, I am aware that I need to contact Dent Source immediately and to send the payment. I understand that should I fail to send in the payment, Dent Source will take all policy holders on this policy and the insurer to a court of law within the legal jurisdiction of D S Rentals headquarters, in Oklahoma County, OK.
              </p>
              <div className={styles.initialsBox}>
                <span>Initials: </span>
                <input
                  type="text"
                  {...register('rentalInitials')}
                  className={styles.initialsInput}
                  readOnly
                  value={watch('rentalInitials')}
                />
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionHeading}>Reviews</h3>
            <div className={styles.acknowledgementRow}>
              <p>
                We appreciate the opportunity to serve you. Our mission is to make every customer smile one vehicle at a time. Dent Source will occasionally offer promotional discounts, restrictions apply. I understand leaving a negative review on social media, internet, or any other media outlet, will result in forfeiture of all promotional discounts, including but not limited to deductible coupon, rental car fee and/or cash back offer. Failure to reimburse in a timely manner will result in legal action. Customer shall pay all legal fees incurred enforcing the terms of this contract.
              </p>
              <div className={styles.initialsBox}>
                <span>Initials: </span>
                <input
                  type="text"
                  {...register('reviewsInitials')}
                  className={styles.initialsInput}
                  readOnly
                  value={watch('reviewsInitials')}
                />
              </div>
            </div>
          </div>

          {/* Parts Owed Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionHeading}>Parts Owed</h3>
            <textarea
              {...register('partsOwed')}
              className={styles.partsOwedTextarea}
              placeholder="List any parts that are owed"
              rows={3}
            />
          </div>

          {/* Signature Section */}
          <div className={styles.signatureSection} ref={signatureSectionRef}>
            <div className={styles.signatureRow}>
              <div className={styles.signatureColumn}>
                <p>Customer Signature</p>
                <SignatureField onSave={handleSignatureSave} />
              </div>
              <div className={styles.dateColumn}>
                <p>Date</p>
                <input
                  type="text"
                  {...register('date')}
                  className={styles.dateInput}
                  readOnly
                  value={new Date().toLocaleDateString()}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`${styles.submitButton} ${!signatureSaved ? styles.disabled : ''}`}
            disabled={!signatureSaved || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>

      {isSubmitting && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p>Submitting documents, please wait...</p>
        </div>
      )}
    </div>
  );


}

