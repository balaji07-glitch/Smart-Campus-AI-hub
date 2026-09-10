import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility, FontSize } from '../../context/AccessibilityContext';
import { LanguageCode, UserRole } from '../../types';
import {
  Compass,
  MessageSquareCode,
  Users2,
  TrendingUp,
  ShieldCheck,
  Globe,
  SunMoon,
  Volume2,
  VolumeX,
  Type,
  LogOut,
  ChevronDown,
  GraduationCap,
  School,
  Users,
  LayoutDashboard,
  CalendarCheck2,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, switchRole, setIsLoginModalOpen, logout } = useAuth();
  const {
    highContrast,
    toggleHighContrast,
    fontSize,
    setFontSize,
    language,
    setLanguage,
    t,
    announce,
    isSpeaking,
    stopSpeaking,
  } = useAccessibility();

  const [isLangOpen, setIsLangOpen] = useState(false);

  const navItems: { id: string; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: t.common.dashboard, icon: LayoutDashboard },
    { id: 'navigate', label: 'Campus Navigator', icon: Compass },
    { id: 'ask', label: 'Ask Campus AI', icon: MessageSquareCode },
  ];

  // Strictly Student & Faculty only
  if (currentUser.role === 'student' || currentUser.role === 'faculty') {
    navItems.push({ id: 'collaborate', label: 'Research Collaborate', icon: Users2 });
  }

  // Strictly Faculty only
  if (currentUser.role === 'faculty') {
    navItems.push({ id: 'attain', label: 'Attain (CO Analytics)', icon: TrendingUp });
  }

  // Strictly Admin only
  if (currentUser.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Manage Events & Schedules', icon: CalendarCheck2 });
  }

  const languages: { code: LanguageCode; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'es', label: 'Spanish', native: 'Español' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  ];

  const fontSizes: { size: FontSize; label: string; tooltip: string }[] = [
    { size: 'sm', label: 'A-', tooltip: t.common.fontSizeSm },
    { size: 'md', label: 'A', tooltip: t.common.fontSizeMd },
    { size: 'lg', label: 'A+', tooltip: t.common.fontSizeLg },
    { size: 'xl', label: 'A++', tooltip: t.common.fontSizeXl },
  ];

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { bg: 'bg-purple-100 text-purple-800 border-purple-300', icon: ShieldCheck, label: t.common.admin };
      case 'faculty':
        return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: School, label: t.common.faculty };
      case 'visitor':
        return { bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: Users, label: t.common.visitor };
      default:
        return { bg: 'bg-blue-100 text-blue-800 border-blue-300', icon: GraduationCap, label: t.common.student };
    }
  };

  const currentRoleBadge = getRoleBadge(currentUser.role);
  const CurrentRoleIcon = currentRoleBadge.icon;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Utility Accessibility Bar */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-blue-400 tracking-wide">SMART CAMPUS</span>
            <span className="text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-300">
              Institutional AI & Accessibility Portal (WCAG 2.1 AA)
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Font Size Adjusters */}
            <div className="flex items-center space-x-1" role="group" aria-label="Adjust font size">
              <Type className="w-3.5 h-3.5 text-slate-400 mr-1" aria-hidden="true" />
              {fontSizes.map(({ size, label, tooltip }) => (
                <button
                  key={size}
                  id={`font-size-${size}`}
                  type="button"
                  onClick={() => {
                    setFontSize(size);
                    announce(`Font size set to ${tooltip}`);
                  }}
                  className={`px-1.5 py-0.5 rounded text-xs font-semibold transition-colors focus:outline-hidden focus:ring-1 focus:ring-blue-400 ${
                    fontSize === size
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                  aria-pressed={fontSize === size}
                  aria-label={`${tooltip} font size`}
                  title={tooltip}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* High Contrast Mode Toggle */}
            <button
              id="btn-high-contrast"
              type="button"
              onClick={() => {
                toggleHighContrast();
                announce(highContrast ? 'Standard contrast mode enabled' : 'High contrast mode enabled');
              }}
              className={`flex items-center space-x-1.5 px-2 py-0.5 rounded transition-colors focus:outline-hidden focus:ring-1 focus:ring-blue-400 ${
                highContrast
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
              aria-pressed={highContrast}
              aria-label={t.common.highContrast}
              title={t.common.highContrast}
            >
              <SunMoon className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="font-medium">{t.common.highContrast}</span>
            </button>

            {/* Speech Narration Control if speaking */}
            {isSpeaking && (
              <button
                id="btn-stop-speech"
                type="button"
                onClick={stopSpeaking}
                className="flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-600 text-white font-medium animate-pulse"
                aria-label="Stop audio speech"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Mute Audio</span>
              </button>
            )}

            {/* Multilingual Switcher */}
            <div className="relative">
              <button
                id="btn-language-selector"
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center space-x-1.5 px-2 py-0.5 rounded text-slate-200 hover:bg-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-400"
                aria-expanded={isLangOpen}
                aria-haspopup="listbox"
                aria-label="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
                <span className="font-medium">
                  {languages.find(l => l.code === language)?.native || 'English'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" aria-hidden="true" />
              </button>

              {isLangOpen && (
                <div
                  className="absolute right-0 mt-1 w-36 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 z-50 text-slate-900 border border-slate-200"
                  role="listbox"
                  aria-label="Select Language"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      id={`lang-opt-${lang.code}`}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangOpen(false);
                        announce(`Language changed to ${lang.label}`);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-blue-50 transition-colors ${
                        language === lang.code ? 'font-bold text-blue-700 bg-blue-50/50' : 'text-slate-700'
                      }`}
                      role="option"
                      aria-selected={language === lang.code}
                    >
                      <span>{lang.native}</span>
                      <span className="text-slate-400 text-3xs uppercase">{lang.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 ring-1 ring-blue-400/30">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                  {t.appName}
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  Campus Hub
                </span>
              </div>
              <p className="text-2xs text-slate-500 font-medium hidden sm:block">
                {t.campusTagline}
              </p>
            </div>
          </div>

          {/* Module Tabs Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    announce(`Navigated to ${item.label}`);
                  }}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-600 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-2xs border border-blue-200/80 ring-1 ring-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Active Role & Switch Role Action */}
          <div className="flex items-center space-x-2.5">
            {/* Active Role Indicator (Non-switching badge) */}
            <div
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-2xs ${currentRoleBadge.bg}`}
              title={`Logged in as ${currentUser.name} (${currentUser.role})`}
            >
              <CurrentRoleIcon className="h-3.5 w-3.5 shrink-0" />
              <div className="flex flex-col text-left leading-tight">
                <span className="capitalize font-bold">{currentRoleBadge.label}</span>
                <span className="text-3xs font-normal text-slate-600 truncate max-w-[100px] sm:max-w-[140px]">
                  {currentUser.name}
                </span>
              </div>
            </div>

            {/* Switch Role Button - Explicitly Returns to Starting Page */}
            <button
              id="btn-switch-role"
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-red-700 bg-slate-100 hover:bg-red-50 border border-slate-300 hover:border-red-300 transition-all shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-red-500 cursor-pointer"
              title="Leave this dashboard and return to starting Role Selector page"
            >
              <LogOut className="h-3.5 w-3.5 text-slate-600 hover:text-red-600" />
              <span>Switch Role</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center space-x-1 pb-3 overflow-x-auto scrollbar-none border-t border-slate-100 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  announce(`Navigated to ${item.label}`);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
