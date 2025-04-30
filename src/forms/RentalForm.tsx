import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import SignatureField from '../components/SignatureField';
import styles from './RentalForm.module.css';
import * as yup from 'yup';
import { submitForm } from '../services/api';
import { useLocation } from 'react-router-dom';

interface LocationState {
  email?: string;
}

interface RentalFormData {
  // Page 1: Credit Card Authorization Form
  customerName: string;
  customerPhone: string;
  customerEmail: string;

  cardHolderName: string;
  cardHolderAddress: string;
  cardHolderPhone: string;
  cardHolderEmail: string;

  cardType: string;
  otherCardType?: string;
  cardNumber: string;
  expirationDate: string;
  cvc: string;

  agreementAccepted: boolean;
  signaturePage1: string;

  // Page 2: Car Rental Acknowledgments
  acknowledgement1: boolean; // Promissory to return...increments, upon return
  acknowledgement2: boolean; // Dent Source prohibits...the rented vehicle
  acknowledgement3: boolean; // Pets are prohibited...up to $450
  acknowledgement4: boolean; // I understand that...Dent Source LLC
  acknowledgement5: boolean; // I understand that...tolls and parking
  acknowledgement6: boolean; // I understand that...Oklahoma County, OK
  signaturePage2: string;

  // Page 3: Authorization and Direction of Pay
  insuranceCompany: string;
  claimNumber: string;
  dateOfLoss: string;
  signaturePage3: string;
}

const schema = yup.object().shape({
  // Page 1: Credit Card Authorization Form
  customerName: yup.string().required('Customer name is required'),
  customerPhone: yup.string().required('Phone number is required'),
  customerEmail: yup.string().email('Invalid email').required('Email is required'),

  cardHolderName: yup.string().required('Name of card holder is required'),
  cardHolderAddress: yup.string().required('Billing address is required'),
  cardHolderPhone: yup.string().required('Phone number is required'),
  cardHolderEmail: yup.string().email('Invalid email').required('Email is required'),

  cardType: yup.string().required('Please select a card type'),
  otherCardType: yup.string().when('cardType', ([cardType], schema) =>
    cardType === 'Other' ? schema.required('Please specify card type') : schema),

  cardNumber: yup
    .string()
    .required('Card number is required')
    .matches(/^[0-9]{13,19}$/, 'Please enter a valid card number'),

  expirationDate: yup
    .string()
    .required('Expiration date is required')
    .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Please enter date in MM/YY format'),

  cvc: yup
    .string()
    .required('CVC is required')
    .matches(/^[0-9]{3,4}$/, 'Please enter a valid CVC'),

  agreementAccepted: yup.boolean().required().oneOf([true], 'You must agree to the terms to continue'),
  signaturePage1: yup.string().required('Signature is required'),

  // Page 2: Car Rental Acknowledgments
  acknowledgement1: yup.boolean().required().oneOf([true], 'All acknowledgements must be checked'),
  acknowledgement2: yup.boolean().required().oneOf([true], 'All acknowledgements must be checked'),
  acknowledgement3: yup.boolean().required().oneOf([true], 'All acknowledgements must be checked'),
  acknowledgement4: yup.boolean().required().oneOf([true], 'All acknowledgements must be checked'),
  acknowledgement5: yup.boolean().required().oneOf([true], 'All acknowledgements must be checked'),
  acknowledgement6: yup.boolean().required().oneOf([true], 'All acknowledgements must be checked'),
  signaturePage2: yup.string().required('Signature is required'),

  // Page 3: Authorization and Direction of Pay
  insuranceCompany: yup.string().required('Insurance company is required'),
  claimNumber: yup.string().required('Claim number is required'),
  dateOfLoss: yup.string().required('Date of loss is required'),
  signaturePage3: yup.string().required('Signature is required'),
});

