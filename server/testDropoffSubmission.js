const fetch = require('node-fetch');

// Test data for drop-off form submission
const testFormData = {
  // New fields
  howDidhear: "Google search",
  referralAddress: "",
  referralPhone: "",
  referralEmail: "",
  dropDate: new Date().toISOString().split('T')[0],
  location: "Main Location",
  estimator: "Test Estimator",

  // Referral Sources
  referralSources: {
    google: true,
    waze: false,
    mailer: false,
    tvCommercial: false,
    tvChannel: null,
    radioCommercial: false,
    doorHanger: false,
    textMessage: false,
    referral: false,
    referralName: null,
    referralAddress: null,
    referralPhone: null,
    internet: false,
    facebook: false,
    instagram: false,
    youtube: false,
    hulu: false,
    fireStick: false,
    prime: false,
    pandora: false,
    billboard: false,
    billboardLocation: null,
    outsideSales: false,
    salesPersonName: null,
    yelp: false,
    insurance: false,
    repeat: false,
    other: false
  },

  // Authorization
  insuranceCompany: "State Farm",
  signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  date: new Date().toISOString().split('T')[0],
  vehicleDescription: "2020 Honda Civic",
  vin: "1HGBH41JXMN109186",
  claimNumber: "CLM123456",
  dateOfLoss: "2024-01-15",

  // Personal Information
  name: "John Test",
  phone: "555-123-4567",
  altPhone: "",
  address: "123 Test Street",
  city: "Test City",
  state: "OK",
  zip: "73301",
  email: "test@example.com",

  // Vehicle Information (auto-filled from authorization)
  year: "2020",
  make: "Honda",
  model: "Civic",

  // Insurance Information
  insuredName: "John Test",
  insuredPhone: "555-123-4567",
  provider: "State Farm",
  deductible: 500,
  hasEstimate: false,
  hasEstimateCopy: null,
  hasReceivedCheck: false,
  hasCheckedCashed: null,
  adjusterName: "",
  adjusterPhone: "",

  // Reference Information (optional)
  referenceAddress: null,
  referencePhone: null,
  referenceEmail: null,

  // Repair Authorization
  repairPermission: true,
  additionalRepairs: true,
  payment: true,
  totalLoss: true,
  failureToPay: true,
  reviews: true
};

async function testDropoffSubmission() {
  console.log('Testing drop-off form submission...');
  
  try {
    const response = await fetch('http://localhost:8081/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        formData: testFormData,
        pdfType: 'dropoff',
        estimatorEmail: 'test@example.com'
      })
    });

    console.log('Response status:', response.status);
    const responseData = await response.json();
    console.log('Response data:', responseData);

    if (response.ok) {
      console.log('✅ Form submission successful!');
    } else {
      console.log('❌ Form submission failed:', responseData.message);
    }
  } catch (error) {
    console.error('❌ Error during form submission:', error.message);
  }
}

testDropoffSubmission();
