interface ConsentLog {
  userId: string;
  timestamp: string;
  action: string;
  formType: string;
  ipAddress?: string;
  deviceInfo?: string;
  formData?: any;
  signature?: string;
}

export const logConsent = async (data: ConsentLog) => {
  try {
    const response = await fetch('/api/consent-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        deviceInfo: navigator.userAgent,
        timestamp: new Date().toISOString(),
        ipAddress: await fetch('https://api.ipify.org?format=json')
          .then(res => res.json())
          .then(data => data.ip),
      }),
    });
    return response.json();
  } catch (error) {
    console.error('Error logging consent:', error);
    throw error;
  }
};
