import { useState } from 'react';
import { motion } from 'framer-motion';
import { RemoteSubmission, approveRemoteSubmission, flagSubmissionForReview } from '../api/mockSubmissions';
import styles from './EstimatorSubmissionDetail.module.css';

interface EstimatorSubmissionDetailProps {
  submission: RemoteSubmission;
  onBack: () => void;
  onStatusUpdate: () => void;
}

function EstimatorSubmissionDetail({ submission, onBack, onStatusUpdate }: EstimatorSubmissionDetailProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const result = await approveRemoteSubmission(submission.id);
      if (result.success) {
        // Create detailed success message
        let message = `✅ Submission approved successfully!\n\n`;
        message += `📍 Parking Spot: ${result.spotNumber}\n`;
        message += `🔐 Lockbox Code: ${result.lockboxCode}\n`;
        message += `📱 SMS sent to customer`;

        if (result.messageId) {
          message += ` (Message ID: ${result.messageId})`;
        }

        alert(message);
        onStatusUpdate();
      } else {
        alert(`❌ Failed to approve submission: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error approving submission:', error);
      alert('❌ Error approving submission. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleFlag = async () => {
    setIsFlagging(true);
    try {
      const result = await flagSubmissionForReview(submission.id);
      if (result.success) {
        alert('⚠️ Submission flagged for review.');
        onStatusUpdate();
      } else {
        alert('Failed to flag submission. Please try again.');
      }
    } catch (error) {
      console.error('Error flagging submission:', error);
      alert('Error flagging submission. Please try again.');
    } finally {
      setIsFlagging(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'approved':
        return styles.statusApproved;
      case 'needs-review':
        return styles.statusNeedsReview;
      default:
        return styles.statusDefault;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'approved':
        return 'Approved';
      case 'needs-review':
        return 'Needs Review';
      default:
        return status;
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          ← Back to Submissions
        </button>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Submission Details</h1>
          <div className={styles.submissionMeta}>
            <span className={styles.submissionId}>ID: {submission.id}</span>
            <div className={`${styles.statusBadge} ${getStatusBadgeClass(submission.status)}`}>
              {getStatusText(submission.status)}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Customer Information */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Customer Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{submission.customerInfo.name}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{submission.customerInfo.email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Phone:</span>
              <span className={styles.value}>{submission.customerInfo.phone}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Address:</span>
              <span className={styles.value}>{submission.customerInfo.address}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Submitted:</span>
              <span className={styles.value}>{formatDate(submission.submittedAt)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Type:</span>
              <span className={styles.value}>
                {submission.submissionType === 'drop-off-only' ? 'Drop-Off Only' : 'Drop-Off + Rental'}
              </span>
            </div>
          </div>
        </section>

        {/* Vehicle Information */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Vehicle Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Year:</span>
              <span className={styles.value}>{submission.vehicleInfo.year}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Make:</span>
              <span className={styles.value}>{submission.vehicleInfo.make}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Model:</span>
              <span className={styles.value}>{submission.vehicleInfo.model}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>VIN:</span>
              <span className={styles.value}>{submission.vehicleInfo.vin}</span>
            </div>
            {submission.vehicleInfo.licensePlate && (
              <div className={styles.infoItem}>
                <span className={styles.label}>License Plate:</span>
                <span className={styles.value}>{submission.vehicleInfo.licensePlate}</span>
              </div>
            )}
          </div>
        </section>

        {/* Insurance Information */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Insurance Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Insurance Company:</span>
              <span className={styles.value}>{submission.formData.insuranceCompany}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Claim Number:</span>
              <span className={styles.value}>{submission.formData.claimNumber}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Date of Loss:</span>
              <span className={styles.value}>{submission.formData.dateOfLoss}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Deductible:</span>
              <span className={styles.value}>${submission.formData.deductible}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Vehicle Description:</span>
              <span className={styles.value}>{submission.formData.vehicleDescription}</span>
            </div>
          </div>
        </section>

        {/* Vehicle Photos */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Vehicle Photos</h2>
          <div className={styles.photoGrid}>
            {Object.entries(submission.photoData.photos).map(([angle, photoData]) => (
              <div key={angle} className={styles.photoItem}>
                <img
                  src={photoData}
                  alt={`Vehicle ${angle}`}
                  className={styles.photoThumbnail}
                  onClick={() => setSelectedPhoto(photoData)}
                />
                <span className={styles.photoLabel}>{angle.replace('_', ' ').toUpperCase()}</span>
              </div>
            ))}
          </div>
          {submission.photoData.comment && (
            <div className={styles.photoComment}>
              <span className={styles.label}>Comment:</span>
              <span className={styles.value}>{submission.photoData.comment}</span>
            </div>
          )}
        </section>

        {/* Rental Information (if applicable) */}
        {submission.rentalData && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Rental Information</h2>
            
            <div className={styles.rentalSection}>
              <h3 className={styles.subsectionTitle}>Photo ID</h3>
              <div className={styles.photoIdContainer}>
                <img
                  src={submission.rentalData.photoId}
                  alt="Customer Photo ID"
                  className={styles.photoId}
                  onClick={() => setSelectedPhoto(submission.rentalData!.photoId)}
                />
              </div>
            </div>

            <div className={styles.rentalSection}>
              <h3 className={styles.subsectionTitle}>Agreement Details</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Agreement Accepted:</span>
                  <span className={styles.value}>
                    {submission.rentalData.agreementAccepted ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Digital Signature:</span>
                  <span className={styles.value}>{submission.rentalData.signature}</span>
                </div>
                {submission.rentalData.cardInfo?.cardholderName && (
                  <div className={styles.infoItem}>
                    <span className={styles.label}>Cardholder Name:</span>
                    <span className={styles.value}>{submission.rentalData.cardInfo.cardholderName}</span>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Action Buttons */}
        {submission.status === 'pending' && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Actions</h2>
            <div className={styles.actionButtons}>
              <motion.button
                className={styles.approveButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleApprove}
                disabled={isApproving}
              >
                {isApproving ? 'Approving...' : '✅ Approve Submission'}
              </motion.button>
              
              <motion.button
                className={styles.flagButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleFlag}
                disabled={isFlagging}
              >
                {isFlagging ? 'Flagging...' : '⚠️ Flag for Review'}
              </motion.button>
            </div>
          </section>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className={styles.photoModal} onClick={() => setSelectedPhoto(null)}>
          <div className={styles.photoModalContent}>
            <img src={selectedPhoto} alt="Enlarged view" className={styles.enlargedPhoto} />
            <button className={styles.closeModal} onClick={() => setSelectedPhoto(null)}>
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EstimatorSubmissionDetail;
