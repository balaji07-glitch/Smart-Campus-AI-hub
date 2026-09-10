import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import {
  Compass,
  MessageSquareCode,
  Users2,
  TrendingUp,
  CalendarCheck2,
  ArrowRight,
  ShieldCheck,
  Calendar,
  MapPin,
  FileCheck2,
  HelpCircle,
  Sparkles,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle2,
  BookOpen,
  School,
  GraduationCap,
  Users,
} from 'lucide-react';

interface DashboardHomeProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ setActiveTab }) => {
  const { currentUser } = useAuth();
  const { t, announce } = useAccessibility();

  // Master definition of all campus modules with role authorization
  const allModuleCards = [
    {
      id: 'navigate',
      title: 'Campus Navigator',
      subtitle: 'Indoor floor plans, outdoor pathways, and step-free turn-by-turn guidance with audio narration.',
      icon: Compass,
      tag: 'Accessibility Enabled',
      accentColor: 'from-blue-600 to-cyan-600',
      badgeBg: 'bg-blue-100 text-blue-800',
      highlights: ['Step-free elevator/ramp routing', 'Audio-guided steps for visually impaired', 'Find nearest accessible washroom'],
      roles: ['student', 'faculty', 'visitor', 'admin'],
    },
    {
      id: 'ask',
      title: 'Ask Campus AI',
      subtitle: 'Verified RAG campus intelligence citing official documents, timetables, and schedules. Never hallucinates.',
      icon: MessageSquareCode,
      tag: 'Zero Hallucination',
      accentColor: 'from-indigo-600 to-violet-600',
      badgeBg: 'bg-indigo-100 text-indigo-800',
      highlights: ['Strictly cites official regulations', 'Voice dictation & multi-language output', 'Integrated human helpdesk fallback'],
      roles: ['student', 'faculty', 'visitor', 'admin'],
    },
    {
      id: 'collaborate',
      title: 'Research Collaborate',
      subtitle: 'AI interdisciplinary research matchmaking connecting complementary student & faculty expertise.',
      icon: Users2,
      tag: 'AI Match Engine',
      accentColor: 'from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-100 text-emerald-800',
      highlights: ['Automated complementarity scoring', 'Skillset & education profile integration', 'Project requirements bulletin'],
      roles: ['student', 'faculty'], // Strictly Student & Faculty only
    },
    {
      id: 'attain',
      title: 'Attain — Course Outcome Analytics',
      subtitle: 'Course Outcome (CO) attainment analytics, NBA/NAAC compliance, and pedagogical interventions.',
      icon: TrendingUp,
      tag: 'NBA / NAAC Ready',
      accentColor: 'from-amber-600 to-orange-600',
      badgeBg: 'bg-amber-100 text-amber-800',
      highlights: ['Automated CO1-CO5 attainment computation', 'Early warning flag for intervention', 'PDF accreditation report export'],
      roles: ['faculty'], // Strictly Faculty only
    },
    {
      id: 'admin',
      title: 'Manage Events & Schedules',
      subtitle: 'Upload campus events, class timetables, and exam schedules with real-time AI knowledge base sync.',
      icon: CalendarCheck2,
      tag: 'Admin & AI Sync',
      accentColor: 'from-purple-600 to-violet-700',
      badgeBg: 'bg-purple-100 text-purple-800',
      highlights: ['Upload events, posters & venues', 'Class timetable CSV import & weekly grid', 'Live grounding sync to Ask Campus AI'],
      roles: ['admin'], // Strictly Admin only
    },
  ];

  // Strictly filter modules matching user's active role
  const permittedModuleCards = allModuleCards.filter(card =>
    card.roles.includes(currentUser.role)
  );

