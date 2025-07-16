import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EstimatorSubmissionList from '../components/EstimatorSubmissionList';
import EstimatorSubmissionDetail from '../components/EstimatorSubmissionDetail';
import LockboxStatus from '../components/LockboxStatus';
import { RemoteSubmission } from '../api/mockSubmissions';
import styles from './EstimatorSubmissions.module.css';

function EstimatorSubmissions() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedSubmission, setSelectedSubmission] = useState<RemoteSubmission | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showLockboxStatus, setShowLockboxStatus] = useState(false);

  // Check if user is logged in as estimator
  useEffect(() => {
    // In a real app, you'd check authentication state here
    // For now, we'll assume they're logged in if they reach this route
    // You could add logic to redirect to login if not authenticated
  }, []);

  const handleViewSubmission = (submission: RemoteSubmission) => {
    setSelectedSubmission(submission);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedSubmission(null);
  };

  const handleStatusUpdate = () => {
    // Trigger a refresh of the submissions list
    setRefreshTrigger(prev => prev + 1);
    // Optionally stay on detail view or go back to list
    // For now, we'll stay on detail view to see the updated status
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className={styles.container}>
      {currentView === 'list' && (
        <div className={styles.listView}>
          <div className={styles.topBar}>
            <button
              className={styles.dashboardButton}
              onClick={handleBackToDashboard}
            >
              ← Back to Dashboard
            </button>

            <button
              className={styles.lockboxButton}
              onClick={() => setShowLockboxStatus(true)}
            >
              🔐 Lockbox Status
            </button>
          </div>
          
          <EstimatorSubmissionList 
            onViewSubmission={handleViewSubmission}
            key={refreshTrigger} // Force re-render when status updates
          />
        </div>
      )}

      {currentView === 'detail' && selectedSubmission && (
        <EstimatorSubmissionDetail 
          submission={selectedSubmission}
          onBack={handleBackToList}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {/* Lockbox Status Modal */}
      {showLockboxStatus && (
        <LockboxStatus onClose={() => setShowLockboxStatus(false)} />
      )}
    </div>
  );
}

export default EstimatorSubmissions;
