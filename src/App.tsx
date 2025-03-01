import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import styles from './App.module.css';

type FormValues = {
  email: string;
};

function App() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    alert(`Submitted Email: ${data.email}`);
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <input
          {...register('email', { required: 'Email is required' })}
          placeholder="Enter your email"
        />
        {errors.email && <p className={styles.error}>{errors.email.message}</p>}

        <button type="submit">
          Submit
        </button>
      </form>
    </motion.div>
  );
}

export default App;
