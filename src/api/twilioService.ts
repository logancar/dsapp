// Twilio SMS service for sending lockbox codes
// Note: Twilio client-side operations should be handled via backend API

// Twilio configuration from environment variables
// Note: These are currently unused as Twilio client-side operations are handled via backend API
// const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
// const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = import.meta.env.VITE_TWILIO_PHONE_NUMBER;

// Twilio client is not available in browser - use backend API instead
let twilioClient: any = null;

export interface LockboxSMSData {
  customerPhone: string;
  customerName: string;
  parkingSpot: number;
  code: string;
  vehicleInfo?: string;
}

// Send lockbox code via SMS
export const sendLockboxCode = async (data: LockboxSMSData): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  if (!twilioClient) {
    console.error('Twilio client not initialized');
    return { success: false, error: 'SMS service not available' };
  }

  try {
    // Format the SMS message
    const message = `Dent Source: Your lockbox code for Parking Spot ${data.parkingSpot} is ${data.code}. Please use this to complete your vehicle drop-off.`;

    console.log(`=== SENDING LOCKBOX CODE SMS ===`);
    console.log(`To: ${data.customerPhone}`);
    console.log(`From: ${TWILIO_PHONE_NUMBER}`);
    console.log(`Message: ${message}`);

    // Send the SMS
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: data.customerPhone
    });

    console.log(`=== SMS SENT SUCCESSFULLY ===`);
    console.log(`Message SID: ${twilioMessage.sid}`);
    console.log(`Status: ${twilioMessage.status}`);

    return {
      success: true,
      messageId: twilioMessage.sid
    };

  } catch (error: any) {
    console.error('=== SMS SEND FAILED ===');
    console.error('Error:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to send SMS'
    };
  }
};

// Send rental confirmation SMS (for rental customers)
export const sendRentalConfirmation = async (data: LockboxSMSData & { rentalInfo: string }): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  if (!twilioClient) {
    console.error('Twilio client not initialized');
    return { success: false, error: 'SMS service not available' };
  }

  try {
    // Format the rental confirmation message
    const message = `Dent Source: Your drop-off is approved! Parking Spot ${data.parkingSpot}, Code: ${data.code}. ${data.rentalInfo} Please proceed to the location.`;

    console.log(`=== SENDING RENTAL CONFIRMATION SMS ===`);
    console.log(`To: ${data.customerPhone}`);
    console.log(`Message: ${message}`);

    // Send the SMS
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: data.customerPhone
    });

    console.log(`=== RENTAL CONFIRMATION SMS SENT ===`);
    console.log(`Message SID: ${twilioMessage.sid}`);

    return {
      success: true,
      messageId: twilioMessage.sid
    };

  } catch (error: any) {
    console.error('=== RENTAL CONFIRMATION SMS FAILED ===');
    console.error('Error:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to send rental confirmation SMS'
    };
  }
};

// Test SMS functionality
export const sendTestSMS = async (phoneNumber: string): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  if (!twilioClient) {
    return { success: false, error: 'SMS service not available' };
  }

  try {
    const message = 'Dent Source: This is a test message from your lockbox system.';

    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    console.log(`Test SMS sent successfully. SID: ${twilioMessage.sid}`);

    return {
      success: true,
      messageId: twilioMessage.sid
    };

  } catch (error: any) {
    console.error('Test SMS failed:', error);
    
    return {
      success: false,
      error: error.message || 'Failed to send test SMS'
    };
  }
};

// Validate phone number format
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Basic validation for US phone numbers
  const phoneRegex = /^\+1[0-9]{10}$/;
  return phoneRegex.test(phoneNumber);
};

// Format phone number to E.164 format
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Add +1 if it's a 10-digit US number
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // Add + if it starts with 1 and is 11 digits
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  // Return as-is if already formatted
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  return phoneNumber;
};
