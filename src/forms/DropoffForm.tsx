import { useForm, useFormContext } from "react-hook-form";
import "../styles/global.css";
import { useState, useCallback, useRef } from "react";
import SignatureCanvas from 'react-signature-canvas';
import styles from './DropoffForm.module.css';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface DropoffFormProps {
  onSubmit: (data: DropoffFormData) => void;  // Update to use DropoffFormData
}

interface DropoffFormData {
  // How did you hear about us
  referralSources: {
    google: boolean;
    waze: boolean;
    mailer: boolean;
    tvCommercial: boolean;
    tvChannel?: string | null;
    radioCommercial: boolean;
    doorHanger: boolean;
    textMessage: boolean;
    referral: boolean;
    referralName?: string | null;
    referralAddress?: string | null;
    referralPhone?: string | null;
    internet: boolean;
    facebook: boolean;
    instagram: boolean;
    youtube: boolean;
    hulu: boolean;
    fireStick: boolean;
    prime: boolean;
    pandora: boolean;
    billboard: boolean;
    billboardLocation?: string | null;
    outsideSales: boolean;
    salesPersonName?: string | null;
    yelp: boolean;
    insurance: boolean;
    repeat: boolean;
    other: boolean;
  };

  // Authorization
  insuranceCompany: string;
  signature: string;
  date: string;
  vehicleDescription: string;
  vin: string;
  claimNumber: string;
  dateOfLoss: string;

  // Personal Information
  name: string;
  phone: string;
  altPhone?: string | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;

  // Vehicle Information
  year: string;
  make: string;
  model: string;

  // Insurance Information
  insuredName: string;
  insuredPhone: string;
  provider: string;
  deductible: number;
  hasEstimate: boolean;
  hasEstimateCopy?: boolean | null;
  hasReceivedCheck: boolean;
  hasCheckedCashed?: boolean | null;
  adjusterName?: string | null;
  adjusterPhone?: string | null;

  // Reference Information (optional)
  referenceAddress?: string | null;
  referencePhone?: string | null;
  referenceEmail?: string | null;

  // Repair Authorization
  repairPermission: boolean;
  additionalRepairs: boolean;
  payment: boolean;
  totalLoss: boolean;
  failureToPay: boolean;
  reviews: boolean;
}

const InsuranceQuestions = () => {
  const { register, watch } = useFormContext();
  const hasEstimate = watch('hasEstimate');
  const hasReceivedCheck = watch('hasReceivedCheck');

  return (
    <div className={styles.insuranceQuestions}>
      <div className={styles.questionGroup}>
        <label>
          Have you had an estimate done on this vehicle?
          <input
            type="checkbox"
            {...register('hasEstimate')}
          />
        </label>
        
        {hasEstimate && (
          <label>
            Do you have a copy of the estimate?
            <input
              type="checkbox"
              {...register('hasEstimateCopy')}
            />
          </label>
        )}
      </div>

      <div className={styles.questionGroup}>
        <label>
          Have you received a check for this claim?
          <input
            type="checkbox"
            {...register('hasReceivedCheck')}
          />
        </label>
        
        {hasReceivedCheck && (
          <label>
            Has it been cashed?
            <input
              type="checkbox"
              {...register('hasCheckedCashed')}
            />
          </label>
        )}
      </div>
    </div>
  );
};

