import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlassCard } from '@/components/UI/GlassCard';

describe('GlassCard', () => {
  describe('rendering', () => {
    it('renders children content', () => {
      render(<GlassCard>Card Content</GlassCard>);
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });
    
    it('renders with default variant', () => {
      render(<GlassCard>Default</GlassCard>);
      const card = screen.getByText('Default').parentElement;
      expect(card).toHaveClass('bg-white/70', 'dark:bg-gray-800/70');
    });
    
    it('renders elevated variant', () => {
      render(<GlassCard variant="elevated">Elevated</GlassCard>);
      const card = screen.getByText('Elevated').parentElement;
      expect(card).toHaveClass('bg-white/80', 'dark:bg-gray-800/80', 'shadow-xl');
    });
    
    it('renders outlined variant', () => {
      render(<GlassCard variant="outlined">Outlined</GlassCard>);
      const card = screen.getByText('Outlined').parentElement;
      expect(card).toHaveClass('bg-transparent', 'border-2');
    });
  });
  
  describe('padding options', () => {
    it('renders with no padding', () => {
      render(<GlassCard padding="none">No Padding</GlassCard>);
      const card = screen.getByText('No Padding').parentElement;
      expect(card).not.toHaveClass('p-3', 'p-6', 'p-8');
    });
    
    it('renders with small padding', () => {
      render(<GlassCard padding="sm">Small Padding</GlassCard>);
      const card = screen.getByText('Small Padding').parentElement;
      expect(card).toHaveClass('p-3');
    });
    
    it('renders with medium padding by default', () => {
      render(<GlassCard>Medium Padding</GlassCard>);
      const card = screen.getByText('Medium Padding').parentElement;
      expect(card).toHaveClass('p-6');
    });
    
    it('renders with large padding', () => {
      render(<GlassCard padding="lg">Large Padding</GlassCard>);
      const card = screen.getByText('Large Padding').parentElement;
      expect(card).toHaveClass('p-8');
    });
  });
  
  describe('hoverable state', () => {
    it('has hoverable classes when hoverable is true', () => {
      render(<GlassCard hoverable>Hoverable</GlassCard>);
      const card = screen.getByText('Hoverable').parentElement;
      expect(card).toHaveClass('hover:shadow-xl', 'hover:-translate-y-1', 'cursor-pointer');
    });
    
    it('does not have hoverable classes by default', () => {
      render(<GlassCard>Not Hoverable</GlassCard>);
      const card = screen.getByText('Not Hoverable').parentElement;
      expect(card).not.toHaveClass('hover:shadow-xl');
    });
  });
  
  describe('glass morphism styles', () => {
    it('has backdrop blur effect', () => {
      render(<GlassCard>Blurred</GlassCard>);
      const card = screen.getByText('Blurred').parentElement;
      expect(card).toHaveClass('backdrop-blur-md');
    });
    
    it('has rounded corners', () => {
      render(<GlassCard>Rounded</GlassCard>);
      const card = screen.getByText('Rounded').parentElement;
      expect(card).toHaveClass('rounded-xl');
    });
    
    it('has border styling', () => {
      render(<GlassCard>Bordered</GlassCard>);
      const card = screen.getByText('Bordered').parentElement;
      expect(card).toHaveClass('border');
    });
    
    it('has transition effects', () => {
      render(<GlassCard>Transitioned</GlassCard>);
      const card = screen.getByText('Transitioned').parentElement;
      expect(card).toHaveClass('transition-all', 'duration-200');
    });
  });
  
  describe('accessibility', () => {
    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLDivElement | null };
      render(<GlassCard ref={ref}>With Ref</GlassCard>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
    
    it('preserves custom className', () => {
      render(<GlassCard className="custom-class">Custom</GlassCard>);
      const card = screen.getByText('Custom').parentElement;
      expect(card).toHaveClass('custom-class');
    });
    
    it('forwards other props', () => {
      render(<GlassCard data-testid="custom-card" data-custom="value">Props</GlassCard>);
      expect(screen.getByTestId('custom-card')).toHaveAttribute('data-custom', 'value');
    });
    
    it('accepts role attribute', () => {
      render(<GlassCard role="article">Article</GlassCard>);
      expect(screen.getByRole('article')).toBeInTheDocument();
    });
    
    it('accepts aria-label', () => {
      render(<GlassCard aria-label="Information card">Labeled</GlassCard>);
      expect(screen.getByLabelText('Information card')).toBeInTheDocument();
    });
  });
  
  describe('complex content', () => {
    it('renders nested elements', () => {
      render(
        <GlassCard>
          <h2>Title</h2>
          <p>Description</p>
          <button>Action</button>
        </GlassCard>
      );
      
      expect(screen.getByRole('heading', { name: 'Title' })).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
    
    it('renders multiple cards', () => {
      render(
        <>
          <GlassCard>Card 1</GlassCard>
          <GlassCard>Card 2</GlassCard>
        </>
      );
      
      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
    });
  });
  
  describe('display name', () => {
    it('has correct display name', () => {
      expect(GlassCard.displayName).toBe('GlassCard');
    });
  });
});
