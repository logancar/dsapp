import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './SendCustomerEmailPage.module.css';
import { sendCustomerEmail } from '../services/api';

interface LocationState {
  name?: string;
  email?: string;
  isCustomer?: boolean;
}

function SendCustomerEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Estimator info from login session
  const estimatorName = locationState?.name || 'Unknown';
  const estimatorEmail = locationState?.email || '';

  // Generate estimator code based on first name
  const getEstimatorCode = (name: string): string => {
    if (!name || name === 'Unknown') return '';

    // Extract first name (in case full name is provided)
    const firstName = name.split(' ')[0];

    // Convert to uppercase and prepend DS
    return `DS${firstName.toUpperCase()}`;
  };

  const estimatorCode = getEstimatorCode(estimatorName);

  // Check if user is logged in as an estimator
  useEffect(() => {
    if (!estimatorEmail || locationState?.isCustomer) {
      // Redirect to login if not logged in as an estimator
      navigate('/');
    }
  }, [estimatorEmail, locationState, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset messages
    setSuccessMessage('');
    setErrorMessage('');

    // Validate form
    if (!customerName.trim() || !customerEmail.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      // Call the API without storing the unused result
      await sendCustomerEmail({
        customerName,
        customerEmail,
        estimatorName,
        estimatorEmail,
        estimatorCode
      });

      setSuccessMessage(`Email sent successfully to ${customerName}!`);
      // Reset form
      setCustomerName('');
      setCustomerEmail('');
    } catch (error) {
      console.error('Error sending email:', error);

      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setErrorMessage(
          'Network error: Could not connect to the server. ' +
          'Please make sure the backend server is running. ' +
          'If you are in development mode, run "cd server && node server.js" to start the server.'
        );
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'An error occurred while sending the email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard', {
      state: {
        name: estimatorName,
        email: estimatorEmail
      }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.backButton} onClick={handleBack}>
        &larr; Back to Dashboard
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>Send Email to Customer</h1>
        <p className={styles.subtitle}>
          Send instructions to your customer for completing their paperwork
        </p>
      </div>

      <div className={styles.infoBox}>
        <div className={styles.infoTitle}>Estimator Information</div>
        <div className={styles.infoText}>
          <p>Name: {estimatorName}</p>
          <p>Email: {estimatorEmail}</p>
          <p>Login Code for Customer: {estimatorCode}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="customerName">Customer Name *</label>
          <input
            type="text"
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer's full name"
            required
            autoComplete="off"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="customerEmail">Customer Email Address *</label>
          <input
            type="email"
            id="customerEmail"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Enter customer's email address"
            required
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Email to Customer'}
        </button>

        {successMessage && (
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className={styles.errorMessage}>
            <strong>Error:</strong> {errorMessage}
            {errorMessage.includes('Network error') && (
              <div className={styles.errorHelp}>
                <p><strong>Troubleshooting:</strong></p>
                <ol>
                  <li>Make sure the backend server is running</li>
                  <li>Check that your internet connection is working</li>
                  <li>If in development mode, run: <code>cd server && node server.js</code></li>
                </ol>
              </div>
            )}
          </div>
        )}
      </form>

      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className="spinner"></div>
          <div className={styles.loadingText}>Sending email...</div>
        </div>
      )}
    </div>
  );
}

export default SendCustomerEmailPage;