const schema = yup.object().shape({
  insuranceCompany: yup.string().required('Insurance company is required'),
  vin: yup
    .string()
    .required('VIN is required')
    .matches(/^[A-HJ-NPR-Z0-9]{17}$/, 'Must be 17 alphanumeric characters')
    .length(17, 'Must be exactly 17 characters'),
  signature: yup.string().required('Signature is required'),
  date: yup.string().required('Date is required'),
  vehicleDescription: yup.string().required('Vehicle description is required'),
  claimNumber: yup.string().required('Claim number is required'),
  dateOfLoss: yup.string().required('Date of loss is required'),
  name: yup.string().required('Name is required'),
  phone: yup.string().required('Phone is required'),
  altPhone: yup.string().nullable().optional(),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zip: yup.string().required('ZIP code is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  year: yup.string().required('Year is required'),
  make: yup.string().required('Make is required'),
  model: yup.string().required('Model is required'),
  insuredName: yup.string().required('Insured name is required'),
  insuredPhone: yup.string().required('Insured phone is required'),
  provider: yup.string().required('Provider is required'),
  deductible: yup.number().required('Deductible is required'),
  hasEstimate: yup.boolean().required(),
  hasEstimateCopy: yup.boolean().nullable().optional(),
  hasReceivedCheck: yup.boolean().required(),
  hasCheckedCashed: yup.boolean().nullable().optional(),
  adjusterName: yup.string().nullable().optional(),
  adjusterPhone: yup.string().nullable().optional(),
  referenceAddress: yup.string().nullable().optional(),
  referencePhone: yup.string().nullable().optional(),
  referenceEmail: yup.string().email('Invalid email').nullable().optional(),
  repairPermission: yup.boolean().required(),
  additionalRepairs: yup.boolean().required(),
  payment: yup.boolean().required(),
  totalLoss: yup.boolean().required(),
  failureToPay: yup.boolean().required(),
  reviews: yup.boolean().required(),
  referralSources: yup.object().shape({
    google: yup.boolean().required(),
    waze: yup.boolean().required(),
    mailer: yup.boolean().required(),
    tvCommercial: yup.boolean().required(),
    tvChannel: yup.string().nullable().optional(),
    radioCommercial: yup.boolean().required(),
    doorHanger: yup.boolean().required(),
    textMessage: yup.boolean().required(),
    referral: yup.boolean().required(),
    referralName: yup.string().nullable().optional(),
    referralAddress: yup.string().nullable().optional(),
    referralPhone: yup.string().nullable().optional(),
    internet: yup.boolean().required(),
    facebook: yup.boolean().required(),
    instagram: yup.boolean().required(),
    youtube: yup.boolean().required(),
    hulu: yup.boolean().required(),
    fireStick: yup.boolean().required(),
    prime: yup.boolean().required(),
    pandora: yup.boolean().required(),
    billboard: yup.boolean().required(),
    billboardLocation: yup.string().nullable().optional(),
    outsideSales: yup.boolean().required(),
    salesPersonName: yup.string().nullable().optional(),
    yelp: yup.boolean().required(),
    insurance: yup.boolean().required(),
    repeat: yup.boolean().required(),
    other: yup.boolean().required()
  }).required()
}).required();

export default function DropoffForm({ onSubmit }: DropoffFormProps) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<DropoffFormData>({
    defaultValues: {
      referralSources: {
        google: false,
        waze: false,
        mailer: false,
        tvCommercial: false,
        tvChannel: null,
        radioCommercial: false,
        doorHanger: false,
        textMessage: false,
        referral: false,
        referralName: null,
        referralAddress: null,
        referralPhone: null,
        internet: false,
        facebook: false,
        instagram: false,
        youtube: false,
        hulu: false,
        fireStick: false,
        prime: false,
        pandora: false,
        billboard: false,
        billboardLocation: null,
        outsideSales: false,
        salesPersonName: null,
        yelp: false,
        insurance: false,
        repeat: false,
        other: false
      },
      hasEstimateCopy: null,
      hasCheckedCashed: null,
      altPhone: null,
      adjusterName: null,
      adjusterPhone: null,
      referenceAddress: null,
      referencePhone: null,
      referenceEmail: null
    },
    resolver: yupResolver(schema)
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [signaturePad, setSignaturePad] = useState<SignatureCanvas | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const signatureSectionRef = useRef<HTMLDivElement | null>(null);

  const scrollToSignature = useCallback(() => {
    if (signatureSectionRef.current) {
      const yOffset = -100;
      const element = signatureSectionRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={`${styles.formStep} ${styles.wideForm}`}>
            <div className={styles.inputGroup}>
              <label>Your Insurance Company</label>
              <input
                type="text"
                {...register('insuranceCompany')}
                className={styles.input}
                placeholder="Enter insurance company name"
              />
              {errors.insuranceCompany && (
                <span className={styles.error}>{errors.insuranceCompany.message}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label>Vehicle VIN</label>
              <input
                type="text"
                {...register('vin')}
                className={styles.input}
                placeholder="Must be 17 alphanumeric characters"
                maxLength={17}
              />
              {errors.vin && (
                <span className={styles.error}>{errors.vin.message}</span>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <h2 className={styles.centerHeading}>Dent Source LLC Authorization and Direction of Pay</h2>
            <div className={styles.authorizationSection}>
              <p className={styles.authText}>
                I authorize DENT SOURCE LLC to repair my vehicle. I authorize{' '}
                <input
                  type="text"
                  {...register('insuranceCompany')}
                  className={styles.inlineInput}
                />{' '}
                to pay DENT SOURCE directly for the repairs performed on my vehicle.
              </p>

              <div className={styles.authFields}>
                <div className={styles.fieldGroup}>
                  <label>Name:</label>
                  <input type="text" {...register('name')} />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Date:</label>
                  <input type="date" {...register('date')} />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Vehicle Description (Year/Make/Model):</label>
                  <input 
                    type="text" 
                    {...register('vehicleDescription')} 
                    placeholder="e.g., 2020 Honda Civic"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label>VIN:</label>
                  <input 
                    type="text" 
                    {...register('vin')} 
                    className={styles.vinInput}
                    maxLength={17}
                    minLength={17}
                    placeholder="17 character VIN number"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Claim Number:</label>
                  <input type="text" {...register('claimNumber')} />
                </div>

                <div className={styles.fieldGroup}>
                  <label>Date of Loss:</label>
                  <input type="date" {...register('dateOfLoss')} />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <h2 className={styles.vehicleTitle}>Vehicle Information</h2>
            <div className={styles.vehicleInfo}>
              <div>
                <label>Year</label>
                <input {...register('year')} />
              </div>
              <div>
                <label>Make</label>
                <input {...register('make')} />
              </div>
              <div>
                <label>Model</label>
                <input {...register('model')} />
              </div>
              <div>
                <label>VIN</label>
                <input {...register('vin')} className={styles.vinInput} />
              </div>
              <div>
                <label>Vehicle Description</label>
                <input {...register('vehicleDescription')} />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-step">
            <h2 className={styles.insuranceTitle}>Insurance Information</h2>
            <div className={styles.insuranceInfo}>
              <div>
                <label>Insurance Company</label>
                <input {...register('insuranceCompany')} />
              </div>
              <div>
                <label>Claim Number</label>
                <input {...register('claimNumber')} />
              </div>
              <div>
                <label>Date of Loss</label>
                <input {...register('dateOfLoss')} type="date" />
              </div>
              <div>
                <label>Insured Name</label>
                <input {...register('insuredName')} />
              </div>
              <div>
                <label>Insured Phone</label>
                <input {...register('insuredPhone')} type="tel" />
              </div>
              <div>
                <label>Provider</label>
                <input {...register('provider')} />
              </div>
              <div>
                <label>Deductible</label>
                <input {...register('deductible')} type="number" />
              </div>
              <div>
                <label>Adjuster Name</label>
                <input 
                  type="text" 
                  {...register('adjusterName')}
                  placeholder="If you know it"
                />
              </div>
              <div>
                <label>Adjuster Phone</label>
                <input 
                  type="tel" 
                  {...register('adjusterPhone')}
                  placeholder="If you know it"
                />
              </div>
              <InsuranceQuestions />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="form-step">
            <h2 className={styles.centerHeading}>Repair Authorization</h2>
            <div className={styles.repairAuth}>
              <div className={styles.authCheckboxes}>
                <label className={styles.authOption}>
                  <input 
                    type="checkbox" 
                    {...register('repairPermission', { required: true })}
                  />
                  <span>Permission to Repair & Release - I authorize the repair of my vehicle and grand permission to DENT SOURCE to operate the vehicle for the purpose of testing and/or inspection. I authorize DENT SOURCE to conduct repairs in any way that deems necessary. I authorize DENT SOURCE to perform mechanical repairs. I agree that DENT SOURCE is not responsible for the loss of damage to this vehicle and/or articles left in the vehicle due to fire, theft or any other cause beyond it's control.</span>
                </label>

                <label className={styles.authOption}>
                  <input 
                    type="checkbox" 
                    {...register('additionalRepairs', { required: true })}
                  />
                  <span>Additional Repairs & Prior Damage - I acknowledge that if closer analysis reveals additional repairs are necessary, either I or my insurance company will be contacted for authroization of any additional repair charges. If new parts listed in the attached repair order are not available, I authorize DENT SOURCE to repair such damage or worn parts when possible. Old parts will be thrown away unless otherwise instructed. I authorize DENT SOURCE to manufacture access to dent that may not be accessible due to their location on this vehicle. DENT SOURCE is not responsible for prior damage listed in the Comments/Parts section on this estimate.</span>
                </label>

                <label className={styles.authOption}>
                  <input 
                    type="checkbox" 
                    {...register('payment', { required: true })}
                  />
                  <span>Payment - I agree to pay for all repair changes not previously paid to DENT SOURCE by my insurance company, and further understand that the total amount of the repair charges must be paid before the attached vehicle can be released for delivery. If insurance coverage pays either a portion of or the total amount due, I acknowledge that the insurance companies check/draft must be obtained by me or sent in advance by the insurance company to DENT SOURCE and received by DENT SOURCE. I also acknowledge that I must make arrangements with any lien holder or other payees to endorse the insurance check/draft prior to the release of the repaired vehicle. I authorize any and all supplements payable directly to DENT SOURCE for the consideration of repairs made to the vehicle. I hereby authorize DENT SOURCE to act as Power of Attorney to sign for or endorse any checks and/or drafts make payable to me and any release there to, as settlement for my claim for damage to this vehicle.</span>
                </label>

                <label className={styles.authOption}>
                  <input 
                    type="checkbox" 
                    {...register('totalLoss', { required: true })}
                  />
                  <span>Total Loss - Vehicles deemed a total loss by insurance provider will be charged an administration fee, storage fee, from date of drop and any repairs or parts installed.</span>
                </label>

                <label className={styles.authOption}>
                  <input 
                    type="checkbox" 
                    {...register('failureToPay', { required: true })}
                  />
                  <span>Failure to Pay - In the event that I fail to pay pursuant to the paragraph above, I acknowledge an expressed mechanics lien on the vehicle to secure payment in the amount of the repairs, and further agree to pay responsible attorney's fees and court costs in the event that legal action becomes necessary to enforce this contract. This agreement is governed by and shall be construed in accordance with the law of Oklahoma and the parties submit all their disputes arising out of or in connection with this agreement to the exclusive jurisdiction of the courts of Oklahoma County, OK.</span>
                </label>

                <label className={styles.authOption}>
                  <input 
                    type="checkbox" 
                    {...register('reviews', { required: true })}
                  />
                  <span>Reviews - Leaving a negative review on social media, internet, or any other media outlet, will result in forfeiture of all promotional discounts, including but not limited to deductible coupon, rental car fee and/or cash back offer. Failure to reimburse in a timely manner will result in legal action. Customer shall pay all legal fees incurred by DENT SOURCE enforcing the terms of this contract.</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="form-step">
            <h2 className={styles.centerHeading}>Authorization</h2>
            <div className={styles.signatureSection} ref={signatureSectionRef}>
              <label className={styles.cursiveFont}>E-signature:</label>
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
                      setTimeout(scrollToSignature, 100);
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
    }
  };

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.greenHeading}>Drop Off Form</h1>
      
      <form onSubmit={handleSubmit(onSubmit)}>
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
              className={`${styles.submitButton} ${!signatureSaved ? styles.disabled : ''}`}
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
