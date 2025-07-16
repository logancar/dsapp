import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCurrentLockboxStatus, releaseLockboxCode, testLockboxFlow } from '../api/lockboxCodeService';
import { VirtualLockbox } from '../api/virtualLockbox';
import styles from './LockboxStatus.module.css';

interface LockboxStatusProps {
  onClose: () => void;
}

function LockboxStatus({ onClose }: LockboxStatusProps) {
  const [lockboxData, setLockboxData] = useState<VirtualLockbox | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLockboxStatus();
  }, []);

  const loadLockboxStatus = () => {
    setLoading(true);
    try {
      const status = getCurrentLockboxStatus();
      setLockboxData(status);
    } catch (error) {
      console.error('Error loading lockbox status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseSpot = async (spotNumber: number) => {
    if (!confirm(`Are you sure you want to release Parking Spot ${spotNumber}?`)) {
      return;
    }

    try {
      const result = await releaseLockboxCode(spotNumber);
      if (result.success) {
        alert(`✅ Parking Spot ${spotNumber} has been released.`);
        loadLockboxStatus(); // Refresh the status
      } else {
        alert(`❌ Failed to release spot: ${result.error}`);
      }
    } catch (error) {
      console.error('Error releasing spot:', error);
      alert('❌ Error releasing parking spot. Please try again.');
    }
  };

  const handleTestLockbox = async () => {
    if (!confirm('This will send a test SMS to +14058874406. Continue?')) {
      return;
    }

    try {
      const result = await testLockboxFlow();
      if (result.success) {
        alert(`✅ Test successful!\nSpot: ${result.spotNumber}\nCode: ${result.code}\nSMS sent!`);
        loadLockboxStatus(); // Refresh to show the test assignment
      } else {
        alert(`❌ Test failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error testing lockbox:', error);
      alert('❌ Test failed. Check console for details.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading lockbox status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!lockboxData) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.error}>
            <p>Failed to load lockbox status</p>
            <button className={styles.closeButton} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const availableSlots = Object.entries(lockboxData.slots).filter(([_, slot]) => !slot.assigned);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <motion.div 
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Lockbox Status</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Location:</span>
              <span className={styles.summaryValue}>{lockboxData.location}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Box ID:</span>
              <span className={styles.summaryValue}>{lockboxData.boxId}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Available Spots:</span>
              <span className={styles.summaryValue}>{availableSlots.length} / {Object.keys(lockboxData.slots).length}</span>
            </div>
          </div>

          <div className={styles.slotsContainer}>
            <h3 className={styles.sectionTitle}>Parking Spots</h3>
            
            <div className={styles.slotsGrid}>
              {Object.entries(lockboxData.slots).map(([spotNumber, slot]) => (
                <div 
                  key={spotNumber}
                  className={`${styles.slotCard} ${slot.assigned ? styles.assigned : styles.available}`}
                >
                  <div className={styles.slotHeader}>
                    <span className={styles.spotNumber}>Spot {spotNumber}</span>
                    <span className={`${styles.status} ${slot.assigned ? styles.statusAssigned : styles.statusAvailable}`}>
                      {slot.assigned ? 'Assigned' : 'Available'}
                    </span>
                  </div>
                  
                  <div className={styles.slotDetails}>
                    <div className={styles.codeInfo}>
                      <span className={styles.label}>Code:</span>
                      <span className={styles.code}>{slot.code}</span>
                    </div>
                    
                    {slot.assigned && (
                      <>
                        <div className={styles.customerInfo}>
                          <span className={styles.label}>Customer:</span>
                          <span className={styles.value}>{slot.customerName}</span>
                        </div>
                        
                        <div className={styles.vehicleInfo}>
                          <span className={styles.label}>Vehicle:</span>
                          <span className={styles.value}>{slot.vehicleInfo}</span>
                        </div>
                        
                        <div className={styles.assignedInfo}>
                          <span className={styles.label}>Assigned:</span>
                          <span className={styles.value}>{formatDate(slot.assignedAt!)}</span>
                        </div>
                        
                        <button
                          className={styles.releaseButton}
                          onClick={() => handleReleaseSpot(parseInt(spotNumber))}
                        >
                          Release Spot
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.refreshButton} onClick={loadLockboxStatus}>
              🔄 Refresh Status
            </button>

            <button className={styles.testButton} onClick={handleTestLockbox}>
              📱 Test SMS
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default LockboxStatus;
