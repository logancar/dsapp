export const API_BASE_URL = 'https://dskiosk.up.railway.app';

export const submitForm = async (formData: any, pdfType: string, estimatorEmail: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/submit-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': 'https://dentsourcekiosk.netlify.app'
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify({
        formData,
        pdfType,
        estimatorEmail
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit form');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};



