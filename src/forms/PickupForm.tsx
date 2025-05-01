import { useForm } from "react-hook-form";
import { useState, useRef, useEffect } from "react";
import SignatureField from '../components/SignatureField';
import { useLocation } from 'react-router-dom';
import styles from './PickupForm.module.css';
import { submitForm, testServerConnection } from '../services/api';

interface PickupFormData {
  // Referral Sources
  google: boolean;
  tv: boolean;
  sms: boolean;
  facebook: boolean;
  hulu: boolean;
  pandora: boolean;
  waze: boolean;
  radio: boolean;
  ref: boolean;
  insta: boolean;
  fire: boolean;
  billboard: boolean;
  mailer: boolean;
  hanger: boolean;
  internet: boolean;
  youtube: boolean;
  prime: boolean;
  sales: boolean;

  // Authorization
  insuranceCo: string;
  vehicleDescription: string;
  vin: string;
  claimNumber: string;
  claimNumber2: string; // Second instance of claim number
  dol: string; // Date of Loss

  // Personal Information
  customerName: string;
  customerPhone: string;
  altPhone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  customerEmail: string;

  // Insurance Information
  insured: string; // Name of Insured
  insuredPhone: string;
  provider: string;
  deductible: string;

  // Questions
  estimateDone: string; // Yes/No radio
  check: string; // Yes/No radio for received check
  referrer: string; // Yes/No radio for referral

  // Authorizations
  auth1: boolean; // Permission to Repair & Release
  auth2: boolean; // Additional Repairs & Prior Damage
  auth3: boolean; // Payment
  auth4: boolean; // Total Loss
  auth5: boolean; // Failure to Pay
  auth6: boolean; // Reviews

  // Signature
  signature1: string; // For PDF field signature1
  signature2: string; // For PDF field signature2

  [key: string]: unknown;
}

interface LocationState {
  name?: string;
  email?: string;
}

