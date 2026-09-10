import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { UserRole } from '../../types';
import { ShieldCheck, GraduationCap, School, Users, X, Check, Lock } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, availableUsers, loginAs } = useAuth();
  const { t, announce } = useAccessibility();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  if (!isLoginModalOpen) return null;

  const roleConfigs = [
    {
      role: 'student' as UserRole,
      title: t.common.student,
      desc: 'Access campus navigation, timetables, and collaborate with researchers.',
      icon: GraduationCap,
      color: 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/20 text-blue-700',
    },
    {
      role: 'faculty' as UserRole,
      title: t.common.faculty,
      desc: 'Manage courses, upload assessment data, and review AI collaborator matches.',
      icon: School,
      color: 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-700',
    },
    {
      role: 'visitor' as UserRole,
      title: t.common.visitor,
      desc: 'Step-free campus tours, visitor parking guide, and general institutional FAQ.',
      icon: Users,
      color: 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/20 text-amber-700',
    },
    {
      role: 'admin' as UserRole,
      title: t.common.admin,
      desc: 'Full console authority over floor plans, verified documents, and tickets.',
      icon: ShieldCheck,
      color: 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/20 text-purple-700',
    },
  ];

  const handleQuickLogin = (role: UserRole) => {
    const user = availableUsers.find(u => u.role === role);
    if (user) {
      loginAs(user);
      announce(`Signed in as ${user.name} (${user.role})`);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      id: `usr_${Date.now()}`,
      name: customName || `${selectedRole.toUpperCase()} User`,
      email: customEmail || `${selectedRole}@campus.edu`,
      role: selectedRole,
      department: selectedRole === 'visitor' ? 'Campus Visitor' : 'Engineering Department',
      languagePreference: 'en' as const,
    };
    loginAs(newUser);
    announce(`Signed in as ${newUser.name}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <button
          id="btn-close-login-modal"
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          aria-label={t.common.close}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h2 id="login-modal-title" className="text-xl font-bold text-slate-900">
              Institutional Single Sign-On (SSO)
            </h2>
            <p className="text-xs text-slate-500">
              Select your role to explore role-specific permissions and dashboards
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          {roleConfigs.map(({ role, title, desc, icon: Icon, color }) => {
            const isCurrent = selectedRole === role;
            return (
              <button
                key={role}
                id={`role-btn-${role}`}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`relative flex flex-col rounded-xl border-2 p-3 text-left transition-all focus:outline-hidden focus:ring-2 focus:ring-blue-600 ${
                  isCurrent ? `${color} shadow-xs ring-1 ring-blue-500/30` : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold text-sm text-slate-900">{title}</span>
                  </div>
                  {isCurrent && <Check className="h-4 w-4 text-blue-600" />}
                </div>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{desc}</p>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickLogin(role);
                    }}
                    className="w-full rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700 border border-slate-300 shadow-2xs hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                  >
                    1-Click Demo Login
                  </button>
                </div>
              </button>
            );
          })}
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Or Login with Campus Credentials
          </h3>
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Dr. Jane Doe"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-600 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Campus Email ID
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="name@campus.edu"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-blue-600 focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 focus:outline-hidden"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-5 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              >
                Authenticate as {selectedRole.toUpperCase()}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
