import { useForm } from "react-hook-form";
import "../styles/global.css";
import { useState, useCallback, useRef, useEffect } from "react";
import SignatureCanvas from 'react-signature-canvas';
import styles from './DropoffForm.module.css';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useLocation } from 'react-router-dom';
import { submitForm } from '../services/api';

interface DropoffFormProps {
  onSubmit: (data: DropoffFormData) => void;  // Update to use DropoffFormData
}

interface LocationState {
  name?: string;
  email?: string;
}

interface DropoffFormData {
  // How did you hear about us
  referralSources: {
    google: boolean;
    waze: boolean;
    mailer: boolean;
    tvCommercial: boolean;
    tvChannel?: string;
    radioCommercial: boolean;
    doorHanger: boolean;
    textMessage: boolean;
    referral: boolean;
    referralName?: string;
    referralAddress?: string;
    referralPhone?: string;
    internet: boolean;
    facebook: boolean;
    instagram: boolean;
    youtube: boolean;
    hulu: boolean;
    fireStick: boolean;
    prime: boolean;
    pandora: boolean;
    billboard: boolean;
    billboardLocation?: string;
    outsideSales: boolean;
    salesPersonName?: string;
    yelp: boolean;
    insurance: boolean;
    repeat: boolean;
    other: boolean;
  };

  // New fields
  howDidhear: string;
  referralAddress?: string;
  referralPhone?: string;
  referralEmail?: string;
  dropDate: string;
  location: string;
  estimator: string;

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
  altPhone?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;

  // Vehicle Information
  year: string;
  make: string;
  model: string;
  licensePlate?: string;

  // Insurance Information
  insuredName: string;
  insuredPhone: string;
  provider: string;
  deductible: number;
  hasEstimate: boolean;
  hasEstimateCopy?: boolean;
  hasReceivedCheck: boolean;
  hasCheckedCashed?: boolean;
  adjusterName?: string;
  adjusterPhone?: string;

  // Reference Information (optional)
  referenceAddress?: string;
  referencePhone?: string;
  referenceEmail?: string;

  // Repair Authorization
  repairPermission: boolean;
  additionalRepairs: boolean;
  payment: boolean;
  totalLoss: boolean;
  failureToPay: boolean;
  reviews: boolean;
}

const schema = yup.object().shape({
  // New fields
  howDidhear: yup.string().required('How did you hear about us is required'),
  referralAddress: yup.string().optional(),
  referralPhone: yup.string().optional(),
  referralEmail: yup.string().email('Invalid email').optional(),
  dropDate: yup.string().required('Drop date is required'),
  location: yup.string().required('Location is required'),
  estimator: yup.string().required('Estimator is required'),

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
  altPhone: yup.string().optional(),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
  zip: yup.string().required('ZIP code is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  year: yup.string().required('Year is required'),
  make: yup.string().required('Make is required'),
  model: yup.string().required('Model is required'),
  licensePlate: yup.string().optional(),
  insuredName: yup.string().required('Insured name is required'),
  insuredPhone: yup.string().required('Insured phone is required'),
  provider: yup.string().required('Provider is required'),
  deductible: yup.number().required('Deductible is required'),
  hasEstimate: yup.boolean().required(),
  hasEstimateCopy: yup.boolean().optional(),
  hasReceivedCheck: yup.boolean().required(),
  hasCheckedCashed: yup.boolean().optional(),
  adjusterName: yup.string().optional(),
  adjusterPhone: yup.string().optional(),
  referenceAddress: yup.string().optional(),
  referencePhone: yup.string().optional(),
  referenceEmail: yup.string().email('Invalid email').optional(),
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
    tvChannel: yup.string().optional(),
    radioCommercial: yup.boolean().required(),
    doorHanger: yup.boolean().required(),
    textMessage: yup.boolean().required(),
    referral: yup.boolean().required(),
    referralName: yup.string().when('referral', {
      is: true,
      then: (schema) => schema.required('Referrer name is required when referral is selected'),
      otherwise: (schema) => schema.optional()
    }),
    referralAddress: yup.string().when('referral', {
      is: true,
      then: (schema) => schema.required('Referrer address is required when referral is selected'),
      otherwise: (schema) => schema.optional()
    }),
    referralPhone: yup.string().when('referral', {
      is: true,
      then: (schema) => schema.required('Referrer phone is required when referral is selected'),
      otherwise: (schema) => schema.optional()
    }),
    internet: yup.boolean().required(),
    facebook: yup.boolean().required(),
    instagram: yup.boolean().required(),
    youtube: yup.boolean().required(),
    hulu: yup.boolean().required(),
    fireStick: yup.boolean().required(),
    prime: yup.boolean().required(),
    pandora: yup.boolean().required(),
    billboard: yup.boolean().required(),
    billboardLocation: yup.string().optional(),
    outsideSales: yup.boolean().required(),
    salesPersonName: yup.string().optional(),
    yelp: yup.boolean().required(),
    insurance: yup.boolean().required(),
    repeat: yup.boolean().required(),
    other: yup.boolean().required()
  }).required()
}).required();

