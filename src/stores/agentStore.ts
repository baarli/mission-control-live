import { create } from 'zustand';

import type { 
  AgentCommand, 
  AgentResponse, 
  ApprovalRequest, 
  SystemStatus, 
  ActivityLog 
} from '@/types/agent';

interface AgentState {
  // Connection state
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Data
  commands: AgentCommand[];
  responses: AgentResponse[];
  approvalRequests: ApprovalRequest[];
  systemStatus: SystemStatus[];
  activityLogs: ActivityLog[];
  
  // Actions
  setIsConnected: (connected: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  addCommand: (command: AgentCommand) => void;
  updateCommand: (id: string, updates: Partial<AgentCommand>) => void;
  
  addResponse: (response: AgentResponse) => void;
  
  setApprovalRequests: (requests: ApprovalRequest[]) => void;
  updateApproval: (id: string, status: 'approved' | 'rejected') => void;
  
  setSystemStatus: (status: SystemStatus[]) => void;
  
  setActivityLogs: (logs: ActivityLog[]) => void;
  addActivityLog: (log: ActivityLog) => void;
  
  clearAll: () => void;
}

const initialState = {
  isConnected: false,
  isLoading: false,
  error: null,
  commands: [],
  responses: [],
  approvalRequests: [],
  systemStatus: [],
  activityLogs: [],
};

/**
 * Agent store for managing BaarliClaw agent state
 */
export const useAgentStore = create<AgentState>((set, _get) => ({
  ...initialState,
  
  setIsConnected: (connected) => set({ isConnected: connected }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  addCommand: (command) => set((state) => ({
    commands: [command, ...state.commands].slice(0, 100) // Keep last 100
  })),
  
  updateCommand: (id, updates) => set((state) => ({
    commands: state.commands.map(cmd => 
      cmd.id === id ? { ...cmd, ...updates } : cmd
    )
  })),
  
  addResponse: (response) => set((state) => ({
    responses: [response, ...state.responses].slice(0, 100)
  })),
  
  setApprovalRequests: (requests) => set({ approvalRequests: requests }),
  
  updateApproval: (id, status) => set((state) => ({
    approvalRequests: state.approvalRequests.map(req =>
      req.id === id ? { ...req, status, resolved_at: new Date().toISOString() } : req
    )
  })),
  
  setSystemStatus: (status) => set({ systemStatus: status }),
  
  setActivityLogs: (logs) => set({ activityLogs: logs }),
  
  addActivityLog: (log) => set((state) => ({
    activityLogs: [log, ...state.activityLogs].slice(0, 200)
  })),
  
  clearAll: () => set(initialState),
}));
