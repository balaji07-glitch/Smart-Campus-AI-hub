import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel, GenerateContentResponse } from '@google/genai';
import {
  initialUsers,
  campusBuildings,
  campusRooms,
  campusNodes,
  campusEdges,
  initialKBDocuments,
  initialResearchProfiles,
  initialResearchProjects,
  initialCourses,
  initialAssessments,
  initialTickets,
  initialCollabRequests,
  initialCampusEvents,
  initialClassTimetables,
  initialExamSchedules,
} from './src/data/initialData';
import {
  CampusRoom,
  KBDocument,
  HelpdeskTicket,
  ResearchProfile,
  ResearchProject,
  CollaborationRequest,
  Course,
  AssessmentRecord,
  CourseAttainmentAnalysis,
  COAttainmentResult,
  NavigationRouteStep,
  NavigationRouteResult,
  CampusEvent,
  ClassTimetableEntry,
  ExamScheduleEntry,
  EducationDetail,
} from './src/types';

dotenv.config();

// In-memory data stores
let users = [...initialUsers];
let rooms = [...campusRooms];
let kbDocuments = [...initialKBDocuments];
let researchProfiles = [...initialResearchProfiles];
let researchProjects = [...initialResearchProjects];
let collabRequests = [...initialCollabRequests];
let courses = [...initialCourses];
let assessments = [...initialAssessments];
let tickets = [...initialTickets];
let campusEvents = [...initialCampusEvents];
let classTimetables = [...initialClassTimetables];
let examSchedules = [...initialExamSchedules];

// Auto-sync Admin Events, Timetables, and Exam Schedules to Verified Knowledge Base
function syncEventsSchedulesToKB() {
  // Clear previous dynamic auto-synced documents
  kbDocuments = kbDocuments.filter(d => !d.id.startsWith('dyn_'));

  // 1. Sync Campus Events
  for (const evt of campusEvents) {
    kbDocuments.push({
      id: `dyn_evt_${evt.id}`,
      title: `Campus Event: ${evt.title}`,
      category: 'Event Calendar',
      summary: `${evt.title} scheduled on ${evt.date} (${evt.time}) at ${evt.venue}. Organized by ${evt.organizer || 'Campus Administration'}.`,
      verifiedBy: evt.organizer || 'Office of Student Affairs & Events',
      lastUpdated: new Date().toISOString().split('T')[0],
      tags: ['event', 'events', 'calendar', 'venue', evt.category ? evt.category.toLowerCase() : 'activity', evt.title.toLowerCase(), 'official'],
      content: `OFFICIAL CAMPUS EVENT: ${evt.title}
Category: ${evt.category || 'General'}
Date: ${evt.date}
Time: ${evt.time}
Venue: ${evt.venue}
Organizer: ${evt.organizer || 'University Events Committee'}
Description: ${evt.description}`,
      isVerified: true,
    });
  }

  // 2. Sync Class Timetables (grouped by department and semester)
  const ttMap = new Map<string, ClassTimetableEntry[]>();
  for (const tt of classTimetables) {
    const key = `${tt.department}__${tt.semester}`;
    if (!ttMap.has(key)) ttMap.set(key, []);
    ttMap.get(key)!.push(tt);
  }

  for (const [key, entries] of ttMap.entries()) {
    const [dept, sem] = key.split('__');
    const scheduleLines = entries
      .map(
        e =>
          `- ${e.dayOfWeek} ${e.timeSlot}: [${e.courseCode}] ${e.courseName} | Venue: Room ${e.roomNumber} | Instructor: ${e.facultyName}`
      )
      .join('\n');

    kbDocuments.push({
      id: `dyn_tt_${dept.replace(/[^a-zA-Z0-9]/g, '_')}_${sem.replace(/[^a-zA-Z0-9]/g, '_')}`,
      title: `Class Timetable: Department of ${dept} (${sem})`,
      category: 'Timetable',
      summary: `Verified weekly academic class schedule for ${dept}, ${sem}.`,
      verifiedBy: 'Office of the Academic Registrar',
      lastUpdated: new Date().toISOString().split('T')[0],
      tags: ['timetable', 'schedule', 'classes', 'routine', 'lecture', dept.toLowerCase(), sem.toLowerCase(), 'official'],
      content: `OFFICIAL CLASS TIMETABLE - DEPARTMENT OF ${dept.toUpperCase()} (${sem.toUpperCase()}):
${scheduleLines}`,
      department: dept,
      isVerified: true,
    });
  }

  // 3. Sync Exam Schedules (grouped by semester)
  const examMap = new Map<string, ExamScheduleEntry[]>();
  for (const ex of examSchedules) {
    const key = `${ex.semester}__${ex.academicYear}`;
    if (!examMap.has(key)) examMap.set(key, []);
    examMap.get(key)!.push(ex);
  }

  for (const [key, entries] of examMap.entries()) {
    const [sem, year] = key.split('__');
    const examLines = entries
      .map(
        e =>
          `- Course: [${e.courseCode}] ${e.courseName} | Exam Date: ${e.examDate} | Time: ${e.examTime} | Hall/Venue: ${e.venue} | Invigilator: ${e.invigilator}`
      )
      .join('\n');

    kbDocuments.push({
      id: `dyn_exam_${sem.replace(/[^a-zA-Z0-9]/g, '_')}`,
      title: `Official Examination Schedule: ${sem} (${year})`,
      category: 'Exam Schedules',
      summary: `Official end-semester final examination schedule for ${sem} (${year}).`,
      verifiedBy: 'Controller of Examinations',
      lastUpdated: new Date().toISOString().split('T')[0],
      tags: ['exam', 'exams', 'examination', 'finals', 'schedules', 'datesheet', sem.toLowerCase(), 'official'],
      content: `OFFICIAL UNIVERSITY EXAMINATION SCHEDULE - ${sem.toUpperCase()} (${year}):
${examLines}`,
      isVerified: true,
    });
  }
}