export default function DropoffForm({ onSubmit }: DropoffFormProps) {
  // Get estimator email from location state
  const location = useLocation();
  const locationState = location.state as LocationState;
  const estimatorEmail = locationState?.email || 'info@autohail.group';
  // Remove unused variable
  // const estimatorName = locationState?.name || 'Unknown';

  // Add loading state - explicitly set to false initially
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { register, setValue, watch, getValues, formState: { errors } } = useForm<DropoffFormData>({
    defaultValues: {
      // New fields with default values
      howDidhear: '',
      referralAddress: '',
      referralPhone: '',
      referralEmail: '',
      dropDate: new Date().toISOString().split('T')[0], // Today's date
      location: '',
      estimator: locationState?.name || '', // Use estimator name from location state if available

      referralSources: {
        google: false,
        waze: false,
        mailer: false,
        tvCommercial: false,
        tvChannel: undefined,
        radioCommercial: false,
        doorHanger: false,
        textMessage: false,
        referral: false,
        referralName: undefined,
        referralAddress: undefined,
        referralPhone: undefined,
        internet: false,
        facebook: false,
        instagram: false,
        youtube: false,
        hulu: false,
        fireStick: false,
        prime: false,
        pandora: false,
        billboard: false,
        billboardLocation: undefined,
        outsideSales: false,
        salesPersonName: undefined,
        yelp: false,
        insurance: false,
        repeat: false,
        other: false
      },
      hasEstimateCopy: undefined,
      hasCheckedCashed: undefined,
      altPhone: undefined,
      adjusterName: undefined,
      adjusterPhone: undefined,
      referenceAddress: undefined,
      referencePhone: undefined,
      referenceEmail: undefined
    },
    resolver: yupResolver(schema)
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [signaturePad, setSignaturePad] = useState<SignatureCanvas | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const signatureSectionRef = useRef<HTMLDivElement | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize for responsive elements
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Reset loading state on component mount
  useEffect(() => {
    // Ensure loading state is false when component mounts
    console.log('Component mounted, setting isSubmitting to false');
    setIsSubmitting(false);
  }, []);

  // Debug loading state changes
  useEffect(() => {
    console.log('isSubmitting state changed:', isSubmitting);
  }, [isSubmitting]);

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

  // Step validation functions
  const validateStep = (step: number): boolean => {
    const values = getValues();

    switch (step) {
      case 1:
        // At least one referral source must be selected
        const referralSources = values.referralSources;
        const hasAnySource = Object.values(referralSources).some(value => value === true);
        if (!hasAnySource) {
          alert('Please select at least one option for how you heard about us.');
          return false;
        }
        return true;

      case 2:
        // Authorization page validation
        if (!values.insuranceCompany?.trim()) {
          alert('Please enter your insurance company.');
          return false;
        }
        if (!values.vehicleDescription?.trim()) {
          alert('Please enter your vehicle description.');
          return false;
        }
        if (!values.vin?.trim()) {
          alert('Please enter your VIN.');
          return false;
        }
        if (values.vin.length !== 17) {
          alert('VIN must be exactly 17 characters.');
          return false;
        }
        if (!values.claimNumber?.trim()) {
          alert('Please enter your claim number.');
          return false;
        }
        if (!values.dateOfLoss?.trim()) {
          alert('Please enter the date of loss.');
          return false;
        }
        if (!values.date?.trim()) {
          alert('Please enter the date.');
          return false;
        }
        return true;

      case 3:
        // Personal Information validation
        if (!values.howDidhear?.trim()) {
          alert('Please provide details about how you heard about us.');
          return false;
        }
        if (!values.dropDate?.trim()) {
          alert('Please enter the drop date.');
          return false;
        }
        if (!values.location?.trim()) {
          alert('Please enter the location.');
          return false;
        }
        if (!values.estimator?.trim()) {
          alert('Please enter the estimator name.');
          return false;
        }
        if (!values.name?.trim()) {
          alert('Please enter your name.');
          return false;
        }
        if (!values.phone?.trim()) {
          alert('Please enter your phone number.');
          return false;
        }
        if (!values.address?.trim()) {
          alert('Please enter your address.');
          return false;
        }
        if (!values.city?.trim()) {
          alert('Please enter your city.');
          return false;
        }
        if (!values.state?.trim()) {
          alert('Please enter your state.');
          return false;
        }
        if (!values.zip?.trim()) {
          alert('Please enter your ZIP code.');
          return false;
        }
        if (!values.email?.trim()) {
          alert('Please enter your email.');
          return false;
        }
        return true;

      case 4:
        // Vehicle Information - this step shows disabled fields auto-filled from step 2
        // No additional validation needed since the data was already validated in step 2
        return true;

      case 5:
        // Insurance Information validation
        if (!values.insuredName?.trim()) {
          alert('Please enter the insured name.');
          return false;
        }
        if (!values.insuredPhone?.trim()) {
          alert('Please enter the insured phone number.');
          return false;
        }
        if (!values.provider?.trim()) {
          alert('Please enter the insurance provider.');
          return false;
        }
        if (values.deductible === undefined || values.deductible === null) {
          alert('Please enter the deductible amount.');
          return false;
        }
        if (values.hasEstimate === undefined || values.hasEstimate === null) {
          alert('Please select whether you have an estimate.');
          return false;
        }
        if (values.hasReceivedCheck === undefined || values.hasReceivedCheck === null) {
          alert('Please select whether you have received a check.');
          return false;
        }

        // If referral is selected, validate referral contact info
        if (values.referralSources.referral === true) {
          if (!values.referralSources.referralName?.trim()) {
            alert('Please provide the name of who referred you.');
            return false;
          }
          if (!values.referralSources.referralAddress?.trim()) {
            alert('Please provide the address of who referred you.');
            return false;
          }
          if (!values.referralSources.referralPhone?.trim()) {
            alert('Please provide the phone number of who referred you.');
            return false;
          }
        }
        return true;

      default:
        return true;
    }
  };

  // We're now handling form submission directly in the button click handler
  // This comment is kept to maintain the structure of the file

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={`${styles.formStep} ${styles.wideForm}`}>
            <h2 className={styles.centerHeading}>How did you hear about Dent Source?</h2>
            <p className={styles.subtitle}>Please select all that apply</p>

            <div className={styles.referralGrid}>
              <label className={styles.referralCheckbox}>
                <input type="checkbox" {...register('referralSources.google')} />
                <span>Google</span>
              </label>

              <label className={styles.referralCheckbox}>
                <input type="checkbox" {...register('referralSources.waze')} />
                <span>Waze</span>
              </label>

              <label className={styles.referralCheckbox}>
                <input type="checkbox" {...register('referralSources.mailer')} />
                <span>Mailer</span>
              </label>

              <label className={styles.referralCheckbox}>
                <input type="checkbox" {...register('referralSources.tvCommercial')} />
                <span>TV Commercial</span>
              </label>

              <label className={styles.referralCheckbox}>
                <input type="checkbox" {...register('referralSources.radioCommercial')} />
                <span>Radio</span>
              </label>

              <label className={styles.referralCheckbox}>
                <input type="checkbox" {...register('referralSources.doorHanger')} />
                <span>Door Hanger</span>
              </label>

              <label className={styles.referralCheckbox}>
                <input type="checkbox" {...register('referralSources.textMessage')} />
                <span>Text Message</span>
              </label>

              <label className={styles.referralCheckbox}>
                <input type="checkbox" {...register('referralSources.referral')} />
                <span>Referral</span>
              </label>

              <label className={styles.referralCheckbox}>
                <input type="checkbox" {...register('referralSources.internet')} />
                <span>Internet</span>
              </label>

              <label className={styles.referralCheckbox}>
                <input type="checkbox" {...register('referralSources.facebook')} />
                <span>Facebook</span>
              </label>

              <label className={styles.referralCheckbox}>
                <input type="checkbox" {...register('referralSources.instagram')} />
                <span>Instagram</span>
              </label>

              <label className={styles.referralCheckbox}>
                <input type="checkbox" {...register('referralSources.youtube')} />
                <span>Youtube</span>
              </label>

              <label className={styles.referralCheckbox}>
                <input type="checkbox" {...register('referralSources.hulu')} />
                <span>Hulu</span>
              </label>

              <label className={styles.referralCheckbox}>
                <input type="checkbox" {...register('referralSources.fireStick')} />
                <span>Fire Stick</span>
              </label>

              <label className={styles.referralCheckbox}>
                <input type="checkbox" {...register('referralSources.prime')} />
                <span>Prime</span>
              </label>

              <label className={styles.referralCheckbox}>
                <input type="checkbox" {...register('referralSources.pandora')} />
                <span>Pandora</span>
              </label>

              <label className={styles.referralCheckbox}>
                <input type="checkbox" {...register('referralSources.billboard')} />
                <span>Billboard</span>
              </label>

              <label className={styles.referralCheckbox}>
                <input type="checkbox" {...register('referralSources.outsideSales')} />
                <span>Outside Sales</span>
              </label>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.formStep}>
            <h2 className={styles.centerHeading}>Dent Source LLC Authorization and Direction of Pay</h2>
            <div className={styles.authorizationSection}>
              <p className={styles.authText}>
                I authorize DENT SOURCE LLC to repair my vehicle.
              </p>
              <p className={styles.authText}>
                I authorize{' '}
                <input
                  type="text"
                  {...register('insuranceCompany')}
                  className={styles.inlineInput}
                  placeholder="your insurance company"
                />{' '}
                to pay DENT SOURCE LLC directly for the repairs performed on my vehicle.
              </p>

              <div className={styles.signatureRow}>
                <div className={styles.signatureField}>
                  <label>Signature:</label>
                  <div className={styles.signaturePlaceholder}>
                    {/* Signature will be captured on the last page */}
                    <span className={styles.signatureNote}>Signature will be captured at the end of the form</span>
                  </div>
                </div>

                <div className={styles.dateField}>
                  <label>Date:</label>
                  <input
                    type="date"
                    {...register('date')}
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                  {errors.date && (
                    <span className={styles.error}>{errors.date.message}</span>
                  )}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label>Vehicle Description:</label>
                <input
                  type="text"
                  {...register('vehicleDescription')}
                  placeholder="year/make/model"
                  autoComplete="off"
                />
                {errors.vehicleDescription && (
                  <span className={styles.error}>{errors.vehicleDescription.message}</span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label>V.I.N.:</label>
                <input
                  type="text"
                  {...register('vin')}
                  className={styles.vinInput}
                  maxLength={17}
                  placeholder="must be 17 alphanumeric characters"
                />
                {errors.vin && (
                  <span className={styles.error}>{errors.vin.message}</span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label>Claim Number:</label>
                <input
                  type="text"
                  {...register('claimNumber')}
                  autoComplete="off"
                />
                {errors.claimNumber && (
                  <span className={styles.error}>{errors.claimNumber.message}</span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label>Date of Loss:</label>
                <input
                  type="date"
                  {...register('dateOfLoss')}
                />
                {errors.dateOfLoss && (
                  <span className={styles.error}>{errors.dateOfLoss.message}</span>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.formStep}>
            <h2 className={styles.centerHeading}>Personal Information</h2>
            <div className={styles.personalInfoSection}>
              {/* New fields section */}
              <div className={styles.fieldGroup}>
                <label>How did you hear about us?</label>
                <input
                  type="text"
                  {...register('howDidhear')}
                  autoComplete="off"
                  placeholder="Please provide details"
                />
                {errors.howDidhear && (
                  <span className={styles.error}>{errors.howDidhear.message}</span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label>Referral Address: (optional)</label>
                <input
                  type="text"
                  {...register('referralAddress')}
                  autoComplete="off"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Referral Phone: (optional)</label>
                <input
                  type="tel"
                  {...register('referralPhone')}
                  autoComplete="off"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Referral Email: (optional)</label>
                <input
                  type="email"
                  {...register('referralEmail')}
                  autoComplete="off"
                />
                {errors.referralEmail && (
                  <span className={styles.error}>{errors.referralEmail.message}</span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label>Drop Date:</label>
                <input
                  type="date"
                  {...register('dropDate')}
                  defaultValue={new Date().toISOString().split('T')[0]}
                  autoComplete="off"
                />
                {errors.dropDate && (
                  <span className={styles.error}>{errors.dropDate.message}</span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label>Location:</label>
                <input
                  type="text"
                  {...register('location')}
                  autoComplete="off"
                />
                {errors.location && (
                  <span className={styles.error}>{errors.location.message}</span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label>Estimator:</label>
                <input
                  type="text"
                  {...register('estimator')}
                  defaultValue={locationState?.name || ''}
                  autoComplete="off"
                />
                {errors.estimator && (
                  <span className={styles.error}>{errors.estimator.message}</span>
                )}
              </div>

              {/* Original fields */}
              <div className={styles.fieldGroup}>
                <label>Name:</label>
                <input
                  type="text"
                  {...register('name')}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                {errors.name && (
                  <span className={styles.error}>{errors.name.message}</span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label>Phone:</label>
                <input
                  type="tel"
                  {...register('phone')}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                {errors.phone && (
                  <span className={styles.error}>{errors.phone.message}</span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label>Alt Phone: (optional)</label>
                <input
                  type="tel"
                  {...register('altPhone')}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Address:</label>
                <div className={styles.autofillPrevention}>
                  {/* Hidden inputs to confuse autofill */}
                  <input type="text" style={{ display: 'none' }} />
                  <input type="text" style={{ display: 'none' }} />
                  <input
                    type="text"
                    {...register('address')}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form-type="other"
                    data-lpignore="true"
                  />
                </div>
                {errors.address && (
                  <span className={styles.error}>{errors.address.message}</span>
                )}
              </div>

              <div className={styles.addressRow}>
                <div className={styles.fieldGroup}>
                  <label>City:</label>
                  <input
                    type="text"
                    {...register('city')}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                  {errors.city && (
                    <span className={styles.error}>{errors.city.message}</span>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <label>State:</label>
                  <input
                    type="text"
                    {...register('state')}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                  {errors.state && (
                    <span className={styles.error}>{errors.state.message}</span>
                  )}
                </div>

                <div className={styles.fieldGroup}>
                  <label>ZIP:</label>
                  <input
                    type="text"
                    {...register('zip')}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                  {errors.zip && (
                    <span className={styles.error}>{errors.zip.message}</span>
                  )}
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label>Email:</label>
                <div className={styles.autofillPrevention}>
                  {/* Hidden inputs to confuse autofill */}
                  <input type="email" style={{ display: 'none' }} />
                  <input type="email" style={{ display: 'none' }} />
                  <input
                    type="email"
                    {...register('email')}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form-type="other"
                    data-lpignore="true"
                  />
                </div>
                {errors.email && (
                  <span className={styles.error}>{errors.email.message}</span>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className={styles.formStep}>
            <h2 className={styles.centerHeading}>Vehicle Information</h2>
            <div className={styles.vehicleInfoSection}>
              <p className={styles.infoText}>
                This information was already provided in the authorization section.
              </p>

              <div className={styles.fieldGroup}>
                <label>Year/Make/Model:</label>
                <input
                  type="text"
                  {...register('vehicleDescription')}
                  disabled
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>VIN:</label>
                <input
                  type="text"
                  {...register('vin')}
                  className={styles.vinInput}
                  disabled
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className={styles.formStep}>
            <h2 className={styles.centerHeading}>Insurance Information</h2>
            <div className={styles.insuranceInfoSection}>
              <div className={styles.fieldGroup}>
                <label>Name of Insured:</label>
                <div className={styles.autofillPrevention}>
                  <input
                    type="text"
                    {...register('insuredName')}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form-type="other"
                    data-lpignore="true"
                  />
                </div>
                {errors.insuredName && (
                  <span className={styles.error}>{errors.insuredName.message}</span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label>Phone:</label>
                <div className={styles.autofillPrevention}>
                  <input
                    type="tel"
                    {...register('insuredPhone')}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form-type="other"
                    data-lpignore="true"
                  />
                </div>
                {errors.insuredPhone && (
                  <span className={styles.error}>{errors.insuredPhone.message}</span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label>Provider:</label>
                <div className={styles.autofillPrevention}>
                  <input
                    type="text"
                    {...register('provider')}
                    defaultValue={watch('insuranceCompany')}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form-type="other"
                    data-lpignore="true"
                  />
                </div>
                {errors.provider && (
                  <span className={styles.error}>{errors.provider.message}</span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label>Claim Number:</label>
                <div className={styles.autofillPrevention}>
                  <input
                    type="text"
                    {...register('claimNumber')}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form-type="other"
                    data-lpignore="true"
                  />
                </div>
                {errors.claimNumber && (
                  <span className={styles.error}>{errors.claimNumber.message}</span>
                )}
              </div>

              <div className={styles.fieldGroup}>
                <label>What is your deductible?</label>
                <div className={styles.autofillPrevention}>
                  <input
                    type="number"
                    {...register('deductible')}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form-type="other"
                    data-lpignore="true"
                  />
                </div>
                {errors.deductible && (
                  <span className={styles.error}>{errors.deductible.message}</span>
                )}
              </div>

              <div className={styles.questionSection}>
                <div className={styles.questionGroup}>
                  <p className={styles.questionLabel}>Have you had an estimate done on this vehicle?</p>
                  <div className={styles.radioGroup}>
                    <label>
                      <input
                        type="radio"
                        value="true"
                        {...register('hasEstimate')}
                      />
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="false"
                        {...register('hasEstimate')}
                      />
                      No
                    </label>
                  </div>
                </div>

                {watch('hasEstimate') === true && (
                  <div className={styles.questionGroup}>
                    <p className={styles.questionLabel}>Do you have a copy of the estimate?</p>
                    <div className={styles.radioGroup}>
                      <label>
                        <input
                          type="radio"
                          value="true"
                          {...register('hasEstimateCopy')}
                        />
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="false"
                          {...register('hasEstimateCopy')}
                        />
                        No
                      </label>
                    </div>
                  </div>
                )}

                <div className={styles.questionGroup}>
                  <p className={styles.questionLabel}>Have you received a check for this claim?</p>
                  <div className={styles.radioGroup}>
                    <label>
                      <input
                        type="radio"
                        value="true"
                        {...register('hasReceivedCheck')}
                      />
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="false"
                        {...register('hasReceivedCheck')}
                      />
                      No
                    </label>
                  </div>
                </div>

                {watch('hasReceivedCheck') === true && (
                  <div className={styles.questionGroup}>
                    <p className={styles.questionLabel}>Has it been cashed?</p>
                    <div className={styles.radioGroup}>
                      <label>
                        <input
                          type="radio"
                          value="true"
                          {...register('hasCheckedCashed')}
                        />
                        Yes
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="false"
                          {...register('hasCheckedCashed')}
                        />
                        No
                      </label>
                    </div>
                  </div>
                )}

                <div className={styles.questionGroup}>
                  <p className={styles.questionLabel}>Were you referred here by someone you know?</p>
                  <div className={styles.radioGroup}>
                    <label>
                      <input
                        type="radio"
                        value="true"
                        {...register('referralSources.referral')}
                      />
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="false"
                        {...register('referralSources.referral')}
                      />
                      No
                    </label>
                  </div>
                </div>

                {watch('referralSources.referral') === true && (
                  <div className={styles.referralInfoSection}>
                    <p className={styles.referralInfoNote}>
                      Please provide as much information as possible about who referred you so we will be able to successfully contact this person
                    </p>

                    <div className={styles.fieldGroup}>
                      <label>Name of referrer:</label>
                      <input
                        type="text"
                        {...register('referralSources.referralName')}
                      />
                      {errors.referralSources?.referralName && (
                        <span className={styles.error}>{errors.referralSources.referralName.message}</span>
                      )}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label>Address:</label>
                      <input
                        type="text"
                        {...register('referralSources.referralAddress')}
                      />
                      {errors.referralSources?.referralAddress && (
                        <span className={styles.error}>{errors.referralSources.referralAddress.message}</span>
                      )}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label>Phone:</label>
                      <input
                        type="tel"
                        {...register('referralSources.referralPhone')}
                      />
                      {errors.referralSources?.referralPhone && (
                        <span className={styles.error}>{errors.referralSources.referralPhone.message}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className={styles.formStep}>
            <h2 className={styles.centerHeading}>Disclaimers</h2>
            <div className={styles.disclaimersSection}>
              <div className={styles.disclaimerItem}>
                <label className={styles.disclaimerLabel}>
                  <input
                    type="checkbox"
                    {...register('repairPermission', { required: true })}
                  />
                  <div>
                    <h3>Permission to Repair & Release</h3>
                    <p>I authorize the repair of my vehicle and grand permission to DENT SOURCE to operate the vehicle for the purpose of testing and/or inspection. I authorize DENT SOURCE to conduct repairs in any way that deems necessary. I authorize DENT SOURCE to perform mechanical repairs. I agree that DENT SOURCE is not responsible for the loss of damage to this vehicle and/or articles left in the vehicle due to fire, theft or any other cause beyond its control.</p>
                  </div>
                </label>
                {errors.repairPermission && (
                  <span className={styles.error}>This acknowledgment is required</span>
                )}
              </div>

              <div className={styles.disclaimerItem}>
                <label className={styles.disclaimerLabel}>
                  <input
                    type="checkbox"
                    {...register('additionalRepairs', { required: true })}
                  />
                  <div>
                    <h3>Additional Repairs & Prior Damage</h3>
                    <p>I acknowledge that if closer analysis reveals additional repairs are necessary, either I or my insurance company will be contacted for authorization of any additional repair charges. If new parts listed in the attached repair order are not available, I authorize DENT SOURCE to repair such damage or worn parts when possible. Old parts will be thrown away unless otherwise instructed. I authorize DENT SOURCE to manufacture access to dent that may not be accessible due to their location on this vehicle. DENT SOURCE is not responsible for prior damage listed in the Comments/Parts section on this estimate.</p>
                  </div>
                </label>
                {errors.additionalRepairs && (
                  <span className={styles.error}>This acknowledgment is required</span>
                )}
              </div>

              <div className={styles.disclaimerItem}>
                <label className={styles.disclaimerLabel}>
                  <input
                    type="checkbox"
                    {...register('payment', { required: true })}
                  />
                  <div>
                    <h3>Payment</h3>
                    <p>I agree to pay for all repair changes not previously paid to DENT SOURCE by my insurance company, and further understand that the total amount of the repair charges must be paid before the attached vehicle can be released for delivery. If insurance coverage pays either a portion of or the total amount due, I acknowledge that the insurance companies check/draft must be obtained by me or sent in advance by the insurance company to DENT SOURCE and received by DENT SOURCE. I also acknowledge that I must make arrangements with any lien holder or other payees to endorse the insurance check/draft prior to the release of the repaired vehicle. I authorize any and all supplements payable directly to DENT SOURCE for the consideration of repairs made to this vehicle.</p>
                  </div>
                </label>
                {errors.payment && (
                  <span className={styles.error}>This acknowledgment is required</span>
                )}
              </div>

              <div className={styles.disclaimerItem}>
                <label className={styles.disclaimerLabel}>
                  <input
                    type="checkbox"
                    {...register('totalLoss', { required: true })}
                  />
                  <div>
                    <h3>Total Loss</h3>
                    <p>Vehicles deemed a total loss by insurance provider will be charged an administration fee, storage fee, from date of drop and any repairs or parts installed.</p>
                  </div>
                </label>
                {errors.totalLoss && (
                  <span className={styles.error}>This acknowledgment is required</span>
                )}
              </div>

              <div className={styles.disclaimerItem}>
                <label className={styles.disclaimerLabel}>
                  <input
                    type="checkbox"
                    {...register('failureToPay', { required: true })}
                  />
                  <div>
                    <h3>Failure to Pay</h3>
                    <p>In the event that I fail to pay pursuant to the paragraph above, I acknowledge an expressed mechanics lien on the vehicle to secure payment in the amount of the repairs, and further agree to pay responsible attorney's fees and court costs in the event that legal action becomes necessary to enforce this contract. This agreement is governed by and shall be construed in accordance with the law of Oklahoma and the parties submit all their disputes arising out of or in connection with this agreement to the exclusive jurisdiction of the courts of Oklahoma County, OK.</p>
                  </div>
                </label>
                {errors.failureToPay && (
                  <span className={styles.error}>This acknowledgment is required</span>
                )}
              </div>

              <div className={styles.disclaimerItem}>
                <label className={styles.disclaimerLabel}>
                  <input
                    type="checkbox"
                    {...register('reviews', { required: true })}
                  />
                  <div>
                    <h3>Reviews</h3>
                    <p>Leaving a negative review on social media, internet, or any other media outlet, will result in forfeiture of all promotional discounts, including but not limited to deductible coupon, rental car fee and/or cash back offer. Failure to reimburse in a timely manner will result in legal action. Customer shall pay all legal fees incurred by DENT SOURCE enforcing the terms of this contract.</p>
                  </div>
                </label>
                {errors.reviews && (
                  <span className={styles.error}>This acknowledgment is required</span>
                )}
              </div>

              <div className={styles.signatureSection} ref={signatureSectionRef}>
                <h3>Signature</h3>
                <SignatureCanvas
                  ref={(ref) => setSignaturePad(ref)}
                  penColor="#3BB554"
                  canvasProps={{
                    className: styles.signatureCanvas,
                    width: windowWidth > 768 ? 500 : windowWidth - 60,
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
                  {signatureSaved && (
                    <div className={styles.signatureSavedIndicator}>
                      <span className={styles.checkmark}>✓</span> Signature Saved
                    </div>
                  )}
                </div>

                <div className={styles.dateField}>
                  <label>Date:</label>
                  <input
                    type="date"
                    {...register('date')}
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // Check if all required checkboxes are checked on the last page
  const allRequiredChecked = currentStep === 6 &&
    watch('repairPermission') &&
    watch('additionalRepairs') &&
    watch('payment') &&
    watch('totalLoss') &&
    watch('failureToPay') &&
    watch('reviews') &&
    signatureSaved;

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.greenHeading}>Drop Off Form</h1>

      <form
        onSubmit={(e) => {
          // Prevent default form submission - we're handling it with the button click
          e.preventDefault();
          console.log('Form submit event triggered, but we are handling submission with the button click');
        }}
        autoComplete="off"
      >
        {/* Hidden fields to catch autofill */}
        <div style={{ display: 'none' }}>
          <input type="text" name="address" autoComplete="street-address" />
          <input type="email" name="email" autoComplete="email" />
        </div>
        {renderStep()}
        <div className={styles.formNavigation}>
          {currentStep > 1 && (
            <button
              type="button"
              className={styles.prevButton}
              onClick={() => {
                setCurrentStep(currentStep - 1);
                // Scroll to top of the page when changing steps
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
                // Validate current step before proceeding
                if (validateStep(currentStep)) {
                  setCurrentStep(currentStep + 1);
                  // Scroll to top of the page when changing steps
                  window.scrollTo(0, 0);
                }
              }}
            >
              Next
            </button>
          ) : (
            <button
              type="button" // Changed from submit to button to handle manually
              className={`${styles.submitButton} ${!allRequiredChecked ? styles.disabled : ''}`}
              disabled={!allRequiredChecked || isSubmitting}
              onClick={(e) => {
                e.preventDefault();
                console.log('Submit button clicked directly');

                if (!allRequiredChecked) {
                  console.log('Not all required fields are checked');
                  return;
                }

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
                text.textContent = 'Submitting documents...';
                text.style.color = 'white';
                text.style.marginTop = '20px';
                text.style.fontSize = '1.2rem';

                overlay.appendChild(spinner);
                overlay.appendChild(text);

                // Add keyframes for spinner animation
                const style = document.createElement('style');
                style.id = 'spinner-style';
                style.textContent = `
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `;

                document.head.appendChild(style);
                document.body.appendChild(overlay);

                // Get form data
                const data = getValues();

                // Submit form
                setTimeout(async () => {
                  try {
                    console.log('Submitting form data:', data);
                    const result = await submitForm(data as unknown as Record<string, unknown>, 'dropoff', estimatorEmail);

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
