import { useForm } from "react-hook-form";
import { useState, useRef } from "react";
import SignatureField from '../components/SignatureField';
import { useLocation } from 'react-router-dom';
import styles from './PickupForm.module.css';
import { API_BASE_URL } from '../services/api';

interface PickupFormData {
  customerName: string;
  partsOwed: string;
  rentalAcknowledgement: boolean;
  reviewAcknowledgement: boolean;
  signature: string;
}

interface LocationState {
  name?: string;
  email?: string;
}

export default function PickupForm({ onSubmit }: { onSubmit: (data: PickupFormData) => void }) {
  const { register, handleSubmit, setValue } = useForm<PickupFormData>();
  const signatureSectionRef = useRef<HTMLDivElement>(null);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const { email: estimatorEmail } = location.state as LocationState;

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

  const handleSignatureSave = (signatureDataUrl: string) => {
    console.log('Signature saved, setting state...');
    setValue('signature', signatureDataUrl);
    setSignatureSaved(true);
    console.log('signatureSaved should now be true');
    setTimeout(scrollToSignature, 100);
  };

  const onSubmitForm = async (data: PickupFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/submit-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://dentsourcekiosk.netlify.app'
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({
          formData: data,
          pdfType: 'pickup',
          estimatorEmail
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
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
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className={styles.formContainer}>
      <h1 className={styles.centerHeading}>Pick Up Acknowledgements</h1>
        
      <div className={styles.section}>
        <h2 className={styles.sectionHeading}>Completion</h2>
        <p className={styles.completionText}>
          I,{' '}
          <input
            type="text"
            {...register('customerName', { required: true })}
            className={styles.inlineInput}
          />{' '}
          , have inspected my vehicle and am accepting the vehicle as repairs have been completed.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionHeading}>Rental Car Coverage</h2>
        <label className={styles.acknowledgementRow}>
          <input
            type="checkbox"
            {...register('rentalAcknowledgement', { required: true })}
          />
          <span>
            I understand that the vehicle is of no charge to me, the customer, however, D.S. Rentals LLC will invoice my insurance company directly. If i receive any form of payment associated with this claim, I am aware that I need to contact Dent Source immediately and to send the payment. I understand that should I fail to send in the payment, Dent Source will take all policy holders on this policy and the insurer to a court of law within the legal jurisdiction of D.S. Rentals headquarters, in Oklahoma County, OK.
          </span>
        </label>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionHeading}>Reviews</h2>
        <label className={styles.acknowledgementRow}>
          <input
            type="checkbox"
            {...register('reviewAcknowledgement', { required: true })}
          />
          <span>
            We appreciate the opportunity to serve you. Our mission is to make every customer smile one vehicle at a time. Dent Source will occasionally offer promotional discounts, restrictions apply. I understand that leaving a negative review on social media, internet, or any other media outlet, will result in the forfeiture of all promotional discounts, including but now limited to deductive coupon, rental car fee and/or cash back offer. Failure to reimburse in a timely manner will result in legal action. Customer shall pay all legal fees incurred enforcing the terms of this contract.
          </span>
        </label>
      </div>

      <div className={styles.signatureSection} ref={signatureSectionRef}>
        <label>Signature</label>
        <SignatureField onSave={handleSignatureSave} />
      </div>

      <button 
        type="submit" 
        className={`${styles.submitButton} ${!signatureSaved ? styles.disabled : ''}`}
        disabled={!signatureSaved || isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>

      {isSubmitting && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p>Submitting documents, please wait...</p>
        </div>
      )}
    </form>
  );
}

