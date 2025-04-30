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

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const submitForm = async (
  formData: Record<string, unknown>,
  pdfType: PdfType,
  estimatorEmail: string
): Promise<FormSubmissionResponse> => {
  // Input validation
  if (!formData) {
    throw new Error('Form data is required');
  }

  if (!isValidEmail(estimatorEmail)) {
    throw new Error('Invalid estimator email format');
  }

  try {
    console.log('Submitting form data:', {
      formData,
      pdfType,
      estimatorEmail,
      url: `${API_BASE_URL}/submit-form`
    });

    const response = await fetch(`${API_BASE_URL}/submit-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({
        formData,
        pdfType,
        estimatorEmail
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Server Error Response:', responseData);
      throw new Error(responseData.message || responseData.error || 'Failed to submit form');
    }

    return responseData as FormSubmissionResponse;
  } catch (error) {
    console.error('API Error Details:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'Unknown error'
    });
    throw error;
  }
};


