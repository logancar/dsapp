// Lockbox code service that combines virtual lockbox and SMS delivery
import { assignParkingSpot, releaseParkingSpot, getLockboxStatus } from './virtualLockbox';
import { sendLockboxCode, sendRentalConfirmation, formatPhoneNumber, LockboxSMSData } from './twilioService';
import { RemoteSubmission } from './mockSubmissions';

export interface LockboxAssignmentResult {
  success: boolean;
  spotNumber?: number;
  code?: string;
  messageId?: string;
  error?: string;
}

// Main function to assign lockbox code and send SMS
export const assignLockboxCodeAndSendSMS = async (
  submission: RemoteSubmission,
  preferredSpot?: number
): Promise<LockboxAssignmentResult> => {
  try {
    console.log(`=== PROCESSING LOCKBOX ASSIGNMENT ===`);
    console.log(`Submission ID: ${submission.id}`);
    console.log(`Customer: ${submission.customerInfo.name}`);
    console.log(`Type: ${submission.submissionType}`);

    // Format vehicle info
    const vehicleInfo = `${submission.vehicleInfo.year} ${submission.vehicleInfo.make} ${submission.vehicleInfo.model}`;

    // Assign parking spot
    const assignment = assignParkingSpot(
      submission.id,
      submission.customerInfo.name,
      vehicleInfo,
      preferredSpot
    );

    if (!assignment) {
      return {
        success: false,
        error: 'No parking spots available'
      };
    }

    // Format customer phone number
    const customerPhone = formatPhoneNumber(submission.customerInfo.phone);

    // Prepare SMS data
    const smsData: LockboxSMSData = {
      customerPhone,
      customerName: submission.customerInfo.name,
      parkingSpot: assignment.spotNumber,
      code: assignment.code,
      vehicleInfo
    };

    // Send appropriate SMS based on submission type
    let smsResult;
    if (submission.submissionType === 'drop-off-with-rental') {
      // Send rental confirmation with additional info
      smsResult = await sendRentalConfirmation({
        ...smsData,
        rentalInfo: 'Your rental car will be ready upon drop-off completion.'
      });
    } else {
      // Send standard lockbox code
      smsResult = await sendLockboxCode(smsData);
    }

    if (!smsResult.success) {
      // If SMS fails, release the parking spot
      releaseParkingSpot(assignment.spotNumber);
      return {
        success: false,
        error: `Parking spot assigned but SMS failed: ${smsResult.error}`
      };
    }

    console.log(`=== LOCKBOX ASSIGNMENT COMPLETED ===`);
    console.log(`Spot: ${assignment.spotNumber}`);
    console.log(`Code: ${assignment.code}`);
    console.log(`SMS Sent: ${smsResult.messageId}`);

    return {
      success: true,
      spotNumber: assignment.spotNumber,
      code: assignment.code,
      messageId: smsResult.messageId
    };

  } catch (error: any) {
    console.error('=== LOCKBOX ASSIGNMENT FAILED ===');
    console.error('Error:', error);

    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
};

// Release a customer's parking spot
export const releaseLockboxCode = async (spotNumber: number): Promise<{ success: boolean; error?: string }> => {
  try {
    const released = releaseParkingSpot(spotNumber);
    
    if (!released) {
      return {
        success: false,
        error: 'Spot was not assigned or does not exist'
      };
    }

    return { success: true };

  } catch (error: any) {
    console.error('Error releasing lockbox code:', error);
    return {
      success: false,
      error: error.message || 'Failed to release parking spot'
    };
  }
};

// Get current lockbox status for admin/estimator view
export const getCurrentLockboxStatus = () => {
  return getLockboxStatus();
};

// Simulate lockbox code assignment for testing (without SMS)
export const simulateLockboxAssignment = (
  submission: RemoteSubmission,
  preferredSpot?: number
): LockboxAssignmentResult => {
  try {
    const vehicleInfo = `${submission.vehicleInfo.year} ${submission.vehicleInfo.make} ${submission.vehicleInfo.model}`;

    const assignment = assignParkingSpot(
      submission.id,
      submission.customerInfo.name,
      vehicleInfo,
      preferredSpot
    );

    if (!assignment) {
      return {
        success: false,
        error: 'No parking spots available'
      };
    }

    console.log(`=== SIMULATED LOCKBOX ASSIGNMENT ===`);
    console.log(`Spot: ${assignment.spotNumber}`);
    console.log(`Code: ${assignment.code}`);
    console.log(`SMS would be sent to: ${submission.customerInfo.phone}`);

    return {
      success: true,
      spotNumber: assignment.spotNumber,
      code: assignment.code,
      messageId: 'SIMULATED_MESSAGE_ID'
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Simulation failed'
    };
  }
};

// Test the entire flow with a test phone number
export const testLockboxFlow = async (): Promise<LockboxAssignmentResult> => {
  // Create a test submission
  const testSubmission: RemoteSubmission = {
    id: 'TEST_' + Date.now(),
    submissionType: 'drop-off-only',
    status: 'pending',
    submittedAt: new Date().toISOString(),
    customerInfo: {
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '+14058874406', // Test phone number
      address: '123 Test St, Test City, OK 73000'
    },
    vehicleInfo: {
      year: '2023',
      make: 'Test',
      model: 'Vehicle',
      vin: 'TEST123456789'
    },
    formData: {
      insuranceCompany: 'Test Insurance',
      claimNumber: 'TEST123',
      dateOfLoss: '2024-01-15',
      deductible: 500
    },
    photoData: {
      photos: {},
      comment: 'Test submission'
    }
  };

  return await assignLockboxCodeAndSendSMS(testSubmission);
};
