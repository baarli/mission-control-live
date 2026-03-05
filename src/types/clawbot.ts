/**
 * BaarliClaw Clawbot Command Contract
 * @module types/clawbot
 *
 * Versioned, discriminated-union command types for controlling the
 * BaarliClaw robotic arm via Mission Control.
 *
 * Version history:
 *   v1 – initial actions: stop, home, move, grip, set_speed, set_mode
 */

// ==========================================
// Safety / Risk Classification
// ==========================================

/**
 * Risk classification for a clawbot command.
 *
 * - `safe`     – routine operation, no approval required.
 * - `elevated` – requires operator awareness.
 * - `critical` – requires explicit confirmation before execution.
 */
export type ClawbotRisk = 'safe' | 'elevated' | 'critical';

// ==========================================
// Discriminated Union – Command Actions
// ==========================================

/** Emergency stop – halt all motion immediately. */
export interface ClawbotStopCommand {
  action: 'stop';
  /** When true the stop is treated as an emergency e-stop. */
  emergency?: boolean;
}

/** Return to home / safe position. */
export interface ClawbotHomeCommand {
  action: 'home';
}

/** Move the arm to an absolute or relative position. */
export interface ClawbotMoveCommand {
  action: 'move';
  /** Target X position in mm (optional for relative moves). */
  x?: number;
  /** Target Y position in mm. */
  y?: number;
  /** Target Z position in mm. */
  z?: number;
  /** Whether coordinates are relative to current position. */
  relative?: boolean;
}

/** Open or close the gripper. */
export interface ClawbotGripCommand {
  action: 'grip';
  /** Gripper position 0 (fully open) – 100 (fully closed). */
  position: number;
  /** Force limit in Newtons (optional). */
  force_limit?: number;
}

/** Adjust movement speed. */
export interface ClawbotSetSpeedCommand {
  action: 'set_speed';
  /** Speed as a percentage of maximum (1–100). */
  speed_percent: number;
}

/** Switch operational mode. */
export interface ClawbotSetModeCommand {
  action: 'set_mode';
  mode: 'manual' | 'auto' | 'safe' | 'maintenance';
}

/** Union of all valid clawbot command payloads. */
export type ClawbotCommandPayload =
  | ClawbotStopCommand
  | ClawbotHomeCommand
  | ClawbotMoveCommand
  | ClawbotGripCommand
  | ClawbotSetSpeedCommand
  | ClawbotSetModeCommand;

// ==========================================
// Full versioned command envelope
// ==========================================

/** Contract version – increment when breaking changes are introduced. */
export const CLAWBOT_CONTRACT_VERSION = 1 as const;

/** A complete, versioned clawbot command ready for the agent service. */
export interface ClawbotCommand {
  /** Contract version for forward-compatibility checks. */
  contract_version: typeof CLAWBOT_CONTRACT_VERSION;
  /** The specific command payload. */
  payload: ClawbotCommandPayload;
  /** Risk classification for this command. */
  risk: ClawbotRisk;
}

// ==========================================
// Validation helpers
// ==========================================

/** Validation result returned by `validateClawbotCommand`. */
export interface ClawbotValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Derive a default risk level from a command payload.
 * Callers may override this for specific situations.
 */
export function getDefaultRisk(payload: ClawbotCommandPayload): ClawbotRisk {
  switch (payload.action) {
    case 'stop':
      return payload.emergency ? 'critical' : 'elevated';
    case 'home':
      return 'safe';
    case 'move':
      return 'elevated';
    case 'grip':
      return 'elevated';
    case 'set_speed':
      return payload.speed_percent > 80 ? 'elevated' : 'safe';
    case 'set_mode':
      return payload.mode === 'maintenance' ? 'elevated' : 'safe';
    default:
      return 'elevated';
  }
}

/**
 * Validate a clawbot command payload and return structured errors.
 * This is intentionally dependency-free (no Zod) to keep the bundle light.
 */
export function validateClawbotCommand(payload: ClawbotCommandPayload): ClawbotValidationResult {
  const errors: string[] = [];

  switch (payload.action) {
    case 'stop':
    case 'home':
      // No additional fields required.
      break;

    case 'move': {
      const hasTarget =
        payload.x !== undefined || payload.y !== undefined || payload.z !== undefined;
      if (!hasTarget) {
        errors.push('move: at least one of x, y, or z must be specified.');
      }
      break;
    }

    case 'grip': {
      if (payload.position < 0 || payload.position > 100) {
        errors.push('grip: position must be between 0 and 100.');
      }
      if (payload.force_limit !== undefined && payload.force_limit <= 0) {
        errors.push('grip: force_limit must be a positive number.');
      }
      break;
    }

    case 'set_speed': {
      if (payload.speed_percent < 1 || payload.speed_percent > 100) {
        errors.push('set_speed: speed_percent must be between 1 and 100.');
      }
      break;
    }

    case 'set_mode': {
      const validModes: ClawbotSetModeCommand['mode'][] = ['manual', 'auto', 'safe', 'maintenance'];
      if (!validModes.includes(payload.mode)) {
        errors.push(`set_mode: mode must be one of ${validModes.join(', ')}.`);
      }
      break;
    }

    default: {
      // Exhaustiveness check – TypeScript will warn if a new action is not handled.
      const _exhaustive: never = payload;
      errors.push(`Unknown action: ${(_exhaustive as ClawbotCommandPayload).action}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Build a complete `ClawbotCommand` envelope from a raw payload.
 */
export function buildClawbotCommand(
  payload: ClawbotCommandPayload,
  risk?: ClawbotRisk
): ClawbotCommand {
  return {
    contract_version: CLAWBOT_CONTRACT_VERSION,
    payload,
    risk: risk ?? getDefaultRisk(payload),
  };
}
