import { useState, useCallback } from 'react';
import { Layout } from '@components/Layout';
import { Dashboard } from '@components/Dashboard';
import { AgentSection } from '@components/Dashboard';
import { Saksliste } from '@components/Saksliste';
import { SearchPanel } from '@components/Search';
import { StatsView } from '@components/Stats';
import { ConnectionIndicator } from '@components/Agent';
import { useKeyboardShortcuts, getMissionControlShortcuts } from '@hooks/useKeyboardShortcuts';

function App() {
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  const handleNavigate = useCallback((section: string) => {
    setActiveSection(section);
  }, []);

  // Setup keyboard shortcuts
  useKeyboardShortcuts(getMissionControlShortcuts(handleNavigate));

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logout clicked');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'saksliste':
        return <Saksliste />;
      case 'search':
        return <SearchPanel />;
      case 'stats':
        return <StatsView />;
      case 'agent':
        return <AgentSection />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Layout
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        {renderContent()}
      </Layout>
      <ConnectionIndicator />
    </>
  );
}

export default App;
