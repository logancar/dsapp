// Determine the API base URL based on the environment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_BASE_URL = isDevelopment
  ? 'http://localhost:8081' // Changed to 8081 to match server port
  : 'https://dskiosk.up.railway.app';

type PdfType = 'rental' | 'pickup' | 'dropoff' | 'walkaround';

interface FormSubmissionResponse {
  success: boolean;
  message: string;
  error?: string;
}

interface CustomerEmailData {
  customerName: string;
  customerEmail: string;
  estimatorName: string;
  estimatorEmail: string;
  estimatorCode: string;
}

// Function to test if the server is reachable
export const testServerConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing server connection to:', `${API_BASE_URL}/test`);
    const response = await fetch(`${API_BASE_URL}/test`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors',
    });

    console.log('Server test response status:', response.status);
    const data = await response.json();
    console.log('Server test response data:', data);

    return response.ok;
  } catch (error) {
    console.error('Server connection test failed:', error);
    return false;
  }
};

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const submitForm = async (
  formData: Record<string, unknown>,
  pdfType: PdfType,
  estimatorEmail: string
): Promise<FormSubmissionResponse> => {
  console.log('submitForm function called with:', { pdfType, estimatorEmail });

  // Input validation
  if (!formData) {
    console.error('Form data is missing');
    throw new Error('Form data is required');
  }

  if (!isValidEmail(estimatorEmail)) {
    console.error('Invalid email format:', estimatorEmail);
    throw new Error('Invalid estimator email format');
  }

  try {
    // For development/testing, we can simulate a successful response if the server is not available
    if (isDevelopment) {
      try {
        // First try to connect to the real server
        const testResponse = await fetch(`${API_BASE_URL}/test`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          mode: 'cors',
        });

        // If test fails, we'll catch it in the next block
        await testResponse.json();
      } catch (testError) {
        console.warn('Server connection test failed, using simulated response for development');
        console.info('To submit forms, make sure your backend server is running at:', API_BASE_URL);

        // Simulate successful response for development
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
          success: true,
          message: `[DEVELOPMENT MODE] Form would be submitted for ${pdfType} type`
        };
      }
    }

    const url = `${API_BASE_URL}/submit-form`;
    console.log('Submitting form data to:', url);
    console.log('Environment:', isDevelopment ? 'Development' : 'Production');
    console.log('Form data keys:', Object.keys(formData));
    console.log('PDF Type:', pdfType);
    console.log('Estimator Email:', estimatorEmail);

    // Check if we have a signature (not needed for walkaround photos)
    if (pdfType !== 'walkaround') {
      // For rental form, check all three signatures
      if (pdfType === 'rental') {
        const hasSignature1 = formData.signaturePage1 || formData.signature1;
        const hasSignature2 = formData.signaturePage2 || formData.signature2;
        const hasSignature3 = formData.signaturePage3 || formData.signature3;

        console.log('Rental form signatures check:');
        console.log('- Page 1 signature:', !!hasSignature1);
        console.log('- Page 2 signature:', !!hasSignature2);
        console.log('- Page 3 signature:', !!hasSignature3);

        if (!hasSignature1 || !hasSignature2 || !hasSignature3) {
          console.warn('Missing one or more signatures in rental form!');
        }
      } else {
        // For other forms
        const hasSignature = formData.signature || formData.signature1 || formData.signature2;
        if (hasSignature) {
          console.log('Signature is present in the form data');
        } else {
          console.warn('No signature found in form data!');
        }
      }
    } else {
      // For walkaround photos, check if we have at least one photo
      const photoKeys = Object.keys(formData).filter(key => key.startsWith('photo_'));
      console.log(`Found ${photoKeys.length} photos in walkaround submission`);
    }

    // Add a timestamp to the form data
    const formDataWithTimestamp = {
      ...formData,
      submittedAt: new Date().toISOString()
    };

    const requestBody = JSON.stringify({
      formData: formDataWithTimestamp,
      pdfType,
      estimatorEmail
    });

    console.log('Request body size:', requestBody.length, 'bytes');

    // Add a small delay to simulate network latency and ensure loading animation is visible
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log('Sending fetch request...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      body: requestBody,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);

    const responseData = await response.json();
    console.log('Response data:', responseData);

    if (!response.ok) {
      console.error('Server Error Response:', responseData);
      throw new Error(responseData.message || responseData.error || 'Failed to submit form');
    }

    // Add a small delay to ensure loading animation is visible
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log('Form submission successful');
    return responseData as FormSubmissionResponse;
  } catch (error) {
    console.error('API Error Details:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'Unknown error'
    });

    // Check for network errors
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error - server might be down or unreachable');

      if (isDevelopment) {
        console.warn('Server connection failed. Make sure your backend server is running at:', API_BASE_URL);
        console.warn('To start the server: cd server && node server.js');
      }
    }

    // Add a small delay before throwing the error to ensure loading animation is visible
    await new Promise(resolve => setTimeout(resolve, 800));

    throw error;
  }
};

export const sendCustomerEmail = async (
  data: CustomerEmailData
): Promise<FormSubmissionResponse> => {
  console.log('sendCustomerEmail function called with:', data);

  // Input validation
  if (!data.customerName || !data.customerEmail || !data.estimatorName || !data.estimatorEmail || !data.estimatorCode) {
    console.error('Missing required data for customer email');
    throw new Error('All fields are required');
  }

  if (!isValidEmail(data.customerEmail)) {
    console.error('Invalid customer email format:', data.customerEmail);
    throw new Error('Invalid customer email format');
  }

  if (!isValidEmail(data.estimatorEmail)) {
    console.error('Invalid estimator email format:', data.estimatorEmail);
    throw new Error('Invalid estimator email format');
  }

  try {
    // Add a small delay to simulate network latency and ensure loading animation is visible
    await new Promise(resolve => setTimeout(resolve, 800));

    // For development/testing, we can simulate a successful response if the server is not available
    if (isDevelopment) {
      try {
        // First try to connect to the real server
        const testResponse = await fetch(`${API_BASE_URL}/test`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          mode: 'cors',
        });

        // If test fails, we'll catch it in the next block
        await testResponse.json();
      } catch (testError) {
        console.warn('Server connection test failed, using simulated response for development');
        console.info('To send real emails, make sure your backend server is running at:', API_BASE_URL);

        // Simulate successful response for development
        await new Promise(resolve => setTimeout(resolve, 1000));

        return {
          success: true,
          message: `[DEVELOPMENT MODE] Email would be sent to ${data.customerName} at ${data.customerEmail}`
        };
      }
    }

    const url = `${API_BASE_URL}/api/send-customer-email`;
    console.log('Sending customer email request to:', url);
    console.log('Environment:', isDevelopment ? 'Development' : 'Production');

    console.log('Sending fetch request...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(data),
    });

    console.log('Response status:', response.status);
    const responseData = await response.json();
    console.log('Response data:', responseData);

    if (!response.ok) {
      console.error('Server Error Response:', responseData);
      throw new Error(responseData.message || responseData.error || 'Failed to send email');
    }

    // Add a small delay to ensure loading animation is visible
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log('Email sent successfully');
    return responseData as FormSubmissionResponse;
  } catch (error) {
    console.error('API Error Details:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'Unknown error'
    });

    // Check for network errors
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error - server might be down or unreachable');

      if (isDevelopment) {
        console.warn('Server connection failed. Make sure your backend server is running at:', API_BASE_URL);
        console.warn('To start the server: cd server && node server.js');
      }
    }

    // Add a small delay before throwing the error to ensure loading animation is visible
    await new Promise(resolve => setTimeout(resolve, 800));

    throw error;
  }
};