  // Role-specific quick links (Strictly matching permissions)
  const getRoleQuickLinks = () => {
    switch (currentUser.role) {
      case 'faculty':
        return [
          {
            title: 'Upload Assessment Data (COs)',
            desc: 'Map CSV or student scores to Course Outcomes for NBA compliance',
            icon: FileCheck2,
            action: () => setActiveTab('attain'),
          },
          {
            title: 'Review Potential Research Collaborators',
            desc: 'View AI-matched student and faculty partners for new grants',
            icon: Users2,
            action: () => setActiveTab('collaborate'),
          },
          {
            title: 'Check Low-Attainment CO Interventions',
            desc: 'Identify topics below 60% threshold requiring remedial tutorials',
            icon: AlertTriangle,
            action: () => setActiveTab('attain'),
          },
          {
            title: 'Office Hours & Hallway Navigation',
            desc: 'Locate department rooms and lecture halls on indoor map',
            icon: MapPin,
            action: () => setActiveTab('navigate'),
          },
        ];

      case 'visitor':
        return [
          {
            title: 'Step-Free Campus Tour',
            desc: 'Begin audio-guided accessible route across campus buildings',
            icon: Compass,
            action: () => setActiveTab('navigate'),
          },
          {
            title: 'Visitor Parking Lot B Directions',
            desc: 'Navigate to designated guest EV & accessible parking bays',
            icon: MapPin,
            action: () => setActiveTab('navigate'),
          },
          {
            title: 'Ask Visitor FAQs',
            desc: 'Inquire about campus Wi-Fi, dining hours, and visitor badge protocols',
            icon: HelpCircle,
            action: () => setActiveTab('ask'),
          },
          {
            title: 'Central Library Guest Hours',
            desc: 'Review public reading access guidelines and digital commons',
            icon: BookOpen,
            action: () => setActiveTab('ask'),
          },
        ];

      case 'admin':
        return [
          {
            title: 'Upload Campus Event / Poster',
            desc: 'Publish university workshop, guest lecture, or hackathon',
            icon: CalendarCheck2,
            action: () => setActiveTab('admin'),
          },
          {
            title: 'Manage Class Timetables',
            desc: 'Update weekly lecture grid and departmental room allocations',
            icon: Clock,
            action: () => setActiveTab('admin'),
          },
          {
            title: 'Update Exam Schedules & Venues',
            desc: 'Publish midterm and final examination datesheets with instant AI sync',
            icon: FileCheck2,
            action: () => setActiveTab('admin'),
          },
          {
            title: 'Campus Navigation & Tactile Pathways',
            desc: 'Inspect indoor and outdoor accessible routing nodes',
            icon: MapPin,
            action: () => setActiveTab('navigate'),
          },
        ];

      default: // student
        return [
          {
            title: "Today's Timetable & Lecture Rooms",
            desc: 'Check CS301 & AI402 class timings in Alan Turing Hall',
            icon: Calendar,
            action: () => setActiveTab('ask'),
          },
          {
            title: 'Find Nearest Study Carrel or Lab',
            desc: 'Get step-free directions to quiet zones in Tagore Library',
            icon: MapPin,
            action: () => setActiveTab('navigate'),
          },
          {
            title: 'Browse Open Research Projects',
            desc: 'Find faculty looking for student research assistants matching your skills',
            icon: Sparkles,
            action: () => setActiveTab('collaborate'),
          },
          {
            title: 'Ask Official Regulations & Datesheets',
            desc: 'Query official exam schedules, circulars, and campus policies',
            icon: MessageSquareCode,
            action: () => setActiveTab('ask'),
          },
        ];
    }
  };

  const quickLinks = getRoleQuickLinks();

