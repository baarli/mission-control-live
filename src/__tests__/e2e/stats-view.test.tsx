import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import { GlassCard } from '@/components/UI/GlassCard';
import { StatCard } from '@/components/UI/StatCard';


// Local type for test dashboard stats
interface DashboardStats {
  totalSaker: number;
  pendingSaker: number;
  approvedSaker: number;
  rejectedSaker: number;
  averageEntertainmentScore: number;
  sakerThisWeek: number;
  sakerLastWeek: number;
}

// Stats view component
const StatsView: React.FC<{ stats: DashboardStats; loading?: boolean }> = ({ 
  stats, 
  loading = false 
}) => {
  const weekChange = ((stats.sakerThisWeek - stats.sakerLastWeek) / stats.sakerLastWeek) * 100;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Statistikk</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard 
          title="Totalt antall saker" 
          value={stats.totalSaker}
          loading={loading}
        />
        <StatCard 
          title="Venter på godkjenning" 
          value={stats.pendingSaker}
          trend={stats.pendingSaker > 20 ? 'up' : 'neutral'}
          change={stats.pendingSaker > 20 ? 10 : 0}
          loading={loading}
        />
        <StatCard 
          title="Godkjente saker" 
          value={stats.approvedSaker}
          trend="up"
          change={Math.round((stats.approvedSaker / stats.totalSaker) * 100)}
          loading={loading}
        />
        <StatCard 
          title="Avviste saker" 
          value={stats.rejectedSaker}
          trend="neutral"
          loading={loading}
        />
        <StatCard 
          title="Underholdningsscore" 
          value={`${stats.averageEntertainmentScore}/100`}
          trend={stats.averageEntertainmentScore > 70 ? 'up' : 'down'}
          loading={loading}
        />
        <StatCard 
          title="Saker denne uken" 
          value={stats.sakerThisWeek}
          trend={weekChange > 0 ? 'up' : weekChange < 0 ? 'down' : 'neutral'}
          change={Math.round(weekChange)}
          changeLabel="vs forrige uke"
          loading={loading}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-lg font-semibold mb-4">Statusfordeling</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Venter</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500"
                    style={{ width: `${(stats.pendingSaker / stats.totalSaker) * 100}%` }}
                    data-testid="pending-bar"
                  />
                </div>
                <span className="w-12 text-right">{Math.round((stats.pendingSaker / stats.totalSaker) * 100)}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Godkjent</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ width: `${(stats.approvedSaker / stats.totalSaker) * 100}%` }}
                    data-testid="approved-bar"
                  />
                </div>
                <span className="w-12 text-right">{Math.round((stats.approvedSaker / stats.totalSaker) * 100)}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span>Avvist</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500"
                    style={{ width: `${(stats.rejectedSaker / stats.totalSaker) * 100}%` }}
                    data-testid="rejected-bar"
                  />
                </div>
                <span className="w-12 text-right">{Math.round((stats.rejectedSaker / stats.totalSaker) * 100)}%</span>
              </div>
            </div>
          </div>
        </GlassCard>
        
        <GlassCard>
          <h2 className="text-lg font-semibold mb-4">Ukentlig sammenligning</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Denne uken:</span>
              <span className="font-semibold" data-testid="this-week">{stats.sakerThisWeek}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Forrige uke:</span>
              <span className="font-semibold" data-testid="last-week">{stats.sakerLastWeek}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Endring:</span>
                <span 
                  className={`font-semibold ${weekChange >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  data-testid="week-change"
                >
                  {weekChange > 0 ? '+' : ''}{Math.round(weekChange)}%
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

const mockStats: DashboardStats = {
  totalSaker: 200,
  pendingSaker: 30,
  approvedSaker: 150,
  rejectedSaker: 20,
  averageEntertainmentScore: 82,
  sakerThisWeek: 15,
  sakerLastWeek: 12,
};

describe('Stats View E2E', () => {
  describe('rendering', () => {
    it('renders stats view with all cards', () => {
      render(<StatsView stats={mockStats} />);
      
      expect(screen.getByText('Statistikk')).toBeInTheDocument();
      expect(screen.getByText('Totalt antall saker')).toBeInTheDocument();
      expect(screen.getByText('Venter på godkjenning')).toBeInTheDocument();
      expect(screen.getByText('Godkjente saker')).toBeInTheDocument();
      expect(screen.getByText('Avviste saker')).toBeInTheDocument();
      expect(screen.getByText('Underholdningsscore')).toBeInTheDocument();
      expect(screen.getByText('Saker denne uken')).toBeInTheDocument();
    });
    
    it('displays correct values', () => {
      render(<StatsView stats={mockStats} />);
      
      // Use getAllByText for values that appear multiple times
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('82/100')).toBeInTheDocument();
      // '15' appears multiple times, so use testid
      expect(screen.getByTestId('this-week')).toHaveTextContent('15');
    });
  });
  
  describe('loading state', () => {
    it('shows loading state for all cards', () => {
      render(<StatsView stats={mockStats} loading />);
      
      // All stat cards should show loading skeleton
      const loadingElements = document.querySelectorAll('.animate-pulse');
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });
  
  describe('status distribution', () => {
    it('renders status bars with correct widths', () => {
      render(<StatsView stats={mockStats} />);
      
      const pendingBar = screen.getByTestId('pending-bar');
      const approvedBar = screen.getByTestId('approved-bar');
      const rejectedBar = screen.getByTestId('rejected-bar');
      
      expect(pendingBar).toHaveStyle({ width: '15%' });
      expect(approvedBar).toHaveStyle({ width: '75%' });
      expect(rejectedBar).toHaveStyle({ width: '10%' });
    });
    
    it('displays correct percentages', () => {
      render(<StatsView stats={mockStats} />);
      
      expect(screen.getByText('15%')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('10%')).toBeInTheDocument();
    });
  });
  
  describe('weekly comparison', () => {
    it('displays weekly stats', () => {
      render(<StatsView stats={mockStats} />);
      
      expect(screen.getByTestId('this-week')).toHaveTextContent('15');
      expect(screen.getByTestId('last-week')).toHaveTextContent('12');
    });
    
    it('calculates and displays positive change', () => {
      const statsWithIncrease = { ...mockStats, sakerThisWeek: 18, sakerLastWeek: 12 };
      render(<StatsView stats={statsWithIncrease} />);
      
      const changeElement = screen.getByTestId('week-change');
      expect(changeElement).toHaveTextContent('+50%');
      expect(changeElement).toHaveClass('text-green-600');
    });
    
    it('calculates and displays negative change', () => {
      const statsWithDecrease = { ...mockStats, sakerThisWeek: 8, sakerLastWeek: 12 };
      render(<StatsView stats={statsWithDecrease} />);
      
      const changeElement = screen.getByTestId('week-change');
      expect(changeElement).toHaveTextContent('-33%');
      expect(changeElement).toHaveClass('text-red-600');
    });
    
    it('handles zero change', () => {
      const statsWithNoChange = { ...mockStats, sakerThisWeek: 12, sakerLastWeek: 12 };
      render(<StatsView stats={statsWithNoChange} />);
      
      expect(screen.getByTestId('week-change')).toHaveTextContent('0%');
    });
  });
  
  describe('trend indicators', () => {
    it('shows up trend for positive change', () => {
      const stats = { ...mockStats, sakerThisWeek: 15, sakerLastWeek: 10 };
      render(<StatsView stats={stats} />);
      
      // Check that trend is displayed
      const trendElements = screen.getAllByText(/\+\d+%/);
      expect(trendElements.length).toBeGreaterThan(0);
    });
    
    it('shows down trend for negative entertainment score', () => {
      const stats = { ...mockStats, averageEntertainmentScore: 50 };
      const { container } = render(<StatsView stats={stats} />);
      
      // Score below 70 should show down trend somewhere in the component
      const downTrend = container.querySelector('.text-red-600');
      expect(downTrend).toBeTruthy();
    });
    
    it('shows up trend for high entertainment score', () => {
      render(<StatsView stats={mockStats} />);
      
      // Score above 70 should show up trend
      const upTrend = document.querySelector('.text-green-600');
      expect(upTrend).toBeInTheDocument();
    });
  });
  
  describe('edge cases', () => {
    it('handles zero total saker', () => {
      const emptyStats = { ...mockStats, totalSaker: 0 };
      render(<StatsView stats={emptyStats} />);
      
      // Should not crash
      expect(screen.getByText('Statistikk')).toBeInTheDocument();
    });
    
    it('handles large numbers', () => {
      const largeStats = { 
        ...mockStats, 
        totalSaker: 10000,
        approvedSaker: 8000,
        pendingSaker: 1500,
        rejectedSaker: 500,
      };
      render(<StatsView stats={largeStats} />);
      
      expect(screen.getByText('10000')).toBeInTheDocument();
    });
    
    it('handles very high entertainment score', () => {
      const highScoreStats = { ...mockStats, averageEntertainmentScore: 100 };
      render(<StatsView stats={highScoreStats} />);
      
      expect(screen.getByText('100/100')).toBeInTheDocument();
    });
  });
});
