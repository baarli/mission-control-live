import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastItem, ToastContainer } from '@/components/UI/Toast';
import type { Toast } from '@/types';

const mockToast: Toast = {
  id: 'toast_1',
  type: 'success',
  title: 'Success!',
  message: 'Operation completed successfully.',
  duration: 5000,
};

describe('ToastItem', () => {
  const mockOnClose = vi.fn();
  
  beforeEach(() => {
    mockOnClose.mockClear();
    vi.useFakeTimers();
  });
  
  afterEach(() => {
    vi.useRealTimers();
  });
  
  describe('rendering', () => {
    it('renders toast title', () => {
      render(<ToastItem toast={mockToast} onClose={mockOnClose} />);
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });
    
    it('renders toast message', () => {
      render(<ToastItem toast={mockToast} onClose={mockOnClose} />);
      expect(screen.getByText('Operation completed successfully.')).toBeInTheDocument();
    });
    
    it('renders without message when not provided', () => {
      const toastWithoutMessage = { ...mockToast, message: undefined };
      const { container } = render(<ToastItem toast={toastWithoutMessage} onClose={mockOnClose} />);
      
      const messages = container.querySelectorAll('p');
      expect(messages.length).toBe(1); // Only title
    });
  });
  
  describe('toast types', () => {
    it('renders success toast', () => {
      render(<ToastItem toast={mockToast} onClose={mockOnClose} />);
      expect(screen.getByTestId('toast-success')).toBeInTheDocument();
    });
    
    it('renders error toast', () => {
      const errorToast = { ...mockToast, type: 'error' as const, title: 'Error!' };
      render(<ToastItem toast={errorToast} onClose={mockOnClose} />);
      expect(screen.getByTestId('toast-error')).toBeInTheDocument();
    });
    
    it('renders warning toast', () => {
      const warningToast = { ...mockToast, type: 'warning' as const, title: 'Warning!' };
      render(<ToastItem toast={warningToast} onClose={mockOnClose} />);
      expect(screen.getByTestId('toast-warning')).toBeInTheDocument();
    });
    
    it('renders info toast', () => {
      const infoToast = { ...mockToast, type: 'info' as const, title: 'Info!' };
      render(<ToastItem toast={infoToast} onClose={mockOnClose} />);
      expect(screen.getByTestId('toast-info')).toBeInTheDocument();
    });
  });
  
  describe('type styling', () => {
    it('success toast has green styling', () => {
      render(<ToastItem toast={mockToast} onClose={mockOnClose} />);
      const toast = screen.getByTestId('toast-success');
      expect(toast).toHaveClass('bg-green-50', 'border-green-200');
    });
    
    it('error toast has red styling', () => {
      const errorToast = { ...mockToast, type: 'error' as const };
      render(<ToastItem toast={errorToast} onClose={mockOnClose} />);
      const toast = screen.getByTestId('toast-error');
      expect(toast).toHaveClass('bg-red-50', 'border-red-200');
    });
    
    it('warning toast has yellow styling', () => {
      const warningToast = { ...mockToast, type: 'warning' as const };
      render(<ToastItem toast={warningToast} onClose={mockOnClose} />);
      const toast = screen.getByTestId('toast-warning');
      expect(toast).toHaveClass('bg-yellow-50', 'border-yellow-200');
    });
    
    it('info toast has blue styling', () => {
      const infoToast = { ...mockToast, type: 'info' as const };
      render(<ToastItem toast={infoToast} onClose={mockOnClose} />);
      const toast = screen.getByTestId('toast-info');
      expect(toast).toHaveClass('bg-blue-50', 'border-blue-200');
    });
  });
  
  describe('close functionality', () => {
    it('renders close button', () => {
      render(<ToastItem toast={mockToast} onClose={mockOnClose} />);
      expect(screen.getByLabelText('Lukk varsel')).toBeInTheDocument();
    });
    
    it('calls onClose when close button clicked', async () => {
      const user = userEvent.setup();
      render(<ToastItem toast={mockToast} onClose={mockOnClose} />);
      
      await user.click(screen.getByLabelText('Lukk varsel'));
      
      // Should start exit animation then call onClose
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledWith('toast_1');
      }, { timeout: 1000 });
    });
    
    it('auto-closes after duration', async () => {
      render(<ToastItem toast={mockToast} onClose={mockOnClose} />);
      
      vi.advanceTimersByTime(5000);
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledWith('toast_1');
      }, { timeout: 1000 });
    });
    
    it('uses custom duration', async () => {
      const customToast = { ...mockToast, duration: 1000 };
      render(<ToastItem toast={customToast} onClose={mockOnClose} />);
      
      vi.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledWith('toast_1');
      }, { timeout: 1000 });
    });
  });
  
  describe('animation', () => {
    it('has enter animation classes', () => {
      render(<ToastItem toast={mockToast} onClose={mockOnClose} />);
      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('transform', 'transition-all', 'duration-300');
      expect(toast).toHaveClass('translate-x-0', 'opacity-100');
    });
  });
  
  describe('accessibility', () => {
    it('has alert role', () => {
      render(<ToastItem toast={mockToast} onClose={mockOnClose} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    
    it('close button has aria-label', () => {
      render(<ToastItem toast={mockToast} onClose={mockOnClose} />);
      expect(screen.getByLabelText('Lukk varsel')).toBeInTheDocument();
    });
    
    it('icons are hidden from screen readers', () => {
      render(<ToastItem toast={mockToast} onClose={mockOnClose} />);
      const icons = document.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});

describe('ToastContainer', () => {
  const mockOnClose = vi.fn();
  
  beforeEach(() => {
    mockOnClose.mockClear();
  });
  
  it('renders nothing when no toasts', () => {
    const { container } = render(<ToastContainer toasts={[]} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });
  
  it('renders single toast', () => {
    const toasts = [mockToast];
    render(<ToastContainer toasts={toasts} onClose={mockOnClose} />);
    
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });
  
  it('renders multiple toasts', () => {
    const toasts = [
      mockToast,
      { ...mockToast, id: 'toast_2', type: 'error' as const, title: 'Error!' },
    ];
    render(<ToastContainer toasts={toasts} onClose={mockOnClose} />);
    
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });
  
  it('has proper container styling', () => {
    const toasts = [mockToast];
    const { container } = render(<ToastContainer toasts={toasts} onClose={mockOnClose} />);
    
    const toastContainer = container.firstChild;
    expect(toastContainer).toHaveClass('fixed', 'bottom-0', 'right-0', 'z-50');
  });
  
  it('has aria-live attribute', () => {
    const toasts = [mockToast];
    render(<ToastContainer toasts={toasts} onClose={mockOnClose} />);
    
    expect(screen.getByLabelText('Varsler')).toHaveAttribute('aria-live', 'polite');
  });
  
  it('has aria-label', () => {
    const toasts = [mockToast];
    render(<ToastContainer toasts={toasts} onClose={mockOnClose} />);
    
    expect(screen.getByLabelText('Varsler')).toBeInTheDocument();
  });
  
  it('renders toasts in order', () => {
    const toasts = [
      { ...mockToast, id: 'toast_1', title: 'First' },
      { ...mockToast, id: 'toast_2', title: 'Second' },
      { ...mockToast, id: 'toast_3', title: 'Third' },
    ];
    render(<ToastContainer toasts={toasts} onClose={mockOnClose} />);
    
    const titles = screen.getAllByText(/First|Second|Third/);
    expect(titles[0]).toHaveTextContent('First');
    expect(titles[1]).toHaveTextContent('Second');
    expect(titles[2]).toHaveTextContent('Third');
  });
  
  it('forwards onClose to each toast item', async () => {
    const user = userEvent.setup();
    const toasts = [
      mockToast,
      { ...mockToast, id: 'toast_2', title: 'Second' },
    ];
    render(<ToastContainer toasts={toasts} onClose={mockOnClose} />);
    
    const closeButtons = screen.getAllByLabelText('Lukk varsel');
    await user.click(closeButtons[1]);
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledWith('toast_2');
    }, { timeout: 1000 });
  });
});
