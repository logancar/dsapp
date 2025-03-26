import { useForm } from 'react-hook-form';

export const useFormValidation = (fields: string[]) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    mode: 'onChange',
  });

  const validateForm = (data: any) => {
    const missingFields = fields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      throw new Error('Error: Missing Fields - If you do not know the answer, ask your estimator for assistance.');
    }
    return true;
  };

  return {
    register,
    handleSubmit,
    errors,
    watch,
    validateForm,
  };
};