export default function PickupForm({ onSubmit }: { onSubmit: (data: PickupFormData) => void }) {
  const { register, handleSubmit, setValue, watch } = useForm<PickupFormData>({
    defaultValues: {
      google: false,
      tv: false,
      sms: false,
      facebook: false,
      hulu: false,
      pandora: false,
      waze: false,
      radio: false,
      ref: false,
      insta: false,
      fire: false,
      billboard: false,
      mailer: false,
      hanger: false,
      internet: false,
      youtube: false,
      prime: false,
      sales: false,
      estimateDone: '',
      check: '',
      referrer: '',
      auth1: false,
      auth2: false,
      auth3: false,
      auth4: false,
      auth5: false,
      auth6: false
    }
  });

  const signatureSectionRef = useRef<HTMLDivElement>(null);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
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

  const handleSignatureSave = (signatureDataUrl: string) => {
    console.log('Signature saved, setting state...');
    setValue('signature1', signatureDataUrl);
    setValue('signature2', signatureDataUrl); // Set both signature fields to the same value
    setSignatureSaved(true);
    console.log('signatureSaved should now be true');
    setTimeout(scrollToSignature, 100);
  };

  const onSubmitForm = async (data: PickupFormData) => {
    console.log('Submit button clicked, starting submission process');
    console.log('Form data to be submitted:', data);
    console.log('Signature saved status:', signatureSaved);
    console.log('Estimator email:', estimatorEmail);

    setIsSubmitting(true);
    try {
      console.log('Calling submitForm API function');
      const result = await submitForm(data, 'pickup', estimatorEmail || 'unknown@somewhere.com');
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={styles.formStep}>
            <h2 className={styles.centerHeading}>How did you hear about Dent Source?</h2>
            <p className={styles.subtitle}>Please select all that apply</p>

            <div className={styles.referralGrid}>
              <label className={styles.referralOption}>
                <input type="checkbox" {...register('google')} />
                <span>Google</span>
              </label>

              <label className={styles.referralOption}>
                <input type="checkbox" {...register('tv')} />
                <span>TV Commercial</span>
              </label>

              <label className={styles.referralOption}>
                <input type="checkbox" {...register('sms')} />
                <span>Text Message</span>
              </label>

              <label className={styles.referralOption}>
                <input type="checkbox" {...register('facebook')} />
                <span>Facebook</span>
              </label>

              <label className={styles.referralOption}>
                <input type="checkbox" {...register('hulu')} />
                <span>Hulu</span>
              </label>

              <label className={styles.referralOption}>
                <input type="checkbox" {...register('pandora')} />
                <span>Pandora</span>
              </label>

              <label className={styles.referralOption}>
                <input type="checkbox" {...register('waze')} />
                <span>Waze</span>
              </label>

              <label className={styles.referralOption}>
                <input type="checkbox" {...register('radio')} />
                <span>Radio</span>
              </label>

              <label className={styles.referralOption}>
                <input type="checkbox" {...register('ref')} />
                <span>Referral</span>
              </label>

              <label className={styles.referralOption}>
                <input type="checkbox" {...register('insta')} />
                <span>Instagram</span>
              </label>

              <label className={styles.referralOption}>
                <input type="checkbox" {...register('fire')} />
                <span>Fire Stick</span>
              </label>

              <label className={styles.referralOption}>
                <input type="checkbox" {...register('billboard')} />
                <span>Billboard</span>
              </label>

              <label className={styles.referralOption}>
                <input type="checkbox" {...register('mailer')} />
                <span>Mailer</span>
              </label>

              <label className={styles.referralOption}>
                <input type="checkbox" {...register('hanger')} />
                <span>Door Hanger</span>
              </label>

              <label className={styles.referralOption}>
                <input type="checkbox" {...register('internet')} />
                <span>Internet</span>
              </label>

              <label className={styles.referralOption}>
                <input type="checkbox" {...register('youtube')} />
                <span>YouTube</span>
              </label>

              <label className={styles.referralOption}>
                <input type="checkbox" {...register('prime')} />
                <span>Prime</span>
              </label>

              <label className={styles.referralOption}>
                <input type="checkbox" {...register('sales')} />
                <span>Outside Sales</span>
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.formStep}>
            <h2 className={styles.centerHeading}>Authorization and Direction of Pay</h2>

            <div className={styles.authorizationSection}>
              <p className={styles.authText}>
                I authorize DENT SOURCE LLC to repair my vehicle.
              </p>
              <p className={styles.authText}>
                I authorize{' '}
                <input
                  type="text"
                  {...register('insuranceCo')}
                  className={styles.inlineInput}
                  placeholder="your insurance company"
                />{' '}
                to pay DENT SOURCE LLC directly for the repairs performed on my vehicle.
              </p>

              <div className={styles.fieldGroup}>
                <label>Vehicle Description:</label>
                <input
                  type="text"
                  {...register('vehicleDescription')}
                  placeholder="Year, Make, Model, Color"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>V.I.N.:</label>
                <input
                  type="text"
                  {...register('vin')}
                  placeholder="Vehicle Identification Number"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Claim Number:</label>
                <input
                  type="text"
                  {...register('claimNumber')}
                  placeholder="Insurance Claim Number"
                  onChange={(e) => {
                    // Also update claimNumber2 to keep them in sync
                    setValue('claimNumber2', e.target.value);
                  }}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Date of Loss:</label>
                <input
                  type="date"
                  {...register('dol')}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.formStep}>
            <h2 className={styles.centerHeading}>Personal Information</h2>

            <div className={styles.personalInfo}>
              <div className={styles.fieldGroup}>
                <label>Name:</label>
                <input
                  type="text"
                  {...register('customerName')}
                  placeholder="Full Name"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Phone:</label>
                <input
                  type="tel"
                  {...register('customerPhone')}
                  placeholder="Primary Phone Number"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Alt. Phone: (optional)</label>
                <input
                  type="tel"
                  {...register('altPhone')}
                  placeholder="Alternative Phone Number"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Address:</label>
                <input
                  type="text"
                  {...register('address')}
                  placeholder="Street Address"
                />
              </div>

              <div className={styles.addressDetails}>
                <div className={styles.fieldGroup}>
                  <label>City:</label>
                  <input
                    type="text"
                    {...register('city')}
                    placeholder="City"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label>State:</label>
                  <input
                    type="text"
                    {...register('state')}
                    placeholder="State"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label>ZIP:</label>
                  <input
                    type="text"
                    {...register('zip')}
                    placeholder="ZIP Code"
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label>Email:</label>
                <input
                  type="email"
                  {...register('customerEmail')}
                  placeholder="Email Address"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className={styles.formStep}>
            <h2 className={styles.centerHeading}>Insurance Information</h2>

            <div className={styles.insuranceInfo}>
              <div className={styles.fieldGroup}>
                <label>Name of Insured:</label>
                <input
                  type="text"
                  {...register('insured')}
                  placeholder="Name of Insured"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Phone:</label>
                <input
                  type="tel"
                  {...register('insuredPhone')}
                  placeholder="Insured's Phone Number"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Provider:</label>
                <input
                  type="text"
                  {...register('provider')}
                  placeholder="Insurance Provider"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Claim Number:</label>
                <input
                  type="text"
                  {...register('claimNumber2')}
                  placeholder="Insurance Claim Number"
                  value={watch('claimNumber')}
                  readOnly
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>What is your deductible?</label>
                <input
                  type="text"
                  {...register('deductible')}
                  placeholder="Deductible Amount"
                />
              </div>

              <div className={styles.questionSection}>
                <div className={styles.questionGroup}>
                  <p className={styles.questionLabel}>Have you had an estimate done on this vehicle?</p>
                  <div className={styles.radioGroup}>
                    <label>
                      <input
                        type="radio"
                        value="Yes"
                        {...register('estimateDone')}
                      />
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="No"
                        {...register('estimateDone')}
                      />
                      No
                    </label>
                  </div>
                </div>

                <div className={styles.questionGroup}>
                  <p className={styles.questionLabel}>Have you received a check for this claim?</p>
                  <div className={styles.radioGroup}>
                    <label>
                      <input
                        type="radio"
                        value="Yes"
                        {...register('check')}
                      />
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="No"
                        {...register('check')}
                      />
                      No
                    </label>
                  </div>
                </div>

                <div className={styles.questionGroup}>
                  <p className={styles.questionLabel}>Were you referred here by someone you know?</p>
                  <div className={styles.radioGroup}>
                    <label>
                      <input
                        type="radio"
                        value="Yes"
                        {...register('referrer')}
                      />
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="No"
                        {...register('referrer')}
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className={styles.formStep}>
            <h2 className={styles.centerHeading}>Disclaimers</h2>
            <div className={styles.disclaimersSection}>
              <div className={styles.disclaimerItem}>
                <label className={styles.disclaimerLabel}>
                  <input
                    type="checkbox"
                    {...register('auth1')}
                  />
                  <div>
                    <h3>Permission to Repair & Release</h3>
                    <p>I authorize the repair of my vehicle and grant permission to DENT SOURCE to operate the vehicle for the purpose of testing and/or inspection. I authorize DENT SOURCE to conduct repairs in any way that deems necessary. I authorize DENT SOURCE to perform mechanical repairs. I agree that DENT SOURCE is not responsible for the loss of damage to this vehicle and/or articles left in the vehicle due to fire, theft or any other cause beyond its control.</p>
                  </div>
                </label>
              </div>

              <div className={styles.disclaimerItem}>
                <label className={styles.disclaimerLabel}>
                  <input
                    type="checkbox"
                    {...register('auth2')}
                  />
                  <div>
                    <h3>Additional Repairs & Prior Damage</h3>
                    <p>I acknowledge that if closer analysis reveals additional repairs are necessary, either I or my insurance company will be contacted for authorization of any additional repair charges. If new parts listed in the attached repair order are not available, I authorize DENT SOURCE to repair such damage or worn parts when possible. Old parts will be thrown away unless otherwise instructed. I authorize DENT SOURCE to manufacture access to dent that may not be accessible due to their location on this vehicle. DENT SOURCE is not responsible for prior damage listed in the Comments/Parts section on this estimate.</p>
                  </div>
                </label>
              </div>

              <div className={styles.disclaimerItem}>
                <label className={styles.disclaimerLabel}>
                  <input
                    type="checkbox"
                    {...register('auth3')}
                  />
                  <div>
                    <h3>Payment</h3>
                    <p>I agree to pay for all repair changes not previously paid to DENT SOURCE by my insurance company, and further understand that the total amount of the repair charges must be paid before the attached vehicle can be released for delivery. If insurance coverage pays either a portion of or the total amount due, I acknowledge that the insurance companies check/draft must be obtained by me or sent in advance by the insurance company to DENT SOURCE and received by DENT SOURCE. I also acknowledge that I must make arrangements with any lien holder or other payees to endorse the insurance check/draft prior to the release of the repaired vehicle. I authorize any and all supplements payable directly to DENT SOURCE for the consideration of repairs made to this vehicle.</p>
                  </div>
                </label>
              </div>

              <div className={styles.disclaimerItem}>
                <label className={styles.disclaimerLabel}>
                  <input
                    type="checkbox"
                    {...register('auth4')}
                  />
                  <div>
                    <h3>Total Loss</h3>
                    <p>Vehicles deemed a total loss by insurance provider will be charged an administration fee, storage fee, from date of drop and any repairs or parts installed.</p>
                  </div>
                </label>
              </div>

              <div className={styles.disclaimerItem}>
                <label className={styles.disclaimerLabel}>
                  <input
                    type="checkbox"
                    {...register('auth5')}
                  />
                  <div>
                    <h3>Failure to Pay</h3>
                    <p>In the event that I fail to pay pursuant to the paragraph above, I acknowledge an expressed mechanics lien on the vehicle to secure payment in the amount of the repairs, and further agree to pay responsible attorney's fees and court costs in the event that legal action becomes necessary to enforce this contract. This agreement is governed by and shall be construed in accordance with the law of Oklahoma and the parties submit all their disputes arising out of or in connection with this agreement to the exclusive jurisdiction of the courts of Oklahoma County, OK.</p>
                  </div>
                </label>
              </div>

              <div className={styles.disclaimerItem}>
                <label className={styles.disclaimerLabel}>
                  <input
                    type="checkbox"
                    {...register('auth6')}
                  />
                  <div>
                    <h3>Reviews</h3>
                    <p>Leaving a negative review on social media, internet, or any other media outlet, will result in forfeiture of all promotional discounts, including but not limited to deductible coupon, rental car fee and/or cash back offer. Failure to reimburse in a timely manner will result in legal action. Customer shall pay all legal fees incurred by DENT SOURCE enforcing the terms of this contract.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className={styles.formStep}>
            <h2 className={styles.centerHeading}>Signature</h2>

            <div className={styles.signatureSection} ref={signatureSectionRef}>
              <p className={styles.signatureInstructions}>
                Please sign below to confirm all information provided is accurate and to agree to the terms outlined in this form.
              </p>

              <SignatureField onSave={handleSignatureSave} />

              <p className={styles.dateText}>
                Date: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Check if all required fields in the current step are filled
  const isStepComplete = () => {
    // You can add validation logic here if needed
    return true;
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
        onSubmit={(e) => {
          console.log('Form submit event triggered');
          handleSubmit((data) => {
            console.log('Form validated successfully, calling onSubmitForm');
            onSubmitForm(data);
          })(e);
        }}
        autoComplete="off"
      >
        {renderStep()}

        <div className={styles.formNavigation}>
          {currentStep > 1 && (
            <button
              type="button"
              className={styles.prevButton}
              onClick={() => {
                setCurrentStep(currentStep - 1);
                window.scrollTo(0, 0);
              }}
            >
              Previous
            </button>
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              className={styles.nextButton}
              onClick={() => {
                if (isStepComplete()) {
                  setCurrentStep(currentStep + 1);
                  window.scrollTo(0, 0);
                }
              }}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className={`${styles.submitButton} ${!signatureSaved ? styles.disabled : ''}`}
              disabled={!signatureSaved || isSubmitting}
              onClick={() => console.log('Submit button clicked')}
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

