import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole, EducationDetail } from '../../types';
import {
  GraduationCap,
  School,
  ShieldCheck,
  X,
  Lock,
  Mail,
  User as UserIcon,
  Tag,
  Plus,
  Trash2,
  Check,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Briefcase,
  BookOpen,
} from 'lucide-react';

const CAMPUS_DEPARTMENTS = [
  'Computer Science & Engineering',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology & Cyber Systems',
  'Biotechnology & Biomedical Engineering',
];

const STUDENT_YEARS = [
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Junior)',
  '4th Year (Senior)',
  'Master\'s / Postgraduate (1st Year)',
  'Master\'s / Postgraduate (2nd Year)',
];

const COMMON_FACULTY_SKILLS = [
  'Deep Learning',
  'Autonomous Navigation',
  'Computer Vision',
  'Natural Language Processing',
  'Distributed Systems',
  'IoT & Sensor Networks',
  'Robotics & Control',
  'Cyber-Physical Systems',
  'Quantum Computing',
  'Bioinformatics',
];

export const RoleAuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    selectedRole,
    clearRoleSelection,
    loginWithRole,
    signupWithRole,
    availableUsers,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Student Fields
  const [studentDept, setStudentDept] = useState('Computer Science & Engineering');
  const [studentYear, setStudentYear] = useState('1st Year (Freshman)');

  // Faculty Fields
  const [facultySkills, setFacultySkills] = useState<string[]>([]);
  const [customFacultySkill, setCustomFacultySkill] = useState('');
  const [educationList, setEducationList] = useState<EducationDetail[]>([
    {
      degree: 'Ph.D.',
      specialization: 'Artificial Intelligence',
      institution: 'Carnegie Mellon University',
      yearsExperience: 8,
    },
  ]);

  // Reset when role changes
  useEffect(() => {
    setError(null);
    if (selectedRole === 'student') {
      setStudentDept('Computer Science & Engineering');
      setStudentYear('1st Year (Freshman)');
      setName('New Student');
      setEmail('');
      setPassword('');
    } else if (selectedRole === 'faculty') {
      setFacultySkills(['Deep Learning', 'Autonomous Navigation']);
      setName('Dr. Faculty Member');
      setEmail('');
      setPassword('');
    } else if (selectedRole === 'admin') {
      setName('Campus Administrator');
      setEmail('');
      setPassword('');
    }
  }, [selectedRole]);

  if (!isAuthModalOpen || !selectedRole || selectedRole === 'visitor') {
    return null;
  }

  // Pre-configured demo user for 1-click testing
  const demoUser = availableUsers.find(u => u.role === selectedRole);

  const handleQuickDemoLogin = async () => {
    if (!demoUser) return;
    setIsLoading(true);
    setError(null);
    try {
      await loginWithRole(selectedRole, { email: demoUser.email });
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Add / Remove Education row (Faculty only)
  const handleAddEducation = () => {
    setEducationList(prev => [
      ...prev,
      { degree: '', specialization: '', institution: '', yearsExperience: 0 },
    ]);
  };

  const handleRemoveEducation = (index: number) => {
    if (educationList.length <= 1) return;
    setEducationList(prev => prev.filter((_, i) => i !== index));
  };

  const handleEducationChange = (index: number, field: keyof EducationDetail, value: any) => {
    setEducationList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Faculty Skill toggles
  const toggleFacultySkill = (skill: string) => {
    setFacultySkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomFacultySkill = () => {
    if (customFacultySkill.trim() && !facultySkills.includes(customFacultySkill.trim())) {
      setFacultySkills(prev => [...prev, customFacultySkill.trim()]);
      setCustomFacultySkill('');
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        await loginWithRole(selectedRole, {
          email: email.trim(),
          password,
        });
      } else {
        // Signup
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (!email.trim()) throw new Error('Please enter a valid institutional email.');

        if (selectedRole === 'student') {
          await signupWithRole({
            role: 'student',
            name: name.trim(),
            email: email.trim(),
            password,
            department: studentDept,
            studentYear: studentYear,
          });
        } else if (selectedRole === 'faculty') {
          await signupWithRole({
            role: 'faculty',
            name: name.trim(),
            email: email.trim(),
            password,
            skills: facultySkills,
            education: educationList,
            department: 'Computer Science & Engineering',
          });
        } else if (selectedRole === 'admin') {
          await signupWithRole({
            role: 'admin',
            name: name.trim(),
            email: email.trim(),
            password,
            department: 'Academic Registrar & Governance',
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleHeader = () => {
    switch (selectedRole) {
      case 'student':
        return {
          title: 'Student Portal Access',
          icon: GraduationCap,
          color: 'text-blue-500',
          bg: 'bg-blue-500/10 border-blue-500/30',
          desc: 'Access campus navigation, official AI queries, and research matchmaking.',
        };
      case 'faculty':
        return {
          title: 'Faculty Portal Access',
          icon: School,
          color: 'text-emerald-500',
          bg: 'bg-emerald-500/10 border-emerald-500/30',
          desc: 'Access navigation, official AI, research matching, and course outcome attainment.',
        };
      case 'admin':
        return {
          title: 'Administration Portal Access',
          icon: ShieldCheck,
          color: 'text-purple-500',
          bg: 'bg-purple-500/10 border-purple-500/30',
          desc: 'Manage campus events, class timetables, and exam schedules with instant AI sync.',
        };
      default:
        return {
          title: 'Portal Access',
          icon: Lock,
          color: 'text-slate-400',
          bg: 'bg-slate-800',
          desc: '',
        };
    }
  };

  const roleMeta = getRoleHeader();
  const RoleIcon = roleMeta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl border ${roleMeta.bg}`}>
              <RoleIcon className={`w-6 h-6 ${roleMeta.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {roleMeta.title}
                <span className="text-3xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedRole}
                </span>
              </h3>
              <p className="text-xs text-slate-400">{roleMeta.desc}</p>
            </div>
          </div>
          <button
            onClick={clearRoleSelection}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Return to Role Selection"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'signin'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In with Existing Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'signup'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create New {selectedRole.toUpperCase()} Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo 1-Click Fill Button */}
          {mode === 'signin' && demoUser && (
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-xs font-semibold text-slate-200">
                    Instant Demo: {demoUser.name}
                  </div>
                  <div className="text-3xs text-slate-400">{demoUser.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-xs font-medium transition-colors cursor-pointer"
              >
                1-Click Login
              </button>
            </div>
          )}

          {/* Name Field (for signup) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {selectedRole === 'admin' ? 'Admin Name' : 'Full Name'} *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={selectedRole === 'admin' ? 'e.g. Director Marcus Vance' : 'e.g. Jane Doe'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Institutional Email ID *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={
                  selectedRole === 'student'
                    ? 'student@campus.edu'
                    : selectedRole === 'faculty'
                    ? 'faculty@campus.edu'
                    : 'admin@campus.edu'
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* STUDENT SPECIFIC: Department and Year of Student */}
          {selectedRole === 'student' && mode === 'signup' && (
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-blue-400" />
                  <span>Academic Department *</span>
                </label>
                <select
                  value={studentDept}
                  onChange={e => setStudentDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                >
                  {CAMPUS_DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-200 mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                  <span>Year of Student *</span>
                </label>
                <select
                  value={studentYear}
                  onChange={e => setStudentYear(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                >
                  {STUDENT_YEARS.map(yr => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* FACULTY SPECIFIC: Skills + Repeatable Education Section */}
          {selectedRole === 'faculty' && mode === 'signup' && (
            <div className="pt-2 border-t border-slate-800 space-y-4">
              {/* Skills / Research Expertise */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Research Expertise & Skills</span>
                  </label>
                  <span className="text-3xs text-slate-400">
                    {facultySkills.length} selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                  {COMMON_FACULTY_SKILLS.map(skill => {
                    const isSelected = facultySkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleFacultySkill(skill)}
                        className={`text-2xs px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customFacultySkill}
                    onChange={e => setCustomFacultySkill(e.target.value)}
                    placeholder="Add specific research area..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomFacultySkill}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Repeatable Education Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Education Details & Academic Credentials</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 text-3xs font-semibold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Another Degree</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {educationList.map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 relative"
                    >
                      <div className="flex items-center justify-between text-3xs text-slate-400 font-semibold uppercase tracking-wider">
                        <span>Credential #{idx + 1}</span>
                        {educationList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(idx)}
                            className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-3xs text-slate-400 block mb-0.5">Degree</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Ph.D. / M.Tech"
                            value={edu.degree}
                            onChange={e =>
                              handleEducationChange(idx, 'degree', e.target.value)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200 placeholder-slate-500"
                          />
                        </div>
                        <div>
                          <label className="text-3xs text-slate-400 block mb-0.5">
                            Specialization
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Robotics & AI"
                            value={edu.specialization}
                            onChange={e =>
                              handleEducationChange(idx, 'specialization', e.target.value)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200 placeholder-slate-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="text-3xs text-slate-400 block mb-0.5">
                            Institution
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Stanford / IIT / MIT"
                            value={edu.institution}
                            onChange={e =>
                              handleEducationChange(idx, 'institution', e.target.value)
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200 placeholder-slate-500"
                          />
                        </div>
                        <div>
                          <label className="text-3xs text-slate-400 block mb-0.5">
                            Experience (Yrs)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={edu.yearsExperience}
                            onChange={e =>
                              handleEducationChange(
                                idx,
                                'yearsExperience',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={clearRoleSelection}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Back to Role Selection
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedRole === 'student'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : selectedRole === 'faculty'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-purple-600 hover:bg-purple-700'
              } disabled:opacity-50`}
            >
              <span>
                {isLoading
                  ? 'Processing...'
                  : mode === 'signin'
                  ? `Enter ${selectedRole.toUpperCase()} Dashboard`
                  : `Create Account & Enter`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
