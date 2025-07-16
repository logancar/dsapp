// Virtual lockbox system to simulate WeHere smart lockboxes
export interface LockboxSlot {
  code: string;
  assigned: boolean;
  customerId?: string;
  customerName?: string;
  assignedAt?: string;
  vehicleInfo?: string;
}

export interface VirtualLockbox {
  boxId: string;
  location: string;
  slots: { [key: number]: LockboxSlot };
}

// Initialize virtual lockbox with 5 slots
const virtualLockbox: VirtualLockbox = {
  boxId: "OKC01",
  location: "Dent Source - Oklahoma City",
  slots: {
    1: { code: "LOCK1231", assigned: false },
    2: { code: "LOCK1232", assigned: false },
    3: { code: "LOCK1233", assigned: false },
    4: { code: "LOCK1234", assigned: false },
    5: { code: "LOCK1235", assigned: false }
  }
};

// Get next available parking spot
export const getNextAvailableSpot = (): number | null => {
  for (let spotNumber = 1; spotNumber <= 5; spotNumber++) {
    if (!virtualLockbox.slots[spotNumber].assigned) {
      return spotNumber;
    }
  }
  return null; // No spots available
};

// Assign a parking spot to a customer
export const assignParkingSpot = (
  customerId: string,
  customerName: string,
  vehicleInfo: string,
  spotNumber?: number
): { spotNumber: number; code: string } | null => {
  // Use provided spot or get next available
  const targetSpot = spotNumber || getNextAvailableSpot();
  
  if (!targetSpot || virtualLockbox.slots[targetSpot].assigned) {
    return null; // Spot not available
  }

  // Assign the spot
  virtualLockbox.slots[targetSpot] = {
    ...virtualLockbox.slots[targetSpot],
    assigned: true,
    customerId,
    customerName,
    assignedAt: new Date().toISOString(),
    vehicleInfo
  };

  console.log(`=== PARKING SPOT ASSIGNED ===`);
  console.log(`Box ID: ${virtualLockbox.boxId}`);
  console.log(`Spot: ${targetSpot}`);
  console.log(`Code: ${virtualLockbox.slots[targetSpot].code}`);
  console.log(`Customer: ${customerName} (${customerId})`);
  console.log(`Vehicle: ${vehicleInfo}`);
  console.log(`Assigned At: ${virtualLockbox.slots[targetSpot].assignedAt}`);

  return {
    spotNumber: targetSpot,
    code: virtualLockbox.slots[targetSpot].code
  };
};

// Release a parking spot
export const releaseParkingSpot = (spotNumber: number): boolean => {
  if (!virtualLockbox.slots[spotNumber] || !virtualLockbox.slots[spotNumber].assigned) {
    return false;
  }

  const slot = virtualLockbox.slots[spotNumber];
  console.log(`=== PARKING SPOT RELEASED ===`);
  console.log(`Spot: ${spotNumber}`);
  console.log(`Previous Customer: ${slot.customerName}`);
  console.log(`Released At: ${new Date().toISOString()}`);

  // Reset the slot
  virtualLockbox.slots[spotNumber] = {
    code: slot.code, // Keep the same code
    assigned: false
  };

  return true;
};

// Get lockbox status
export const getLockboxStatus = (): VirtualLockbox => {
  return { ...virtualLockbox };
};

// Get specific slot info
export const getSlotInfo = (spotNumber: number): LockboxSlot | null => {
  return virtualLockbox.slots[spotNumber] || null;
};

// Check if a spot is available
export const isSpotAvailable = (spotNumber: number): boolean => {
  return virtualLockbox.slots[spotNumber] && !virtualLockbox.slots[spotNumber].assigned;
};

// Get all assigned spots
export const getAssignedSpots = (): { [key: number]: LockboxSlot } => {
  const assigned: { [key: number]: LockboxSlot } = {};
  
  for (const [spotNumber, slot] of Object.entries(virtualLockbox.slots)) {
    if (slot.assigned) {
      assigned[parseInt(spotNumber)] = slot;
    }
  }
  
  return assigned;
};

// Get available spots count
export const getAvailableSpotsCount = (): number => {
  return Object.values(virtualLockbox.slots).filter(slot => !slot.assigned).length;
};