export default function RentalForm({ onSubmit }: { onSubmit: (data: RentalFormData) => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [signaturePage1Saved, setSignaturePage1Saved] = useState(false);
  const [signaturePage2Saved, setSignaturePage2Saved] = useState(false);
  const [signaturePage3Saved, setSignaturePage3Saved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const { email: estimatorEmail } = location.state as LocationState;

  const { register, handleSubmit, watch, setValue, formState: { errors }, trigger } = useForm<RentalFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange'
  });

  const cardType = watch('cardType');

  // Handle signature saves for each page
  const handleSignaturePage1Save = (signatureDataUrl: string) => {
    setValue('signaturePage1', signatureDataUrl);
    setSignaturePage1Saved(true);
  };

  const handleSignaturePage2Save = (signatureDataUrl: string) => {
    setValue('signaturePage2', signatureDataUrl);
    setSignaturePage2Saved(true);
  };

  const handleSignaturePage3Save = (signatureDataUrl: string) => {
    setValue('signaturePage3', signatureDataUrl);
    setSignaturePage3Saved(true);
  };

  // Function to validate current step before proceeding
  const validateStep = async () => {
    let fieldsToValidate: (keyof RentalFormData)[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = [
          'customerName', 'customerPhone', 'customerEmail',
          'cardHolderName', 'cardHolderAddress', 'cardHolderPhone', 'cardHolderEmail',
          'cardType', 'cardNumber', 'expirationDate', 'cvc', 'agreementAccepted', 'signaturePage1'
        ];
        if (cardType === 'Other') {
          fieldsToValidate.push('otherCardType');
        }
        break;
      case 2:
        fieldsToValidate = [
          'acknowledgement1', 'acknowledgement2', 'acknowledgement3',
          'acknowledgement4', 'acknowledgement5', 'acknowledgement6',
          'signaturePage2'
        ];
        break;
      case 3:
        fieldsToValidate = ['insuranceCompany', 'claimNumber', 'dateOfLoss', 'signaturePage3'];
        break;
    }

    const result = await trigger(fieldsToValidate);
    return result;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={styles.formStep}>
            <h2 className={styles.centerHeading}>Credit Card Authorization Form</h2>

            <p className={styles.agreementText}>
              Please fill out the information below to authorize Dent Source LLC and/or DS Rentals LLC to charge the below credit/debit card for the rental related charges accrued during the duration of your time in the rental. This form will be kept on file for the specified charges to be billed for the time period the customer in the rental listed below. This credit/debit card is to be used for charges for:
            </p>

            <div className={styles.inputGroup}>
              <label>Customer Name</label>
              <input
                {...register("customerName")}
                placeholder="Full name"
              />
              {errors.customerName && <span className={styles.error}>{errors.customerName.message}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label>Phone Number</label>
              <input
                type="tel"
                inputMode="numeric"
                {...register("customerPhone")}
                className={styles.phoneInput}
              />
              {errors.customerPhone && <span className={styles.error}>{errors.customerPhone.message}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label>Email</label>
              <input
                type="email"
                {...register("customerEmail")}
              />
              {errors.customerEmail && <span className={styles.error}>{errors.customerEmail.message}</span>}
            </div>

            <div className={styles.agreementText}>
              <p>By signing in the space below and providing a copy of my Driver's License; and, the credit/debit card back & front with my name clearly visible, I hereby authorize Dent Source LLC, and/or DS Rentals LLC to charge the credit card listed below for the following charges:</p>
            </div>

            <div className={styles.chargesBox}>
              <ul>
                <li>Fuel -$25 per quarter tank to refuel for failure to return on a full tank.</li>
                <li>Smoking - $450 cleaning fee assessed for smoking in the rental</li>
                <li>Pets - $450 cleaning fee assessed for pet damage in the rental</li>
                <li>Tolls and Parking fees - Charged at the rate of toll/bill/invoice</li>
                <li>4% credit card processing fee</li>
              </ul>
            </div>

            <div className={styles.inputGroup}>
              <label>Name of Card Holder</label>
              <input {...register("cardHolderName")} />
              {errors.cardHolderName && <span className={styles.error}>{errors.cardHolderName.message}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label>Billing Address of Card Holder</label>
              <input {...register("cardHolderAddress")} />
              {errors.cardHolderAddress && <span className={styles.error}>{errors.cardHolderAddress.message}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label>Phone Number of Card Holder</label>
              <input
                type="tel"
                inputMode="numeric"
                {...register("cardHolderPhone")}
                className={styles.phoneInput}
              />
              {errors.cardHolderPhone && <span className={styles.error}>{errors.cardHolderPhone.message}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label>Email Address of Card Holder</label>
              <input
                type="email"
                {...register("cardHolderEmail")}
              />
              {errors.cardHolderEmail && <span className={styles.error}>{errors.cardHolderEmail.message}</span>}
            </div>

            <div className={styles.cardTypeSection}>
              <h3>Type of Credit/Debit Card</h3>
              <div className={styles.cardOptions}>
                {['Visa', 'American Express', 'Master Card', 'Discover Card', 'Other'].map((type) => (
                  <label key={type} className={styles.cardOption}>
                    <input
                      type="radio"
                      {...register("cardType")}
                      value={type}
                      className={styles.greenRadio}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>

              {cardType === 'Other' && (
                <div className={styles.inputGroup}>
                  <input
                    {...register("otherCardType")}
                    placeholder="Enter Card Type"
                  />
                  {errors.otherCardType && <span className={styles.error}>{errors.otherCardType.message}</span>}
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label>Card Number</label>
              <input
                type="text"
                inputMode="numeric"
                {...register("cardNumber")}
                placeholder="XXXX XXXX XXXX XXXX"
              />
              {errors.cardNumber && <span className={styles.error}>{errors.cardNumber.message}</span>}
            </div>

            <div className={styles.nameGroup}>
              <div className={styles.inputGroup}>
                <label>Expiration Date</label>
                <input
                  type="text"
                  {...register("expirationDate")}
                  placeholder="MM/YY"
                />
                {errors.expirationDate && <span className={styles.error}>{errors.expirationDate.message}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label>CVC</label>
                <input
                  type="text"
                  inputMode="numeric"
                  {...register("cvc")}
                  placeholder="XXX"
                />
                {errors.cvc && <span className={styles.error}>{errors.cvc.message}</span>}
              </div>
            </div>

            <div className={styles.agreementBox}>
              <p className={styles.agreementText}>
                I agree to be responsible for all charges as noted above for myself, any of my guests for the duration of the time that I was in the rented vehicle. I CERTIFY THAT I am an authorized user of this credit card and that I will not dispute this payment: as long as the transaction corresponds to the terms indicated in this form.
              </p>
              <div className={styles.acceptanceRow}>
                <input
                  type="checkbox"
                  {...register("agreementAccepted")}
                />
                <span>I agree to the terms</span>
              </div>
              {errors.agreementAccepted && <span className={styles.error}>{errors.agreementAccepted.message}</span>}
            </div>

            <div className={styles.signatureSection}>
              <h3>Signature</h3>
              <SignatureField onSave={handleSignaturePage1Save} />
              {errors.signaturePage1 && <span className={styles.error}>{errors.signaturePage1.message}</span>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.formStep}>
            <h2 className={styles.centerHeading}>Dent Source LLC - Car Rental Acknowledgments</h2>

            <div className={styles.acknowledgements}>
              <p className={styles.acknowledgementNotice}>Please check each acknowledgment below:</p>

              <div className={styles.acknowledgementRow}>
                <input
                  type="checkbox"
                  {...register("acknowledgement1")}
                />
                <span>Promissory to return... increments, upon return</span>
              </div>
              {errors.acknowledgement1 && <span className={styles.error}>{errors.acknowledgement1.message}</span>}

              <div className={styles.acknowledgementRow}>
                <input
                  type="checkbox"
                  {...register("acknowledgement2")}
                />
                <span>Dent Source prohibits... the rented vehicle</span>
              </div>
              {errors.acknowledgement2 && <span className={styles.error}>{errors.acknowledgement2.message}</span>}

              <div className={styles.acknowledgementRow}>
                <input
                  type="checkbox"
                  {...register("acknowledgement3")}
                />
                <span>Pets are prohibited... up to $450</span>
              </div>
              {errors.acknowledgement3 && <span className={styles.error}>{errors.acknowledgement3.message}</span>}

              <div className={styles.acknowledgementRow}>
                <input
                  type="checkbox"
                  {...register("acknowledgement4")}
                />
                <span>I understand that... Dent Source LLC</span>
              </div>
              {errors.acknowledgement4 && <span className={styles.error}>{errors.acknowledgement4.message}</span>}

              <div className={styles.acknowledgementRow}>
                <input
                  type="checkbox"
                  {...register("acknowledgement5")}
                />
                <span>I understand that... tolls and parking</span>
              </div>
              {errors.acknowledgement5 && <span className={styles.error}>{errors.acknowledgement5.message}</span>}

              <div className={styles.acknowledgementRow}>
                <input
                  type="checkbox"
                  {...register("acknowledgement6")}
                />
                <span>I understand that... Oklahoma County, OK</span>
              </div>
              {errors.acknowledgement6 && <span className={styles.error}>{errors.acknowledgement6.message}</span>}
            </div>

            <div className={styles.signatureSection}>
              <h3>Signature</h3>
              <SignatureField onSave={handleSignaturePage2Save} />
              {errors.signaturePage2 && <span className={styles.error}>{errors.signaturePage2.message}</span>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.formStep}>
            <h2 className={styles.centerHeading}>DS Rentals LLC - Authorization and Direction of Pay</h2>

            <div className={styles.agreementSection}>
              <p className={styles.agreementText}>
                I am choosing DS Rentals LLC as my rental company of choice while my vehicle is being repaired.
                I authorize <input
                  {...register("insuranceCompany")}
                  className={styles.inlineInput}
                  placeholder="your insurance company"
                /> to pay DS Rentals LLC directly upon completion and return of my personal automobile. I understand that should my insurer send the payment directly to me or any other policy holder on my insurance policy, I will forward the payment directly to DS Rentals LLC at the address provided. Should I choose to keep the rental payment, I understand that DS Rentals LLC will take any and all policy holders on this policy and the insurer to a court of law within the legal jurisdiction of DS Rentals LLC headquarters in Oklahoma County, OK.
              </p>
              {errors.insuranceCompany && <span className={styles.error}>{errors.insuranceCompany.message}</span>}
            </div>

            <div className={styles.nameGroup}>
              <div className={styles.inputGroup}>
                <label>Claim Number</label>
                <input {...register("claimNumber")} />
                {errors.claimNumber && <span className={styles.error}>{errors.claimNumber.message}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label>Date of Loss</label>
                <input
                  type="date"
                  {...register("dateOfLoss")}
                />
                {errors.dateOfLoss && <span className={styles.error}>{errors.dateOfLoss.message}</span>}
              </div>
            </div>

            <div className={styles.signatureSection}>
              <h3>Signature</h3>
              <SignatureField onSave={handleSignaturePage3Save} />
              {errors.signaturePage3 && <span className={styles.error}>{errors.signaturePage3.message}</span>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const onFormSubmit = async (data: RentalFormData) => {
    // Check if the current step's signature is saved
    if (
      (currentStep === 1 && !signaturePage1Saved) ||
      (currentStep === 2 && !signaturePage2Saved) ||
      (currentStep === 3 && !signaturePage3Saved)
    ) {
      alert("Please save your signature before proceeding");
      return;
    }

    // If we're on the final step, submit the form
    if (currentStep === 3) {
      setIsSubmitting(true);
      try {
        const result = await submitForm(
          data as unknown as Record<string, unknown>,
          'rental',
          estimatorEmail || 'unknown@somewhere.com'
        );

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
    } else {
      // Otherwise, validate and move to the next step
      const isValid = await validateStep();
      if (isValid) {
        setCurrentStep(currentStep + 1);
      } else {
        alert("Please fill in all required fields and save your signature before proceeding");
      }
    }
  };

  // Handle next button click
  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid) {
      setCurrentStep(currentStep + 1);
    } else {
      alert("Please fill in all required fields and save your signature before proceeding");
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        {renderStep()}
        <div className={styles.formNavigation}>
          {currentStep > 1 && (
            <button
              type="button"
              className={styles.prevButton}
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={isSubmitting}
            >
              Previous
            </button>
          )}
          {currentStep < 3 ? (
            <button
              type="button"
              className={styles.nextButton}
              onClick={handleNext}
              disabled={isSubmitting}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || !signaturePage3Saved}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
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
