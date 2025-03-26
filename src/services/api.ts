export const API_BASE_URL = 'https://dskiosk.up.railway.app';

export const submitForm = async (formData: any, pdfType: string, estimatorEmail: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/submit-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify({
        formData,
        pdfType,
        estimatorEmail
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network response was not ok' }));
      throw new Error(errorData.message || 'Failed to submit form');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};




