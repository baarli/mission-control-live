import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import LoginScreen from '@/components/Auth/LoginScreen';

describe('LoginScreen', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    mockOnLogin.mockClear();
  });

  describe('rendering', () => {
    it('renders login form correctly', () => {
      render(<LoginScreen onLogin={mockOnLogin} />);

      expect(screen.getByText('Mission Control')).toBeInTheDocument();
      expect(screen.getByText('Logg inn for å fortsette')).toBeInTheDocument();
      expect(screen.getByLabelText('Passord')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Skriv passord...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Logg inn' })).toBeInTheDocument();
    });

    it('renders lock icon', () => {
      render(<LoginScreen onLogin={mockOnLogin} />);
      expect(document.querySelector('svg')).toBeInTheDocument();
    });

    it('renders help text', () => {
      render(<LoginScreen onLogin={mockOnLogin} />);
      expect(
        screen.getByText('Kontakt administrator hvis du har glemt passordet')
      ).toBeInTheDocument();
    });
  });

  describe('password input', () => {
    it('accepts password input', async () => {
      const user = userEvent.setup();
      render(<LoginScreen onLogin={mockOnLogin} />);

      const input = screen.getByPlaceholderText('Skriv passord...');
      await user.type(input, 'mysecretpassword');

      expect(input).toHaveValue('mysecretpassword');
    });

    it('masks password input', () => {
      render(<LoginScreen onLogin={mockOnLogin} />);
      const input = screen.getByPlaceholderText('Skriv passord...');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('has password autocomplete', () => {
      render(<LoginScreen onLogin={mockOnLogin} />);
      const input = screen.getByPlaceholderText('Skriv passord...');
      expect(input).toHaveAttribute('autocomplete', 'current-password');
    });

    it('is associated with label', () => {
      render(<LoginScreen onLogin={mockOnLogin} />);
      const label = screen.getByText('Passord');
      const input = screen.getByLabelText('Passord');
      expect(label).toHaveAttribute('for', input.id);
    });
  });

  describe('form submission', () => {
    it('calls onLogin with correct password', async () => {
      const user = userEvent.setup();
      render(<LoginScreen onLogin={mockOnLogin} />);

      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'kloakontroll2026');
      await user.click(screen.getByRole('button', { name: 'Logg inn' }));

      // Wait for async operation
      await screen.findByRole('button', { name: 'Logg inn' });

      expect(mockOnLogin).toHaveBeenCalledTimes(1);
    });

    it('shows error on wrong password', async () => {
      const user = userEvent.setup();
      render(<LoginScreen onLogin={mockOnLogin} />);

      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: 'Logg inn' }));

      const error = await screen.findByRole('alert');
      expect(error).toHaveTextContent('Feil passord');
    });

    it('shows error when password is empty', async () => {
      const user = userEvent.setup();
      render(<LoginScreen onLogin={mockOnLogin} />);

      await user.click(screen.getByRole('button', { name: 'Logg inn' }));

      const error = await screen.findByRole('alert');
      expect(error).toHaveTextContent('Vennligst skriv inn passord');
    });

    it('clears error when user types', async () => {
      const user = userEvent.setup();
      render(<LoginScreen onLogin={mockOnLogin} />);

      // Trigger error first
      await user.click(screen.getByRole('button', { name: 'Logg inn' }));
      expect(await screen.findByRole('alert')).toBeInTheDocument();

      // Type to clear error
      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'a');

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('submits on Enter key', async () => {
      const user = userEvent.setup();
      render(<LoginScreen onLogin={mockOnLogin} />);

      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'kloakontroll2026');
      await user.keyboard('{Enter}');

      // Wait for async operation
      await screen.findByRole('button', { name: 'Logg inn' });

      expect(mockOnLogin).toHaveBeenCalledTimes(1);
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      render(<LoginScreen onLogin={mockOnLogin} />);

      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'kloakontroll2026');
      await user.click(screen.getByRole('button', { name: 'Logg inn' }));

      // Should show loading state immediately
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('custom password', () => {
    it('uses custom expected password', async () => {
      const user = userEvent.setup();
      const customOnLogin = vi.fn((password: string) => password === 'custom123');
      render(<LoginScreen onLogin={customOnLogin} />);

      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'custom123');
      await user.click(screen.getByRole('button', { name: 'Logg inn' }));

      await screen.findByRole('button', { name: 'Logg inn' });

      expect(customOnLogin).toHaveBeenCalledTimes(1);
    });

    it('rejects wrong password with custom expected', async () => {
      const user = userEvent.setup();
      const customOnLogin = vi.fn((password: string) => password === 'custom123');
      render(<LoginScreen onLogin={customOnLogin} />);

      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'kloakontroll2026');
      await user.click(screen.getByRole('button', { name: 'Logg inn' }));

      const error = await screen.findByRole('alert');
      expect(error).toHaveTextContent('Feil passord');
    });
  });

  describe('accessibility', () => {
    it('has proper form structure', () => {
      render(<LoginScreen onLogin={mockOnLogin} />);
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('password input has aria-invalid on error', async () => {
      const user = userEvent.setup();
      render(<LoginScreen onLogin={mockOnLogin} />);

      await user.click(screen.getByRole('button', { name: 'Logg inn' }));

      const input = screen.getByPlaceholderText('Skriv passord...');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('error is associated with input via aria-describedby', async () => {
      const user = userEvent.setup();
      render(<LoginScreen onLogin={mockOnLogin} />);

      await user.click(screen.getByRole('button', { name: 'Logg inn' }));

      const input = screen.getByPlaceholderText('Skriv passord...');
      const errorId = input.getAttribute('aria-describedby');
      expect(screen.getByRole('alert')).toHaveAttribute('id', errorId);
    });

    it('has no validation on pristine form', () => {
      render(<LoginScreen onLogin={mockOnLogin} />);
      const input = screen.getByPlaceholderText('Skriv passord...');
      expect(input).not.toHaveAttribute('aria-invalid', 'true');
    });

    it('uses noValidate on form', () => {
      render(<LoginScreen onLogin={mockOnLogin} />);
      const form = screen.getByRole('form');
      expect(form).toHaveAttribute('novalidate');
    });
  });

  describe('visual states', () => {
    it('has proper styling classes', () => {
      render(<LoginScreen onLogin={mockOnLogin} />);

      const container = screen.getByText('Mission Control').closest('div')?.parentElement;
      expect(container).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center');
    });

    it('renders glass card', () => {
      render(<LoginScreen onLogin={mockOnLogin} />);
      expect(screen.getByRole('form').parentElement).toBeInTheDocument();
    });
  });
});