// Initial sync on startup
syncEventsSchedulesToKB();

// Lazy initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!aiClient) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.warn('Failed to initialize GoogleGenAI client:', err);
      aiClient = null;
    }
  }
  return aiClient;
}

export const app = express();
app.use(express.json({ limit: '10mb' }));

// Express route path normalization for Vercel serverless functions
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && !req.url.startsWith('/@') && req.url !== '/') {
    req.url = '/api' + req.url;
  }
  next();
});

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // ==========================================
  // Health & Auth Endpoints
  // ==========================================
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Smart Campus AI Hub Backend',
      timestamp: new Date().toISOString(),
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  app.get('/api/auth/users', (req, res) => {
    res.json(users);
  });

  // Role-Specific Signup Endpoint
  app.post('/api/auth/signup', (req, res) => {
    const { role, name, email, password, skills, education, department, studentYear } = req.body;
    if (!role || !name || !email) {
      return res.status(400).json({ error: 'Role, name, and email are required.' });
    }

    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === 'string' && skills.trim().length > 0
      ? skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const newUser: any = {
      id: `usr_${role}_${Date.now()}`,
      name,
      email,
      role,
      department:
        department ||
        (role === 'admin'
          ? 'Academic Registrar & IT Governance'
          : role === 'faculty'
          ? 'Computer Science & Engineering'
          : 'Computer Science & Engineering'),
      studentYear: role === 'student' ? studentYear || '1st Year' : undefined,
      studentOrEmpId:
        role === 'student'
          ? `STU-${Date.now().toString().slice(-4)}`
          : role === 'faculty'
          ? `FAC-${Date.now().toString().slice(-4)}`
          : `ADM-${Date.now().toString().slice(-4)}`,
      languagePreference: 'en',
      avatar:
        role === 'faculty'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
          : role === 'admin'
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      skills: skillsArray.length > 0 ? skillsArray : role === 'student' ? ['Python', 'Problem Solving', 'Data Structures'] : [],
      education: Array.isArray(education) ? education : [],
    };

    users.push(newUser);

    // Auto-create/sync research profile for Student & Faculty so Collaborate matcher works immediately
    if (role === 'student' || role === 'faculty') {
      const newProfile: ResearchProfile = {
        userId: newUser.id,
        name: newUser.name,
        role: newUser.role,
        department: newUser.department,
        designation:
          role === 'faculty' ? 'Faculty Member / Researcher' : `${newUser.studentYear || 'Undergraduate'} Student`,
        email: newUser.email,
        avatar: newUser.avatar,
        bio:
          role === 'faculty'
            ? `Faculty member specialized in ${skillsArray.slice(0, 3).join(', ') || 'engineering and advanced computing'}.`
            : `${newUser.studentYear || 'Student'} in ${newUser.department} interested in technology and applied research.`,
        interests: skillsArray.length > 0 ? skillsArray : ['Emerging Technologies', 'Data Science'],
        skills: skillsArray.length > 0 ? skillsArray : ['Python', 'Problem Solving'],
        publications: [],
        openForCollaboration: true,
      };
      researchProfiles.push(newProfile);
    }

    res.status(201).json({ success: true, user: newUser });
  });

  // Login Endpoint (Supports role check & email match)
  app.post('/api/auth/login', (req, res) => {
    const { userId, role, email, password } = req.body;
    let found = users.find(
      u =>
        u.id === userId ||
        (email && u.email.toLowerCase() === email.toLowerCase()) ||
        (role && !email && !userId && u.role === role)
    );

    if (!found) {
      // Auto create demonstration account for chosen role
      found = {
        id: `usr_${role || 'student'}_${Date.now()}`,
        name:
          role === 'visitor'
            ? 'Guest Visitor'
            : role === 'faculty'
            ? 'Dr. Academic Member'
            : role === 'admin'
            ? 'Admin Officer'
            : 'Student Member',
        email: email || `${role || 'student'}@campus.edu`,
        role: role || 'student',
        department:
          role === 'visitor'
            ? 'Campus Guest'
            : role === 'admin'
            ? 'Campus Administration'
            : 'Computer Science & Engineering',
        languagePreference: 'en',
        skills:
          role === 'student'
            ? ['Python', 'Data Analysis', 'Web Development']
            : role === 'faculty'
            ? ['Artificial Intelligence', 'Embedded Systems']
            : [],
      };
      users.push(found as any);
    }
    res.json({ success: true, user: found });
  });

  // Dedicated Visitor Guest Session Endpoint (Zero Credentials Needed)
  app.post('/api/auth/visitor', (req, res) => {
    const visitorUser = {
      id: `usr_visitor_guest_${Date.now()}`,
      name: 'Guest Visitor',
      email: `visitor_${Date.now().toString().slice(-4)}@guest.org`,
      role: 'visitor' as const,
      department: 'Campus Visitor / Guest',
      languagePreference: 'en' as const,
      skills: [],
    };
    users.push(visitorUser as any);
    res.json({ success: true, user: visitorUser });
  });

  // ==========================================
  // MODULE 1: NAVIGATE Endpoints
  // ==========================================
  app.get('/api/navigate/map-data', (req, res) => {
    res.json({
      buildings: campusBuildings,
      rooms: rooms,
      nodes: campusNodes,
      edges: campusEdges,
    });
  });

  app.post('/api/navigate/rooms', (req, res) => {
    const newRoom: CampusRoom = {
      ...req.body,
      id: req.body.id || `rm_${Date.now()}`,
    };
    rooms.push(newRoom);
    res.status(201).json(newRoom);
  });

  app.put('/api/navigate/rooms/:id', (req, res) => {
    const { id } = req.params;
    const index = rooms.findIndex(r => r.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Room not found' });
    }
    rooms[index] = { ...rooms[index], ...req.body };
    res.json(rooms[index]);
  });

  app.delete('/api/navigate/rooms/:id', (req, res) => {
    const { id } = req.params;
    rooms = rooms.filter(r => r.id !== id);
    res.json({ success: true });
  });

  // Turn-by-turn routing calculation
  app.post('/api/navigate/route', (req, res) => {
    const { startRoomId, endRoomId, accessibleOnly } = req.body;
    const startRoom = rooms.find(r => r.id === startRoomId);
    const endRoom = rooms.find(r => r.id === endRoomId);

    if (!startRoom || !endRoom) {
      return res.status(400).json({ error: 'Valid start and destination rooms required.' });
    }

    const startBldg = campusBuildings.find(b => b.id === startRoom.buildingId);
    const endBldg = campusBuildings.find(b => b.id === endRoom.buildingId);

    const steps: NavigationRouteStep[] = [];
    let totalDist = 0;

    // Step 1: Depart start room
    const step1Dist = 15;
    totalDist += step1Dist;
    steps.push({
      stepNumber: 1,
      instruction: `Depart ${startRoom.name} (${startRoom.roomNumber}) on Floor ${startRoom.floor}.`,
      distanceMeters: step1Dist,
      estimatedSeconds: 20,
      buildingName: startBldg?.name,
      floor: startRoom.floor,
      isAccessible: true,
      audioPrompt: `Starting from ${startRoom.name}, exit to the main corridor. Follow the tactile path guide.`,
    });

    // Step 2: Handle floor transitions if needed
    if (startRoom.floor !== 0) {
      const elevDist = 25;
      totalDist += elevDist;
      steps.push({
        stepNumber: 2,
        instruction: accessibleOnly
          ? `Take the accessible elevator to Ground Floor (Floor 0).`
          : `Take the stairs or elevator down to Ground Floor.`,
        distanceMeters: elevDist,
        estimatedSeconds: 40,
        buildingName: startBldg?.name,
        floor: startRoom.floor,
        isAccessible: true,
        audioPrompt: accessibleOnly
          ? `Proceed straight 20 meters to the accessible glass elevator. Select Floor 0.`
          : `Proceed to the stairs or elevator to reach Ground Floor.`,
      });
    }

    // Step 3: Inter-building campus pathway if in different buildings
    if (startRoom.buildingId !== endRoom.buildingId) {
      const outdoorDist = 85;
      totalDist += outdoorDist;
      steps.push({
        stepNumber: steps.length + 1,
        instruction: accessibleOnly
          ? `Exit ${startBldg?.name || 'building'} via the smooth access ramp. Follow the paved tactile walkway toward ${endBldg?.name || 'destination'}.`
          : `Exit toward central campus courtyard and walk across to ${endBldg?.name || 'destination'}.`,
        distanceMeters: outdoorDist,
        estimatedSeconds: 80,
        isAccessible: true,
        audioPrompt: accessibleOnly
          ? `Exit via the zero-threshold automatic doors and ramp. Continue forward 80 meters along the textured guide tiles directly to ${endBldg?.name}.`
          : `Head across the central campus plaza toward ${endBldg?.name}.`,
      });
    }

    // Step 4: Arrive in destination building & ascend if floor > 0
    if (endRoom.floor !== 0) {
      const ascendDist = 30;
      totalDist += ascendDist;
      steps.push({
        stepNumber: steps.length + 1,
        instruction: accessibleOnly
          ? `Enter ${endBldg?.name} and take the audio-signaled elevator to Floor ${endRoom.floor}.`
          : `Enter ${endBldg?.name} and head to Floor ${endRoom.floor}.`,
        distanceMeters: ascendDist,
        estimatedSeconds: 45,
        buildingName: endBldg?.name,
        floor: endRoom.floor,
        isAccessible: true,
        audioPrompt: `Enter the elevator lobby. Take elevator to Floor ${endRoom.floor}. The elevator chimes twice when doors open.`,
      });
    }

    // Final Step: Reach target room
    const finalDist = 20;
    totalDist += finalDist;
    steps.push({
      stepNumber: steps.length + 1,
      instruction: `Arrive at ${endRoom.name} (${endRoom.roomNumber}), located on your left.`,
      distanceMeters: finalDist,
      estimatedSeconds: 25,
      buildingName: endBldg?.name,
      floor: endRoom.floor,
      isAccessible: true,
      audioPrompt: `Walk 15 meters down the hallway. You have arrived at your destination: ${endRoom.name}, room ${endRoom.roomNumber}.`,
    });

    const routeResult: NavigationRouteResult = {
      startRoom,
      endRoom,
      totalDistanceMeters: totalDist,
      totalEstimatedMinutes: Math.max(1, Math.ceil(totalDist / 45)), // Average walking pace
      isAccessibleOnly: !!accessibleOnly,
      steps,
      pathPoints: [
        { x: startRoom.coordinates.x + startRoom.coordinates.width / 2, y: startRoom.coordinates.y + startRoom.coordinates.height / 2, floor: startRoom.floor, buildingId: startRoom.buildingId },
        { x: (startBldg?.coordinates.x || 200), y: (startBldg?.coordinates.y || 200) },
        { x: 380, y: 280 }, // Central plaza
        { x: (endBldg?.coordinates.x || 400), y: (endBldg?.coordinates.y || 200) },
        { x: endRoom.coordinates.x + endRoom.coordinates.width / 2, y: endRoom.coordinates.y + endRoom.coordinates.height / 2, floor: endRoom.floor, buildingId: endRoom.buildingId },
      ],
    };

    res.json(routeResult);
  });

  // Find nearest facility
  app.get('/api/navigate/nearest', (req, res) => {
    const { category, currentRoomId } = req.query;
    const currentRoom = rooms.find(r => r.id === currentRoomId) || rooms[0];

    const matching = rooms.filter(r => {
      if (category === 'washroom') return r.type === 'washroom' || r.isNearestCategory === 'washroom';
      if (category === 'exit') return r.type === 'exit' || r.isNearestCategory === 'exit';
      if (category === 'elevator') return r.type === 'elevator' || r.isNearestCategory === 'elevator';
      if (category === 'canteen') return r.type === 'canteen' || r.isNearestCategory === 'canteen';
      if (category === 'parking') return r.type === 'parking' || r.isNearestCategory === 'parking';
      return false;
    });

    // Prioritize same building, same floor, accessible
    matching.sort((a, b) => {
      const aSameBldg = a.buildingId === currentRoom.buildingId ? 2 : 0;
      const bSameBldg = b.buildingId === currentRoom.buildingId ? 2 : 0;
      const aSameFloor = a.floor === currentRoom.floor ? 1 : 0;
      const bSameFloor = b.floor === currentRoom.floor ? 1 : 0;
      return (bSameBldg + bSameFloor) - (aSameBldg + aSameFloor);
    });

    res.json({
      nearest: matching[0] || null,
      candidates: matching.slice(0, 4),
    });
  });

  // ==========================================
  // MODULE 2: ASK (Campus Chatbot with RAG & Citations)
  // ==========================================
  app.get('/api/ask/knowledge-base', (req, res) => {
    res.json(kbDocuments);
  });

  app.post('/api/ask/knowledge-base', (req, res) => {
    const newDoc: KBDocument = {
      ...req.body,
      id: req.body.id || `kb_doc_${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
      isVerified: true,
    };
    kbDocuments.push(newDoc);
    res.status(201).json(newDoc);
  });

  app.put('/api/ask/knowledge-base/:id', (req, res) => {
    const { id } = req.params;
    const index = kbDocuments.findIndex(d => d.id === id);
    if (index === -1) return res.status(404).json({ error: 'Document not found' });
    kbDocuments[index] = { ...kbDocuments[index], ...req.body, lastUpdated: new Date().toISOString().split('T')[0] };
    res.json(kbDocuments[index]);
  });

  app.delete('/api/ask/knowledge-base/:id', (req, res) => {
    const { id } = req.params;
    kbDocuments = kbDocuments.filter(d => d.id !== id);
    res.json({ success: true });
  });

  // Grounded RAG Chatbot Endpoint (Optimized Fast Mode)
  app.post('/api/ask/chat', async (req, res) => {
    const startTime = Date.now();
    const { message, language = 'en' } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Query message is required.' });
    }

    const query = message.toLowerCase().trim();

    // 1. Retrieve most relevant verified documents via keyword and tag scoring
    const scoredDocs = kbDocuments.map(doc => {
      let score = 0;
      const titleLower = doc.title.toLowerCase();
      const contentLower = doc.content.toLowerCase();
      const tags = doc.tags || [];

      const queryWords = query.split(/\s+/).filter(w => w.length > 2);
      for (const word of queryWords) {
        if (titleLower.includes(word)) score += 5;
        if (tags.some(t => t.toLowerCase().includes(word))) score += 4;
        if (contentLower.includes(word)) score += 1;
      }

      return { doc, score };
    });

    scoredDocs.sort((a, b) => b.score - a.score);
    const topMatches = scoredDocs.filter(d => d.score > 2).slice(0, 3);

    // Calculate confidence based on match strength
    const topScore = topMatches.length > 0 ? topMatches[0].score : 0;
    const confidence = Math.min(0.98, Math.max(0.2, topScore > 10 ? 0.95 : topScore > 5 ? 0.82 : topScore > 2 ? 0.65 : 0.25));

    // If confidence is low, strictly do NOT guess
    if (confidence < 0.6 || topMatches.length === 0) {
      return res.json({
        text: `I could not find a verified answer for your inquiry in our official institutional knowledge base. In accordance with university policy, I will not speculate. Would you like to create a verified helpdesk ticket so an institutional staff member can assist you directly?`,
        confidence: Math.round(confidence * 100),
        lowConfidence: true,
        canCreateTicket: true,
        suggestedAction: 'Open Helpdesk Ticket',
        sources: [],
        latencyMs: Date.now() - startTime,
      });
    }

    const relevantDocs = topMatches.map(m => m.doc);
    const contextPrompt = relevantDocs
      .map(
        d =>
          `[DOCUMENT: "${d.title}"] (Verified by: ${d.verifiedBy}, Category: ${d.category})\n${d.content}\n---`
      )
      .join('\n\n');

    const gemini = getGeminiClient();

    if (gemini) {
      try {
        const response = await gemini.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `You are the official Smart Campus AI Hub verified assistant for university students, faculty, and visitors.
Answer the user's question STRICTLY and ONLY using the verified institutional documents provided below.
DO NOT use outside knowledge. DO NOT invent dates, names, room numbers, or policies.
Keep your answer clear, direct, and concise (under 3 paragraphs or bullet points).
Always cite the source document name explicitly in your answer.
If the language requested is other than English, respond in that language (${language}) while keeping official titles accurate.

USER QUESTION: "${message}"
REQUESTED LANGUAGE: "${language}"

VERIFIED DOCUMENTS CONTEXT:
${contextPrompt}
`,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          },
        });

        const generatedText = response.text || '';
        return res.json({
          text: generatedText,
          confidence: Math.round(confidence * 100),
          lowConfidence: false,
          latencyMs: Date.now() - startTime,
          model: 'gemini-3.6-flash',
          sources: relevantDocs.map(d => ({
            documentId: d.id,
            documentTitle: d.title,
            excerpt: d.summary || d.content.slice(0, 160) + '...',
            verifiedBy: d.verifiedBy,
          })),
        });
      } catch (err) {
        console.warn('Fast Gemini API call failed, falling back to grounded rule synthesizer:', err);
      }
    }

    // High-fidelity instant fallback when Gemini key is not set or network fails
    const primaryDoc = relevantDocs[0];
    const fallbackResponse = `According to verified institutional circular "${primaryDoc.title}" (${primaryDoc.verifiedBy}):

${primaryDoc.summary}

Key Details:
${primaryDoc.content.split('\n').filter(line => line.trim().length > 0).slice(1, 5).join('\n')}

Source: ${primaryDoc.title} (Last verified: ${primaryDoc.lastUpdated})`;

    res.json({
      text: fallbackResponse,
      confidence: Math.round(confidence * 100),
      lowConfidence: false,
      latencyMs: Date.now() - startTime,
      sources: relevantDocs.map(d => ({
        documentId: d.id,
        documentTitle: d.title,
        excerpt: d.summary,
        verifiedBy: d.verifiedBy,
      })),
    });
  });

  // Real-Time Streaming RAG Chatbot Endpoint (Server-Sent Events)
  app.post('/api/ask/chat/stream', async (req, res) => {
    const startTime = Date.now();
    const { message, language = 'en' } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Query message is required.' });
    }

    const query = message.toLowerCase().trim();

    // 1. Retrieve most relevant verified documents via keyword and tag scoring
    const scoredDocs = kbDocuments.map(doc => {
      let score = 0;
      const titleLower = doc.title.toLowerCase();
      const contentLower = doc.content.toLowerCase();
      const tags = doc.tags || [];

      const queryWords = query.split(/\s+/).filter(w => w.length > 2);
      for (const word of queryWords) {
        if (titleLower.includes(word)) score += 5;
        if (tags.some(t => t.toLowerCase().includes(word))) score += 4;
        if (contentLower.includes(word)) score += 1;
      }

      return { doc, score };
    });

    scoredDocs.sort((a, b) => b.score - a.score);
    const topMatches = scoredDocs.filter(d => d.score > 2).slice(0, 3);

    // Calculate confidence based on match strength
    const topScore = topMatches.length > 0 ? topMatches[0].score : 0;
    const confidence = Math.min(0.98, Math.max(0.2, topScore > 10 ? 0.95 : topScore > 5 ? 0.82 : topScore > 2 ? 0.65 : 0.25));

    // Establish SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // If confidence is low, strictly do NOT guess
    if (confidence < 0.6 || topMatches.length === 0) {
      res.write(`event: meta\ndata: ${JSON.stringify({
        confidence: Math.round(confidence * 100),
        lowConfidence: true,
        canCreateTicket: true,
        suggestedAction: 'Open Helpdesk Ticket',
        sources: [],
      })}\n\n`);
      const apology = 'I could not find a verified answer for your inquiry in our official institutional knowledge base. In accordance with university policy, I will not speculate. Would you like to create a verified helpdesk ticket so an institutional staff member can assist you directly?';
      res.write(`event: chunk\ndata: ${JSON.stringify({ text: apology })}\n\n`);
      res.write(`event: done\ndata: ${JSON.stringify({ latencyMs: Date.now() - startTime })}\n\n`);
      return res.end();
    }

    const relevantDocs = topMatches.map(m => m.doc);
    const contextPrompt = relevantDocs
      .map(
        d =>
          `[DOCUMENT: "${d.title}"] (Verified by: ${d.verifiedBy}, Category: ${d.category})\n${d.content}\n---`
      )
      .join('\n\n');

    const meta = {
      confidence: Math.round(confidence * 100),
      lowConfidence: false,
      model: 'gemini-3.6-flash',
      sources: relevantDocs.map(d => ({
        documentId: d.id,
        documentTitle: d.title,
        excerpt: d.summary || d.content.slice(0, 160) + '...',
        verifiedBy: d.verifiedBy,
      })),
    };
    res.write(`event: meta\ndata: ${JSON.stringify(meta)}\n\n`);

    const gemini = getGeminiClient();
    let streamSucceeded = false;

    if (gemini) {
      try {
        const stream = await gemini.models.generateContentStream({
          model: 'gemini-3.6-flash',
          contents: `You are the official Smart Campus AI Hub verified assistant for university students, faculty, and visitors.
Answer the user's question STRICTLY and ONLY using the verified institutional documents provided below.
DO NOT use outside knowledge. DO NOT invent dates, names, room numbers, or policies.
Keep your answer clear, direct, and concise (under 3 paragraphs or bullet points).
Always cite the source document name explicitly in your answer.
If the language requested is other than English, respond in that language (${language}) while keeping official titles accurate.

USER QUESTION: "${message}"
REQUESTED LANGUAGE: "${language}"

VERIFIED DOCUMENTS CONTEXT:
${contextPrompt}`,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          },
        });

        for await (const chunk of stream) {
          const c = chunk as GenerateContentResponse;
          const text = c.text;
          if (text) {
            res.write(`event: chunk\ndata: ${JSON.stringify({ text })}\n\n`);
          }
        }
        streamSucceeded = true;
      } catch (err: any) {
        console.warn('Streaming Gemini failed, falling back to local synthesizer:', err?.message || err);
      }
    }

    if (!streamSucceeded) {
      const primaryDoc = relevantDocs[0];
      const fallbackResponse = `According to verified institutional circular "${primaryDoc.title}" (${primaryDoc.verifiedBy}):\n\n${primaryDoc.summary}\n\nKey Details:\n${primaryDoc.content.split('\n').filter(line => line.trim().length > 0).slice(1, 5).join('\n')}\n\nSource: ${primaryDoc.title} (Last verified: ${primaryDoc.lastUpdated})`;
      
      const words = fallbackResponse.split(' ');
      for (let i = 0; i < words.length; i += 4) {
        const slice = words.slice(i, i + 4).join(' ') + (i + 4 < words.length ? ' ' : '');
        res.write(`event: chunk\ndata: ${JSON.stringify({ text: slice })}\n\n`);
      }
    }

    res.write(`event: done\ndata: ${JSON.stringify({ latencyMs: Date.now() - startTime })}\n\n`);
    res.end();
  });

  // Helpdesk Ticket Endpoints
  app.get('/api/ask/tickets', (req, res) => {
    res.json(tickets);
  });

  app.post('/api/ask/tickets', (req, res) => {
    const newTicket: HelpdeskTicket = {
      id: `tkt_${Date.now()}`,
      userId: req.body.userId || 'usr_guest',
      userName: req.body.userName || 'Campus User',
      userEmail: req.body.userEmail || 'user@campus.edu',
      userRole: req.body.userRole || 'student',
      query: req.body.query,
      category: req.body.category || 'General Inquiries',
      department: req.body.department || 'Academic Registrar',
      priority: req.body.priority || 'medium',
      status: 'open',
      createdAt: new Date().toLocaleString(),
    };
    tickets.unshift(newTicket);
    res.status(201).json(newTicket);
  });

  app.patch('/api/ask/tickets/:id', (req, res) => {
    const { id } = req.params;
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (req.body.status) ticket.status = req.body.status;
    if (req.body.resolutionNotes) ticket.resolutionNotes = req.body.resolutionNotes;
    res.json(ticket);
  });

  // ==========================================
  // MODULE 3: COLLABORATE Endpoints
  // ==========================================
  app.get('/api/collaborate/profiles', (req, res) => {
    res.json(researchProfiles);
  });

  app.put('/api/collaborate/profiles/:userId', (req, res) => {
    const { userId } = req.params;
    const index = researchProfiles.findIndex(p => p.userId === userId);
    if (index === -1) {
      // Create new profile
      const newProf: ResearchProfile = {
        userId,
        ...req.body,
      };
      researchProfiles.push(newProf);
      return res.status(201).json(newProf);
    }
    researchProfiles[index] = { ...researchProfiles[index], ...req.body };
    res.json(researchProfiles[index]);
  });

  // AI Matching Engine for Collaborators
  app.post('/api/collaborate/match', async (req, res) => {
    const { userId, interests = [], skills = [], targetDepartment } = req.body;
    const currentProfile = researchProfiles.find(p => p.userId === userId);

    const userInterests: string[] = interests.length > 0 ? interests : (currentProfile?.interests || []);
    const userSkills: string[] = skills.length > 0 ? skills : (currentProfile?.skills || []);

    const candidates = researchProfiles.filter(p => p.userId !== userId && p.openForCollaboration);

    const matched = candidates.map(cand => {
      // 1. Direct overlap in research interests
      const sharedInterests = cand.interests.filter(i =>
        userInterests.some(ui => ui.toLowerCase().includes(i.toLowerCase()) || i.toLowerCase().includes(ui.toLowerCase()))
      );

      // 2. Complementary skills (skills user doesn't have, or complementary domain tools)
      const complementarySkills = cand.skills.filter(s =>
        !userSkills.some(us => us.toLowerCase() === s.toLowerCase())
      );

      // 3. Department synergy bonus
      const isInterdisciplinary = cand.department !== currentProfile?.department;

      const score = Math.min(
        98,
        Math.max(
          45,
          sharedInterests.length * 22 +
          (isInterdisciplinary ? 15 : 8) +
          cand.publications.length * 3 +
          Math.min(20, complementarySkills.length * 4)
        )
      );

      const matchReasons = [
        sharedInterests.length > 0 ? `Shared focus on ${sharedInterests.slice(0, 2).join(' & ')}` : 'Complementary methodological synergy',
        isInterdisciplinary ? `High-value cross-disciplinary link (${cand.department} × ${currentProfile?.department || 'Computing'})` : 'Deep departmental collaboration synergy',
        complementarySkills.length > 0 ? `Brings complementary proficiency in ${complementarySkills.slice(0, 2).join(', ')}` : 'Strong peer publication track record',
      ];

      return {
        profile: cand,
        matchScore: score,
        sharedInterests,
        matchReasons,
      };
    });

    matched.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      matches: matched,
      totalEvaluated: candidates.length,
    });
  });

  // Projects & Requirements
  app.get('/api/collaborate/projects', (req, res) => {
    res.json(researchProjects);
  });

  app.post('/api/collaborate/projects', async (req, res) => {
    const newProject: ResearchProject = {
      ...req.body,
      id: `proj_${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Calculate instant matches
    const requiredSkills: string[] = newProject.requiredSkills || [];
    const matched = researchProfiles
      .filter(p => p.userId !== newProject.authorId)
      .map(p => {
        const matchingSkills = p.skills.filter(s =>
          requiredSkills.some(rs => rs.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(rs.toLowerCase()))
        );
        const score = Math.min(95, 50 + matchingSkills.length * 18);
        return {
          profile: p,
          matchScore: score,
          matchReasons: [
            `Demonstrated mastery in required skills: ${matchingSkills.join(', ') || 'General domain proficiency'}`,
            `Active researcher in ${p.department}`,
          ],
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    newProject.matchedProfiles = matched;
    researchProjects.unshift(newProject);
    res.status(201).json(newProject);
  });

  // Collaboration Requests / Invites
  app.get('/api/collaborate/requests', (req, res) => {
    res.json(collabRequests);
  });

  app.post('/api/collaborate/requests', (req, res) => {
    const newReq: CollaborationRequest = {
      id: `req_${Date.now()}`,
      senderId: req.body.senderId,
      senderName: req.body.senderName,
      senderRole: req.body.senderRole,
      receiverId: req.body.receiverId,
      receiverName: req.body.receiverName,
      projectId: req.body.projectId,
      projectTitle: req.body.projectTitle,
      proposedRole: req.body.proposedRole,
      message: req.body.message,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    collabRequests.unshift(newReq);
    res.status(201).json(newReq);
  });

  app.patch('/api/collaborate/requests/:id', (req, res) => {
    const { id } = req.params;
    const reqItem = collabRequests.find(r => r.id === id);
    if (!reqItem) return res.status(404).json({ error: 'Request not found' });
    if (req.body.status) reqItem.status = req.body.status;
    res.json(reqItem);
  });

  // ==========================================
  // MODULE 4: ATTAIN (Course Outcome Analytics & NBA/NAAC)
  // ==========================================
  app.get('/api/attain/courses', (req, res) => {
    res.json(courses);
  });

  app.post('/api/attain/courses', (req, res) => {
    const newCourse: Course = {
      ...req.body,
      id: req.body.id || `course_${Date.now()}`,
    };
    courses.push(newCourse);
    res.status(201).json(newCourse);
  });

  app.get('/api/attain/assessments', (req, res) => {
    const { courseId } = req.query;
    if (courseId) {
      return res.json(assessments.filter(a => a.courseId === courseId));
    }
    res.json(assessments);
  });

  app.post('/api/attain/assessments/batch', (req, res) => {
    const { courseId, records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Valid array of assessment records required.' });
    }

    const inserted: AssessmentRecord[] = records.map((r, i) => ({
      id: `as_${Date.now()}_${i}`,
      courseId: courseId || r.courseId,
      courseOutcomeId: r.courseOutcomeId || r.coCode || 'CO1',
      studentId: r.studentId || `S${100 + i}`,
      studentName: r.studentName || `Student ${i + 1}`,
      assessmentName: r.assessmentName || 'Assessment',
      score: Number(r.score),
      maxScore: Number(r.maxScore || 100),
    }));

    assessments.push(...inserted);
    res.status(201).json({ success: true, count: inserted.length });
  });

  // Detailed Course Attainment & NBA/NAAC Analysis
  app.get('/api/attain/analysis/:courseId', (req, res) => {
    const { courseId } = req.params;
    const course = courses.find(c => c.id === courseId) || courses[0];
    const courseAssessments = assessments.filter(a => a.courseId === course.id);

    const thresholdPct = course.attainmentThreshold || 60;

    // Calculate per-CO attainment
    const coResults: COAttainmentResult[] = course.courseOutcomes.map(co => {
      const coAssessments = courseAssessments.filter(
        a => a.courseOutcomeId === co.code || a.courseOutcomeId === co.id
      );

      const totalAssessed = coAssessments.length || 6;
      let studentsAttained = 0;

      if (coAssessments.length > 0) {
        studentsAttained = coAssessments.filter(a => (a.score / a.maxScore) * 100 >= thresholdPct).length;
      } else {
        // Default statistical estimate if sparse
        studentsAttained = Math.round(totalAssessed * (co.code === 'CO4' ? 0.35 : 0.8));
      }

      const attainmentPct = Math.round((studentsAttained / totalAssessed) * 100);
      const isBelowThreshold = attainmentPct < co.targetPercentage;

      const recommendations: string[] = [];
      if (isBelowThreshold) {
        recommendations.push(
          `Schedule 2 remedial tutorial sessions focused on ${co.description.slice(0, 45)}...`,
          `Provide supplementary formative quiz with step-by-step video solution walkthroughs.`,
          `Introduce peer mentoring pairing top scorers with students below ${thresholdPct}%.`
        );
      } else {
        recommendations.push(
          `Attainment benchmark achieved. Maintain active problem-solving seminar series.`,
          `Introduce advanced research challenge problem set for honors students.`
        );
      }

      return {
        coId: co.id,
        coCode: co.code,
        description: co.description,
        bloomLevel: co.bloomLevel,
        totalStudentsAssessed: totalAssessed,
        studentsAttained,
        attainmentPercentage: attainmentPct,
        targetPercentage: co.targetPercentage,
        isBelowThreshold,
        status: isBelowThreshold ? 'Needs Instructional Intervention' : 'Attained',
        recommendedInterventions: recommendations,
      };
    });

    const overallAttainment = Math.round(
      coResults.reduce((acc, curr) => acc + curr.attainmentPercentage, 0) / coResults.length
    );

    const pendingInterventionCount = coResults.filter(r => r.isBelowThreshold).length;

    const analysis: CourseAttainmentAnalysis = {
      courseId: course.id,
      courseCode: course.code,
      courseName: course.name,
      academicYear: course.academicYear,
      semester: course.semester,
      thresholdPercentage: thresholdPct,
      overallAttainmentPercentage: overallAttainment,
      coResults,
      historicalSemesterTrends: [
        { semester: 'Fall 2024', attainment: 61 },
        { semester: 'Spring 2025', attainment: 66 },
        { semester: 'Fall 2025', attainment: 64 },
        { semester: 'Spring 2026', attainment: 70 },
        { semester: 'Fall 2026 (Current)', attainment: overallAttainment },
      ],
      studentPerformanceTiers: [
        { tier: 'Distinction (>= 80%)', count: 18, percentage: 30 },
        { tier: 'First Class (65% - 79%)', count: 24, percentage: 40 },
        { tier: 'Pass Class (50% - 64%)', count: 12, percentage: 20 },
        { tier: 'At Risk (< 50%)', count: 6, percentage: 10 },
      ],
      nbaSummary: {
        nbaCode: `NBA-TIER-I-CRITERION-3-CO-${course.code}`,
        totalCOs: course.courseOutcomes.length,
        cosAttained: course.courseOutcomes.length - pendingInterventionCount,
        cosPendingIntervention: pendingInterventionCount,
        accreditationStatus: pendingInterventionCount <= 1 ? 'Compliant' : 'Sub-optimal',
      },
    };

    res.json(analysis);
  });

  // ==========================================
  // MODULE 5: ADMIN - Manage Events & Schedules
  // (All data feeds directly into Ask Campus AI)
  // ==========================================

  // --- Campus Events CRUD ---
  app.get('/api/admin/events', (req, res) => {
    res.json(campusEvents);
  });

  app.post('/api/admin/events', (req, res) => {
    const { title, description, date, time, venue, posterImage, category, organizer } = req.body;
    if (!title || !date || !venue) {
      return res.status(400).json({ error: 'Title, date, and venue are required.' });
    }
    const newEvent: CampusEvent = {
      id: `evt_${Date.now()}`,
      title,
      description: description || '',
      date,
      time: time || '10:00 AM - 04:00 PM',
      venue,
      posterImage:
        posterImage ||
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
      category: category || 'General',
      organizer: organizer || 'University Administration',
      createdAt: new Date().toISOString().split('T')[0],
    };
    campusEvents.unshift(newEvent);
    syncEventsSchedulesToKB();
    res.status(201).json(newEvent);
  });

  app.put('/api/admin/events/:id', (req, res) => {
    const idx = campusEvents.findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Event not found' });
    campusEvents[idx] = { ...campusEvents[idx], ...req.body };
    syncEventsSchedulesToKB();
    res.json(campusEvents[idx]);
  });

  app.delete('/api/admin/events/:id', (req, res) => {
    campusEvents = campusEvents.filter(e => e.id !== req.params.id);
    syncEventsSchedulesToKB();
    res.json({ success: true });
  });

  // --- Class Timetables CRUD ---
  app.get('/api/admin/timetables', (req, res) => {
    res.json(classTimetables);
  });

  app.post('/api/admin/timetables', (req, res) => {
    const { department, semester, dayOfWeek, timeSlot, courseCode, courseName, roomNumber, facultyName } = req.body;
    if (!department || !semester || !dayOfWeek || !timeSlot || !courseCode) {
      return res.status(400).json({ error: 'Department, semester, day, time slot, and course code are required.' });
    }
    const newEntry: ClassTimetableEntry = {
      id: `tt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      department,
      semester,
      dayOfWeek,
      timeSlot,
      courseCode,
      courseName: courseName || courseCode,
      roomNumber: roomNumber || 'TBD',
      facultyName: facultyName || 'Faculty',
    };
    classTimetables.push(newEntry);
    syncEventsSchedulesToKB();
    res.status(201).json(newEntry);
  });

  app.post('/api/admin/timetables/bulk', (req, res) => {
    const { entries } = req.body;
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'Entries array is required.' });
    }
    const added: ClassTimetableEntry[] = [];
    for (const item of entries) {
      if (item.department && item.semester && item.courseCode) {
        const entry: ClassTimetableEntry = {
          id: `tt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          department: item.department,
          semester: item.semester,
          dayOfWeek: item.dayOfWeek || 'Monday',
          timeSlot: item.timeSlot || '09:00 - 10:00',
          courseCode: item.courseCode,
          courseName: item.courseName || item.courseCode,
          roomNumber: item.roomNumber || 'TBD',
          facultyName: item.facultyName || 'Staff',
        };
        classTimetables.push(entry);
        added.push(entry);
      }
    }
    syncEventsSchedulesToKB();
    res.status(201).json({ success: true, count: added.length, entries: added });
  });

  app.put('/api/admin/timetables/:id', (req, res) => {
    const idx = classTimetables.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Timetable entry not found' });
    classTimetables[idx] = { ...classTimetables[idx], ...req.body };
    syncEventsSchedulesToKB();
    res.json(classTimetables[idx]);
  });

  app.delete('/api/admin/timetables/:id', (req, res) => {
    classTimetables = classTimetables.filter(t => t.id !== req.params.id);
    syncEventsSchedulesToKB();
    res.json({ success: true });
  });

  // --- Exam Schedules CRUD ---
  app.get('/api/admin/exams', (req, res) => {
    res.json(examSchedules);
  });

  app.post('/api/admin/exams', (req, res) => {
    const { courseCode, courseName, semester, academicYear, examDate, examTime, venue, invigilator } = req.body;
    if (!courseCode || !semester || !examDate) {
      return res.status(400).json({ error: 'Course code, semester, and exam date are required.' });
    }
    const newExam: ExamScheduleEntry = {
      id: `exam_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      courseCode,
      courseName: courseName || courseCode,
      semester,
      academicYear: academicYear || '2026-2027',
      examDate,
      examTime: examTime || '09:30 AM - 12:30 PM',
      venue: venue || 'Main Examination Wing',
      invigilator: invigilator || 'Examination Staff',
    };
    examSchedules.push(newExam);
    syncEventsSchedulesToKB();
    res.status(201).json(newExam);
  });

  app.post('/api/admin/exams/bulk', (req, res) => {
    const { entries } = req.body;
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'Entries array is required.' });
    }
    const added: ExamScheduleEntry[] = [];
    for (const item of entries) {
      if (item.courseCode && item.examDate) {
        const entry: ExamScheduleEntry = {
          id: `exam_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          courseCode: item.courseCode,
          courseName: item.courseName || item.courseCode,
          semester: item.semester || 'Current Semester',
          academicYear: item.academicYear || '2026-2027',
          examDate: item.examDate,
          examTime: item.examTime || '09:30 AM - 12:30 PM',
          venue: item.venue || 'Examination Hall',
          invigilator: item.invigilator || 'Faculty Invigilator',
        };
        examSchedules.push(entry);
        added.push(entry);
      }
    }
    syncEventsSchedulesToKB();
    res.status(201).json({ success: true, count: added.length, entries: added });
  });

  app.put('/api/admin/exams/:id', (req, res) => {
    const idx = examSchedules.findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Exam schedule not found' });
    examSchedules[idx] = { ...examSchedules[idx], ...req.body };
    syncEventsSchedulesToKB();
    res.json(examSchedules[idx]);
  });

  app.delete('/api/admin/exams/:id', (req, res) => {
    examSchedules = examSchedules.filter(e => e.id !== req.params.id);
    syncEventsSchedulesToKB();
    res.json({ success: true });
  });

  // Manual trigger for Knowledge Base Auto-Sync
  app.post('/api/admin/sync-kb', (req, res) => {
    syncEventsSchedulesToKB();
    const dynamicDocs = kbDocuments.filter(d => d.id.startsWith('dyn_'));
    res.json({
      success: true,
      message: `Synchronized ${dynamicDocs.length} dynamic institutional documents to Ask Campus AI.`,
      dynamicCount: dynamicDocs.length,
      totalKBDocs: kbDocuments.length,
    });
  });

  // ==========================================
  // Vite Integration (Dev Middleware vs Production Dist)
  // ==========================================
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Smart Campus AI Hub server listening on http://0.0.0.0:${PORT}`);
    });
  }
}

export default app;

if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error('Fatal server startup failure:', err);
    process.exit(1);
  });
}
