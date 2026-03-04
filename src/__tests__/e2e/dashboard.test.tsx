import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlassCard } from '@/components/UI/GlassCard';
import { StatCard } from '@/components/UI/StatCard';
import { Button } from '@/components/UI/Button';
import { LoginScreen } from '@/components/Auth/LoginScreen';
import { useAuthStore } from '@/stores/authStore';
import type { DashboardStats } from '@/types';
import React, { useState, useEffect } from 'react';

// Mock dashboard component
const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { isAuthenticated, checkAuth } = useAuthStore();
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setStats({
        totalSaker: 156,
        pendingSaker: 23,
        approvedSaker: 120,
        rejectedSaker: 13,
        averageEntertainmentScore: 78,
        sakerThisWeek: 12,
        sakerLastWeek: 8,
      });
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isAuthenticated) {
    return (
      <LoginScreen 
        onLogin={() => useAuthStore.setState({ isAuthenticated: true })} 
      />
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Mission Control Dashboard</h1>
      
      {isLoading ? (
        <div data-testid="dashboard-loading">Laster dashboard...</div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard 
              title="Totalt antall saker" 
              value={stats?.totalSaker || 0}
              loading={isLoading}
            />
            <StatCard 
              title="Venter" 
              value={stats?.pendingSaker || 0}
              trend="up"
              change={15}
              loading={isLoading}
            />
            <StatCard 
              title="Godkjent" 
              value={stats?.approvedSaker || 0}
              trend="neutral"
              loading={isLoading}
            />
            <StatCard 
              title="Avvist" 
              value={stats?.rejectedSaker || 0}
              trend="down"
              change={-5}
              loading={isLoading}
            />
          </div>
          
          <GlassCard className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Hurtighandlinger</h2>
            <div className="flex gap-4">
              <Button>Ny sak</Button>
              <Button variant="secondary">Importer</Button>
              <Button variant="outline">Eksporter</Button>
            </div>
          </GlassCard>
          
          <div data-testid="dashboard-content">
            <p>Snitt underholdningsscore: {stats?.averageEntertainmentScore}/100</p>
            <p>Saker denne uken: {stats?.sakerThisWeek}</p>
            <p>Saker forrige uke: {stats?.sakerLastWeek}</p>
          </div>
        </>
      )}
    </div>
  );
};

describe('Dashboard E2E', () => {
  beforeEach(() => {
    // Reset auth state
    useAuthStore.setState({ isAuthenticated: false, user: null, isLoading: false });
  });
  
  describe('authentication gate', () => {
    it('shows login screen when not authenticated', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('Mission Control')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Skriv passord...')).toBeInTheDocument();
    });
    
    it('shows dashboard after successful login', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);
      
      // Login
      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'kloakontroll2026');
      await user.click(screen.getByRole('button', { name: 'Logg inn' }));
      
      // Should see dashboard heading
      await waitFor(() => {
        expect(screen.getByText('Mission Control Dashboard')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });
  
  describe('loading state', () => {
    it('shows loading state initially', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);
      
      // Login
      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'kloakontroll2026');
      await user.click(screen.getByRole('button', { name: 'Logg inn' }));
      
      // Initially loading
      expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
      
      // Wait for data to load
      await waitFor(() => {
        expect(screen.queryByTestId('dashboard-loading')).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });
  
  describe('dashboard content', () => {
    it('displays all stat cards after loading', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);
      
      // Login and wait for load
      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'kloakontroll2026');
      await user.click(screen.getByRole('button', { name: 'Logg inn' }));
      
      await waitFor(() => {
        expect(screen.queryByTestId('dashboard-loading')).not.toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Check all stat cards
      expect(screen.getByText('Totalt antall saker')).toBeInTheDocument();
      expect(screen.getByText('Venter')).toBeInTheDocument();
      expect(screen.getByText('Godkjent')).toBeInTheDocument();
      expect(screen.getByText('Avvist')).toBeInTheDocument();
      
      // Check values
      expect(screen.getByText('156')).toBeInTheDocument();
      expect(screen.getByText('23')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('13')).toBeInTheDocument();
    });
    
    it('displays quick actions', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);
      
      // Login and wait
      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'kloakontroll2026');
      await user.click(screen.getByRole('button', { name: 'Logg inn' }));
      
      await waitFor(() => {
        expect(screen.queryByTestId('dashboard-loading')).not.toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Check quick actions
      expect(screen.getByRole('button', { name: 'Ny sak' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Importer' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Eksporter' })).toBeInTheDocument();
    });
    
    it('displays dashboard metrics', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);
      
      // Login and wait
      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'kloakontroll2026');
      await user.click(screen.getByRole('button', { name: 'Logg inn' }));
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Check metrics
      expect(screen.getByText(/Snitt underholdningsscore: 78/)).toBeInTheDocument();
      expect(screen.getByText(/Saker denne uken: 12/)).toBeInTheDocument();
      expect(screen.getByText(/Saker forrige uke: 8/)).toBeInTheDocument();
    });
  });
  
  describe('dashboard interactions', () => {
    it('allows clicking quick action buttons', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);
      
      // Login and wait
      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'kloakontroll2026');
      await user.click(screen.getByRole('button', { name: 'Logg inn' }));
      
      await waitFor(() => {
        expect(screen.queryByTestId('dashboard-loading')).not.toBeInTheDocument();
      }, { timeout: 2000 });
      
      // Click buttons (just verify they don't crash)
      await user.click(screen.getByRole('button', { name: 'Ny sak' }));
      await user.click(screen.getByRole('button', { name: 'Importer' }));
      await user.click(screen.getByRole('button', { name: 'Eksporter' }));
      
      // Dashboard should still be visible
      expect(screen.getByText('Mission Control Dashboard')).toBeInTheDocument();
    });
  });
  
  describe('error scenarios', () => {
    it('shows error on wrong password and allows retry', async () => {
      const user = userEvent.setup();
      render(<Dashboard />);
      
      // Wrong password
      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'wrong');
      await user.click(screen.getByRole('button', { name: 'Logg inn' }));
      
      const error = await screen.findByRole('alert');
      expect(error).toHaveTextContent('Feil passord');
      
      // Clear and retry
      await user.clear(screen.getByPlaceholderText('Skriv passord...'));
      await user.type(screen.getByPlaceholderText('Skriv passord...'), 'kloakontroll2026');
      await user.click(screen.getByRole('button', { name: 'Logg inn' }));
      
      // Should get to dashboard
      await waitFor(() => {
        expect(screen.getByText('Mission Control Dashboard')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });
});
