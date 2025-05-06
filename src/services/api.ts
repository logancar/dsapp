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

    // Check if we have a signature (not needed for walkaround photos)
    if (pdfType !== 'walkaround') {
      const hasSignature = formData.signature || formData.signature1 || formData.signature2;
      if (hasSignature) {
        console.log('Signature is present in the form data');
      } else {
        console.warn('No signature found in form data!');
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
    }

    // Add a small delay before throwing the error to ensure loading animation is visible
    await new Promise(resolve => setTimeout(resolve, 800));

    throw error;
  }
};


