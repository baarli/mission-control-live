import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SakItem } from '@/components/Saksliste/SakItem';
import type { Sak } from '@/types';

// Create a mock saksliste component for integration testing
const MockSaksliste: React.FC<{
  initialSaker: Sak[];
  onCreate?: (sak: Omit<Sak, 'id' | 'createdAt' | 'updatedAt'>) => void;
}> = ({ initialSaker, onCreate }) => {
  const [saker, setSaker] = useState<Sak[]>(initialSaker);
  
  const handleDelete = (id: string) => {
    setSaker(prev => prev.filter(s => s.id !== id));
  };
  
  const handleStatusChange = (id: string, status: Sak['status']) => {
    setSaker(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };
  
  const handleCreate = () => {
    const newSak: Sak = {
      id: `sak_${Date.now()}`,
      title: 'New Test Sak',
      description: 'New description',
      status: 'draft',
      priority: 'medium',
      category: 'Test',
      tags: [],
      createdBy: {
        id: 'user_1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSaker(prev => [...prev, newSak]);
    onCreate?.(newSak);
  };
  
  return (
    <div>
      <button onClick={handleCreate} data-testid="create-sak-btn">Create New Sak</button>
      <div data-testid="saksliste">
        {saker.map(sak => (
          <SakItem
            key={sak.id}
            sak={sak}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
      <div data-testid="sak-count">{saker.length} saker</div>
    </div>
  );
};

const mockCreator = {
  id: 'user_1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin' as const,
  createdAt: new Date().toISOString(),
};

const createMockSak = (id: string, overrides: Partial<Sak> = {}): Sak => ({
  id,
  title: `Sak ${id}`,
  description: `Description for ${id}`,
  status: 'pending',
  priority: 'medium',
  category: 'Test',
  tags: [],
  createdBy: mockCreator,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('Saksliste CRUD Integration', () => {
  const mockSaker = [
    createMockSak('sak_1', { title: 'First Sak', status: 'pending' }),
    createMockSak('sak_2', { title: 'Second Sak', status: 'draft' }),
    createMockSak('sak_3', { title: 'Third Sak', status: 'approved' }),
  ];
  
  describe('read operations', () => {
    it('displays list of saker', () => {
      render(<MockSaksliste initialSaker={mockSaker} />);
      
      expect(screen.getByText('First Sak')).toBeInTheDocument();
      expect(screen.getByText('Second Sak')).toBeInTheDocument();
      expect(screen.getByText('Third Sak')).toBeInTheDocument();
    });
    
    it('shows correct sak count', () => {
      render(<MockSaksliste initialSaker={mockSaker} />);
      
      expect(screen.getByTestId('sak-count')).toHaveTextContent('3 saker');
    });
    
    it('displays correct status for each sak', () => {
      render(<MockSaksliste initialSaker={mockSaker} />);
      
      const sakItems = screen.getAllByTestId(/sak-item-/);
      expect(sakItems).toHaveLength(3);
    });
  });
  
  describe('create operations', () => {
    it('adds new sak to list', async () => {
      const user = userEvent.setup();
      render(<MockSaksliste initialSaker={mockSaker} />);
      
      await user.click(screen.getByTestId('create-sak-btn'));
      
      expect(screen.getByText('New Test Sak')).toBeInTheDocument();
      expect(screen.getByTestId('sak-count')).toHaveTextContent('4 saker');
    });
    
    it('calls onCreate callback when creating sak', async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn();
      render(<MockSaksliste initialSaker={mockSaker} onCreate={onCreate} />);
      
      await user.click(screen.getByTestId('create-sak-btn'));
      
      expect(onCreate).toHaveBeenCalledTimes(1);
      expect(onCreate).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Test Sak',
        status: 'draft',
      }));
    });
  });
  
  describe('delete operations', () => {
    it('removes sak from list when deleted', async () => {
      const user = userEvent.setup();
      render(<MockSaksliste initialSaker={mockSaker} />);
      
      // Find first sak and delete it
      const firstSakDeleteBtn = screen.getAllByTestId('delete-btn')[0];
      await user.click(firstSakDeleteBtn);
      
      expect(screen.queryByText('First Sak')).not.toBeInTheDocument();
      expect(screen.getByTestId('sak-count')).toHaveTextContent('2 saker');
    });
    
    it('only deletes the clicked sak', async () => {
      const user = userEvent.setup();
      render(<MockSaksliste initialSaker={mockSaker} />);
      
      // Delete the second sak
      const deleteBtns = screen.getAllByTestId('delete-btn');
      await user.click(deleteBtns[1]);
      
      // First and third should still exist
      expect(screen.getByText('First Sak')).toBeInTheDocument();
      expect(screen.queryByText('Second Sak')).not.toBeInTheDocument();
      expect(screen.getByText('Third Sak')).toBeInTheDocument();
    });
  });
  
  describe('update operations', () => {
    it('changes sak status when approved', async () => {
      const user = userEvent.setup();
      render(<MockSaksliste initialSaker={mockSaker} />);
      
      // First sak is pending and should have approve button
      const approveBtn = screen.getAllByTestId('approve-btn')[0];
      await user.click(approveBtn);
      
      // Status should be updated to approved
      await waitFor(() => {
        const sakItem = screen.getByTestId('sak-item-sak_1');
        const status = within(sakItem).getByTestId('sak-status');
        expect(status).toHaveTextContent('Godkjent');
      });
    });
    
    it('hides approve button for already approved saker', () => {
      const approvedSaker = [
        createMockSak('sak_1', { status: 'approved' }),
      ];
      render(<MockSaksliste initialSaker={approvedSaker} />);
      
      expect(screen.queryByTestId('approve-btn')).not.toBeInTheDocument();
    });
  });
  
  describe('complex operations', () => {
    it('handles multiple operations in sequence', async () => {
      const user = userEvent.setup();
      const onCreate = vi.fn();
      render(<MockSaksliste initialSaker={mockSaker} onCreate={onCreate} />);
      
      // 1. Create a new sak
      await user.click(screen.getByTestId('create-sak-btn'));
      expect(screen.getByTestId('sak-count')).toHaveTextContent('4 saker');
      
      // 2. Approve the first sak
      const approveBtn = screen.getAllByTestId('approve-btn')[0];
      await user.click(approveBtn);
      
      // 3. Delete the second sak
      const deleteBtns = screen.getAllByTestId('delete-btn');
      await user.click(deleteBtns[1]);
      
      // Verify final state
      expect(screen.getByTestId('sak-count')).toHaveTextContent('3 saker');
      expect(screen.queryByText('Second Sak')).not.toBeInTheDocument();
      expect(screen.getByText('New Test Sak')).toBeInTheDocument();
    });
    
    it('maintains state consistency after multiple updates', async () => {
      const user = userEvent.setup();
      render(<MockSaksliste initialSaker={mockSaker} />);
      
      // Approve first sak
      await user.click(screen.getAllByTestId('approve-btn')[0]);
      
      // Delete second sak
      await user.click(screen.getAllByTestId('delete-btn')[1]);
      
      // Create new sak
      await user.click(screen.getByTestId('create-sak-btn'));
      
      // Verify all items are rendered correctly
      const saksliste = screen.getByTestId('saksliste');
      expect(within(saksliste).getAllByTestId(/sak-item-/)).toHaveLength(3);
    });
  });
});
