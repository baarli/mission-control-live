import { supabase as supabaseService } from '@/lib/supabase';
import { useAgentStore } from '@stores/agentStore';
import { useToastStore } from '@stores/toastStore';
import type { 
  AgentCommand, CommandType, Priority,
  ApprovalStatus, SystemStatus, ActivityLog 
} from '../types/agent';

class AgentService {
  private subscriptions: (() => void)[] = [];
  
  private get client() {
    return supabaseService.getClient();
  }
  
  // Initialize realtime subscriptions
  async initRealtime() {
    const store = useAgentStore.getState();
    store.setIsConnected(true);
    
    // Subscribe to agent_commands
    const commandsSub = this.client
      .channel('agent_commands')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'agent_commands' },
        (payload: any) => this.handleCommandChange(payload)
      )
      .subscribe();
    
    // Subscribe to agent_responses
    const responsesSub = this.client
      .channel('agent_responses')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agent_responses' },
        (payload: any) => this.handleResponseInsert(payload)
      )
      .subscribe();
    
    // Subscribe to approval_requests
    const approvalsSub = this.client
      .channel('approval_requests')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'approval_requests' },
        (payload: any) => this.handleApprovalChange(payload)
      )
      .subscribe();
    
    // Subscribe to system_status
    const statusSub = this.client
      .channel('system_status')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'system_status' },
        (payload: any) => this.handleStatusChange(payload)
      )
      .subscribe();
    
    // Subscribe to activity_log
    const logsSub = this.client
      .channel('activity_log')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_log' },
        (payload: any) => this.handleLogInsert(payload)
      )
      .subscribe();
    
    this.subscriptions = [
      () => commandsSub.unsubscribe(),
      () => responsesSub.unsubscribe(),
      () => approvalsSub.unsubscribe(),
      () => statusSub.unsubscribe(),
      () => logsSub.unsubscribe(),
    ];
    
    // Initial data fetch
    await this.fetchInitialData();
    
    // Start heartbeat
    this.startHeartbeat();
  }
  
  private async fetchInitialData() {
    const store = useAgentStore.getState();
    store.setIsLoading(true);
    
    try {
      // Fetch commands
      const { data: commands } = await this.client
        .from('agent_commands')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (commands) {
        commands.forEach((cmd: any) => store.addCommand(cmd));
      }
      
      // Fetch pending approvals
      const { data: approvals } = await this.client
        .from('approval_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (approvals) {
        store.setApprovalRequests(approvals);
      }
      
      // Fetch system status
      const { data: status } = await this.client
        .from('system_status')
        .select('*')
        .order('last_check', { ascending: false });
      
      if (status) {
        store.setSystemStatus(status);
      }
      
      // Fetch activity logs
      const { data: logs } = await this.client
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (logs) {
        store.setActivityLogs(logs);
      }
      
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      store.setIsLoading(false);
    }
  }
  
  // Send command to agent
  async sendCommand(
    commandType: CommandType, 
    data: Record<string, unknown>,
    priority: Priority = 'medium'
  ): Promise<string | null> {
    const { data: result, error } = await this.client
      .from('agent_commands')
      .insert({
        command_type: commandType,
        command_data: data,
        priority,
        status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      useToastStore.getState().showToast('Failed to send command', 'error');
      return null;
    }
    
    useAgentStore.getState().addCommand(result);
    useToastStore.getState().showToast('Command sent successfully', 'success');
    return result.id;
  }
  
  // Respond to approval request
  async respondToApproval(id: string, decision: 'approved' | 'rejected'): Promise<boolean> {
    const { error } = await this.client
      .from('approval_requests')
      .update({ 
        status: decision,
        resolved_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      useToastStore.getState().showToast('Failed to respond', 'error');
      return false;
    }
    
    useAgentStore.getState().updateApproval(id, decision);
    useToastStore.getState().showToast(
      decision === 'approved' ? 'Request approved' : 'Request rejected',
      'success'
    );
    return true;
  }
  
  // Handle realtime changes
  private handleCommandChange(payload: any) {
    const store = useAgentStore.getState();
    if (payload.eventType === 'INSERT') {
      store.addCommand(payload.new);
    } else if (payload.eventType === 'UPDATE') {
      store.updateCommand(payload.new.id, payload.new);
    }
  }
  
  private handleResponseInsert(payload: any) {
    const store = useAgentStore.getState();
    store.addResponse(payload.new);
    
    // Show notification
    useToastStore.getState().showToast(
      'New response from BaarliClaw',
      payload.new.response_type === 'error' ? 'error' : 'success'
    );
  }
  
  private handleApprovalChange(payload: any) {
    const store = useAgentStore.getState();
    if (payload.eventType === 'INSERT') {
      store.setApprovalRequests([payload.new, ...store.approvalRequests]);
      useToastStore.getState().showToast(
        `Approval needed: ${payload.new.title}`,
        'warning'
      );
    }
  }
  
  private handleStatusChange(payload: any) {
    const store = useAgentStore.getState();
    const current = store.systemStatus;
    const updated = current.map(s => 
      s.id === payload.new.id ? payload.new : s
    );
    store.setSystemStatus(updated);
  }
  
  private handleLogInsert(payload: any) {
    useAgentStore.getState().addActivityLog(payload.new);
  }
  
  // Heartbeat to check connection
  private heartbeatInterval?: number;
  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      this.client.from('system_status')
        .select('count')
        .limit(1)
        .then(({ error }: { error: any }) => {
          useAgentStore.getState().setIsConnected(!error);
        });
    }, 30000);
  }
  
  cleanup() {
    this.subscriptions.forEach(unsub => unsub());
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }
}

export const agentService = new AgentService();
