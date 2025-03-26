import { useState } from 'react';
import styles from './ReferralSection.module.css';

interface ReferralData {
  referralType: 'Direct' | 'Referral';
  referralName?: string;
  referralAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  referralPhone?: string;
}

interface ReferralSectionProps {
  onChange: (data: Partial<ReferralData>) => void;
}

export const ReferralSection = ({ onChange }: ReferralSectionProps) => {
  const [showReferralFields, setShowReferralFields] = useState(false);
  const [address, setAddress] = useState<ReferralData['referralAddress']>({
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const handleReferralChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const isReferral = e.target.value === 'Referral';
    setShowReferralFields(isReferral);
    onChange({
      referralType: e.target.value as 'Direct' | 'Referral',
      ...(isReferral ? {} : {
        referralName: '',
        referralAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        referralPhone: '',
      }),
    });
  };

  const handleReferralFieldChange = (field: keyof Omit<ReferralData, 'referralType'>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ [field]: e.target.value });
    };

  const handleAddressFieldChange = (field: 'street' | 'city' | 'state' | 'zipCode') => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newAddress = {
        ...address,
        [field]: e.target.value
      };
      setAddress({
        street: newAddress.street || '',
        city: newAddress.city || '',
        state: newAddress.state || '',
        zipCode: newAddress.zipCode || ''
      });
      onChange({
        referralAddress: {
          street: newAddress.street || '',
          city: newAddress.city || '',
          state: newAddress.state || '',
          zipCode: newAddress.zipCode || ''
        }
      });
    };

  return (
    <div className={styles.referralSection}>
      <h3>How did you hear about us?</h3>
      <div className={styles.radioGroup}>
        <label>
          <input
            type="radio"
            name="referralType"
            value="Direct"
            onChange={handleReferralChange}
          />
          Direct
        </label>
        <label>
          <input
            type="radio"
            name="referralType"
            value="Referral"
            onChange={handleReferralChange}
          />
          Referral
        </label>
      </div>
      
      {showReferralFields && (
        <div className={styles.referralFields}>
          <input
            type="text"
            placeholder="Referral Name"
            onChange={handleReferralFieldChange('referralName')}
            required
          />
          <div className={styles.addressFields}>
            <input
              type="text"
              placeholder="Street Address"
              onChange={handleAddressFieldChange('street')}
              required
            />
            <div className={styles.cityStateZip}>
              <input
                type="text"
                placeholder="City"
                onChange={handleAddressFieldChange('city')}
                required
              />
              <input
                type="text"
                placeholder="State"
                maxLength={2}
                onChange={handleAddressFieldChange('state')}
                required
              />
              <input
                type="text"
                placeholder="ZIP Code"
                pattern="[0-9]{5}"
                onChange={handleAddressFieldChange('zipCode')}
                required
              />
            </div>
          </div>
          <input
            type="tel"
            placeholder="Phone (XXX-XXX-XXXX)"
            pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
            onChange={handleReferralFieldChange('referralPhone')}
            required
          />
        </div>
      )}
    </div>
  );
};









