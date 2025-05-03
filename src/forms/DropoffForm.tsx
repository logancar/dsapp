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
  licensePlate?: string;

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
  licensePlate: yup.string().optional(),
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
  // Generate random field names to prevent autofill
  const randomAddressField = `address_${Math.random().toString(36).substring(2, 15)}`;
  const randomEmailField = `email_${Math.random().toString(36).substring(2, 15)}`;

  // Get estimator email from location state
  const location = useLocation();
  const locationState = location.state as LocationState;
  const estimatorEmail = locationState?.email || 'unknown@somewhere.com';
  const estimatorName = locationState?.name || 'Unknown';

  // Add loading state - explicitly set to false initially
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { register, handleSubmit, setValue, watch, getValues, formState: { errors } } = useForm<DropoffFormData>({
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

  // Clear form fields and reset loading state on component mount
  useEffect(() => {
    // Reset address and email fields
    setValue('address', '');
    setValue('email', '');

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
                    name={randomAddressField}
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
                    name={randomEmailField}
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
                    </div>

                    <div className={styles.fieldGroup}>
                      <label>Address:</label>
                      <input
                        type="text"
                        {...register('referralSources.referralAddress')}
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label>Phone:</label>
                      <input
                        type="tel"
                        {...register('referralSources.referralPhone')}
                      />
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
                // Ensure we can navigate to the next step
                setCurrentStep(currentStep + 1);
                // Scroll to top of the page when changing steps
                window.scrollTo(0, 0);
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
                    const result = await submitForm(data, 'dropoff', estimatorEmail);

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
