import { useNavigate } from 'react-router-dom';
import styles from './ThanksPage.module.css';

function ThanksPage() {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Thank You for Submitting Your Documents!</h2>
      <p className={styles.message}>
        Let your estimator know that you have completed this step.
      </p>
      <button
        className={styles.finishButton}
        onClick={goHome}
      >
        Finish Document Signing
      </button>
    </div>
  );
}

export default ThanksPage;
