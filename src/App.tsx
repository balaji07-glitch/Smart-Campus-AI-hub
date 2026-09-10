import React, { useState, useEffect } from 'react';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SkipLink } from './components/common/SkipLink';
import { Header } from './components/common/Header';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { NavigateModule } from './components/navigate/NavigateModule';
import { AskModule } from './components/ask/AskModule';
import { CollaborateModule } from './components/collaborate/CollaborateModule';
import { AttainModule } from './components/attain/AttainModule';
import { ManageEventsSchedules } from './components/admin/ManageEventsSchedules';
import { RoleSelectorLanding } from './components/auth/RoleSelectorLanding';
import { RoleAuthModal } from './components/auth/RoleAuthModal';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const { currentUser, isLoggedIn } = useAuth();

  // Strict route guarding based on current session role
  useEffect(() => {
    if (!isLoggedIn || !currentUser) return;

    // Attain is strictly for Faculty
    if (activeTab === 'attain' && currentUser.role !== 'faculty') {
      setActiveTab('dashboard');
    }

    // Research Collaborate is strictly for Student and Faculty
    if (
      activeTab === 'collaborate' &&
      currentUser.role !== 'student' &&
      currentUser.role !== 'faculty'
    ) {
      setActiveTab('dashboard');
    }

    // Manage Events & Schedules is strictly for Admin
    if (activeTab === 'admin' && currentUser.role !== 'admin') {
      setActiveTab('dashboard');
    }
  }, [activeTab, currentUser, isLoggedIn]);

  // FIRST SCREEN: If user has not chosen role or logged in, show Role Selector first!
  if (!isLoggedIn || !currentUser) {
    return (
      <>
        <RoleSelectorLanding />
        <RoleAuthModal />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors duration-200">
      <SkipLink />
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main id="main-content" className="flex-1 focus:outline-hidden" tabIndex={-1}>
        {activeTab === 'dashboard' && <DashboardHome setActiveTab={setActiveTab} />}
        {activeTab === 'navigate' && <NavigateModule />}
        {activeTab === 'ask' && <AskModule />}

        {/* Student & Faculty only */}
        {activeTab === 'collaborate' && (currentUser.role === 'student' || currentUser.role === 'faculty') && (
          <CollaborateModule />
        )}

        {/* Faculty only */}
        {activeTab === 'attain' && currentUser.role === 'faculty' && (
          <AttainModule />
        )}

        {/* Admin only */}
        {activeTab === 'admin' && currentUser.role === 'admin' && (
          <ManageEventsSchedules />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700">Smart Campus AI Hub</span>
            <span>•</span>
            <span>Accredited Institution Operations Portal</span>
          </div>

          <div className="flex items-center space-x-4 text-3xs text-slate-400">
            <span>WCAG 2.1 AA Accessibility Compliant</span>
            <span>•</span>
            <span>NBA Tier-I Criterion 3</span>
            <span>•</span>
            <span>NAAC SSR Matrix</span>
          </div>

          <div className="text-3xs text-slate-400">
            Current Session: <strong className="text-slate-700 capitalize">{currentUser.name}</strong> (
            <span className="uppercase font-semibold text-blue-600">{currentUser.role}</span>)
          </div>
        </div>
      </footer>

      {/* Role Auth Modal in case user triggers a role switch / signup */}
      <RoleAuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </AccessibilityProvider>
  );
}
