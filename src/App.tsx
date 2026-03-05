import { useState, useCallback } from 'react';

import { ConnectionIndicator } from '@components/Agent';
import { Dashboard, AgentSection } from '@components/Dashboard';
import { Layout } from '@components/Layout';
import { NotImplemented } from '@components/UI';
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
        return (
          <NotImplemented
            section="Saksliste"
            description="Saksliste is not yet connected to a live data source. Add saker from the search panel when the integration is ready."
          />
        );
      case 'search':
        return (
          <NotImplemented
            section="Søk"
            description="The search panel requires a configured Brave API key. Set VITE_BRAVE_API_KEY in your environment to enable news search."
          />
        );
      case 'stats':
        return (
          <NotImplemented
            section="Statistikk"
            description="Statistics are not yet connected to live radio/podcast data sources."
          />
        );
      case 'agent':
        return <AgentSection />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Layout activeSection={activeSection} onNavigate={handleNavigate} onLogout={handleLogout}>
        {renderContent()}
      </Layout>
      <ConnectionIndicator />
    </>
  );
}

export default App;
