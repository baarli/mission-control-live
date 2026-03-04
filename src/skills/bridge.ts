/* ============================================
   SKILL BRIDGE
   Unified interface to call skill CLIs
   ============================================ */

import { emitToast } from '../hooks/useToast';

// Skill CLI paths (relative to CODEX_HOME)
const SKILL_PATHS = {
  doc: 'skills/doc/scripts/render_docx.py',
  pdf: null, // PDF uses reportlab directly, no CLI
  transcribe: 'skills/transcribe/scripts/transcribe_diarize.py',
  imagegen: 'skills/imagegen/scripts/image_gen.py',
  speech: 'skills/speech/scripts/text_to_speech.py'
};

// Skill types
export type SkillType = keyof typeof SKILL_PATHS;

// Progress callback type
export type ProgressCallback = (progress: number, message: string) => void;

// Skill result interface
export interface SkillResult<T = unknown> {
  success: boolean;
  data?: T;
  outputPath?: string;
  error?: string;
  logs: string[];
}

// Skill job interface
interface SkillJob {
  id: string;
  skill: SkillType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message: string;
  result?: SkillResult;
  startTime: number;
  endTime?: number;
}

// Bridge configuration
interface BridgeConfig {
  codexHome: string;
  outputDir: string;
  timeoutMs: number;
}

// Default configuration
const DEFAULT_CONFIG: BridgeConfig = {
  codexHome: import.meta.env.VITE_CODEX_HOME || `${window.location.protocol}//${window.location.host}/.codex`,
  outputDir: 'output',
  timeoutMs: 300000 // 5 minutes
};

class SkillBridge {
  private config: BridgeConfig;
  private jobs: Map<string, SkillJob> = new Map();
  private progressListeners: Map<string, ProgressCallback[]> = new Map();

  constructor(config: Partial<BridgeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get the full path to a skill CLI script
   */
  private getSkillPath(skill: SkillType): string | null {
    const relativePath = SKILL_PATHS[skill];
    if (!relativePath) return null;
    return `${this.config.codexHome}/${relativePath}`;
  }

  /**
   * Generate a unique job ID
   */
  private generateJobId(): string {
    return `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a new job
   */
  private createJob(skill: SkillType): SkillJob {
    const job: SkillJob = {
      id: this.generateJobId(),
      skill,
      status: 'pending',
      progress: 0,
      message: 'Initializing...',
      startTime: Date.now(),
    };
    
    this.jobs.set(job.id, job);
    this.progressListeners.set(job.id, []);
    
    return job;
  }

  /**
   * Update job progress
   */
  private updateJob(jobId: string, updates: Partial<SkillJob>): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    Object.assign(job, updates);

    // Notify listeners
    const listeners = this.progressListeners.get(jobId) || [];
    listeners.forEach((callback) => callback(job.progress, job.message));
  }

  /**
   * Subscribe to job progress
   */
  subscribeToProgress(jobId: string, callback: ProgressCallback): () => void {
    const listeners = this.progressListeners.get(jobId) || [];
    listeners.push(callback);
    this.progressListeners.set(jobId, listeners);

    // Return unsubscribe function
    return () => {
      const currentListeners = this.progressListeners.get(jobId) || [];
      const index = currentListeners.indexOf(callback);
      if (index > -1) {
        currentListeners.splice(index, 1);
      }
    };
  }

  /**
   * Execute a skill command (simulated - in real implementation would call backend)
   */
  async execute<T>(
    skill: SkillType,
    args: Record<string, unknown>,
    onProgress?: ProgressCallback
  ): Promise<SkillResult<T>> {
    const job = this.createJob(skill);

    if (onProgress) {
      this.subscribeToProgress(job.id, onProgress);
    }

    try {
      this.updateJob(job.id, { status: 'running', progress: 10, message: 'Starting...' });

      // Simulate execution delay
      await this.simulateProgress(job.id);

      // In real implementation, this would call the skill CLI via a backend API
      const result: SkillResult<T> = {
        success: true,
        outputPath: `${this.config.outputDir}/${skill}/${job.id}`,
        logs: [`${skill} execution completed`]
      };

      this.updateJob(job.id, { 
        status: 'completed', 
        progress: 100, 
        message: 'Completed',
        result,
        endTime: Date.now()
      });

      emitToast(`${skill} skill executed successfully`, 'success');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const result: SkillResult<T> = {
        success: false,
        error: errorMessage,
        logs: [errorMessage]
      };

      this.updateJob(job.id, { 
        status: 'failed', 
        message: errorMessage,
        result,
        endTime: Date.now()
      });

      emitToast(`${skill} skill failed: ${errorMessage}`, 'error');
      return result;
    }
  }

  /**
   * Simulate progress updates (for demo purposes)
   */
  private simulateProgress(jobId: string): Promise<void> {
    return new Promise((resolve) => {
      const steps = [
        { progress: 25, message: 'Processing...', delay: 500 },
        { progress: 50, message: 'Generating output...', delay: 1000 },
        { progress: 75, message: 'Finalizing...', delay: 800 },
        { progress: 100, message: 'Complete', delay: 200 }
      ];

      let currentStep = 0;

      const nextStep = () => {
        if (currentStep >= steps.length) {
          resolve();
          return;
        }

        const step = steps[currentStep];
        if (!step) {
          resolve();
          return;
        }
        setTimeout(() => {
          this.updateJob(jobId, { progress: step.progress, message: step.message });
          currentStep++;
          nextStep();
        }, step.delay);
      };

      nextStep();
    });
  }

  /**
   * Get job status
   */
  getJob(jobId: string): SkillJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): SkillJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get jobs by skill
   */
  getJobsBySkill(skill: SkillType): SkillJob[] {
    return this.getAllJobs().filter((job) => job.skill === skill);
  }

  /**
   * Clear completed/failed jobs older than specified age
   */
  clearOldJobs(maxAgeMs: number = 3600000): void {
    const now = Date.now();
    for (const [id, job] of this.jobs) {
      if (job.endTime && now - job.endTime > maxAgeMs) {
        this.jobs.delete(id);
        this.progressListeners.delete(id);
      }
    }
  }

  /**
   * Check if required environment variables are set
   */
  checkEnvironment(skill: SkillType): { ready: boolean; missing: string[] } {
    const missing: string[] = [];

    switch (skill) {
      case 'transcribe':
      case 'imagegen':
      case 'speech':
        if (!import.meta.env.VITE_OPENAI_API_KEY) {
          missing.push('OPENAI_API_KEY');
        }
        break;
      case 'doc':
      case 'pdf':
        // No special requirements
        break;
    }

    return { ready: missing.length === 0, missing };
  }
}

// Singleton instance
let bridgeInstance: SkillBridge | null = null;

export function getSkillBridge(config?: Partial<BridgeConfig>): SkillBridge {
  if (!bridgeInstance) {
    bridgeInstance = new SkillBridge(config);
  }
  return bridgeInstance;
}

export function resetSkillBridge(): void {
  bridgeInstance = null;
}

// Export class for testing
export { SkillBridge };

// Default export
export default getSkillBridge;
