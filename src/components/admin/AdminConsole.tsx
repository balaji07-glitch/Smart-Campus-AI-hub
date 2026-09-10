import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  MapPin,
  FileCheck2,
  Users2,
  LifeBuoy,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Edit,
  Search,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { KBDocument, HelpdeskTicket, CampusRoom, ResearchProfile } from '../../types';

export const AdminConsole: React.FC = () => {
  const { t, announce } = useAccessibility();
  const { currentUser } = useAuth();

  const [activeAdminTab, setActiveAdminTab] = useState<'kb' | 'tickets' | 'rooms' | 'profiles'>('kb');

  // KB State
  const [kbDocs, setKbDocs] = useState<KBDocument[]>([]);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('Academic Circulars');
  const [newDocVerifiedBy, setNewDocVerifiedBy] = useState('Office of the Dean of Academic Affairs');
  const [newDocContent, setNewDocContent] = useState('');
  const [newDocSummary, setNewDocSummary] = useState('');

  // Tickets State
  const [tickets, setTickets] = useState<HelpdeskTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<HelpdeskTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Rooms State
  const [rooms, setRooms] = useState<CampusRoom[]>([]);

  // Profiles State
  const [profiles, setProfiles] = useState<ResearchProfile[]>([]);

  // Load all admin datasets
  useEffect(() => {
    fetch('/api/ask/knowledge-base')
      .then(r => r.json())
      .then(d => setKbDocs(d || []));

    fetch('/api/ask/tickets')
      .then(r => r.json())
      .then(d => setTickets(d || []));

    fetch('/api/navigate/map-data')
      .then(r => r.json())
      .then(d => setRooms(d.rooms || []));

    fetch('/api/collaborate/profiles')
      .then(r => r.json())
      .then(d => setProfiles(d || []));
  }, []);

  // Add KB Doc
  const handleAddKBDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/ask/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newDocTitle,
          category: newDocCategory,
          verifiedBy: newDocVerifiedBy,
          content: newDocContent,
          summary: newDocSummary,
          tags: [newDocCategory.toLowerCase(), 'official', 'verified'],
        }),
      });
      const created = await res.json();
      setKbDocs(prev => [created, ...prev]);
      setIsAddDocOpen(false);
      setNewDocTitle('');
      setNewDocContent('');
      setNewDocSummary('');
      announce(`Document "${created.title}" added to verified knowledge base.`);
    } catch (err) {
      console.error('Failed to add document:', err);
    }
  };

  // Delete KB Doc
  const handleDeleteKBDoc = async (id: string) => {
    if (!confirm('Are you sure you want to remove this verified document?')) return;
    try {
      await fetch(`/api/ask/knowledge-base/${id}`, { method: 'DELETE' });
      setKbDocs(prev => prev.filter(d => d.id !== id));
      announce('Document removed.');
    } catch (err) {
      console.error('Failed to delete doc:', err);
    }
  };

  // Resolve Ticket
  const handleResolveTicket = async (ticketId: string) => {
    try {
      const res = await fetch(`/api/ask/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'resolved',
          resolutionNotes: resolutionNotes || 'Resolved by Campus Administration Officer.',
        }),
      });
      const updated = await res.json();
      setTickets(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      setSelectedTicket(null);
      setResolutionNotes('');
      announce(`Ticket ${ticketId} resolved.`);
    } catch (err) {
      console.error('Failed to resolve ticket:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-purple-600" />
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              {t.modules.admin.title}
            </h1>
            <span className="rounded-full bg-purple-100 text-purple-800 text-3xs font-bold px-2.5 py-0.5 border border-purple-200">
              Staff Authority Level
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.modules.admin.subtitle}
          </p>
        </div>

        {/* Global Admin Stat Chips */}
        <div className="flex items-center space-x-3 text-xs font-semibold text-slate-600">
          <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            {kbDocs.length} Verified Docs
          </span>
          <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            {tickets.filter(t => t.status === 'open').length} Open Tickets
          </span>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'kb', label: 'Verified Knowledge Base', icon: FileCheck2, count: kbDocs.length },
          { id: 'tickets', label: 'Staff Helpdesk Escalations', icon: LifeBuoy, count: tickets.length },
          { id: 'rooms', label: 'Campus Map & Accessibility Tags', icon: MapPin, count: rooms.length },
          { id: 'profiles', label: 'Faculty & Research Profiles', icon: Users2, count: profiles.length },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`admin-tab-${tab.id}`}
              type="button"
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-50 text-purple-700 border border-purple-300 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-3xs ${
                  isActive ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: VERIFIED KB MANAGEMENT */}
      {/* ========================================================================= */}
      {activeAdminTab === 'kb' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Verified Documents for RAG AI Assistant
              </h2>
              <p className="text-xs text-slate-500">
                Only documents catalogued here are used to answer user questions with zero hallucination.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddDocOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-xs font-bold shadow-2xs"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Verified Circular</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kbDocs.map(doc => (
              <div
                key={doc.id}
                className="rounded-2xl bg-white p-5 border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800">
                      {doc.category}
                    </span>
                    <span className="text-3xs text-slate-400">Verified: {doc.lastUpdated}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-2">{doc.title}</h3>
                  <p className="text-xs text-slate-500 font-medium">Authority: {doc.verifiedBy}</p>
                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-3">
                    {doc.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-3xs text-emerald-600 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Active in RAG Grounding</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteKBDoc(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    aria-label="Delete document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STAFF HELPDESK ESCALATIONS */}
      {/* ========================================================================= */}
      {activeAdminTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Escalated Unanswered Queries & Helpdesk Inquiries
              </h2>
              <p className="text-xs text-slate-500">
                Inquiries escalated by the Ask AI chatbot when verified confidence fell below benchmark
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {tickets.map(tkt => (
              <div
                key={tkt.id}
                className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">Ticket #{tkt.id}</span>
                    <span className={`text-3xs font-bold uppercase px-2 py-0.5 rounded-full ${
                      tkt.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tkt.status}
                    </span>
                    <span className="text-3xs text-slate-400">• {tkt.createdAt}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">
                    "{tkt.query}"
                  </p>
                  <p className="text-3xs text-slate-500">
                    From: {tkt.userName} ({tkt.userEmail}) • Department: <strong>{tkt.department}</strong>
                  </p>
                  {tkt.resolutionNotes && (
                    <p className="text-3xs text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      <strong>Resolution:</strong> {tkt.resolutionNotes}
                    </p>
                  )}
                </div>

                {tkt.status === 'open' && (
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(tkt)}
                    className="px-4 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 whitespace-nowrap shadow-xs"
                  >
                    Respond & Resolve
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ROOMS & ACCESSIBILITY TAG AUDIT */}
      {/* ========================================================================= */}
      {activeAdminTab === 'rooms' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            Campus Rooms & Accessibility Tag Audit ({rooms.length} registered locations)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rooms.map(rm => (
              <div key={rm.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{rm.roomNumber}</span>
                  <span className="text-3xs uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {rm.type}
                  </span>
                </div>
                <p className="font-semibold text-slate-800">{rm.name}</p>
                <p className="text-3xs text-slate-500">{rm.department} • Floor {rm.floor}</p>
                <div className="pt-2 flex flex-wrap gap-1">
                  {rm.accessibilityTags.map(tag => (
                    <span key={tag} className="text-3xs px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                      ✓ {tag.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FACULTY & RESEARCH PROFILES */}
      {/* ========================================================================= */}
      {activeAdminTab === 'profiles' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            Registered Campus Researchers & Interdisciplinary Profiles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profiles.map(p => (
              <div key={p.userId} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{p.name}</span>
                  <span className="text-3xs text-slate-500 capitalize">{p.role}</span>
                </div>
                <p className="text-3xs text-slate-400">{p.department}</p>
                <p className="text-slate-600 line-clamp-2">{p.bio}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {p.skills.map((s, i) => (
                    <span key={i} className="text-3xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add New Verified Knowledge Base Document */}
      {isAddDocOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <button
              onClick={() => setIsAddDocOpen(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Add Verified Institutional Document
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              All documents entered here are indexed into the RAG Chatbot with official citations
            </p>

            <form onSubmit={handleAddKBDoc} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={newDocTitle}
                  onChange={e => setNewDocTitle(e.target.value)}
                  placeholder="e.g. University Code of Conduct & Academic Integrity Policy"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newDocCategory}
                    onChange={e => setNewDocCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  >
                    <option value="Academic Circulars">Academic Circulars</option>
                    <option value="Examinations">Examinations</option>
                    <option value="Library">Library</option>
                    <option value="Housing & Hostels">Housing & Hostels</option>
                    <option value="Laboratory Safety">Laboratory Safety</option>
                    <option value="Student Welfare">Student Welfare</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Verified Authority</label>
                  <input
                    type="text"
                    required
                    value={newDocVerifiedBy}
                    onChange={e => setNewDocVerifiedBy(e.target.value)}
                    placeholder="e.g. Office of the Registrar"
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Summary / Excerpt</label>
                <input
                  type="text"
                  required
                  value={newDocSummary}
                  onChange={e => setNewDocSummary(e.target.value)}
                  placeholder="Brief 1-line summary cited in chatbot answers"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Document Text</label>
                <textarea
                  rows={5}
                  required
                  value={newDocContent}
                  onChange={e => setNewDocContent(e.target.value)}
                  placeholder="Paste official regulations, deadlines, contact personnel, and clauses..."
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDocOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700"
                >
                  Publish & Verify Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Resolve Helpdesk Ticket */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Resolve Ticket #{selectedTicket.id}
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              User: {selectedTicket.userName} ({selectedTicket.userEmail})
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 mb-3">
              "{selectedTicket.query}"
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resolution Response</label>
                <textarea
                  rows={4}
                  required
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  placeholder="Type official reply and instructions for the user..."
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleResolveTicket(selectedTicket.id)}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Mark as Resolved & Email User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
