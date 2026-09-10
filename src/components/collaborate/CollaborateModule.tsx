import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';
import {
  ResearchProfile,
  ResearchProject,
  CollaborationRequest,
  AIResearchMatch,
} from '../../types';
import {
  Users2,
  Sparkles,
  Search,
  Filter,
  BookOpen,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Building,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  FileText,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

export const CollaborateModule: React.FC = () => {
  const { t, announce } = useAccessibility();
  const { currentUser } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'matches' | 'directory' | 'projects' | 'myProfile' | 'requests'>('matches');

  const [profiles, setProfiles] = useState<ResearchProfile[]>([]);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [collabRequests, setCollabRequests] = useState<CollaborationRequest[]>([]);
  const [aiMatches, setAiMatches] = useState<AIResearchMatch[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  // Selected Profile for detail modal
  const [selectedProfile, setSelectedProfile] = useState<ResearchProfile | null>(null);

  // Send Collaboration Request Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteReceiver, setInviteReceiver] = useState<ResearchProfile | null>(null);
  const [inviteProjectTitle, setInviteProjectTitle] = useState('');
  const [inviteRole, setInviteRole] = useState('Co-Researcher');
  const [inviteMessage, setInviteMessage] = useState('');

  // Post a Requirement Modal
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectDepartment, setNewProjectDepartment] = useState('Computer Science & Engineering');
  const [newProjectSkills, setNewProjectSkills] = useState('');
  const [newProjectRole, setNewProjectRole] = useState('Research Assistant (10 hrs/week)');

  // My Profile Editing
  const [myProfile, setMyProfile] = useState<ResearchProfile | null>(null);
  const [isEditingMyProfile, setIsEditingMyProfile] = useState(false);
  const [profileBio, setProfileBio] = useState('');
  const [profileInterests, setProfileInterests] = useState('');
  const [profileSkills, setProfileSkills] = useState('');
  const [profileEquipment, setProfileEquipment] = useState('');
  const [profileOpenForCollab, setProfileOpenForCollab] = useState(true);

  // Load Data
  useEffect(() => {
    fetch('/api/collaborate/profiles')
      .then(res => res.json())
      .then(data => {
        setProfiles(data || []);
        const mine = data.find((p: ResearchProfile) => p.userId === currentUser.id);
        if (mine) {
          setMyProfile(mine);
          setProfileBio(mine.bio);
          setProfileInterests(mine.interests.join(', '));
          setProfileSkills(mine.skills.join(', '));
          setProfileEquipment((mine.equipmentAccess || []).join(', '));
          setProfileOpenForCollab(mine.openForCollaboration);
        }
      })
      .catch(err => console.error('Failed to load profiles:', err));

    fetch('/api/collaborate/projects')
      .then(res => res.json())
      .then(data => setProjects(data || []))
      .catch(err => console.error('Failed to load projects:', err));

    fetch('/api/collaborate/requests')
      .then(res => res.json())
      .then(data => setCollabRequests(data || []))
      .catch(err => console.error('Failed to load requests:', err));

    // Fetch AI Matches for Current User
    fetchMatches();
  }, [currentUser]);

  const fetchMatches = async () => {
    setIsLoadingMatches(true);
    try {
      const res = await fetch('/api/collaborate/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      const data = await res.json();
      setAiMatches(data.matches || []);
    } catch (err) {
      console.error('Failed to fetch AI matches:', err);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  // Filtered Profiles
  const filteredProfiles = profiles.filter(p => {
    const matchesDept = departmentFilter === 'All' || p.department === departmentFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q) ||
      p.interests.some(i => i.toLowerCase().includes(q)) ||
      p.skills.some(s => s.toLowerCase().includes(q));
    return matchesDept && matchesSearch;
  });

  // Handle Send Collab Request
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteReceiver) return;

    try {
      const res = await fetch('/api/collaborate/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          receiverId: inviteReceiver.userId,
          receiverName: inviteReceiver.name,
          projectTitle: inviteProjectTitle || 'Interdisciplinary Research Collaboration',
          proposedRole: inviteRole,
          message: inviteMessage,
        }),
      });

      const newReq = await res.json();
      setCollabRequests(prev => [newReq, ...prev]);
      setIsInviteModalOpen(false);
      setInviteMessage('');
      announce(`Collaboration request sent to ${inviteReceiver.name}`);
    } catch (err) {
      console.error('Failed to send invite:', err);
    }
  };

  // Handle Post Requirement / Project
  const handlePostProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/collaborate/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProjectTitle,
          description: newProjectDesc,
          department: newProjectDepartment,
          authorId: currentUser.id,
          authorName: currentUser.name,
          requiredSkills: newProjectSkills.split(',').map(s => s.trim()),
          openRoles: [newProjectRole],
        }),
      });

      const newProj = await res.json();
      setProjects(prev => [newProj, ...prev]);
      setIsNewProjectModalOpen(false);
      setNewProjectTitle('');
      setNewProjectDesc('');
      setNewProjectSkills('');
      announce(`Research project requirement posted successfully.`);
    } catch (err) {
      console.error('Failed to post project:', err);
    }
  };

  // Handle Update My Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Partial<ResearchProfile> = {
      bio: profileBio,
      interests: profileInterests.split(',').map(s => s.trim()),
      skills: profileSkills.split(',').map(s => s.trim()),
      equipmentAccess: profileEquipment.split(',').map(s => s.trim()),
      openForCollaboration: profileOpenForCollab,
    };

    try {
      const res = await fetch(`/api/collaborate/profiles/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      setMyProfile(data);
      setIsEditingMyProfile(false);
      announce('Research profile updated successfully.');
      fetchMatches();
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  // Handle Accept/Decline Request
  const handleRespondRequest = async (requestId: string, newStatus: 'accepted' | 'declined') => {
    try {
      const res = await fetch(`/api/collaborate/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const updated = await res.json();
      setCollabRequests(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      announce(`Collaboration invitation ${newStatus}`);
    } catch (err) {
      console.error('Failed to respond to request:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users2 className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              {t.modules.collaborate.title}
            </h1>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-3xs font-bold px-2.5 py-0.5 border border-emerald-200">
              AI Matchmaking Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.modules.collaborate.subtitle}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            id="btn-post-requirement"
            type="button"
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-2xs"
          >
            <Plus className="h-4 w-4" />
            <span>Post Research Requirement</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'matches', label: 'AI Recommended Matches', icon: Sparkles, count: aiMatches.length },
          { id: 'directory', label: 'Researcher Directory', icon: Users2, count: profiles.length },
          { id: 'projects', label: 'Open Requirements', icon: FileText, count: projects.length },
          { id: 'requests', label: 'Collaboration Invites', icon: Send, count: collabRequests.length },
          { id: 'myProfile', label: 'My Research Profile', icon: GraduationCap },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`collab-tab-${tab.id}`}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-3xs ${
                  isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: AI MATCHES */}
      {/* ========================================================================= */}
      {activeSubTab === 'matches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 p-5 text-white shadow-md">
            <div>
              <h2 className="text-base font-bold flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>Explainable AI Interdisciplinary Matching</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                The algorithm analyzes skill complementarity, research methodologies, and domain crossover between faculty and student researchers.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchMatches}
              disabled={isLoadingMatches}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/30 border border-emerald-400/40 text-xs font-bold text-white hover:bg-emerald-500/50 transition-colors"
            >
              {isLoadingMatches ? 'Computing...' : 'Recalculate Matches'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiMatches.map((match, idx) => {
              const prof = match.profile;
              return (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-2xl bg-white p-5 border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all space-y-4"
                >
                  <div>
                    {/* Match Score & Department */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {prof.department}
                      </span>
                      <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>{match.matchScore}% Match</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{prof.name}</h3>
                    <p className="text-xs text-slate-500 capitalize">{prof.role}</p>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {prof.bio}
                    </p>

                    {/* AI Explainable Match Reasons */}
                    <div className="mt-4 rounded-xl bg-emerald-50/70 p-3 border border-emerald-200/80 space-y-1.5">
                      <span className="text-3xs font-bold uppercase tracking-wider text-emerald-800 block">
                        Why AI Matched This Researcher:
                      </span>
                      {match.matchReasons.map((reason, i) => (
                        <div key={i} className="flex items-start space-x-1.5 text-3xs text-emerald-900 leading-tight">
                          <Check className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>

                    {/* Skills & Equipment */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex flex-wrap gap-1">
                        {prof.skills.slice(0, 3).map((s, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-3xs font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedProfile(prof)}
                      className="flex-1 py-1.5 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-center"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInviteReceiver(prof);
                        setIsInviteModalOpen(true);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 text-center"
                    >
                      Send Invite
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: RESEARCHER DIRECTORY */}
      {/* ========================================================================= */}
      {activeSubTab === 'directory' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search researchers by name, methodology, or equipment..."
                className="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2 text-xs"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                className="rounded-xl border border-slate-300 p-2 text-xs font-semibold text-slate-700"
              >
                <option value="All">All Departments</option>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                <option value="Biomedical Informatics">Biomedical Informatics</option>
                <option value="Mathematics & Quantum Computing">Mathematics & Quantum Computing</option>
                <option value="Environmental Architecture">Environmental Architecture</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map(prof => (
              <div
                key={prof.userId}
                className="rounded-2xl bg-white p-5 border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {prof.department}
                    </span>
                    {prof.openForCollaboration && (
                      <span className="flex items-center space-x-1 text-3xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>Open to Collab</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-2">{prof.name}</h3>
                  <p className="text-xs text-slate-500 capitalize">{prof.role}</p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{prof.bio}</p>

                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <p className="text-3xs font-bold uppercase text-slate-400 mb-1">Publications:</p>
                    <p className="text-xs text-slate-700 font-medium">
                      {prof.publications.length} peer-reviewed works listed
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProfile(prof)}
                    className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInviteReceiver(prof);
                      setIsInviteModalOpen(true);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: OPEN REQUIREMENTS / PROJECTS */}
      {/* ========================================================================= */}
      {activeSubTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Campus Research Opportunities & Lab Openings
            </h2>
            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(true)}
              className="flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl hover:bg-emerald-100"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Post New Opportunity</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map(proj => (
              <div
                key={proj.id}
                className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-bold uppercase tracking-wider text-slate-400">
                    {proj.department}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-3xs font-bold uppercase bg-emerald-100 text-emerald-800">
                    {proj.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{proj.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

                <div className="pt-2">
                  <span className="text-3xs font-bold uppercase text-slate-400 block mb-1">
                    Required Skills / Tools:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.requiredSkills.map((sk, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-3xs font-semibold">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Instant AI Matched Profiles for this project */}
                {proj.matchedProfiles && proj.matchedProfiles.length > 0 && (
                  <div className="mt-3 rounded-xl bg-slate-50 p-3 border border-slate-200">
                    <span className="text-3xs font-bold uppercase text-emerald-800 block mb-1.5 flex items-center space-x-1">
                      <Sparkles className="h-3 w-3 text-emerald-600" />
                      <span>AI Ranked Candidates on Campus:</span>
                    </span>
                    <div className="space-y-1">
                      {proj.matchedProfiles.map((mp, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-0.5">
                          <span className="font-semibold text-slate-800">{mp.profile.name}</span>
                          <span className="text-3xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {mp.matchScore}% Match
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Author: {proj.authorName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setInviteReceiver(profiles.find(p => p.userId === proj.authorId) || profiles[0]);
                      setInviteProjectTitle(proj.title);
                      setIsInviteModalOpen(true);
                    }}
                    className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                  >
                    Apply / Collaborate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: COLLABORATION INVITES / REQUESTS */}
      {/* ========================================================================= */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            Active Research Collaboration Invitations
          </h2>

          <div className="space-y-3">
            {collabRequests.map(req => {
              const isReceiver = req.receiverId === currentUser.id;
              return (
                <div
                  key={req.id}
                  className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900">{req.projectTitle}</span>
                      <span className={`text-3xs font-bold uppercase px-2 py-0.5 rounded-full ${
                        req.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'declined' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      From: <strong>{req.senderName}</strong> ({req.senderRole}) • Proposed Role: <strong>{req.proposedRole}</strong>
                    </p>
                    {req.message && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-xl">
                        "{req.message}"
                      </p>
                    )}
                  </div>

                  {isReceiver && req.status === 'pending' && (
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleRespondRequest(req.id, 'declined')}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRespondRequest(req.id, 'accepted')}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        Accept
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 5: MY PROFILE */}
      {/* ========================================================================= */}
      {activeSubTab === 'myProfile' && (
        <div className="max-w-2xl mx-auto rounded-2xl bg-white p-6 border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{currentUser.name}</h2>
              <p className="text-xs text-slate-500">{currentUser.department} • Role: {currentUser.role}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingMyProfile(!isEditingMyProfile)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold"
            >
              {isEditingMyProfile ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bio / Research Summary</label>
              <textarea
                disabled={!isEditingMyProfile}
                rows={3}
                value={profileBio}
                onChange={e => setProfileBio(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Research Interests / Methodology Tags (comma-separated)
              </label>
              <input
                type="text"
                disabled={!isEditingMyProfile}
                value={profileInterests}
                onChange={e => setProfileInterests(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Core Skills & Tools (comma-separated)
              </label>
              <input
                type="text"
                disabled={!isEditingMyProfile}
                value={profileSkills}
                onChange={e => setProfileSkills(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Available Equipment & Lab Access (comma-separated)
              </label>
              <input
                type="text"
                disabled={!isEditingMyProfile}
                value={profileEquipment}
                onChange={e => setProfileEquipment(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 disabled:bg-slate-50"
              />
            </div>

            <div className="pt-1">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  disabled={!isEditingMyProfile}
                  checked={profileOpenForCollab}
                  onChange={e => setProfileOpenForCollab(e.target.checked)}
                  className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-800">
                  Open for interdisciplinary collaboration invitations
                </span>
              </label>
            </div>

            {isEditingMyProfile && (
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Save Research Profile
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Modal: View Full Researcher Details */}
      {selectedProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProfile(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 font-bold text-lg">
                {selectedProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedProfile.name}</h3>
                <p className="text-xs text-slate-500">{selectedProfile.department} • {selectedProfile.role}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-700 mb-1">Biography</h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedProfile.bio}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 mb-1">Research Interests & Methods</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProfile.interests.map((it, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-3xs font-semibold">
                      {it}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 mb-1">Publications</h4>
                <div className="space-y-1.5">
                  {selectedProfile.publications.map((pub, i) => (
                    <div key={i} className="p-2 rounded-lg border border-slate-200 bg-slate-50/50">
                      <p className="font-bold text-slate-900">{pub.title} ({pub.year})</p>
                      <p className="text-3xs text-slate-500">{pub.venue} • {pub.citations} citations</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setInviteReceiver(selectedProfile);
                    setSelectedProfile(null);
                    setIsInviteModalOpen(true);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Send Collaboration Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Send Collaboration Invitation */}
      {isInviteModalOpen && inviteReceiver && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Invite {inviteReceiver.name} to Collaborate
            </h3>
            <p className="text-xs text-slate-500 mb-4">{inviteReceiver.department}</p>

            <form onSubmit={handleSendInvite} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project or Research Topic</label>
                <input
                  type="text"
                  required
                  value={inviteProjectTitle}
                  onChange={e => setInviteProjectTitle(e.target.value)}
                  placeholder="e.g. Brain-Computer Interface Signal Processing"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proposed Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 font-semibold text-slate-800"
                >
                  <option value="Co-Principal Investigator">Co-Principal Investigator</option>
                  <option value="Research Fellow / Postdoc">Research Fellow / Postdoc</option>
                  <option value="Graduate Research Assistant">Graduate Research Assistant</option>
                  <option value="Domain Subject Expert">Domain Subject Expert</option>
                  <option value="Undergraduate Research Student">Undergraduate Research Student</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message</label>
                <textarea
                  rows={3}
                  required
                  value={inviteMessage}
                  onChange={e => setInviteMessage(e.target.value)}
                  placeholder="Explain why your research methodologies complement each other..."
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs"
                >
                  Send Official Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Post Research Requirement */}
      {isNewProjectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <button
              onClick={() => setIsNewProjectModalOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Post Research Project / Lab Requirement
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Our AI engine will rank and match campus researchers with complementary skills
            </p>

            <form onSubmit={handlePostProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={newProjectTitle}
                  onChange={e => setNewProjectTitle(e.target.value)}
                  placeholder="e.g. Privacy-Preserving Federated Learning for Medical IoT"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description & Objectives</label>
                <textarea
                  rows={3}
                  required
                  value={newProjectDesc}
                  onChange={e => setNewProjectDesc(e.target.value)}
                  placeholder="Summarize research problem and scope..."
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={newProjectDepartment}
                    onChange={e => setNewProjectDepartment(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Open Role</label>
                  <input
                    type="text"
                    value={newProjectRole}
                    onChange={e => setNewProjectRole(e.target.value)}
                    placeholder="e.g. Student Research Assistant"
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Required Skills (comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={newProjectSkills}
                  onChange={e => setNewProjectSkills(e.target.value)}
                  placeholder="PyTorch, Differential Privacy, Python"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xs"
                >
                  Publish & Match Candidates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
