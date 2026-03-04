/* ============================================
   TASK LIST COMPONENT
   ============================================ */

import React from 'react';
import { GlassCard } from '../Layout';
import { useAgentStore } from '@/stores/agentStore';
import styles from './styles.module.css';

const statusIcons: Record<string, string> = {
  pending: '⏳',
  processing: '⚙️',
  completed: '✅',
  failed: '❌',
};

const priorityColors: Record<string, string | undefined> = {
  low: styles.priorityLow,
  medium: styles.priorityMedium,
  high: styles.priorityHigh,
  critical: styles.priorityCritical,
};

export const TaskList: React.FC = () => {
  const { commands, isLoading } = useAgentStore();

  const sortedCommands = [...commands].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <GlassCard className={styles.taskCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>📋 Tasks</h3>
        <span className={styles.count}>{commands.length}</span>
      </div>

      <div className={styles.taskList}>
        {isLoading ? (
          <div className={styles.loading}>Loading tasks...</div>
        ) : sortedCommands.length === 0 ? (
          <div className={styles.empty}>
            <p>No tasks yet</p>
            <p className={styles.emptyHint}>Send a command to create a task</p>
          </div>
        ) : (
          sortedCommands.slice(0, 10).map((cmd) => (
            <div key={cmd.id} className={styles.taskItem}>
              <div className={styles.taskHeader}>
                <span className={styles.taskIcon}>{statusIcons[cmd.status] || '○'}</span>
                <span className={styles.taskType}>{cmd.command_type}</span>
                <span className={`${styles.priority} ${priorityColors[cmd.priority] || ''}`}>
                  {cmd.priority}
                </span>
              </div>
              <p className={styles.taskData}>
                {String((cmd.command_data as Record<string, unknown>)?.message ?? '') || JSON.stringify(cmd.command_data).substring(0, 100)}
              </p>
              <span className={styles.taskTime}>
                {new Date(cmd.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
};
