// Mock data for remote submissions
export interface RemoteSubmission {
  id: string;
  submissionType: 'drop-off-only' | 'drop-off-with-rental';
  status: 'pending' | 'approved' | 'needs-review';
  submittedAt: string;
  estimatorId?: string;
  
  // Customer info
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  
  // Vehicle info
  vehicleInfo: {
    year: string;
    make: string;
    model: string;
    vin: string;
    licensePlate?: string;
  };
  
  // Form data
  formData: {
    insuranceCompany: string;
    claimNumber: string;
    dateOfLoss: string;
    deductible: number;
    // ... other form fields
    [key: string]: any;
  };
  
  // Photo data
  photoData: {
    photos: { [key: string]: string }; // base64 or URLs
    comment?: string;
  };
  
  // Rental data (if applicable)
  rentalData?: {
    photoId: string; // base64 or URL
    cardInfo?: {
      cardholderName?: string;
      // Note: sensitive data would be encrypted/tokenized in real implementation
    };
    agreementAccepted: boolean;
    signature: string;
  };
}

// Mock submissions data
const mockSubmissions: RemoteSubmission[] = [
  {
    id: 'SUB001',
    submissionType: 'drop-off-only',
    status: 'pending',
    submittedAt: '2024-01-15T10:30:00Z',
    estimatorId: 'EST001',
    customerInfo: {
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      address: '123 Main St, Anytown, ST 12345'
    },
    vehicleInfo: {
      year: '2020',
      make: 'Toyota',
      model: 'Camry',
      vin: '1HGBH41JXMN109186',
      licensePlate: 'ABC123'
    },
    formData: {
      insuranceCompany: 'State Farm',
      claimNumber: 'SF123456789',
      dateOfLoss: '2024-01-10',
      deductible: 500,
      vehicleDescription: '2020 Toyota Camry, Silver'
    },
    photoData: {
      photos: {
        front: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        rear: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
      },
      comment: 'Minor damage to front bumper'
    }
  },
  {
    id: 'SUB002',
    submissionType: 'drop-off-with-rental',
    status: 'approved',
    submittedAt: '2024-01-14T14:15:00Z',
    estimatorId: 'EST002',
    customerInfo: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 987-6543',
      address: '456 Oak Ave, Another City, ST 67890'
    },
    vehicleInfo: {
      year: '2019',
      make: 'Honda',
      model: 'Civic',
      vin: '2HGFC2F59KH123456',
      licensePlate: 'XYZ789'
    },
    formData: {
      insuranceCompany: 'Allstate',
      claimNumber: 'AL987654321',
      dateOfLoss: '2024-01-12',
      deductible: 1000,
      vehicleDescription: '2019 Honda Civic, Blue'
    },
    photoData: {
      photos: {
        front: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        rear: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
      },
      comment: 'Rear-end collision damage'
    },
    rentalData: {
      photoId: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
      cardInfo: {
        cardholderName: 'Sarah Johnson'
      },
      agreementAccepted: true,
      signature: 'Sarah Johnson'
    }
  },
  {
    id: 'SUB003',
    submissionType: 'drop-off-only',
    status: 'needs-review',
    submittedAt: '2024-01-13T09:45:00Z',
    estimatorId: 'EST001',
    customerInfo: {
      name: 'Mike Davis',
      email: 'mike.davis@email.com',
      phone: '(555) 456-7890',
      address: '789 Pine St, Third Town, ST 11111'
    },
    vehicleInfo: {
      year: '2021',
      make: 'Ford',
      model: 'F-150',
      vin: '1FTFW1ET5MKE12345',
      licensePlate: 'DEF456'
    },
    formData: {
      insuranceCompany: 'Progressive',
      claimNumber: 'PG456789123',
      dateOfLoss: '2024-01-11',
      deductible: 250,
      vehicleDescription: '2021 Ford F-150, White'
    },
    photoData: {
      photos: {
        front: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
        rear: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
      },
      comment: 'Side panel damage needs assessment'
    }
  }
];

// Mock API functions
export const getRemoteSubmissions = async (estimatorId?: string): Promise<RemoteSubmission[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Filter by estimator if provided
  if (estimatorId) {
    return mockSubmissions.filter(sub => sub.estimatorId === estimatorId);
  }
  
  return mockSubmissions;
};

export const getSubmissionById = async (id: string): Promise<RemoteSubmission | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return mockSubmissions.find(sub => sub.id === id) || null;
};

export const approveRemoteSubmission = async (id: string): Promise<{ success: boolean; lockboxCode?: string; spotNumber?: number; messageId?: string; error?: string }> => {
  // Import the lockbox service dynamically to avoid circular dependencies
  const { assignLockboxCodeAndSendSMS } = await import('./lockboxCodeService');

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Find the submission
  const submission = mockSubmissions.find(sub => sub.id === id);
  if (!submission) {
    return { success: false, error: 'Submission not found' };
  }

  // Update status to approved
  submission.status = 'approved';

  try {
    // Assign lockbox code and send SMS
    const result = await assignLockboxCodeAndSendSMS(submission);

    if (result.success) {
      return {
        success: true,
        lockboxCode: result.code,
        spotNumber: result.spotNumber,
        messageId: result.messageId
      };
    } else {
      // Revert status if lockbox assignment failed
      submission.status = 'pending';
      return {
        success: false,
        error: result.error || 'Failed to assign lockbox code'
      };
    }
  } catch (error: any) {
    // Revert status if there was an error
    submission.status = 'pending';
    console.error('Error in approveRemoteSubmission:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }
};

export const flagSubmissionForReview = async (id: string): Promise<{ success: boolean }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Find the submission
  const submission = mockSubmissions.find(sub => sub.id === id);
  if (!submission) {
    return { success: false };
  }
  
  // Update status
  submission.status = 'needs-review';
  
  console.log(`=== SUBMISSION FLAGGED ===`);
  console.log(`Submission ID: ${id}`);
  console.log(`Customer: ${submission.customerInfo.name}`);
  console.log(`Status: Needs Review`);
  
  return { success: true };
};
