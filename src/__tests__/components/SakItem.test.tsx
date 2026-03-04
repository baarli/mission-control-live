import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SakItem } from '@/components/Saksliste/SakItem';
import type { Sak } from '@/types';

const mockSak: Sak = {
  id: 'sak_1',
  tenant_id: 'tenant_1',
  title: 'Test Sak Title',
  description: 'This is a test description for the sak item.',
  status: 'pending',
  priority: 'high',
  category: 'TALK',
  tags: ['tag1', 'tag2'],
  created_by: 'user_1',
  show_date: '2024-01-15',
  order_index: 0,
  created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  updated_at: new Date().toISOString(),
  entertainmentScore: 75,
};

describe('SakItem', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnStatusChange = vi.fn();
  const mockOnPriorityChange = vi.fn();
  
  describe('rendering', () => {
    it('renders sak title', () => {
      render(<SakItem sak={mockSak} />);
      expect(screen.getByText('Test Sak Title')).toBeInTheDocument();
    });
    
    it('renders sak description', () => {
      render(<SakItem sak={mockSak} />);
      expect(screen.getByText('This is a test description for the sak item.')).toBeInTheDocument();
    });
    
    it('renders status label', () => {
      render(<SakItem sak={mockSak} />);
      expect(screen.getByText('Venter')).toBeInTheDocument();
    });
    
    it('renders priority label', () => {
      render(<SakItem sak={mockSak} />);
      expect(screen.getByText('Høy')).toBeInTheDocument();
    });
    
    it('renders entertainment score', () => {
      render(<SakItem sak={mockSak} />);
      expect(screen.getByTestId('entertainment-score')).toHaveTextContent('75/100');
    });
    
    it('renders relative timestamp', () => {
      render(<SakItem sak={mockSak} />);
      expect(screen.getByText(/dag|time|minutt/)).toBeInTheDocument();
    });
  });
  
  describe('status variants', () => {
    it('renders draft status', () => {
      const draftSak = { ...mockSak, status: 'draft' as const };
      render(<SakItem sak={draftSak} />);
      expect(screen.getByText('Utkast')).toBeInTheDocument();
    });
    
    it('renders approved status', () => {
      const approvedSak = { ...mockSak, status: 'approved' as const };
      render(<SakItem sak={approvedSak} />);
      expect(screen.getByText('Godkjent')).toBeInTheDocument();
    });
    
    it('renders rejected status', () => {
      const rejectedSak = { ...mockSak, status: 'rejected' as const };
      render(<SakItem sak={rejectedSak} />);
      expect(screen.getByText('Avvist')).toBeInTheDocument();
    });
  });
  
  describe('priority variants', () => {
    it('renders low priority', () => {
      const lowSak = { ...mockSak, priority: 'low' as const };
      render(<SakItem sak={lowSak} />);
      expect(screen.getByText('Lav')).toBeInTheDocument();
    });
    
    it('renders medium priority', () => {
      const mediumSak = { ...mockSak, priority: 'medium' as const };
      render(<SakItem sak={mediumSak} />);
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });
    
    it('renders critical priority', () => {
      const criticalSak = { ...mockSak, priority: 'critical' as const };
      render(<SakItem sak={criticalSak} />);
      expect(screen.getByText('Kritisk')).toBeInTheDocument();
    });
  });
  
  describe('tags', () => {
    it('renders tags', () => {
      render(<SakItem sak={mockSak} />);
      expect(screen.getByText('tag1')).toBeInTheDocument();
      expect(screen.getByText('tag2')).toBeInTheDocument();
    });
    
    it('does not render tags section when no tags', () => {
      const noTagsSak = { ...mockSak, tags: [] };
      render(<SakItem sak={noTagsSak} />);
      // Tags section has flex gap-2 and mt-3 classes
      const tagsSection = document.querySelector('.mt-3.flex.gap-2');
      expect(tagsSection).not.toBeInTheDocument();
    });
  });
  
  describe('assignee', () => {
    it('renders assignee name when provided', () => {
      const assignedSak = {
        ...mockSak,
        assignee: 'Assignee Name',
      };
      render(<SakItem sak={assignedSak} />);
      expect(screen.getByText('Assignee Name')).toBeInTheDocument();
    });
    
    it('does not render assignee when not provided', () => {
      render(<SakItem sak={mockSak} />);
      expect(screen.queryByText('Assignee Name')).not.toBeInTheDocument();
    });
  });
  
  describe('action buttons', () => {
    it('shows approve button for pending saker', () => {
      render(<SakItem sak={mockSak} onStatusChange={mockOnStatusChange} />);
      expect(screen.getByTestId('approve-btn')).toBeInTheDocument();
    });
    
    it('does not show approve button for approved saker', () => {
      const approvedSak = { ...mockSak, status: 'approved' as const };
      render(<SakItem sak={approvedSak} onStatusChange={mockOnStatusChange} />);
      expect(screen.queryByTestId('approve-btn')).not.toBeInTheDocument();
    });
    
    it('calls onStatusChange when approve is clicked', async () => {
      const user = userEvent.setup();
      render(<SakItem sak={mockSak} onStatusChange={mockOnStatusChange} />);
      
      await user.click(screen.getByTestId('approve-btn'));
      expect(mockOnStatusChange).toHaveBeenCalledWith('sak_1', 'approved');
    });
    
    it('shows edit button when onEdit provided', () => {
      render(<SakItem sak={mockSak} onEdit={mockOnEdit} />);
      expect(screen.getByTestId('edit-btn')).toBeInTheDocument();
    });
    
    it('calls onEdit when edit is clicked', async () => {
      const user = userEvent.setup();
      render(<SakItem sak={mockSak} onEdit={mockOnEdit} />);
      
      await user.click(screen.getByTestId('edit-btn'));
      expect(mockOnEdit).toHaveBeenCalledWith(mockSak);
    });
    
    it('shows delete button when onDelete provided', () => {
      render(<SakItem sak={mockSak} onDelete={mockOnDelete} />);
      expect(screen.getByTestId('delete-btn')).toBeInTheDocument();
    });
    
    it('calls onDelete when delete is clicked', async () => {
      const user = userEvent.setup();
      render(<SakItem sak={mockSak} onDelete={mockOnDelete} />);
      
      await user.click(screen.getByTestId('delete-btn'));
      expect(mockOnDelete).toHaveBeenCalledWith('sak_1');
    });
  });
  
  describe('expandable description', () => {
    it('shows expand button for long descriptions', () => {
      const longDescSak = {
        ...mockSak,
        description: 'A'.repeat(150),
      };
      render(<SakItem sak={longDescSak} />);
      
      const expandButton = screen.getByLabelText('Vis mer');
      expect(expandButton).toBeInTheDocument();
    });
    
    it('does not show expand button for short descriptions', () => {
      const shortDescSak = {
        ...mockSak,
        description: 'Short desc',
      };
      render(<SakItem sak={shortDescSak} />);
      
      expect(screen.queryByLabelText('Vis mer')).not.toBeInTheDocument();
    });
    
    it('toggles description expansion', async () => {
      const user = userEvent.setup();
      const longDescSak = {
        ...mockSak,
        description: 'A'.repeat(150),
      };
      render(<SakItem sak={longDescSak} />);
      
      const expandButton = screen.getByLabelText('Vis mer');
      await user.click(expandButton);
      
      expect(screen.getByLabelText('Vis mindre')).toBeInTheDocument();
    });
  });
  
  describe('data attributes', () => {
    it('has data-testid with sak id', () => {
      render(<SakItem sak={mockSak} />);
      expect(screen.getByTestId('sak-item-sak_1')).toBeInTheDocument();
    });
    
    it('status has data-testid', () => {
      render(<SakItem sak={mockSak} />);
      expect(screen.getByTestId('sak-status')).toHaveTextContent('Venter');
    });
  });
  
  describe('accessibility', () => {
    it('approve button has aria-label', () => {
      render(<SakItem sak={mockSak} onStatusChange={mockOnStatusChange} />);
      expect(screen.getByLabelText('Godkjenn sak')).toBeInTheDocument();
    });
    
    it('edit button has aria-label', () => {
      render(<SakItem sak={mockSak} onEdit={mockOnEdit} />);
      expect(screen.getByLabelText('Rediger sak')).toBeInTheDocument();
    });
    
    it('delete button has aria-label', () => {
      render(<SakItem sak={mockSak} onDelete={mockOnDelete} />);
      expect(screen.getByLabelText('Slett sak')).toBeInTheDocument();
    });
    
    it('expand button has aria-expanded', async () => {
      const user = userEvent.setup();
      const longDescSak = {
        ...mockSak,
        description: 'A'.repeat(150),
      };
      render(<SakItem sak={longDescSak} />);
      
      const expandButton = screen.getByLabelText('Vis mer');
      expect(expandButton).toHaveAttribute('aria-expanded', 'false');
      
      await user.click(expandButton);
      expect(screen.getByLabelText('Vis mindre')).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
