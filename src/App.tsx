import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SplashScreen } from './components/common/SplashScreen';
import { WelcomeScreen } from './components/common/WelcomeScreen';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { AppLockModal } from './components/common/AppLockModal';
import { VoiceCallModal } from './components/voice/VoiceCallModal';
import { AboutModal } from './components/about/AboutModal';
import { AdminDashboardModal } from './components/admin/AdminDashboardModal';
import { HomeDashboard } from './components/home/HomeDashboard';
import { FriendsView } from './components/friends/FriendsView';
import { ToolsCenterView } from './components/tools/ToolsCenterView';
import { ExploreView } from './components/explore/ExploreView';
import { ProfileView } from './components/profile/ProfileView';

const MainAppContent: React.FC = () => {
  const { showSplash, showWelcome, isAppLocked, activeTab } = useApp();

  if (showSplash) {
    return <SplashScreen />;
  }

  if (showWelcome) {
    return <WelcomeScreen />;
  }

  return (
    <div className="min-h-screen bg-[#090214] text-white flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-pink-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/40 via-[#0a0217] to-[#05000c]" />

      {/* Security Pin Lock Screen */}
      {isAppLocked && <AppLockModal />}

      {/* Dedicated Voice Call Modal */}
      <VoiceCallModal />

      {/* About Modal */}
      <AboutModal />

      {/* Admin Monitoring Modal */}
      <AdminDashboardModal />

      {/* Top Application Header */}
      <Header />

      {/* Dynamic Main Body Content */}
      <main className="flex-1 w-full max-w-md mx-auto relative z-10 overflow-x-hidden">
        {activeTab === 'home' && <HomeDashboard />}
        {activeTab === 'friends' && <FriendsView />}
        {activeTab === 'tools' && <ToolsCenterView />}
        {activeTab === 'explore' && <ExploreView />}
        {activeTab === 'profile' && <ProfileView />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
