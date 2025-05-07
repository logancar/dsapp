import React, { useState } from 'react';
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
  customerAddress: string;

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
  signatureDate1: string;

  // Page 2: Car Rental Acknowledgments
  acknowledgement1: boolean; // Promissory to return...increments, upon return
  acknowledgement2: boolean; // Dent Source prohibits...the rented vehicle
  acknowledgement3: boolean; // Pets are prohibited...up to $450
  acknowledgement4: boolean; // I understand that...Dent Source LLC
  acknowledgement5: boolean; // I understand that...tolls and parking
  acknowledgement6: boolean; // I understand that...Oklahoma County, OK
  signaturePage2: string;
  signatureDate2: string;

  // Page 3: Authorization and Direction of Pay
  insuranceCompany: string;
  claimNumber: string;
  dateOfLoss: string;
  signaturePage3: string;
  signatureDate3: string;
}

const schema = yup.object().shape({
  // Page 1: Credit Card Authorization Form
  customerName: yup.string().required('Customer name is required'),
  customerPhone: yup.string().required('Phone number is required'),
  customerEmail: yup.string().email('Invalid email').required('Email is required'),
  customerAddress: yup.string().required('Address is required'),

  // Card holder fields can be empty if customer info is used
  cardHolderName: yup.string().optional(),
  cardHolderAddress: yup.string().optional(),
  cardHolderPhone: yup.string().optional(),
  cardHolderEmail: yup.string().email('Invalid email').optional(),

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
  signatureDate1: yup.string().required('Date is required'),

  // Page 2: Car Rental Acknowledgments - all optional now
  acknowledgement1: yup.boolean().optional(),
  acknowledgement2: yup.boolean().optional(),
  acknowledgement3: yup.boolean().optional(),
  acknowledgement4: yup.boolean().optional(),
  acknowledgement5: yup.boolean().optional(),
  acknowledgement6: yup.boolean().optional(),
  signaturePage2: yup.string().required('Signature is required'),
  signatureDate2: yup.string().required('Date is required'),

  // Page 3: Authorization and Direction of Pay
  insuranceCompany: yup.string().required('Insurance company is required'),
  claimNumber: yup.string().required('Claim number is required'),
  dateOfLoss: yup.string().required('Date of loss is required'),
  signaturePage3: yup.string().required('Signature is required'),
  signatureDate3: yup.string().required('Date is required'),
});

