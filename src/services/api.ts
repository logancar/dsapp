// Determine the API base URL based on the environment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_BASE_URL = isDevelopment
  ? 'http://localhost:8080'
  : 'https://dskiosk.up.railway.app';

type PdfType = 'rental' | 'pickup' | 'dropoff';

interface FormSubmissionResponse {
  success: boolean;
  message: string;
  error?: string;
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
    const url = `${API_BASE_URL}/submit-form`;
    console.log('Submitting form data to:', url);
    console.log('Environment:', isDevelopment ? 'Development' : 'Production');
    console.log('Form data keys:', Object.keys(formData));
    console.log('PDF Type:', pdfType);
    console.log('Estimator Email:', estimatorEmail);

    // Check if we have a signature
    if (formData.signature1) {
      console.log('Signature is present in the form data');
    } else {
      console.warn('No signature found in form data!');
    }

    const requestBody = JSON.stringify({
      formData,
      pdfType,
      estimatorEmail
    });

    console.log('Request body size:', requestBody.length, 'bytes');

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
    }

    throw error;
  }
};