  const getRoleHeaderBadge = () => {
    switch (currentUser.role) {
      case 'faculty':
        return { icon: School, text: 'Faculty Portal Active', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' };
      case 'visitor':
        return { icon: Users, text: 'Guest Visitor Portal Active', color: 'bg-amber-500/20 text-amber-300 border-amber-400/30' };
      case 'admin':
        return { icon: ShieldCheck, text: 'Admin Portal Active', color: 'bg-purple-500/20 text-purple-300 border-purple-400/30' };
      default:
        return { icon: GraduationCap, text: 'Student Portal Active', color: 'bg-blue-500/20 text-blue-300 border-blue-400/30' };
    }
  };

  const roleBadge = getRoleHeaderBadge();
  const RoleBadgeIcon = roleBadge.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className={`inline-flex items-center space-x-2 rounded-full px-3 py-1 text-xs font-semibold border ${roleBadge.color}`}>
            <RoleBadgeIcon className="h-3.5 w-3.5" />
            <span>{roleBadge.text}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {currentUser.department} • Connected to the unified Smart Campus AI Hub. Access real-time accessible navigation, verified institutional knowledge, research collaboration, and operations.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>WCAG 2.1 AA Compliant</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Multi-Language Audio Narration</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Verified Institutional Grounding</span>
            </div>
          </div>
        </div>

        {/* Decorative background grid */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 0 L100 100 M20 0 L100 80 M40 0 L100 60" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>

      {/* Role-Specific Allowed Module Cards */}
      <section aria-labelledby="core-modules-heading">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="core-modules-heading" className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Your Accessible Campus Modules</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {permittedModuleCards.length} {permittedModuleCards.length === 1 ? 'Module' : 'Modules'}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Role-authorized services available for your session ({currentUser.role.toUpperCase()})
            </p>
          </div>
        </div>

        <div
          className={`grid gap-6 ${
            permittedModuleCards.length === 2
              ? 'grid-cols-1 md:grid-cols-2 max-w-4xl'
              : permittedModuleCards.length === 3
              ? 'grid-cols-1 md:grid-cols-3'
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}
        >
          {permittedModuleCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                id={`module-card-${card.id}`}
                onClick={() => {
                  setActiveTab(card.id);
                  announce(`Opened module: ${card.title}`);
                }}
                className="group relative flex flex-col justify-between rounded-2xl bg-white p-6 shadow-md shadow-slate-200/50 border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-blue-600"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-tr ${card.accentColor} text-white shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`text-3xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${card.badgeBg}`}>
                      {card.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {card.subtitle}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    {card.highlights.map((h, i) => (
                      <div key={i} className="flex items-center space-x-2 text-3xs text-slate-500 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>Launch Module</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Role-Specific Quick Links & Campus Broadcasts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Role Quick Links (2 Columns) */}
        <section aria-labelledby="role-quicklinks-heading" className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 id="role-quicklinks-heading" className="text-lg font-bold text-slate-900">
                {t.common.quickLinks} for {currentUser.role.toUpperCase()}
              </h2>
              <p className="text-xs text-slate-500">
                Frequently accessed tasks and personalized shortcuts
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full capitalize">
              Active: {currentUser.role}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((ql, idx) => {
              const Icon = ql.icon;
              return (
                <button
                  key={idx}
                  id={`quick-link-${idx}`}
                  type="button"
                  onClick={ql.action}
                  className="flex items-start space-x-3.5 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-2xs hover:border-blue-400 hover:shadow-md transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 hover:text-blue-600">
                      {ql.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {ql.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Official Campus Bulletins / Alerts (1 Column) */}
        <section aria-labelledby="campus-bulletin-heading">
          <div className="mb-4">
            <h2 id="campus-bulletin-heading" className="text-lg font-bold text-slate-900">
              Campus Intelligence Bulletin
            </h2>
            <p className="text-xs text-slate-500">
              Verified operational notices & accreditation timeline
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
              <div className="flex items-center space-x-2 text-amber-800 text-xs font-bold">
                <Clock className="h-4 w-4" />
                <span>Fall 2026 Midterm Exams</span>
              </div>
              <p className="mt-1 text-xs text-amber-900/80">
                Examinations begin Oct 12. Ground floor accessible seating allocated in Turing Hall (TH-G01).
              </p>
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3">
              <div className="flex items-center space-x-2 text-blue-800 text-xs font-bold">
                <Award className="h-4 w-4" />
                <span>NBA Accreditation Review</span>
              </div>
              <p className="mt-1 text-xs text-blue-900/80">
                Departmental Course Outcome attainment reports for CS301 are ready for faculty sign-off.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
              <div className="flex items-center space-x-2 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Elevator E01 Service Check</span>
              </div>
              <p className="mt-1 text-xs text-emerald-900/80">
                Alan Turing Central Glass Elevator fully certified and operational with speech audio chimes.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
