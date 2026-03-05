import { describe, it, expect } from 'vitest';

import {
  validateClawbotCommand,
  buildClawbotCommand,
  getDefaultRisk,
  CLAWBOT_CONTRACT_VERSION,
  type ClawbotCommandPayload,
} from '@/types/clawbot';

describe('clawbot command contract', () => {
  describe('validateClawbotCommand', () => {
    it('validates stop command', () => {
      expect(validateClawbotCommand({ action: 'stop' })).toEqual({ valid: true, errors: [] });
    });

    it('validates home command', () => {
      expect(validateClawbotCommand({ action: 'home' })).toEqual({ valid: true, errors: [] });
    });

    it('validates move command with at least one axis', () => {
      expect(validateClawbotCommand({ action: 'move', x: 100 })).toEqual({
        valid: true,
        errors: [],
      });
    });

    it('rejects move command with no axes', () => {
      const result = validateClawbotCommand({ action: 'move' });
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it('validates grip command with valid position', () => {
      expect(validateClawbotCommand({ action: 'grip', position: 50 })).toEqual({
        valid: true,
        errors: [],
      });
    });

    it('rejects grip command with position out of range', () => {
      const low = validateClawbotCommand({ action: 'grip', position: -1 });
      expect(low.valid).toBe(false);

      const high = validateClawbotCommand({ action: 'grip', position: 101 });
      expect(high.valid).toBe(false);
    });

    it('rejects grip command with non-positive force_limit', () => {
      const result = validateClawbotCommand({ action: 'grip', position: 50, force_limit: 0 });
      expect(result.valid).toBe(false);
    });

    it('validates set_speed with valid range', () => {
      expect(validateClawbotCommand({ action: 'set_speed', speed_percent: 75 })).toEqual({
        valid: true,
        errors: [],
      });
    });

    it('rejects set_speed outside 1-100', () => {
      expect(validateClawbotCommand({ action: 'set_speed', speed_percent: 0 }).valid).toBe(false);
      expect(validateClawbotCommand({ action: 'set_speed', speed_percent: 101 }).valid).toBe(false);
    });

    it('validates set_mode with valid mode', () => {
      const modes: ClawbotCommandPayload[] = [
        { action: 'set_mode', mode: 'manual' },
        { action: 'set_mode', mode: 'auto' },
        { action: 'set_mode', mode: 'safe' },
        { action: 'set_mode', mode: 'maintenance' },
      ];
      for (const cmd of modes) {
        expect(validateClawbotCommand(cmd).valid).toBe(true);
      }
    });
  });

  describe('getDefaultRisk', () => {
    it('emergency stop is critical', () => {
      expect(getDefaultRisk({ action: 'stop', emergency: true })).toBe('critical');
    });

    it('non-emergency stop is elevated', () => {
      expect(getDefaultRisk({ action: 'stop' })).toBe('elevated');
    });

    it('home is safe', () => {
      expect(getDefaultRisk({ action: 'home' })).toBe('safe');
    });

    it('high speed is elevated', () => {
      expect(getDefaultRisk({ action: 'set_speed', speed_percent: 90 })).toBe('elevated');
    });

    it('low speed is safe', () => {
      expect(getDefaultRisk({ action: 'set_speed', speed_percent: 50 })).toBe('safe');
    });
  });

  describe('buildClawbotCommand', () => {
    it('produces correct contract version', () => {
      const envelope = buildClawbotCommand({ action: 'home' });
      expect(envelope.contract_version).toBe(CLAWBOT_CONTRACT_VERSION);
    });

    it('uses provided risk override', () => {
      const envelope = buildClawbotCommand({ action: 'home' }, 'critical');
      expect(envelope.risk).toBe('critical');
    });

    it('derives default risk when none provided', () => {
      const envelope = buildClawbotCommand({ action: 'home' });
      expect(envelope.risk).toBe('safe');
    });
  });
});
