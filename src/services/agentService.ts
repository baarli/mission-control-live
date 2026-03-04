import { supabase as supabaseService } from '@/lib/supabase';
import { useAgentStore } from '@stores/agentStore';
import { useToastStore } from '@stores/toastStore';

import type {
  CommandType,
  Priority,
  AgentCommand,
  AgentResponse,
  ApprovalRequest,
  SystemStatus,
  ActivityLog,
} from '../types/agent';

type RealtimePayload = {
  eventType: string;
  new: Record<string, unknown>;
  old: Record<string, unknown>;
};

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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'agent_commands' },
        (payload: RealtimePayload) => this.handleCommandChange(payload)
      )
      .subscribe();

    // Subscribe to agent_responses
    const responsesSub = this.client
      .channel('agent_responses')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agent_responses' },
        (payload: RealtimePayload) => this.handleResponseInsert(payload)
      )
      .subscribe();

    // Subscribe to approval_requests
    const approvalsSub = this.client
      .channel('approval_requests')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'approval_requests' },
        (payload: RealtimePayload) => this.handleApprovalChange(payload)
      )
      .subscribe();

    // Subscribe to system_status
    const statusSub = this.client
      .channel('system_status')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_status' },
        (payload: RealtimePayload) => this.handleStatusChange(payload)
      )
      .subscribe();

    // Subscribe to activity_log
    const logsSub = this.client
      .channel('activity_log')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_log' },
        (payload: RealtimePayload) => this.handleLogInsert(payload)
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
        commands.forEach((cmd: AgentCommand) => store.addCommand(cmd));
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
        status: 'pending',
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
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      useToastStore.getState().showToast('Failed to respond', 'error');
      return false;
    }

    useAgentStore.getState().updateApproval(id, decision);
    useToastStore
      .getState()
      .showToast(decision === 'approved' ? 'Request approved' : 'Request rejected', 'success');
    return true;
  }

  // Handle realtime changes
  private handleCommandChange(payload: RealtimePayload) {
    const store = useAgentStore.getState();
    if (payload.eventType === 'INSERT') {
      store.addCommand(payload.new as unknown as AgentCommand);
    } else if (payload.eventType === 'UPDATE') {
      store.updateCommand(payload.new.id as string, payload.new as unknown as AgentCommand);
    }
  }

  private handleResponseInsert(payload: RealtimePayload) {
    const store = useAgentStore.getState();
    store.addResponse(payload.new as unknown as AgentResponse);

    // Show notification
    useToastStore
      .getState()
      .showToast(
        'New response from BaarliClaw',
        payload.new.response_type === 'error' ? 'error' : 'success'
      );
  }

  private handleApprovalChange(payload: RealtimePayload) {
    const store = useAgentStore.getState();
    if (payload.eventType === 'INSERT') {
      store.setApprovalRequests([
        payload.new as unknown as ApprovalRequest,
        ...store.approvalRequests,
      ]);
      useToastStore.getState().showToast(`Approval needed: ${payload.new.title}`, 'warning');
    }
  }

  private handleStatusChange(payload: RealtimePayload) {
    const store = useAgentStore.getState();
    const current = store.systemStatus;
    const updated = current.map(s =>
      s.id === payload.new.id ? (payload.new as unknown as SystemStatus) : s
    );
    store.setSystemStatus(updated);
  }

  private handleLogInsert(payload: RealtimePayload) {
    useAgentStore.getState().addActivityLog(payload.new as unknown as ActivityLog);
  }

  // Heartbeat to check connection
  private heartbeatInterval?: number;
  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      this.client
        .from('system_status')
        .select('count')
        .limit(1)
        .then(({ error }: { error: Error | null }) => {
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
