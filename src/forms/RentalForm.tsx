import { useState } from 'react';
import { useForm } from 'react-hook-form';
import SignatureCanvas from 'react-signature-canvas';
import styles from './RentalForm.module.css';

interface RentalFormData {
  customerFirstName: string;
  customerLastName: string;
  customerPhone: string;
  customerEmail: string;
  customerStreet: string;
  customerCity: string;
  customerState: string;
  customerZip: string;
  
  cardHolderName: string;
  cardHolderStreet: string;
  cardHolderCity: string;
  cardHolderState: string;
  cardHolderZip: string;
  cardHolderPhone: string;
  cardHolderEmail: string;
  
  cardType: string;
  otherCardIssuer?: string;
  
  agreementAccepted: boolean;
  
  // Acknowledgements
  fuelAcknowledgement: boolean;
  smokingAcknowledgement: boolean;
  petAcknowledgement: boolean;
  outOfStateAcknowledgement: boolean;
  tollAcknowledgement: boolean;
  paymentAcknowledgement: boolean;
  
  insuranceCompany: string;
  claimNumber: string;
  dateOfLoss: string;
  signature: string;
}

export default function RentalForm({ onSubmit }: { onSubmit: (data: RentalFormData) => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [signaturePad, setSignaturePad] = useState<SignatureCanvas | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RentalFormData>();
  
  const cardType = watch('cardType');

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="form-step">
            <h2 className={styles.centerHeading}>Customer Information</h2>
            <div className={styles.nameGroup}>
              <div className={styles.inputGroup}>
                <label>First Name</label>
                <input 
                  {...register("customerFirstName", { required: "First name is required" })}
                  placeholder="First name"
                />
                {errors.customerFirstName && <span className={styles.error}>{errors.customerFirstName.message}</span>}
              </div>
              <div className={styles.inputGroup}>
                <label>Last Name</label>
                <input 
                  {...register("customerLastName", { required: "Last name is required" })}
                  placeholder="Last name"
                />
                {errors.customerLastName && <span className={styles.error}>{errors.customerLastName.message}</span>}
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Phone Number</label>
              <input 
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                {...register("customerPhone", { required: "Phone number is required" })}
                className={styles.phoneInput}
              />
              {errors.customerPhone && <span className={styles.error}>{errors.customerPhone.message}</span>}
            </div>

            <div className={styles.inputGroup}>
              <label>Email</label>
              <input 
                type="email"
                {...register("customerEmail", { required: "Email is required" })}
              />
              {errors.customerEmail && <span className={styles.error}>{errors.customerEmail.message}</span>}
            </div>

            <div className={styles.addressGroup}>
              <div className={styles.inputGroup}>
                <label>Street Address</label>
                <input {...register("customerStreet", { required: "Street address is required" })} />
              </div>
              <div className={styles.addressDetails}>
                <div className={styles.inputGroup}>
                  <label>City</label>
                  <input {...register("customerCity", { required: "City is required" })} />
                </div>
                <div className={styles.inputGroup}>
                  <label>State</label>
                  <input {...register("customerState", { required: "State is required" })} />
                </div>
                <div className={styles.inputGroup}>
                  <label>ZIP Code</label>
                  <input {...register("customerZip", { required: "ZIP code is required" })} />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <h2 className={styles.centerHeading}>Card Holder Information</h2>
            <div className={styles.inputGroup}>
              <label>Name of Card Holder</label>
              <input {...register("cardHolderName", { required: "Card holder name is required" })} />
            </div>

            <div className={styles.addressGroup}>
              <div className={styles.inputGroup}>
                <label>Billing Address</label>
                <input {...register("cardHolderStreet", { required: "Billing address is required" })} />
              </div>
              <div className={styles.addressDetails}>
                <div className={styles.inputGroup}>
                  <label>City</label>
                  <input {...register("cardHolderCity", { required: "City is required" })} />
                </div>
                <div className={styles.inputGroup}>
                  <label>State</label>
                  <input {...register("cardHolderState", { required: "State is required" })} />
                </div>
                <div className={styles.inputGroup}>
                  <label>ZIP Code</label>
                  <input {...register("cardHolderZip", { required: "ZIP code is required" })} />
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Phone #</label>
              <input 
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                {...register("cardHolderPhone", { required: "Phone number is required" })}
                className={styles.phoneInput}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Email</label>
              <input 
                type="email"
                {...register("cardHolderEmail", { required: "Email is required" })}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <h2 className={styles.centerHeading}>Card Details</h2>
            <div className={styles.cardTypeSection}>
              <h3>Type of Credit/Debit Card</h3>
              <div className={styles.cardOptions}>
                {['Visa', 'Mastercard', 'American Express', 'Discover', 'Other'].map((type) => (
                  <label key={type} className={styles.cardOption}>
                    <input
                      type="radio"
                      {...register("cardType", { required: "Please select a card type" })}
                      value={type}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
              
              {cardType === 'Other' && (
                <div className={styles.inputGroup}>
                  <input
                    {...register("otherCardIssuer", { 
                      required: cardType === 'Other' ? "Please specify card issuer" : false 
                    })}
                    placeholder="Enter Card Issuer Name"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-step">
            <h2 className={styles.centerHeading}>Agreement & Charges</h2>
            <div className={styles.chargesBox}>
              <h3>Charges Breakdown:</h3>
              <ul>
                <li>Fuel – ($24 per quarter tank to refuel for the failure to return on a full tank)</li>
                <li>Smoking – ($450 cleaning fee assessed for smoking in the rental)</li>
                <li>Pets – ($450 cleaning fee assessed for pets in rental)</li>
                <li>Tolls and Parking Fees – (Charged at the rate of toll/bill/invoice)</li>
                <li>4% Credit Card Processing Fee</li>
              </ul>
            </div>

            <div className={styles.agreementBox}>
              <p className={styles.agreementText}>
                I agree to be responsible for all charges notated above for myself, any of my guests 
                for the duration of time that I was in the rented vehicle. I certify that I am an 
                authorized user of this credit card and that I will not dispute this payment, as long 
                as the transaction corresponds to the terms indicated in this form.
              </p>
              <div className={styles.acceptanceRow}>
                <span>Accept:</span>
                <input 
                  type="checkbox" 
                  {...register("agreementAccepted", { 
                    required: "You must agree to the terms to continue" 
                  })}
                />
              </div>
              {errors.agreementAccepted && <span className={styles.error}>{errors.agreementAccepted.message}</span>}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="form-step">
            <h2 className={styles.centerHeading}>Car Rental Acknowledgements</h2>
            <div className={styles.acknowledgements}>
              <p className={styles.notice}>(All acknowledgements must be checked)</p>
              {[
                {
                  key: "fuelAcknowledgement",
                  text: "I promise to return the rental car with a full tank; if I fail to do so, I will be charged $25 per quarter tank."
                },
                {
                  key: "smokingAcknowledgement",
                  text: "I understand that Dent Source prohibits all types of smoking (including vaping) in its cars; if a car returns smelling of smoke, I will be charged up to $450 for cleaning."
                },
                {
                  key: "petAcknowledgement",
                  text: "I understand that pets are prohibited; if the car returns with pet hair or stains, I will be charged up to $450 for cleaning."
                },
                {
                  key: "outOfStateAcknowledgement",
                  text: "I understand that I must not take the rental out of state without written consent from an authorized representative of Dent Source LLC."
                },
                {
                  key: "tollAcknowledgement",
                  text: "I understand that I am responsible for any tolls and parking fees incurred during my rental."
                },
                {
                  key: "paymentAcknowledgement",
                  text: "I understand that the vehicle is provided at no charge to me, and D.S. Rentals LLC will bill my insurance company directly. If I receive a payment for my rental, I am aware I must forward the payment to Dent Source immediately. Failure to do so may result in legal action in Oklahoma County, OK."
                }
              ].map(({ key, text }) => (
                <div key={key} className={styles.acknowledgementRow}>
                  <input 
                    type="checkbox" 
                    {...register(key as keyof RentalFormData, { 
                      required: "All acknowledgements must be checked" 
                    })}
                  />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="form-step">
            <h2 className={styles.centerHeading}>Insurance & Signature</h2>
            <div className={styles.insuranceSection}>
              <div className={styles.inputGroup}>
                <label>Insurance Company</label>
                <input {...register("insuranceCompany", { required: "Insurance company is required" })} />
              </div>
              <div className={styles.inputGroup}>
                <label>Claim Number</label>
                <input {...register("claimNumber", { required: "Claim number is required" })} />
              </div>
              <div className={styles.inputGroup}>
                <label>Date of Loss</label>
                <input 
                  type="date"
                  {...register("dateOfLoss", { required: "Date of loss is required" })}
                />
              </div>
            </div>

            <div className={styles.signatureSection}>
              <label>Signature</label>
              <SignatureCanvas
                ref={(ref) => setSignaturePad(ref)}
                penColor="#3BB554"
                canvasProps={{
                  className: styles.signatureCanvas,
                  width: 500,
                  height: 200
                }}
                onEnd={() => setHasSignature(true)}
              />
              <div className={styles.signatureActions}>
                <button 
                  type="button"
                  className={styles.clearButton}
                  onClick={() => {
                    signaturePad?.clear();
                    setHasSignature(false);
                    setSignatureSaved(false);
                  }}
                >
                  Clear
                </button>
                <button 
                  type="button"
                  className={styles.saveButton}
                  onClick={() => {
                    if (hasSignature && signaturePad) {
                      setValue('signature', signaturePad.toDataURL());
                      setSignatureSaved(true);
                    }
                  }}
                  disabled={!hasSignature}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const onFormSubmit = (data: RentalFormData) => {
    if (currentStep === 6 && !signatureSaved) {
      alert("Please save your signature before submitting");
      return;
    }
    onSubmit(data);
    // Redirect to thank you page
    window.location.href = '/thankyou';
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
            >
              Previous
            </button>
          )}
          {currentStep < 6 ? (
            <button 
              type="button" 
              className={styles.nextButton}
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Next
            </button>
          ) : (
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={!signatureSaved}
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
