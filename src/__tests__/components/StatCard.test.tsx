import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from '@/components/UI/StatCard';

describe('StatCard', () => {
  describe('rendering', () => {
    it('renders title and value', () => {
      render(<StatCard title="Total Users" value={1234} />);
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('1234')).toBeInTheDocument();
    });
    
    it('renders string values', () => {
      render(<StatCard title="Status" value="Active" />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });
  
  describe('loading state', () => {
    it('shows loading skeleton when loading is true', () => {
      render(<StatCard title="Loading" value={0} loading />);
      
      // Should have animate-pulse class
      const card = screen.getByText('Loading').closest('div')?.parentElement;
      expect(card).toHaveClass('animate-pulse');
    });
    
    it('does not show value when loading', () => {
      render(<StatCard title="Loading" value={1234} loading />);
      
      // Value should not be directly visible in loading state
      expect(screen.queryByText('1234')).not.toBeInTheDocument();
    });
    
    it('shows content when loading is false', () => {
      render(<StatCard title="Loaded" value={1234} loading={false} />);
      expect(screen.getByText('1234')).toBeInTheDocument();
    });
  });
  
  describe('change indicator', () => {
    it('shows change percentage when provided', () => {
      render(<StatCard title="Users" value={100} change={15} />);
      expect(screen.getByText('+15%')).toBeInTheDocument();
    });
    
    it('shows negative change with minus sign', () => {
      render(<StatCard title="Users" value={100} change={-10} />);
      expect(screen.getByText('-10%')).toBeInTheDocument();
    });
    
    it('shows custom change label', () => {
      render(<StatCard title="Users" value={100} change={15} changeLabel="vs forrige måned" />);
      expect(screen.getByText('vs forrige måned')).toBeInTheDocument();
    });
    
    it('shows upward trend icon for positive change', () => {
      render(<StatCard title="Users" value={100} change={15} trend="up" />);
      expect(screen.getByText('+15%').parentElement?.querySelector('svg')).toBeInTheDocument();
    });
    
    it('shows downward trend icon for negative change', () => {
      render(<StatCard title="Users" value={100} change={-10} trend="down" />);
      expect(screen.getByText('-10%').parentElement?.querySelector('svg')).toBeInTheDocument();
    });
    
    it('shows neutral trend icon', () => {
      render(<StatCard title="Users" value={100} change={0} trend="neutral" />);
      expect(screen.getByText('+0%').parentElement?.querySelector('svg')).toBeInTheDocument();
    });
    
    it('has green color for upward trend', () => {
      render(<StatCard title="Users" value={100} change={15} trend="up" />);
      const changeElement = screen.getByText('+15%').parentElement;
      expect(changeElement).toHaveClass('text-green-600');
    });
    
    it('has red color for downward trend', () => {
      render(<StatCard title="Users" value={100} change={-10} trend="down" />);
      const changeElement = screen.getByText('-10%').parentElement;
      expect(changeElement).toHaveClass('text-red-600');
    });
    
    it('has gray color for neutral trend', () => {
      render(<StatCard title="Users" value={100} change={0} trend="neutral" />);
      const changeElement = screen.getByText('+0%').parentElement;
      expect(changeElement).toHaveClass('text-gray-600');
    });
  });
  
  describe('icon', () => {
    it('renders icon when provided', () => {
      const icon = <span data-testid="stat-icon">📊</span>;
      render(<StatCard title="Stats" value={100} icon={icon} />);
      expect(screen.getByTestId('stat-icon')).toBeInTheDocument();
    });
    
    it('does not render icon container when no icon provided', () => {
      render(<StatCard title="Stats" value={100} />);
      expect(screen.queryByTestId('stat-icon')).not.toBeInTheDocument();
    });
    
    it('icon has proper styling', () => {
      const icon = <span data-testid="stat-icon">📊</span>;
      render(<StatCard title="Stats" value={100} icon={icon} />);
      const iconContainer = screen.getByTestId('stat-icon').parentElement;
      expect(iconContainer).toHaveClass('p-3', 'rounded-lg', 'bg-blue-50');
    });
  });
  
  describe('accessibility', () => {
    it('title has id for aria-labelledby', () => {
      render(<StatCard title="Accessible" value={100} />);
      const title = screen.getByText('Accessible');
      expect(title).toHaveAttribute('id', 'stat-title-Accessible');
    });
    
    it('value is associated with title via aria-labelledby', () => {
      render(<StatCard title="Accessible" value={100} />);
      const value = screen.getByText('100');
      expect(value).toHaveAttribute('aria-labelledby', 'stat-title-Accessible');
    });
    
    it('has proper role and structure', () => {
      render(<StatCard title="Stats" value={100} />);
      const card = screen.getByText('Stats').closest('div')?.parentElement;
      expect(card).toHaveAttribute('role', 'region');
    });
    
    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLDivElement | null };
      render(<StatCard ref={ref} title="Stats" value={100} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
    
    it('preserves custom className', () => {
      render(<StatCard className="custom-class" title="Stats" value={100} />);
      const card = screen.getByText('Stats').closest('div')?.parentElement;
      expect(card).toHaveClass('custom-class');
    });
    
    it('forwards other props', () => {
      render(<StatCard data-testid="custom-stat" data-custom="value" title="Stats" value={100} />);
      expect(screen.getByTestId('custom-stat')).toHaveAttribute('data-custom', 'value');
    });
  });
  
  describe('visual styling', () => {
    it('has glass morphism effect', () => {
      render(<StatCard title="Stats" value={100} />);
      const card = screen.getByText('Stats').closest('div')?.parentElement;
      expect(card).toHaveClass('bg-white/70', 'backdrop-blur-md');
    });
    
    it('has proper spacing', () => {
      render(<StatCard title="Stats" value={100} />);
      const card = screen.getByText('Stats').closest('div')?.parentElement;
      expect(card).toHaveClass('p-6', 'rounded-xl');
    });
    
    it('has shadow', () => {
      render(<StatCard title="Stats" value={100} />);
      const card = screen.getByText('Stats').closest('div')?.parentElement;
      expect(card).toHaveClass('shadow-lg');
    });
  });
  
  describe('display name', () => {
    it('has correct display name', () => {
      expect(StatCard.displayName).toBe('StatCard');
    });
  });
});
