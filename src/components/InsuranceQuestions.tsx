import { useState } from 'react';
import styles from './InsuranceQuestions.module.css';

interface InsuranceQuestionsProps {
  onComplete: (data: any) => void;
}

export const InsuranceQuestions: React.FC<InsuranceQuestionsProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    Estimate_Done: '',
    Estimate_Copy: '',
    Check_Received: '',
    Cashed_Status: '',
  });

  const handleChange = (field: string, value: string) => {
    const newFormData = {
      ...formData,
      [field]: value,
      // Reset dependent fields if "No" is selected
      ...(field === 'Estimate_Done' && value === 'no' && { Estimate_Copy: '' }),
      ...(field === 'Check_Received' && value === 'no' && { Cashed_Status: '' }),
    };
    setFormData(newFormData);
    onComplete(newFormData); // Call onComplete with updated form data
  };

  return (
    <div className={styles.container}>
      <div className={styles.questionGroup}>
        <label>Have you had an estimate done on this vehicle?</label>
        <div className={styles.radioGroup}>
          <label>
            <input
              type="radio"
              name="Estimate_Done"
              value="yes"
              checked={formData.Estimate_Done === 'yes'}
              onChange={(e) => handleChange('Estimate_Done', e.target.value)}
            /> Yes
          </label>
          <label>
            <input
              type="radio"
              name="Estimate_Done"
              value="no"
              checked={formData.Estimate_Done === 'no'}
              onChange={(e) => handleChange('Estimate_Done', e.target.value)}
            /> No
          </label>
        </div>
      </div>

      {formData.Estimate_Done === 'yes' && (
        <div className={styles.questionGroup}>
          <label>Do you have a copy of the estimate?</label>
          <div className={styles.radioGroup}>
            <label>
              <input
                type="radio"
                name="Estimate_Copy"
                value="yes"
                checked={formData.Estimate_Copy === 'yes'}
                onChange={(e) => handleChange('Estimate_Copy', e.target.value)}
              /> Yes
            </label>
            <label>
              <input
                type="radio"
                name="Estimate_Copy"
                value="no"
                checked={formData.Estimate_Copy === 'no'}
                onChange={(e) => handleChange('Estimate_Copy', e.target.value)}
              /> No
            </label>
          </div>
        </div>
      )}

      {/* Similar pattern for Check_Received and Cashed_Status */}
    </div>
  );
};
