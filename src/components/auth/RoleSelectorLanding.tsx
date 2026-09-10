import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  GraduationCap,
  School,
  Users,
  ShieldCheck,
  Compass,
  MessageSquareCode,
  Users2,
  TrendingUp,
  CalendarCheck2,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Zap,
} from 'lucide-react';

interface RoleCardConfig {
  role: UserRole;
  title: string;
  badge: string;
  tagline: string;
  icon: React.ElementType;
  gradient: string;
  borderHover: string;
  buttonColor: string;
  authBadge: string;
  modules: { name: string; icon: React.ElementType }[];
  restrictions: string[];
  ctaText: string;
}

export const RoleSelectorLanding: React.FC = () => {
  const { selectRole } = useAuth();

  const roleConfigs: RoleCardConfig[] = [
    {
      role: 'student',
      title: 'Student',
      badge: 'Academic & Research',
      tagline: 'Undergraduate, graduate scholars & student innovators',
      icon: GraduationCap,
      gradient: 'from-blue-600 to-indigo-700',
      borderHover: 'hover:border-blue-500 hover:shadow-blue-500/15',
      buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
      authBadge: 'Requires Department & Year Details',
      modules: [
        { name: 'Campus Navigator', icon: Compass },
        { name: 'Ask Campus AI', icon: MessageSquareCode },
        { name: 'Research Collaborate', icon: Users2 },
      ],
      restrictions: ['No Course Attainment / NBA Analytics', 'No Event Administration'],
      ctaText: 'Enter as Student',
    },
    {
      role: 'faculty',
      title: 'Faculty',
      badge: 'Instruction & Research',
      tagline: 'Professors, principal investigators & department chairs',
      icon: School,
      gradient: 'from-emerald-600 to-teal-700',
      borderHover: 'hover:border-emerald-500 hover:shadow-emerald-500/15',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      authBadge: 'Requires Skills & Education Credentials',
      modules: [
        { name: 'Campus Navigator', icon: Compass },
        { name: 'Ask Campus AI', icon: MessageSquareCode },
        { name: 'Research Collaborate', icon: Users2 },
        { name: 'Attain — CO Analytics', icon: TrendingUp },
      ],
      restrictions: ['No Event Administration'],
      ctaText: 'Enter as Faculty',
    },
    {
      role: 'visitor',
      title: 'Visitor',
      badge: 'Public & Guest Access',
      tagline: 'Prospective students, visiting delegates & family members',
      icon: Users,
      gradient: 'from-amber-500 to-orange-600',
      borderHover: 'hover:border-amber-500 hover:shadow-amber-500/15',
      buttonColor: 'bg-amber-600 hover:bg-amber-700 text-white',
      authBadge: 'Instant Access • Zero Credentials Needed',
      modules: [
        { name: 'Campus Navigator', icon: Compass },
        { name: 'Ask Campus AI', icon: MessageSquareCode },
      ],
      restrictions: ['No Research Matching', 'No Accreditation / Admin'],
      ctaText: 'Instant Guest Access',
    },
    {
      role: 'admin',
      title: 'Admin',
      badge: 'Campus Governance',
      tagline: 'Registrars, facility directors & timetable coordinators',
      icon: ShieldCheck,
      gradient: 'from-purple-600 to-violet-800',
      borderHover: 'hover:border-purple-500 hover:shadow-purple-500/15',
      buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
      authBadge: 'Institutional Staff Authentication',
      modules: [
        { name: 'Campus Navigator', icon: Compass },
        { name: 'Ask Campus AI', icon: MessageSquareCode },
        { name: 'Manage Events & Schedules', icon: CalendarCheck2 },
      ],
      restrictions: ['Replaces Collaborate with Schedule Management'],
      ctaText: 'Admin Portal',
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 text-slate-100 flex flex-col justify-between p-4 md:p-8">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between py-2 border-b border-slate-700/60">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Smart Campus AI Hub
              <span className="text-3xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-400/30">
                v2.0
              </span>
            </h1>
            <p className="text-xs text-slate-400">Institutional Accessibility, Grounded AI & Operations Portal</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Campus Services Online
          </span>
          <span className="text-slate-600">•</span>
          <span>WCAG 2.1 AA Compliant</span>
        </div>
      </div>

      {/* Main Role Selector Hero */}
      <div className="max-w-7xl mx-auto w-full my-auto py-10">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300 mb-4 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Role-Based Institutional Gateway</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Select Your Campus Role
          </h2>
          <p className="text-base md:text-lg text-slate-300">
            Choose your affiliation below to access role-specific workflows, verified AI intelligence, and personalized dashboards.
          </p>
        </div>

        {/* 4 Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roleConfigs.map(cfg => {
            const Icon = cfg.icon;
            return (
              <div
                key={cfg.role}
                className={`relative flex flex-col justify-between bg-slate-800/70 backdrop-blur-md rounded-2xl p-6 border border-slate-700/80 shadow-xl transition-all duration-300 hover:-translate-y-1.5 ${cfg.borderHover} group`}
              >
                <div>
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-linear-to-br ${cfg.gradient} flex items-center justify-center shadow-lg text-white group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-slate-700/60 text-slate-300 border border-slate-600/60">
                      {cfg.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-2xl font-bold text-white mb-1.5 flex items-center justify-between">
                    {cfg.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4 min-h-[36px]">
                    {cfg.tagline}
                  </p>

                  {/* Auth Condition Badge */}
                  <div className="mb-5 py-1.5 px-3 rounded-lg bg-slate-900/60 border border-slate-700/50 text-3xs font-medium text-slate-300 flex items-center gap-1.5">
                    {cfg.role === 'visitor' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    )}
                    <span>{cfg.authBadge}</span>
                  </div>

                  {/* Accessible Modules List */}
                  <div className="space-y-2 mb-6">
                    <div className="text-3xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
                      Included Modules ({cfg.modules.length})
                    </div>
                    {cfg.modules.map(mod => {
                      const ModIcon = mod.icon;
                      return (
                        <div
                          key={mod.name}
                          className="flex items-center gap-2 text-xs font-medium text-slate-200 bg-slate-900/40 px-2.5 py-1.5 rounded-md border border-slate-700/30"
                        >
                          <ModIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{mod.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Role Button */}
                <button
                  id={`btn-select-role-${cfg.role}`}
                  onClick={() => selectRole(cfg.role)}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${cfg.buttonColor} focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <span>{cfg.ctaText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto w-full pt-6 border-t border-slate-800 text-center text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          <span>Smart Campus AI Hub</span>
          <span className="mx-2">•</span>
          <span>Unified Autonomous Navigation, Grounded RAG Chat & Accreditation System</span>
        </div>
        <div className="flex items-center space-x-3 text-3xs">
          <span>NBA Tier-I Criterion 3</span>
          <span>•</span>
          <span>NAAC SSR Matrix</span>
          <span>•</span>
          <span>Equal Opportunity Access</span>
        </div>
      </div>
    </div>
  );
};
