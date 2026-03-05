/* ============================================
   COMMAND SENDER COMPONENT
   ============================================ */

import React, { useState } from 'react';

import { useAgentStore } from '@/stores/agentStore';
import {
  validateClawbotCommand,
  buildClawbotCommand,
  type ClawbotCommandPayload,
  type ClawbotMoveCommand,
  type ClawbotGripCommand,
  type ClawbotSetSpeedCommand,
  type ClawbotSetModeCommand,
} from '@/types/clawbot';

import { GlassCard } from '../Layout';
import { Button } from '../UI';

import styles from './styles.module.css';

// ---- action types offered in the structured UI ----
type ClawAction = 'stop' | 'home' | 'move' | 'grip' | 'set_speed' | 'set_mode' | 'advanced';

const ACTION_LABELS: Record<ClawAction, string> = {
  stop: '⏹ Stop',
  home: '🏠 Home',
  move: '�� Move',
  grip: '🤏 Grip',
  set_speed: '⚡ Set Speed',
  set_mode: '🔧 Set Mode',
  advanced: '{ } Advanced JSON',
};

interface FormState {
  action: ClawAction;
  // move
  moveX: string;
  moveY: string;
  moveZ: string;
  moveRelative: boolean;
  // grip
  gripPosition: string;
  gripForce: string;
  // set_speed
  speedPercent: string;
  // set_mode
  mode: ClawbotSetModeCommand['mode'];
  // advanced / legacy
  legacyCommand: string;
  commandType: 'task' | 'query' | 'system';
  priority: 'low' | 'medium' | 'high';
}

const initialForm: FormState = {
  action: 'stop',
  moveX: '',
  moveY: '',
  moveZ: '',
  moveRelative: false,
  gripPosition: '50',
  gripForce: '',
  speedPercent: '50',
  mode: 'manual',
  legacyCommand: '',
  commandType: 'task',
  priority: 'medium',
};

function buildPayload(form: FormState): ClawbotCommandPayload | null {
  switch (form.action) {
    case 'stop':
      return { action: 'stop' };
    case 'home':
      return { action: 'home' };
    case 'move': {
      const x = form.moveX !== '' ? parseFloat(form.moveX) : undefined;
      const y = form.moveY !== '' ? parseFloat(form.moveY) : undefined;
      const z = form.moveZ !== '' ? parseFloat(form.moveZ) : undefined;
      const cmd: ClawbotMoveCommand = { action: 'move' };
      if (x !== undefined) cmd.x = x;
      if (y !== undefined) cmd.y = y;
      if (z !== undefined) cmd.z = z;
      cmd.relative = form.moveRelative;
      return cmd;
    }
    case 'grip': {
      const pos = parseFloat(form.gripPosition);
      const cmd: ClawbotGripCommand = { action: 'grip', position: pos };
      if (form.gripForce !== '') {
        cmd.force_limit = parseFloat(form.gripForce);
      }
      return cmd;
    }
    case 'set_speed': {
      const sp = parseFloat(form.speedPercent);
      const cmd: ClawbotSetSpeedCommand = { action: 'set_speed', speed_percent: sp };
      return cmd;
    }
    case 'set_mode':
      return { action: 'set_mode', mode: form.mode };
    default:
      return null;
  }
}

