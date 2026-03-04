/* ============================================
   AGENT SECTION COMPONENT
   ============================================ */

import React from 'react';
import { AgentStatusCard, CommandSender, TaskList, ApprovalQueue, ActivityLog } from '../Agent';
import styles from './Dashboard.module.css';

export const AgentSection: React.FC = () => {
  return (
    <section className={styles.agentSection} aria-label="Agent Control Panel">
      <div className={styles.agentGrid}>
        <div className={styles.agentRow}>
          <AgentStatusCard />
          <CommandSender />
        </div>

        <div className={styles.agentRow}>
          <TaskList />
          <ApprovalQueue />
        </div>

        <ActivityLog />
      </div>
    </section>
  );
};
