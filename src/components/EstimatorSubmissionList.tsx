import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RemoteSubmission, getRemoteSubmissions } from '../api/mockSubmissions';
import styles from './EstimatorSubmissionList.module.css';

interface EstimatorSubmissionListProps {
  onViewSubmission: (submission: RemoteSubmission) => void;
  estimatorId?: string;
}

function EstimatorSubmissionList({ onViewSubmission, estimatorId }: EstimatorSubmissionListProps) {
  const [submissions, setSubmissions] = useState<RemoteSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<RemoteSubmission[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Load submissions on component mount
  useEffect(() => {
    loadSubmissions();
  }, [estimatorId]);

  // Filter submissions when status filter changes
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredSubmissions(submissions);
    } else {
      setFilteredSubmissions(submissions.filter(sub => sub.status === statusFilter));
    }
  }, [submissions, statusFilter]);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await getRemoteSubmissions(estimatorId);
      setSubmissions(data);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
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
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'needs-review':
        return 'Needs Review';
      default:
        return status;
    }
  };

  const formatSubmissionType = (type: string) => {
    return type === 'drop-off-only' ? 'Drop-Off Only' : 'Drop-Off + Rental';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Remote Drop-Off Submissions</h1>
        <p className={styles.subtitle}>Review and manage customer submissions</p>
      </div>

      <div className={styles.filters}>
        <label htmlFor="statusFilter" className={styles.filterLabel}>Filter by status:</label>
        <select
          id="statusFilter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Submissions</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="needs-review">Needs Review</option>
        </select>
      </div>

      <div className={styles.submissionsList}>
        {filteredSubmissions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No submissions found for the selected filter.</p>
          </div>
        ) : (
          filteredSubmissions.map((submission) => (
            <motion.div
              key={submission.id}
              className={styles.submissionCard}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.customerInfo}>
                  <h3 className={styles.customerName}>{submission.customerInfo.name}</h3>
                  <p className={styles.submissionId}>ID: {submission.id}</p>
                </div>
                <div className={`${styles.statusBadge} ${getStatusBadgeClass(submission.status)}`}>
                  {getStatusText(submission.status)}
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.submissionDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Type:</span>
                    <span className={styles.detailValue}>{formatSubmissionType(submission.submissionType)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Vehicle:</span>
                    <span className={styles.detailValue}>
                      {submission.vehicleInfo.year} {submission.vehicleInfo.make} {submission.vehicleInfo.model}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Submitted:</span>
                    <span className={styles.detailValue}>{formatDate(submission.submittedAt)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Insurance:</span>
                    <span className={styles.detailValue}>{submission.formData.insuranceCompany}</span>
                  </div>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <motion.button
                  className={styles.viewButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onViewSubmission(submission)}
                >
                  View Submission
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className={styles.summary}>
        <p>Showing {filteredSubmissions.length} of {submissions.length} submissions</p>
      </div>
    </div>
  );
}

export default EstimatorSubmissionList;
