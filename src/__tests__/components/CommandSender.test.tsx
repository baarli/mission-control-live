import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

import { CommandSender } from '@/components/Agent/CommandSender';
import { useAgentStore } from '@/stores/agentStore';

// Reset store state before each test
beforeEach(() => {
  useAgentStore.setState({
    isConnected: false,
    isLoading: false,
    error: null,
    commands: [],
    responses: [],
    approvalRequests: [],
    systemStatus: [],
    activityLogs: [],
  });
});

describe('CommandSender', () => {
  describe('disconnected state', () => {
    it('disables the E-STOP button when not connected', () => {
      render(<CommandSender />);
      const estop = screen.getByRole('button', { name: /emergency stop/i });
      expect(estop).toBeDisabled();
    });

    it('disables the action selector when not connected', () => {
      render(<CommandSender />);
      const selector = screen.getByLabelText(/select clawbot action/i);
      expect(selector).toBeDisabled();
    });
  });

  describe('E-STOP', () => {
    it('sends a critical priority stop command when E-STOP is pressed', () => {
      // Set connected
      useAgentStore.setState({ isConnected: true });

      render(<CommandSender />);
      const estop = screen.getByRole('button', { name: /emergency stop/i });
      expect(estop).not.toBeDisabled();

      fireEvent.click(estop);

      const { commands, activityLogs } = useAgentStore.getState();
      expect(commands).toHaveLength(1);
      const cmd = commands[0]!;
      expect(cmd.priority).toBe('critical');
      expect(cmd.command_type).toBe('system');

      // Inspect the payload inside the command_data envelope
      const envelope = cmd.command_data as {
        payload: { action: string; emergency?: boolean };
      };
      expect(envelope.payload.action).toBe('stop');
      expect(envelope.payload.emergency).toBe(true);

      expect(activityLogs).toHaveLength(1);
      expect(activityLogs[0]!.message).toContain('E-STOP');
    });
  });

  describe('structured stop command', () => {
    it('sends a stop command when the form is submitted with action=stop', () => {
      useAgentStore.setState({ isConnected: true });

      render(<CommandSender />);

      // action selector defaults to 'stop' – submit the structured form
      const sendButton = screen.getByRole('button', { name: /send/i });
      const form = sendButton.closest('form');
      expect(form).not.toBeNull();
      fireEvent.submit(form!);

      const { commands } = useAgentStore.getState();
      expect(commands).toHaveLength(1);
      const envelope = commands[0]!.command_data as { payload: { action: string } };
      expect(envelope.payload.action).toBe('stop');
    });
  });

  describe('advanced JSON mode', () => {
    it('shows validation error on invalid JSON', () => {
      useAgentStore.setState({ isConnected: true });

      render(<CommandSender />);

      // Switch to advanced mode
      fireEvent.change(screen.getByLabelText(/select clawbot action/i), {
        target: { value: 'advanced' },
      });

      // Type invalid JSON
      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'not-json' } });

      fireEvent.submit(textarea.closest('form')!);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByRole('alert').textContent).toContain('invalid JSON');
    });

    it('sends command with valid JSON payload', () => {
      useAgentStore.setState({ isConnected: true });

      render(<CommandSender />);

      fireEvent.change(screen.getByLabelText(/select clawbot action/i), {
        target: { value: 'advanced' },
      });

      const textarea = screen.getByRole('textbox');
      fireEvent.change(textarea, { target: { value: '{"action":"custom"}' } });

      fireEvent.submit(textarea.closest('form')!);

      const { commands } = useAgentStore.getState();
      expect(commands).toHaveLength(1);
      expect((commands[0]!.command_data as { action: string }).action).toBe('custom');
    });
  });
});