export const CommandSender: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialForm);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { isConnected, addCommand, addActivityLog } = useAgentStore();

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setValidationErrors([]);
  };

  // ---- E-STOP ----
  const handleEStop = () => {
    const payload: ClawbotCommandPayload = { action: 'stop', emergency: true };
    const envelope = buildClawbotCommand(payload, 'critical');
    const id = crypto.randomUUID();
    addCommand({
      id,
      command_type: 'system',
      command_data: envelope as unknown as Record<string, unknown>,
      status: 'pending',
      priority: 'critical',
      created_at: new Date().toISOString(),
    });
    addActivityLog({
      id: crypto.randomUUID(),
      level: 'warning',
      category: 'agent',
      message: '🛑 E-STOP sent',
      created_at: new Date().toISOString(),
    });
  };

  // ---- Structured submit ----
  const handleStructuredSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return;

    const payload = buildPayload(form);
    if (!payload) return;

    const result = validateClawbotCommand(payload);
    if (!result.valid) {
      setValidationErrors(result.errors);
      return;
    }

    const envelope = buildClawbotCommand(payload);
    const id = crypto.randomUUID();
    addCommand({
      id,
      command_type: 'task',
      command_data: envelope as unknown as Record<string, unknown>,
      status: 'pending',
      priority: envelope.risk === 'critical' ? 'critical' : form.priority,
      created_at: new Date().toISOString(),
    });
    addActivityLog({
      id: crypto.randomUUID(),
      level: 'info',
      category: 'agent',
      message: `Command sent: clawbot/${payload.action}`,
      created_at: new Date().toISOString(),
    });
    setValidationErrors([]);
  };

  // ---- Advanced (legacy) submit ----
  const handleAdvancedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.legacyCommand.trim() || !isConnected) return;

    let parsedData: Record<string, unknown> = { message: form.legacyCommand };
    try {
      parsedData = JSON.parse(form.legacyCommand) as Record<string, unknown>;
      setValidationErrors([]);
    } catch {
      setValidationErrors(['Advanced JSON: invalid JSON payload.']);
      return;
    }

    const id = crypto.randomUUID();
    addCommand({
      id,
      command_type: form.commandType as 'task' | 'query' | 'system' | 'approval',
      command_data: parsedData,
      status: 'pending',
      priority: form.priority,
      created_at: new Date().toISOString(),
    });
    addActivityLog({
      id: crypto.randomUUID(),
      level: 'info',
      category: 'agent',
      message: `Command sent: ${form.commandType} - ${form.legacyCommand.substring(0, 50)}`,
      created_at: new Date().toISOString(),
    });
    setForm(prev => ({ ...prev, legacyCommand: '' }));
  };

  const isAdvanced = form.action === 'advanced';

  return (
    <GlassCard className={styles.commandCard}>
      <div className={styles.statusHeader}>
        <h3 className={styles.title}>🦾 Clawbot Control</h3>
        {/* E-STOP – always visible when connected */}
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={!isConnected}
          onClick={handleEStop}
          aria-label="Emergency stop – halts all clawbot motion immediately"
        >
          🛑 E-STOP
        </Button>
      </div>

      {/* Action selector */}
      <div className={styles.formGroup} style={{ marginBottom: '0.75rem' }}>
        <label className={styles.label}>Action</label>
        <select
          value={form.action}
          onChange={e => setField('action', e.target.value as ClawAction)}
          className={styles.select}
          disabled={!isConnected}
          aria-label="Select clawbot action"
        >
          {(Object.keys(ACTION_LABELS) as ClawAction[]).map(a => (
            <option key={a} value={a}>
              {ACTION_LABELS[a]}
            </option>
          ))}
        </select>
      </div>

      {/* Structured form */}
      {!isAdvanced && (
        <form onSubmit={handleStructuredSubmit} className={styles.commandForm}>
          {/* move fields */}
          {form.action === 'move' && (
            <>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>X (mm)</label>
                  <input
                    type="number"
                    value={form.moveX}
                    onChange={e => setField('moveX', e.target.value)}
                    className={styles.select}
                    placeholder="optional"
                    disabled={!isConnected}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Y (mm)</label>
                  <input
                    type="number"
                    value={form.moveY}
                    onChange={e => setField('moveY', e.target.value)}
                    className={styles.select}
                    placeholder="optional"
                    disabled={!isConnected}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Z (mm)</label>
                  <input
                    type="number"
                    value={form.moveZ}
                    onChange={e => setField('moveZ', e.target.value)}
                    className={styles.select}
                    placeholder="optional"
                    disabled={!isConnected}
                  />
                </div>
              </div>
              <label
                className={styles.label}
                style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
              >
                <input
                  type="checkbox"
                  checked={form.moveRelative}
                  onChange={e => setField('moveRelative', e.target.checked)}
                  disabled={!isConnected}
                />
                Relative move
              </label>
            </>
          )}

          {/* grip fields */}
          {form.action === 'grip' && (
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Position (0–100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.gripPosition}
                  onChange={e => setField('gripPosition', e.target.value)}
                  className={styles.select}
                  disabled={!isConnected}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Force limit (N, optional)</label>
                <input
                  type="number"
                  min={0}
                  value={form.gripForce}
                  onChange={e => setField('gripForce', e.target.value)}
                  className={styles.select}
                  placeholder="optional"
                  disabled={!isConnected}
                />
              </div>
            </div>
          )}

          {/* set_speed fields */}
          {form.action === 'set_speed' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Speed (1–100%)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.speedPercent}
                onChange={e => setField('speedPercent', e.target.value)}
                className={styles.select}
                disabled={!isConnected}
              />
            </div>
          )}

          {/* set_mode fields */}
          {form.action === 'set_mode' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Mode</label>
              <select
                value={form.mode}
                onChange={e => setField('mode', e.target.value as ClawbotSetModeCommand['mode'])}
                className={styles.select}
                disabled={!isConnected}
              >
                <option value="manual">Manual</option>
                <option value="auto">Auto</option>
                <option value="safe">Safe</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          )}

          {/* Priority (shown for non-instant actions) */}
          {!['stop', 'home'].includes(form.action) && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Priority</label>
              <select
                value={form.priority}
                onChange={e => setField('priority', e.target.value as FormState['priority'])}
                className={styles.select}
                disabled={!isConnected}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          )}

          {validationErrors.length > 0 && (
            <ul className={styles.validationErrors} role="alert" aria-live="polite">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}

          <Button type="submit" disabled={!isConnected} className={styles.submitButton}>
            Send {ACTION_LABELS[form.action]}
          </Button>
        </form>
      )}

      {/* Advanced JSON mode */}
      {isAdvanced && (
        <form onSubmit={handleAdvancedSubmit} className={styles.commandForm}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Command Type</label>
              <select
                value={form.commandType}
                onChange={e => setField('commandType', e.target.value as FormState['commandType'])}
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
                value={form.priority}
                onChange={e => setField('priority', e.target.value as FormState['priority'])}
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
            <label className={styles.label}>JSON Payload</label>
            <textarea
              value={form.legacyCommand}
              onChange={e => setField('legacyCommand', e.target.value)}
              placeholder={isConnected ? '{"action": "..."}' : 'Connect to send commands'}
              className={styles.textarea}
              rows={3}
              disabled={!isConnected}
            />
          </div>

          {validationErrors.length > 0 && (
            <ul className={styles.validationErrors} role="alert" aria-live="polite">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}

          <Button
            type="submit"
            disabled={!isConnected || !form.legacyCommand.trim()}
            className={styles.submitButton}
          >
            Send Command
          </Button>
        </form>
      )}
    </GlassCard>
  );
};
