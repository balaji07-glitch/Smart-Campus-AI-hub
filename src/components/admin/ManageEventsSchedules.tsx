import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';
import {
  CampusEvent,
  ClassTimetableEntry,
  ExamScheduleEntry,
  KBDocument,
  HelpdeskTicket,
} from '../../types';
import {
  CalendarCheck2,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Edit,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  MessageSquareCode,
  Layers,
  Search,
  BookOpen,
  Filter,
  Check,
  X,
  AlertCircle,
  Eye,
  RefreshCw,
  LifeBuoy,
} from 'lucide-react';

export const ManageEventsSchedules: React.FC = () => {
  const { announce } = useAccessibility();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'events' | 'timetables' | 'exams' | 'aiSync' | 'tickets'>('events');

  // Datasets
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [timetables, setTimetables] = useState<ClassTimetableEntry[]>([]);
  const [exams, setExams] = useState<ExamScheduleEntry[]>([]);
  const [kbDocs, setKbDocs] = useState<KBDocument[]>([]);
  const [tickets, setTickets] = useState<HelpdeskTicket[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // --- Events Modals State ---
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('10:00 AM - 04:00 PM');
  const [eventVenue, setEventVenue] = useState('');
  const [eventPoster, setEventPoster] = useState('');
  const [eventCategory, setEventCategory] = useState<CampusEvent['category']>('Workshop');
  const [eventOrganizer, setEventOrganizer] = useState('Department of Computer Science');

  // --- Timetable Modals State ---
  const [isAddTTOpen, setIsAddTTOpen] = useState(false);
  const [editingTT, setEditingTT] = useState<ClassTimetableEntry | null>(null);
  const [ttDept, setTtDept] = useState('Computer Science & Engineering');
  const [ttSem, setTtSem] = useState('Semester 5');
  const [ttDay, setTtDay] = useState<ClassTimetableEntry['dayOfWeek']>('Monday');
  const [ttSlot, setTtSlot] = useState('09:00 - 10:00');
  const [ttCourseCode, setTtCourseCode] = useState('');
  const [ttCourseName, setTtCourseName] = useState('');
  const [ttRoom, setTtRoom] = useState('TH-G01');
  const [ttFaculty, setTtFaculty] = useState('');
  const [isUploadTTModalOpen, setIsUploadTTModalOpen] = useState(false);
  const [ttCsvText, setTtCsvText] = useState('');

  // --- Exam Schedule Modals State ---
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamScheduleEntry | null>(null);
  const [examCourseCode, setExamCourseCode] = useState('');
  const [examCourseName, setExamCourseName] = useState('');
  const [examSem, setExamSem] = useState('Semester 5 (Fall 2026)');
  const [examYear, setExamYear] = useState('2026-2027');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('09:30 AM - 12:30 PM');
  const [examVenue, setExamVenue] = useState('Turing Hall - Examination Wing A');
  const [examInvigilator, setExamInvigilator] = useState('Dr. Faculty Member');
  const [isUploadExamModalOpen, setIsUploadExamModalOpen] = useState(false);
  const [examCsvText, setExamCsvText] = useState('');

  // Load all initial data
  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/admin/events').then(r => r.json()),
      fetch('/api/admin/timetables').then(r => r.json()),
      fetch('/api/admin/exams').then(r => r.json()),
      fetch('/api/ask/knowledge-base').then(r => r.json()),
      fetch('/api/ask/tickets').then(r => r.json()),
    ])
      .then(([evts, tts, exs, kbs, tkts]) => {
        setEvents(Array.isArray(evts) ? evts : []);
        setTimetables(Array.isArray(tts) ? tts : []);
        setExams(Array.isArray(exs) ? exs : []);
        setKbDocs(Array.isArray(kbs) ? kbs : []);
        setTickets(Array.isArray(tkts) ? tkts : []);
      })
      .catch(err => console.error('Failed to load admin data:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Trigger manual sync
  const handleTriggerSync = async () => {
    setSyncStatus('Synchronizing...');
    try {
      const res = await fetch('/api/admin/sync-kb', { method: 'POST' });
      const data = await res.json();
      setSyncStatus(`Successfully synchronized ${data.dynamicCount} records with Ask Campus AI.`);
      announce('Knowledge base synchronized successfully with Ask Campus AI.');
      loadData();
      setTimeout(() => setSyncStatus(null), 4000);
    } catch (e) {
      setSyncStatus('Sync failed.');
    }
  };

  // --- EVENTS HANDLERS ---
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: eventTitle,
      description: eventDesc,
      date: eventDate,
      time: eventTime,
      venue: eventVenue,
      posterImage: eventPoster,
      category: eventCategory,
      organizer: eventOrganizer,
    };

    if (editingEvent) {
      await fetch(`/api/admin/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      announce(`Event "${eventTitle}" updated.`);
    } else {
      await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      announce(`Event "${eventTitle}" created and synced to Ask Campus AI.`);
    }

    setIsAddEventOpen(false);
    setEditingEvent(null);
    resetEventForm();
    loadData();
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? This will also remove it from the Ask AI knowledge base.')) return;
    await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
    announce('Event deleted.');
    loadData();
  };

  const handleEditEventClick = (evt: CampusEvent) => {
    setEditingEvent(evt);
    setEventTitle(evt.title);
    setEventDesc(evt.description);
    setEventDate(evt.date);
    setEventTime(evt.time);
    setEventVenue(evt.venue);
    setEventPoster(evt.posterImage || '');
    setEventCategory(evt.category || 'General');
    setEventOrganizer(evt.organizer || '');
    setIsAddEventOpen(true);
  };

  const resetEventForm = () => {
    setEventTitle('');
    setEventDesc('');
    setEventDate('');
    setEventTime('10:00 AM - 04:00 PM');
    setEventVenue('');
    setEventPoster('');
    setEventCategory('Workshop');
    setEventOrganizer('Department of Computer Science');
  };

  // --- TIMETABLE HANDLERS ---
  const handleSaveTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      department: ttDept,
      semester: ttSem,
      dayOfWeek: ttDay,
      timeSlot: ttSlot,
      courseCode: ttCourseCode,
      courseName: ttCourseName,
      roomNumber: ttRoom,
      facultyName: ttFaculty,
    };

    if (editingTT) {
      await fetch(`/api/admin/timetables/${editingTT.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/admin/timetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    setIsAddTTOpen(false);
    setEditingTT(null);
    resetTTForm();
    loadData();
  };

  const handleDeleteTimetable = async (id: string) => {
    if (!confirm('Delete this timetable entry?')) return;
    await fetch(`/api/admin/timetables/${id}`, { method: 'DELETE' });
    loadData();
  };

  const resetTTForm = () => {
    setTtCourseCode('');
    setTtCourseName('');
    setTtFaculty('');
    setTtSlot('09:00 - 10:00');
  };

  const handleUploadTimetableCSV = async () => {
    if (!ttCsvText.trim()) return;
    const lines = ttCsvText.trim().split('\n');
    const entries: Partial<ClassTimetableEntry>[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.toLowerCase().startsWith('department')) continue; // skip header
      const parts = line.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 6) {
        entries.push({
          department: parts[0] || ttDept,
          semester: parts[1] || ttSem,
          dayOfWeek: (parts[2] || 'Monday') as any,
          timeSlot: parts[3] || '09:00 - 10:00',
          courseCode: parts[4] || 'CS101',
          courseName: parts[5] || parts[4],
          roomNumber: parts[6] || 'TH-G01',
          facultyName: parts[7] || 'Staff',
        });
      }
    }

    if (entries.length === 0) {
      alert('No valid CSV rows parsed. Please check the format.');
      return;
    }

    await fetch('/api/admin/timetables/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    });

    setIsUploadTTModalOpen(false);
    setTtCsvText('');
    loadData();
  };

  // --- EXAM SCHEDULE HANDLERS ---
  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      courseCode: examCourseCode,
      courseName: examCourseName,
      semester: examSem,
      academicYear: examYear,
      examDate,
      examTime,
      venue: examVenue,
      invigilator: examInvigilator,
    };

    if (editingExam) {
      await fetch(`/api/admin/exams/${editingExam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/admin/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    setIsAddExamOpen(false);
    setEditingExam(null);
    resetExamForm();
    loadData();
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm('Delete this exam schedule?')) return;
    await fetch(`/api/admin/exams/${id}`, { method: 'DELETE' });
    loadData();
  };

  const resetExamForm = () => {
    setExamCourseCode('');
    setExamCourseName('');
    setExamDate('');
  };

  const handleUploadExamCSV = async () => {
    if (!examCsvText.trim()) return;
    const lines = examCsvText.trim().split('\n');
    const entries: Partial<ExamScheduleEntry>[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.toLowerCase().startsWith('course')) continue; // skip header
      const parts = line.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 4) {
        entries.push({
          courseCode: parts[0],
          courseName: parts[1] || parts[0],
          semester: parts[2] || examSem,
          academicYear: parts[3] || examYear,
          examDate: parts[4] || '2026-11-20',
          examTime: parts[5] || '09:30 AM - 12:30 PM',
          venue: parts[6] || examVenue,
          invigilator: parts[7] || examInvigilator,
        });
      }
    }

    if (entries.length === 0) {
      alert('No valid exam rows parsed.');
      return;
    }

    await fetch('/api/admin/exams/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    });

    setIsUploadExamModalOpen(false);
    setExamCsvText('');
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Module Title Banner */}
      <div className="bg-linear-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl border border-purple-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-semibold mb-3">
            <CalendarCheck2 className="w-3.5 h-3.5" />
            <span>Admin Central Governance</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Manage Events & Schedules
          </h2>
          <p className="text-sm text-purple-200/80 mt-1 max-w-2xl">
            Upload and maintain campus events, timetables, and exam schedules. All entries automatically synchronize into verified institutional knowledge for the <strong>Ask Campus AI</strong> chatbot.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleTriggerSync}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync to Ask AI</span>
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 gap-1 bg-white p-1 rounded-xl shadow-xs">
        <button
          onClick={() => setActiveTab('events')}
          className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'events'
              ? 'bg-purple-100 text-purple-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4 text-purple-600" />
          <span>Campus Events ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timetables')}
          className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'timetables'
              ? 'bg-purple-100 text-purple-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4 text-purple-600" />
          <span>Class Timetables ({timetables.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'exams'
              ? 'bg-purple-100 text-purple-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4 text-purple-600" />
          <span>Exam Schedules ({exams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('aiSync')}
          className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'aiSync'
              ? 'bg-purple-100 text-purple-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>AI Live Feed ({kbDocs.filter(d => d.id.startsWith('dyn_')).length} auto-synced)</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`py-2.5 px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'tickets'
              ? 'bg-purple-100 text-purple-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <LifeBuoy className="w-4 h-4 text-blue-600" />
          <span>Helpdesk Escalations ({tickets.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CAMPUS EVENTS */}
      {/* ========================================================================= */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Campus Events & Announcements</h3>
              <p className="text-xs text-slate-500">
                Created events immediately become searchable facts for students and visitors asking the chatbot.
              </p>
            </div>
            <button
              onClick={() => {
                resetEventForm();
                setEditingEvent(null);
                setIsAddEventOpen(true);
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Event</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(evt => (
              <div
                key={evt.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {evt.posterImage && (
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                      <img
                        src={evt.posterImage}
                        alt={evt.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 right-3 text-3xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-xs">
                        {evt.category || 'General'}
                      </span>
                    </div>
                  )}

                  <div className="p-5">
                    <h4 className="font-bold text-base text-slate-900 mb-2">{evt.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                      {evt.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{evt.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{evt.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <span className="text-3xs text-slate-400 font-medium truncate max-w-[160px]">
                    By: {evt.organizer || 'Admin'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditEventClick(evt)}
                      className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit event"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="p-1.5 text-slate-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CLASS TIMETABLES */}
      {/* ========================================================================= */}
      {activeTab === 'timetables' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Class Timetables & Schedules</h3>
              <p className="text-xs text-slate-500">
                Departmental routine tables. When students ask "Where is my CS301 class?", Ask Campus AI retrieves this data.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsUploadTTModalOpen(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload CSV</span>
              </button>
              <button
                onClick={() => {
                  resetTTForm();
                  setEditingTT(null);
                  setIsAddTTOpen(true);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Class Slot</span>
              </button>
            </div>
          </div>

          {/* Timetable Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Day</th>
                    <th className="py-3 px-4">Time Slot</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Department & Sem</th>
                    <th className="py-3 px-4">Room / Lab</th>
                    <th className="py-3 px-4">Faculty</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {timetables.map(tt => (
                    <tr key={tt.id} className="hover:bg-purple-50/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{tt.dayOfWeek}</td>
                      <td className="py-3 px-4 font-mono text-purple-800">{tt.timeSlot}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">[{tt.courseCode}]</span> {tt.courseName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {tt.department} • <span className="font-medium">{tt.semester}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold text-slate-800 border border-slate-200">
                          {tt.roomNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{tt.facultyName}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteTimetable(tt.id)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          title="Delete slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: EXAM SCHEDULES */}
      {/* ========================================================================= */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Examination Schedules</h3>
              <p className="text-xs text-slate-500">
                Official mid-semester and final exam date sheets with exam halls and invigilators.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsUploadExamModalOpen(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload CSV</span>
              </button>
              <button
                onClick={() => {
                  resetExamForm();
                  setEditingExam(null);
                  setIsAddExamOpen(true);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Exam Entry</span>
              </button>
            </div>
          </div>

          {/* Exam Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Exam Date</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Course Code & Name</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4">Examination Hall</th>
                    <th className="py-3 px-4">Invigilator</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {exams.map(ex => (
                    <tr key={ex.id} className="hover:bg-purple-50/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{ex.examDate}</td>
                      <td className="py-3 px-4 font-mono text-purple-800">{ex.examTime}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">[{ex.courseCode}]</span> {ex.courseName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{ex.semester}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 font-semibold text-purple-800 border border-purple-200">
                          {ex.venue}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{ex.invigilator}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteExam(ex.id)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          title="Delete exam"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AI LIVE FEED (GROUNDING VERIFICATION) */}
      {/* ========================================================================= */}
      {activeTab === 'aiSync' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Grounding Verification for Ask Campus AI
              </h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                The institutional documents below were automatically generated from your uploaded Events, Timetables, and Exam Schedules. The Ask Campus AI assistant indexes these documents to answer queries strictly with verifiable citations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kbDocs
              .filter(d => d.id.startsWith('dyn_'))
              .map(doc => (
                <div
                  key={doc.id}
                  className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xs uppercase font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {doc.category}
                    </span>
                    <span className="text-3xs text-slate-400">ID: {doc.id}</span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{doc.title}</h4>
                  <p className="text-xs text-slate-600">{doc.summary}</p>

                  <div className="p-3 bg-slate-900 text-slate-200 rounded-xl text-3xs font-mono max-h-36 overflow-y-auto whitespace-pre-wrap">
                    {doc.content}
                  </div>

                  <div className="text-3xs text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span>Verified By: {doc.verifiedBy}</span>
                    <span>Updated: {doc.lastUpdated}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: HELPDESK TICKETS ESCALATED FROM AI */}
      {/* ========================================================================= */}
      {activeTab === 'tickets' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Escalated Inquiries from Ask Campus AI</h3>
            <p className="text-xs text-slate-500">
              When the AI chatbot encounters a query without verified institutional backing, it refrains from guessing and enables users to raise these tickets.
            </p>
          </div>

          <div className="space-y-3">
            {tickets.map(tkt => (
              <div
                key={tkt.id}
                className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-3xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        tkt.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {tkt.priority} Priority
                    </span>
                    <span className="text-xs font-bold text-slate-800">{tkt.category}</span>
                  </div>
                  <span className="text-3xs text-slate-400">{tkt.createdAt}</span>
                </div>

                <p className="text-xs text-slate-800 font-medium">"{tkt.query}"</p>

                <div className="text-3xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>
                    Raised by: <strong className="text-slate-700">{tkt.userName}</strong> ({tkt.userRole}) • {tkt.userEmail}
                  </span>
                  <span className="capitalize font-semibold text-purple-700">{tkt.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- ADD EVENT MODAL --- */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">
                {editingEvent ? 'Edit Event' : 'Create Campus Event'}
              </h3>
              <button
                onClick={() => setIsAddEventOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  placeholder="e.g. AI & Robotics Hackathon 2026"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={eventDesc}
                  onChange={e => setEventDesc(e.target.value)}
                  placeholder="Detailed event scope and participation guidelines..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="text"
                    required
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    placeholder="e.g. 2026-10-15 or Oct 15-17"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={eventTime}
                    onChange={e => setEventTime(e.target.value)}
                    placeholder="e.g. 09:00 AM - 05:00 PM"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Venue *</label>
                  <input
                    type="text"
                    required
                    value={eventVenue}
                    onChange={e => setEventVenue(e.target.value)}
                    placeholder="e.g. Turing Hall Auditorium"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={eventCategory}
                    onChange={e => setEventCategory(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 bg-white"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Conference">Conference</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Poster Image URL</label>
                <input
                  type="text"
                  value={eventPoster}
                  onChange={e => setEventPoster(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Organizer / Department</label>
                <input
                  type="text"
                  value={eventOrganizer}
                  onChange={e => setEventOrganizer(e.target.value)}
                  placeholder="e.g. Robotics Club & Dean of Research"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Save & Sync to Ask AI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD TIMETABLE ENTRY MODAL --- */}
      {isAddTTOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Add Class Timetable Entry</h3>
              <button onClick={() => setIsAddTTOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTimetable} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                  <input
                    type="text"
                    required
                    value={ttDept}
                    onChange={e => setTtDept(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester *</label>
                  <input
                    type="text"
                    required
                    value={ttSem}
                    onChange={e => setTtSem(e.target.value)}
                    placeholder="e.g. Semester 5"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Day of Week *</label>
                  <select
                    value={ttDay}
                    onChange={e => setTtDay(e.target.value as any)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 bg-white"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot *</label>
                  <input
                    type="text"
                    required
                    value={ttSlot}
                    onChange={e => setTtSlot(e.target.value)}
                    placeholder="e.g. 09:00 - 10:00"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    value={ttCourseCode}
                    onChange={e => setTtCourseCode(e.target.value)}
                    placeholder="e.g. CS301"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course Name *</label>
                  <input
                    type="text"
                    required
                    value={ttCourseName}
                    onChange={e => setTtCourseName(e.target.value)}
                    placeholder="e.g. Algorithms"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room / Lab *</label>
                  <input
                    type="text"
                    required
                    value={ttRoom}
                    onChange={e => setTtRoom(e.target.value)}
                    placeholder="e.g. TH-G01"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Faculty Name *</label>
                  <input
                    type="text"
                    required
                    value={ttFaculty}
                    onChange={e => setTtFaculty(e.target.value)}
                    placeholder="e.g. Dr. Elena Rostova"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTTOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Save Class Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- UPLOAD TIMETABLE CSV MODAL --- */}
      {isUploadTTModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Upload Timetable CSV</h3>
              <button onClick={() => setIsUploadTTModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Paste or type your CSV content. Format:
              <br />
              <code className="text-3xs bg-slate-100 p-1 rounded font-mono block mt-1">
                Department, Semester, Day, TimeSlot, CourseCode, CourseName, Room, Faculty
              </code>
            </p>

            <textarea
              rows={8}
              value={ttCsvText}
              onChange={e => setTtCsvText(e.target.value)}
              placeholder={`Computer Science & Engineering, Semester 5, Monday, 09:00 - 10:00, CS301, Data Structures, TH-G01, Dr. Elena Rostova\nComputer Science & Engineering, Semester 5, Monday, 10:15 - 11:15, CS302, Databases, TH-G03, Dr. Ramesh Sundaram`}
              className="w-full border border-slate-300 rounded-xl p-3 font-mono text-xs text-slate-900"
            />

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsUploadTTModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadTimetableCSV}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Parse & Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD EXAM MODAL --- */}
      {isAddExamOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Add Exam Schedule</h3>
              <button onClick={() => setIsAddExamOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    value={examCourseCode}
                    onChange={e => setExamCourseCode(e.target.value)}
                    placeholder="e.g. CS301"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Course Name *</label>
                  <input
                    type="text"
                    required
                    value={examCourseName}
                    onChange={e => setExamCourseName(e.target.value)}
                    placeholder="e.g. Algorithms"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="text"
                    value={examSem}
                    onChange={e => setExamSem(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={examYear}
                    onChange={e => setExamYear(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Date *</label>
                  <input
                    type="text"
                    required
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                    placeholder="e.g. 2026-11-20"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Time *</label>
                  <input
                    type="text"
                    required
                    value={examTime}
                    onChange={e => setExamTime(e.target.value)}
                    placeholder="e.g. 09:30 AM - 12:30 PM"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hall / Venue *</label>
                  <input
                    type="text"
                    required
                    value={examVenue}
                    onChange={e => setExamVenue(e.target.value)}
                    placeholder="e.g. Turing Hall Wing A"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Invigilator</label>
                  <input
                    type="text"
                    value={examInvigilator}
                    onChange={e => setExamInvigilator(e.target.value)}
                    placeholder="e.g. Dr. Elena Rostova"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExamOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Save Exam Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- UPLOAD EXAM CSV MODAL --- */}
      {isUploadExamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-900">Upload Exam Schedule CSV</h3>
              <button onClick={() => setIsUploadExamModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Paste or type your CSV content. Format:
              <br />
              <code className="text-3xs bg-slate-100 p-1 rounded font-mono block mt-1">
                CourseCode, CourseName, Semester, AcademicYear, ExamDate, ExamTime, Venue, Invigilator
              </code>
            </p>

            <textarea
              rows={8}
              value={examCsvText}
              onChange={e => setExamCsvText(e.target.value)}
              placeholder={`CS301, Data Structures, Semester 5, 2026-2027, 2026-11-18, 09:30 AM - 12:30 PM, Turing Hall Room G01, Dr. Elena Rostova\nCS302, Databases, Semester 5, 2026-2027, 2026-11-21, 09:30 AM - 12:30 PM, Edison Hall 101, Dr. Ramesh Sundaram`}
              className="w-full border border-slate-300 rounded-xl p-3 font-mono text-xs text-slate-900"
            />

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsUploadExamModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadExamCSV}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Parse & Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
