/**
 * BaarliClaw Agent Integration Types
 * @module types/agent
 *
 * TypeScript type definitions for BaarliClaw AI agent integration
 * with Mission Control dashboard.
 */

// ==========================================
// Agent Command Types
// ==========================================

/**
 * Types of commands that can be sent to the BaarliClaw agent
 */
export type CommandType = 'task' | 'query' | 'system' | 'approval';

/**
 * Status values for tracking command lifecycle
 */
export type CommandStatus = 'pending' | 'processing' | 'completed' | 'failed';

/**
 * Priority levels for command execution ordering
 */
export type Priority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Command sent to the BaarliClaw agent for execution
 */
export interface AgentCommand {
  /** Unique identifier for the command */
  id: string;
  /** Type of command being sent */
  command_type: CommandType;
  /** Command payload data */
  command_data: Record<string, unknown>;
  /** Current execution status */
  status: CommandStatus;
  /** Execution priority */
  priority: Priority;
  /** Creation timestamp (ISO 8601) */
  created_at: string;
  /** Last update timestamp (ISO 8601) */
  updated_at?: string;
}

// ==========================================
// Agent Response Types
// ==========================================

/**
 * Types of responses from the BaarliClaw agent
 */
export type ResponseType = 'success' | 'error' | 'partial' | 'progress';

/**
 * Response received from the BaarliClaw agent
 */
export interface AgentResponse {
  /** Unique identifier for the response */
  id: string;
  /** ID of the command this responds to */
  command_id: string;
  /** Type of response */
  response_type: ResponseType;
  /** Response payload data */
  response_data: Record<string, unknown>;
  /** Response timestamp (ISO 8601) */
  created_at: string;
}

// ==========================================
// Approval Request Types
// ==========================================

/**
 * Status values for approval requests
 */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

/**
 * Risk level assessment for approval requests
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * Approval request requiring human authorization
 */
export interface ApprovalRequest {
  /** Unique identifier for the request */
  id: string;
  /** Type of request (e.g., 'deployment', 'file_write') */
  request_type: string;
  /** Human-readable title */
  title: string;
  /** Detailed description */
  description: string;
  /** Risk level assessment */
  risk_level: RiskLevel;
  /** Current approval status */
  status: ApprovalStatus;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** Creation timestamp (ISO 8601) */
  created_at: string;
  /** Resolution timestamp (ISO 8601) */
  resolved_at?: string;
}

// ==========================================
// System Status Types
// ==========================================

/**
 * Health status of a system component
 */
export type SystemHealth = 'healthy' | 'degraded' | 'unhealthy' | 'offline';

/**
 * Status information for a system component
 */
export interface SystemStatus {
  /** Unique identifier */
  id: string;
  /** Name of the system/service */
  system_name: string;
  /** Current health status */
  status: SystemHealth;
  /** Health score (0-100) */
  health_score: number;
  /** Last health check timestamp (ISO 8601) */
  last_check: string;
  /** Numeric metrics keyed by name */
  metrics?: Record<string, number>;
  /** Description of current task (if any) */
  current_task?: string;
  /** Progress percentage (0-100) if a task is running */
  progress_percent?: number;
}

// ==========================================
// Activity Log Types
// ==========================================

/**
 * Log severity levels
 */
export type LogLevel = 'debug' | 'info' | 'success' | 'warning' | 'error';

/**
 * Log category for filtering and organization
 */
export type LogCategory = 'system' | 'agent' | 'user' | 'api' | 'task';

/**
 * Activity log entry for auditing and monitoring
 */
export interface ActivityLog {
  /** Unique identifier */
  id: string;
  /** Severity level */
  level: LogLevel;
  /** Category for organization */
  category: LogCategory;
  /** Log message */
  message: string;
  /** Additional structured details */
  details?: Record<string, unknown>;
  /** Creation timestamp (ISO 8601) */
  created_at: string;
}

// ==========================================
// Agent Configuration Types
// ==========================================

/**
 * Configuration setting for the BaarliClaw agent
 */
export interface AgentConfig {
  /** Unique identifier */
  id: string;
  /** Configuration key name */
  config_key: string;
  /** Configuration value (any type) */
  config_value: unknown;
  /** Last update timestamp (ISO 8601) */
  updated_at: string;
}
