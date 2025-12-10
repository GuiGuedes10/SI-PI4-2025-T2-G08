import { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { MatchDetail } from './components/MatchDetail';
import { Assistant } from './components/Assistant';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import type { Match } from './types';

type Screen = 'onboarding' | 'dashboard' | 'match' | 'assistant' | 'champions' | 'matches' | 'profile';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Redirect based on auth state
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && currentScreen === 'onboarding') {
        setCurrentScreen('dashboard');
      } else if (!isAuthenticated && currentScreen !== 'onboarding') {
        setCurrentScreen('onboarding');
      }
    }
  }, [isAuthenticated, isLoading, currentScreen]);

  const handleNavigate = (screen: string, data?: unknown) => {
    setCurrentScreen(screen as Screen);
    if (screen === 'match' && data) {
      setSelectedMatch(data as Match);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl border border-white/20 flex items-center justify-center text-2xl font-black animate-pulse"
              style={{ color: 'var(--neon-primary)' }}
            >
              SG
            </div>
            <p className="text-sm" style={{ color: 'var(--muted-text)' }}>Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <Onboarding onNavigate={handleNavigate} />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'match':
        return selectedMatch ? (
          <MatchDetail match={selectedMatch} onNavigate={handleNavigate} />
        ) : (
          <Dashboard onNavigate={handleNavigate} />
        );
      case 'assistant':
        return <Assistant onNavigate={handleNavigate} />;
      case 'champions':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'matches':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'profile':
        return <Dashboard onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout>
      {renderScreen()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