export default function RentalForm({ onSubmit }: { onSubmit: (data: RentalFormData) => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [signaturePage1Saved, setSignaturePage1Saved] = useState(false);
  const [signaturePage2Saved, setSignaturePage2Saved] = useState(false);
  const [signaturePage3Saved, setSignaturePage3Saved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const { email: estimatorEmail } = location.state as LocationState;

  const { register, watch, setValue, getValues, formState: { errors }, trigger } = useForm<RentalFormData>({
    resolver: yupResolver(schema) as any,
    mode: 'onChange'
  });

  const cardType = watch('cardType');
  const customerName = watch('customerName');
  const customerPhone = watch('customerPhone');
  const customerEmail = watch('customerEmail');

  // Auto-fill card holder fields with customer info when customer fields change
  React.useEffect(() => {
    const cardHolderName = getValues('cardHolderName');
    if (!cardHolderName && customerName) {
      setValue('cardHolderName', customerName);
    }
  }, [customerName, setValue, getValues]);

  React.useEffect(() => {
    const cardHolderPhone = getValues('cardHolderPhone');
    if (!cardHolderPhone && customerPhone) {
      setValue('cardHolderPhone', customerPhone);
    }
  }, [customerPhone, setValue, getValues]);

  React.useEffect(() => {
    const cardHolderEmail = getValues('cardHolderEmail');
    if (!cardHolderEmail && customerEmail) {
      setValue('cardHolderEmail', customerEmail);
    }
  }, [customerEmail, setValue, getValues]);

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
          'customerName', 'customerPhone', 'customerEmail', 'customerAddress',
          // Removed card holder fields from validation
          'cardType', 'cardNumber', 'expirationDate', 'cvc', 'agreementAccepted', 'signaturePage1', 'signatureDate1'
        ];
        if (cardType === 'Other') {
          fieldsToValidate.push('otherCardType');
        }
        break;
      case 2:
        fieldsToValidate = [
          // Removed acknowledgements from validation
          'signaturePage2', 'signatureDate2'
        ];
        break;
      case 3:
        fieldsToValidate = ['insuranceCompany', 'claimNumber', 'dateOfLoss', 'signaturePage3', 'signatureDate3'];
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

            <div className={styles.inputGroup}>
              <label>Address</label>
              <input
                {...register("customerAddress")}
                placeholder="Enter address"
              />
              {errors.customerAddress && <span className={styles.error}>{errors.customerAddress.message}</span>}
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
              <input
                {...register("cardHolderAddress")}
                placeholder="Enter billing address"
              />
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
                      required
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
              {errors.cardType && <span className={styles.error}>{errors.cardType.message}</span>}

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
              <h3>Cardholder Signature</h3>
              <SignatureField onSave={handleSignaturePage1Save} />
              {errors.signaturePage1 && <span className={styles.error}>{errors.signaturePage1.message}</span>}

              <div className={styles.signatureDate}>
                <div className={styles.inputGroup}>
                  <label>Date</label>
                  <input
                    type="date"
                    {...register("signatureDate1")}
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
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
                <span>Promissory to return the rental vehicle with a full tank of fuel. If the vehicle is not returned with a full tank of fuel, I will be charged $25 per quarter tank to refuel. I understand that the fuel level is measured in quarter tank increments, upon return.</span>
              </div>
              {errors.acknowledgement1 && <span className={styles.error}>{errors.acknowledgement1.message}</span>}

              <div className={styles.acknowledgementRow}>
                <input
                  type="checkbox"
                  {...register("acknowledgement2")}
                />
                <span>Dent Source prohibits smoking in all rental vehicles. I understand that if I or any of my guests smoke in the rental vehicle, I will be charged a $450 cleaning fee. This includes cigarettes, cigars, vaping, and any other form of smoking in the rented vehicle.</span>
              </div>
              {errors.acknowledgement2 && <span className={styles.error}>{errors.acknowledgement2.message}</span>}

              <div className={styles.acknowledgementRow}>
                <input
                  type="checkbox"
                  {...register("acknowledgement3")}
                />
                <span>Pets are prohibited in all rental vehicles. I understand that if I or any of my guests bring a pet into the rental vehicle, I will be charged a cleaning fee of up to $450.</span>
              </div>
              {errors.acknowledgement3 && <span className={styles.error}>{errors.acknowledgement3.message}</span>}

              <div className={styles.acknowledgementRow}>
                <input
                  type="checkbox"
                  {...register("acknowledgement4")}
                />
                <span>I understand that I am responsible for all tolls, parking fees, and traffic violations incurred during my rental period. These charges will be billed to my credit card on file with Dent Source LLC.</span>
              </div>
              {errors.acknowledgement4 && <span className={styles.error}>{errors.acknowledgement4.message}</span>}

              <div className={styles.acknowledgementRow}>
                <input
                  type="checkbox"
                  {...register("acknowledgement5")}
                />
                <span>I understand that a 4% credit card processing fee will be added to all credit card transactions for tolls and parking.</span>
              </div>
              {errors.acknowledgement5 && <span className={styles.error}>{errors.acknowledgement5.message}</span>}

              <div className={styles.acknowledgementRow}>
                <input
                  type="checkbox"
                  {...register("acknowledgement6")}
                />
                <span>I understand that any disputes regarding this rental agreement will be resolved in a court of law within the legal jurisdiction of DS Rentals LLC headquarters in Oklahoma County, OK.</span>
              </div>
              {errors.acknowledgement6 && <span className={styles.error}>{errors.acknowledgement6.message}</span>}
            </div>

            <div className={styles.signatureSection}>
              <h3>Signature</h3>
              <SignatureField onSave={handleSignaturePage2Save} />
              {errors.signaturePage2 && <span className={styles.error}>{errors.signaturePage2.message}</span>}

              <div className={styles.signatureDate}>
                <div className={styles.inputGroup}>
                  <label>Date</label>
                  <input
                    type="date"
                    {...register("signatureDate2")}
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
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

              <div className={styles.signatureDate}>
                <div className={styles.inputGroup}>
                  <label>Date</label>
                  <input
                    type="date"
                    {...register("signatureDate3")}
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Removed unused function
  /*
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
  */

    /* Removed rest of unused function
    // If we're on the final step, submit the form
    if (currentStep === 3) {
      // We'll handle the form submission in the submit button click handler
      // This function will just validate and move between steps
      const isValid = await validateStep();
      if (isValid) {
        // The submit button will handle the actual submission
        return true;
      } else {
        alert("Please fill in all required fields and save your signature before proceeding");
        return false;
      }
    } else {
      // Otherwise, validate and move to the next step
      const isValid = await validateStep();
      if (isValid) {
        setCurrentStep(currentStep + 1);
        return true;
      } else {
        alert("Please fill in all required fields and save your signature before proceeding");
        return false;
      }
    }
    */

  // Handle next button click
  const handleNext = async () => {
    // Check if the current step's signature is saved
    if (
      (currentStep === 1 && !signaturePage1Saved) ||
      (currentStep === 2 && !signaturePage2Saved)
    ) {
      alert("Please save your signature before proceeding");
      return;
    }

    const isValid = await validateStep();
    if (isValid) {
      // Additional check for specific fields based on the current step
      if (currentStep === 1) {
        // Check credit card fields specifically
        // Get all form values
        const formValues = getValues();

        // Log values for debugging
        console.log('Form values:', formValues);

        // Force update form values with fallbacks - this is critical
        setValue('cardHolderName', formValues.cardHolderName || formValues.customerName);
        // Don't set a default for cardHolderAddress - let user enter it
        setValue('cardHolderPhone', formValues.cardHolderPhone || formValues.customerPhone);
        setValue('cardHolderEmail', formValues.cardHolderEmail || formValues.customerEmail);

        // Get updated values after setting fallbacks
        const updatedFormValues = getValues();
        console.log('Updated values after fallback:', updatedFormValues);

        // No validation for card holder fields - they can be empty
        // Just set default values for them
        setValue('cardHolderName', updatedFormValues.cardHolderName || updatedFormValues.customerName || 'Customer');
        // Don't set a default for cardHolderAddress - let user enter it
        setValue('cardHolderPhone', updatedFormValues.cardHolderPhone || updatedFormValues.customerPhone);
        setValue('cardHolderEmail', updatedFormValues.cardHolderEmail || updatedFormValues.customerEmail);
      } else if (currentStep === 2) {
        // Force all acknowledgements to be true
        setValue('acknowledgement1', true);
        setValue('acknowledgement2', true);
        setValue('acknowledgement3', true);
        setValue('acknowledgement4', true);
        setValue('acknowledgement5', true);
        setValue('acknowledgement6', true);
      }

      setCurrentStep(currentStep + 1);
    } else {
      alert("Please fill in all required fields and save your signature before proceeding");
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={(e) => {
        // Prevent default form submission - we're handling it with the button click
        e.preventDefault();
        console.log('Form submit event triggered, but we are handling submission with the button click');
      }}>
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
              type="button" // Changed from submit to button to handle manually
              className={styles.submitButton}
              disabled={isSubmitting || !signaturePage3Saved}
              onClick={async (e) => {
                e.preventDefault();
                console.log('Submit button clicked directly');

                if (!signaturePage3Saved) {
                  console.log('Signature not saved');
                  alert("Please save your signature before proceeding");
                  return;
                }

                // Validate all steps of the form before submitting
                // First, save the current step
                const currentStepBackup = currentStep;

                // Check step 1
                setCurrentStep(1);

                // Get all values first for detailed validation
                const formValues = getValues();
                console.log('All form values:', formValues);

                // Check credit card fields specifically with detailed messages
                // Removed unused variable cardFields

                // Log all form values for debugging
                console.log('Form values for validation:', {
                  cardHolderName: formValues.cardHolderName,
                  cardHolderAddress: formValues.cardHolderAddress,
                  cardHolderPhone: formValues.cardHolderPhone,
                  cardHolderEmail: formValues.cardHolderEmail,
                  cardType: formValues.cardType,
                  cardNumber: formValues.cardNumber,
                  expirationDate: formValues.expirationDate,
                  cvc: formValues.cvc,
                  customerName: formValues.customerName,
                  customerPhone: formValues.customerPhone,
                  customerEmail: formValues.customerEmail
                });

                // Force update form values with fallbacks - this is critical
                setValue('cardHolderName', formValues.cardHolderName || formValues.customerName);
                // Don't set a default for cardHolderAddress - let user enter it
                setValue('cardHolderPhone', formValues.cardHolderPhone || formValues.customerPhone);
                setValue('cardHolderEmail', formValues.cardHolderEmail || formValues.customerEmail);

                // Get updated values after setting fallbacks
                const updatedFormValues = getValues();
                console.log('Updated form values after fallback:', {
                  cardHolderName: updatedFormValues.cardHolderName,
                  cardHolderAddress: updatedFormValues.cardHolderAddress,
                  cardHolderPhone: updatedFormValues.cardHolderPhone,
                  cardHolderEmail: updatedFormValues.cardHolderEmail
                });

                // No validation for card holder fields - they can be empty
                // Just set default values for them
                setValue('cardHolderName', formValues.cardHolderName || formValues.customerName || 'Customer');
                // Don't set a default for cardHolderAddress - let user enter it
                setValue('cardHolderPhone', formValues.cardHolderPhone || formValues.customerPhone);
                setValue('cardHolderEmail', formValues.cardHolderEmail || formValues.customerEmail);

                // Now trigger the validation for other fields
                const step1Valid = await trigger([
                  'customerName', 'customerPhone', 'customerEmail',
                  'cardType', 'cardNumber', 'expirationDate', 'cvc',
                  'agreementAccepted', 'signaturePage1', 'signatureDate1'
                ]);

                if (!step1Valid) {
                  alert("Please fill in all required fields on page 1 (Credit Card Authorization)");
                  setCurrentStep(1);
                  setIsSubmitting(false);
                  return;
                }

                // Check step 2
                setCurrentStep(2);

                // Force all acknowledgements to be true
                setValue('acknowledgement1', true);
                setValue('acknowledgement2', true);
                setValue('acknowledgement3', true);
                setValue('acknowledgement4', true);
                setValue('acknowledgement5', true);
                setValue('acknowledgement6', true);

                // Check signature
                if (!formValues.signaturePage2 || !signaturePage2Saved) {
                  alert("Please save your signature on page 2");
                  setCurrentStep(2);
                  setIsSubmitting(false);
                  return;
                }

                // We've already checked everything manually

                // Check step 3
                setCurrentStep(3);

                // Check page 3 fields individually
                let missingPage3Fields = [];
                if (!formValues.insuranceCompany) missingPage3Fields.push('Insurance Company');
                if (!formValues.claimNumber) missingPage3Fields.push('Claim Number');
                if (!formValues.dateOfLoss) missingPage3Fields.push('Date of Loss');
                if (!formValues.signatureDate3) missingPage3Fields.push('Signature Date');

                if (missingPage3Fields.length > 0) {
                  alert(`Please fill in the following fields: ${missingPage3Fields.join(', ')}`);
                  setCurrentStep(3);
                  setIsSubmitting(false);
                  return;
                }

                // Check signature
                if (!formValues.signaturePage3 || !signaturePage3Saved) {
                  alert("Please save your signature on page 3");
                  setCurrentStep(3);
                  setIsSubmitting(false);
                  return;
                }

                // We've already checked everything manually

                // Check all signatures
                if (!signaturePage1Saved || !signaturePage2Saved || !signaturePage3Saved) {
                  alert("Please ensure all signatures are saved on all pages");
                  setIsSubmitting(false);
                  return;
                }

                // Restore the current step
                setCurrentStep(currentStepBackup);

                // Set loading state
                setIsSubmitting(true);

                // Create a manual loading overlay
                const overlay = document.createElement('div');
                overlay.id = 'manual-loading-overlay';
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
                overlay.style.display = 'flex';
                overlay.style.flexDirection = 'column';
                overlay.style.justifyContent = 'center';
                overlay.style.alignItems = 'center';
                overlay.style.zIndex = '9999';

                const spinner = document.createElement('div');
                spinner.style.width = '70px';
                spinner.style.height = '70px';
                spinner.style.border = '6px solid rgba(255, 255, 255, 0.3)';
                spinner.style.borderRadius = '50%';
                spinner.style.borderTopColor = '#3BB554';
                spinner.style.animation = 'spin 1s ease-in-out infinite';

                const text = document.createElement('p');
                text.textContent = 'Submitting documents, please wait...';
                text.style.color = 'white';
                text.style.marginTop = '20px';
                text.style.fontSize = '1.2rem';

                overlay.appendChild(spinner);
                overlay.appendChild(text);

                // Remove any existing overlay first
                const existingOverlay = document.getElementById('manual-loading-overlay');
                if (existingOverlay) {
                  document.body.removeChild(existingOverlay);
                }

                document.body.appendChild(overlay);

                // Add keyframes for spinner animation
                const style = document.createElement('style');
                style.id = 'spinner-style';
                style.textContent = `
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `;

                // Remove any existing style first
                const existingStyle = document.getElementById('spinner-style');
                if (existingStyle) {
                  document.head.removeChild(existingStyle);
                }

                document.head.appendChild(style);

                // Get form data
                const data = getValues();

                // Submit form
                setTimeout(async () => {
                  try {
                    console.log('Submitting form data:', data);
                    // Get current date in MM/DD/YYYY format
                    const currentDate = new Date().toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric'
                    });

                    // Also get the date values from the form for each page
                    const signatureDate1 = data.signatureDate1 ? new Date(data.signatureDate1).toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric'
                    }) : currentDate;

                    const signatureDate2 = data.signatureDate2 ? new Date(data.signatureDate2).toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric'
                    }) : currentDate;

                    const signatureDate3 = data.signatureDate3 ? new Date(data.signatureDate3).toLocaleDateString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric'
                    }) : currentDate;

                    // Process card type (handle radio button selection)
                    let cardTypeValue = data.cardType;
                    if (data.cardType === 'Other' && data.otherCardType) {
                      cardTypeValue = data.otherCardType;
                    }

                    console.log('Card type value:', cardTypeValue);

                    // Format date of loss if it exists
                    let formattedDateOfLoss = data.dateOfLoss;
                    if (formattedDateOfLoss) {
                      // Convert from YYYY-MM-DD to MM/DD/YYYY
                      const dateParts = formattedDateOfLoss.split('-');
                      if (dateParts.length === 3) {
                        formattedDateOfLoss = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;
                      }
                    }

                    console.log('Date of loss:', formattedDateOfLoss);

                    // Ensure all acknowledgements are set to true
                    const acknowledgements = {
                      acknowledgement1: true,
                      acknowledgement2: true,
                      acknowledgement3: true,
                      acknowledgement4: true,
                      acknowledgement5: true,
                      acknowledgement6: true,
                      // Map to the exact field names in the PDF
                      ack1: true,
                      ack2: true,
                      ack3: true,
                      ack4: true,
                      ack5: true,
                      ack6: true
                    };

                    // Map the form data to match the PDF field names
                    const formattedData = {
                      ...data,
                      // Ensure all acknowledgements are set to true
                      ...acknowledgements,
                      // Map to the exact field names in the PDF
                      customerName: data.customerName,
                      customerPhone: data.customerPhone,
                      customerEmail: data.customerEmail,
                      customerAddress: data.customerAddress,
                      address: data.customerAddress, // Add alternative field name for address

                      // Card holder information
                      cardholderName: data.cardHolderName || data.customerName || 'Customer',
                      cardholderStreet: data.cardHolderAddress || 'Same as customer',
                      cardholderPhone: data.cardHolderPhone || data.customerPhone,
                      cardholderEmail: data.cardHolderEmail || data.customerEmail,

                      // Card information
                      cardNumber: data.cardNumber,
                      expDate: data.expirationDate,
                      cvc: data.cvc,

                      // Handle card type checkboxes
                      visa: cardTypeValue === 'Visa' ? true : false,
                      americanExpress: cardTypeValue === 'American Express' ? true : false,
                      masterCard: cardTypeValue === 'Master Card' ? true : false,
                      discoverCard: cardTypeValue === 'Discover Card' ? true : false,

                      // Acknowledgements (already set to true in acknowledgements object)

                      // Insurance information
                      insuranceCompany: data.insuranceCompany,
                      claimNumber: data.claimNumber,
                      dateofLoss: formattedDateOfLoss,
                      vehicleOwner: data.customerName, // Use customer name as vehicle owner

                      // Signatures
                      signature1: data.signaturePage1,
                      signature2: data.signaturePage2,
                      signature3: data.signaturePage3,

                      // Dates
                      todayDate1: signatureDate1,
                      todayDate2: signatureDate2,
                      todayDate3: signatureDate3,

                      // Remove fields that should be excluded
                      rentalUnit: undefined,
                      otherCharges: undefined,
                      otherCardType: undefined,
                    };

                    console.log('Formatted form data:', formattedData);

                    // Log signature data status
                    console.log('Signature data status:', {
                      signaturePage1: !!data.signaturePage1,
                      signaturePage2: !!data.signaturePage2,
                      signaturePage3: !!data.signaturePage3,
                      signaturePage1Saved,
                      signaturePage2Saved,
                      signaturePage3Saved
                    });

                    try {
                      console.log('Submitting rental form data...');

                      // Add additional logging for debugging
                      console.log('Checking signature data:');
                      console.log('- Page 1 signature length:', formattedData.signature1 ? formattedData.signature1.toString().length : 0);
                      console.log('- Page 2 signature length:', formattedData.signature2 ? formattedData.signature2.toString().length : 0);
                      console.log('- Page 3 signature length:', formattedData.signature3 ? formattedData.signature3.toString().length : 0);

                      const result = await submitForm(
                        formattedData as unknown as Record<string, unknown>,
                        'rental',
                        estimatorEmail || 'info@autohail.group'
                      );

                      if (result.success) {
                        console.log('Form submitted successfully');
                        onSubmit(data);

                        // Redirect after a delay
                        setTimeout(() => {
                          window.location.href = '/thankyou';
                        }, 1000);
                      } else {
                        console.error('Form submission failed:', result.message);
                        alert('Failed to submit form. Please try again.');

                        // Remove overlay
                        document.body.removeChild(overlay);
                        document.head.removeChild(style);
                      }
                    } catch (submitError) {
                      console.error('Error during form submission:', submitError);

                      // Check for specific error types
                      if (submitError instanceof TypeError && submitError.message.includes('Failed to fetch')) {
                        alert('Network error: Could not connect to the server. Please check your internet connection and try again.');
                      } else if (submitError instanceof Error) {
                        alert(`Error submitting form: ${submitError.message}`);
                      } else {
                        alert('An unknown error occurred while submitting the form. Please try again.');
                      }

                      // Remove the loading overlay
                      const existingOverlay = document.getElementById('manual-loading-overlay');
                      if (existingOverlay) {
                        document.body.removeChild(existingOverlay);
                      }

                      setIsSubmitting(false);
                    }
                  } catch (error) {
                    console.error('Error submitting form:', error);
                    alert('Error submitting form. Please try again.');

                    // Remove overlay
                    document.body.removeChild(overlay);
                    document.head.removeChild(style);
                    setIsSubmitting(false);
                  }
                }, 500);
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          )}
        </div>
      </form>

      {/* We're now using a direct DOM approach for the loading overlay */}
    </div>
  );
}
