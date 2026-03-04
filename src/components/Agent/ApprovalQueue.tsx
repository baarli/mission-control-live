/* ============================================
   APPROVAL QUEUE COMPONENT
   ============================================ */

import React from 'react';
import { GlassCard } from '../Layout';
import { Button } from '../UI';
import { useAgentStore } from '@/stores/agentStore';
import styles from './styles.module.css';

const riskLevelStyles: Record<string, string> = {
  low: styles.riskLow,
  medium: styles.riskMedium,
  high: styles.riskHigh,
};

const riskIcons: Record<string, string> = {
  low: '🟢',
  medium: '🟡',
  high: '🔴',
};

export const ApprovalQueue: React.FC = () => {
  const { approvalRequests, updateApproval, addActivityLog, isLoading } = useAgentStore();

  const pendingRequests = approvalRequests.filter(r => r.status === 'pending');

  const handleApprove = (id: string, title: string) => {
    updateApproval(id, 'approved');
    addActivityLog({
      id: crypto.randomUUID(),
      level: 'success',
      category: 'user',
      message: `Approved: ${title}`,
      created_at: new Date().toISOString(),
    });
  };

  const handleReject = (id: string, title: string) => {
    updateApproval(id, 'rejected');
    addActivityLog({
      id: crypto.randomUUID(),
      level: 'warning',
      category: 'user',
      message: `Rejected: ${title}`,
      created_at: new Date().toISOString(),
    });
  };

  return (
    <GlassCard className={styles.approvalCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>⏸️ Approvals</h3>
        {pendingRequests.length > 0 && (
          <span className={`${styles.badge} ${styles.badgeWarning}`}>
            {pendingRequests.length} pending
          </span>
        )}
      </div>

      <div className={styles.approvalList}>
        {isLoading ? (
          <div className={styles.loading}>Loading approvals...</div>
        ) : pendingRequests.length === 0 ? (
          <div className={styles.empty}>
            <p>No pending approvals</p>
            <p className={styles.emptyHint}>Approval requests will appear here</p>
          </div>
        ) : (
          pendingRequests.map((request) => (
            <div key={request.id} className={styles.approvalItem}>
              <div className={styles.approvalHeader}>
                <span className={styles.approvalType}>{request.request_type}</span>
                <span className={`${styles.riskLevel} ${riskLevelStyles[request.risk_level] || ''}`}>
                  {riskIcons[request.risk_level]} {request.risk_level}
                </span>
              </div>
              <h4 className={styles.approvalTitle}>{request.title}</h4>
              <p className={styles.approvalDesc}>{request.description}</p>
              <div className={styles.approvalActions}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApprove(request.id, request.title)}
                  className={styles.approveBtn}
                >
                  ✓ Approve
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleReject(request.id, request.title)}
                  className={styles.rejectBtn}
                >
                  ✗ Reject
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
};
