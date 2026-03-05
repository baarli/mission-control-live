/* ============================================
   COMMAND SENDER COMPONENT
   ============================================ */

import React, { useState } from 'react';

import { useAgentStore } from '@/stores/agentStore';

import { GlassCard } from '../Layout';
import { Button } from '../UI';

import styles from './styles.module.css';

export const CommandSender: React.FC = () => {
  const [command, setCommand] = useState('');
  const [commandType, setCommandType] = useState<'task' | 'query' | 'system'>('task');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const { isConnected, addCommand, addActivityLog } = useAgentStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || !isConnected) return;

    const newCommand = {
      id: crypto.randomUUID(),
      command_type: commandType as 'task' | 'query' | 'system' | 'approval',
      command_data: { message: command },
      status: 'pending' as const,
      priority,
      created_at: new Date().toISOString(),
    };

    addCommand(newCommand);
    addActivityLog({
      id: crypto.randomUUID(),
      level: 'info',
      category: 'agent',
      message: `Command sent: ${commandType} - ${command.substring(0, 50)}...`,
      created_at: new Date().toISOString(),
    });

    setCommand('');
  };

  return (
    <GlassCard className={styles.commandCard}>
      <h3 className={styles.title}>📡 Send Command</h3>

      <form onSubmit={handleSubmit} className={styles.commandForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Command Type</label>
            <select
              value={commandType}
              onChange={e => setCommandType(e.target.value as typeof commandType)}
              className={styles.select}
              disabled={!isConnected}
            >
              <option value="task">Task</option>
              <option value="query">Query</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Priority</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as typeof priority)}
              className={styles.select}
              disabled={!isConnected}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Command</label>
          <textarea
            value={command}
            onChange={e => setCommand(e.target.value)}
            placeholder={isConnected ? 'Enter command...' : 'Connect to send commands'}
            className={styles.textarea}
            rows={3}
            disabled={!isConnected}
          />
        </div>

        <Button
          type="submit"
          disabled={!isConnected || !command.trim()}
          className={styles.submitButton}
        >
          Send Command
        </Button>
      </form>
    </GlassCard>
  );
};
