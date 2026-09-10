export type UserRole = 'student' | 'faculty' | 'visitor' | 'admin';

export type LanguageCode = 'en' | 'hi' | 'es' | 'ta';

export interface EducationDetail {
  id?: string;
  degree: string;
  specialization: string;
  institution: string;
  yearsExperience: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  studentOrEmpId?: string;
  avatar?: string;
  languagePreference: LanguageCode;
  skills?: string[];
  education?: EducationDetail[];
  studentYear?: string;
}

export type RoomType =
  | 'classroom'
  | 'lab'
  | 'office'
  | 'library'
  | 'facility'
  | 'washroom'
  | 'elevator'
  | 'exit'
  | 'canteen'
  | 'parking'
  | 'auditorium'
  | 'stairs';

export type AccessibilityTag =
  | 'ramp_accessible'
  | 'elevator_access'
  | 'braille_signage'
  | 'wide_doorway'
  | 'tactile_paving'
  | 'accessible_restroom'
  | 'audio_beacon'
  | 'step_free';

export interface CampusBuilding {
  id: string;
  name: string;
  code: string;
  description: string;
  floors: number[];
  coordinates: { x: number; y: number }; // Relative percentage or canvas units
  color: string;
}

export interface CampusRoom {
  id: string;
  buildingId: string;
  floor: number;
  roomNumber: string;
  name: string;
  type: RoomType;
  department: string;
  accessibilityTags: AccessibilityTag[];
  coordinates: { x: number; y: number; width: number; height: number };
  description?: string;
  isNearestCategory?: 'washroom' | 'exit' | 'elevator' | 'canteen' | 'parking';
}

export interface MapPathwayNode {
  id: string;
  buildingId?: string;
  floor?: number;
  name: string;
  x: number;
  y: number;
  isElevator?: boolean;
  isStairs?: boolean;
  isRamp?: boolean;
  isOutdoor?: boolean;
  isAccessible: boolean;
}

export interface MapPathwayEdge {
  from: string;
  to: string;
  distanceMeters: number;
  hasStairs: boolean;
  hasElevator: boolean;
  hasRamp: boolean;
  isAccessible: boolean;
  instruction: string;
}

export interface NavigationRouteStep {
  stepNumber: number;
  instruction: string;
  distanceMeters: number;
  estimatedSeconds: number;
  buildingName?: string;
  floor?: number;
  isAccessible: boolean;
  audioPrompt: string;
}

export interface NavigationRouteResult {
  startRoom: CampusRoom;
  endRoom: CampusRoom;
  totalDistanceMeters: number;
  totalEstimatedMinutes: number;
  isAccessibleOnly: boolean;
  steps: NavigationRouteStep[];
  pathPoints: { x: number; y: number; floor?: number; buildingId?: string }[];
}

export interface KBDocument {
  id: string;
  title: string;
  category: 'Timetable' | 'Exam Schedules' | 'Department Info' | 'Facilities' | 'Event Calendar' | 'Official Rules & Policies';
  content: string;
  summary: string;
  verifiedBy: string;
  lastUpdated: string;
  tags: string[];
  department?: string;
  isVerified: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  confidence?: number;
  sources?: {
    documentId: string;
    documentTitle: string;
    excerpt: string;
    verifiedBy: string;
  }[];
  lowConfidence?: boolean;
  canCreateTicket?: boolean;
  suggestedAction?: string;
  language?: LanguageCode;
  latencyMs?: number;
  isStreaming?: boolean;
  model?: string;
}

export interface HelpdeskTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  query: string;
  category: string;
  department: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  resolutionNotes?: string;
}

export interface ResearchPublication {
  id: string;
  title: string;
  journalOrConference: string;
  year: number;
  citations: number;
  doi?: string;
  url?: string;
}

export interface ResearchProfile {
  id?: string;
  userId: string;
  name: string;
  role: UserRole;
  department: string;
  designation: string;
  email: string;
  avatar?: string;
  bio: string;
  interests: string[];
  skills: string[];
  equipmentAccess?: string[];
  publications: ResearchPublication[];
  orcidId?: string;
  googleScholarUrl?: string;
  openForCollaboration: boolean;
  availableHoursPerWeek?: number;
}

export interface AIResearchMatch {
  profile: ResearchProfile;
  matchScore: number;
  sharedInterests?: string[];
  matchReasons: string[];
}

export interface ResearchProject {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  department: string;
  title: string;
  description: string;
  requiredSkills: string[];
  targetOutcomes: string;
  status: 'open' | 'in_progress' | 'completed';
  createdAt: string;
  matchedProfiles?: {
    profile: ResearchProfile;
    matchScore: number;
    matchReasons: string[];
  }[];
}

export interface CollaborationRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  projectId?: string;
  projectTitle?: string;
  proposedRole: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface CourseOutcome {
  id: string;
  code: string; // e.g. CO1, CO2
  description: string;
  targetPercentage: number;
  bloomLevel: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';
}

export interface ProgramOutcome {
  id: string;
  code: string; // e.g. PO1, PO2
  description: string;
}

export interface Course {
  id: string;
  code: string; // e.g. CS301
  name: string;
  department: string;
  semester: string;
  academicYear: string;
  credits: number;
  facultyId: string;
  facultyName: string;
  attainmentThreshold: number; // e.g. 60%
  courseOutcomes: CourseOutcome[];
  programOutcomes: ProgramOutcome[];
}

export interface AssessmentRecord {
  id: string;
  courseId: string;
  courseOutcomeId: string; // matches CourseOutcome.id or code
  studentId: string;
  studentName: string;
  assessmentName: string; // 'Midterm 1', 'Assignment 2', 'Lab Exam', 'End Sem'
  score: number;
  maxScore: number;
}

export interface COAttainmentResult {
  coId: string;
  coCode: string;
  description: string;
  bloomLevel: string;
  totalStudentsAssessed: number;
  studentsAttained: number; // scored >= threshold%
  attainmentPercentage: number;
  targetPercentage: number;
  isBelowThreshold: boolean;
  status: 'Attained' | 'Needs Instructional Intervention';
  recommendedInterventions: string[];
}

export interface CourseAttainmentAnalysis {
  courseId: string;
  courseCode: string;
  courseName: string;
  academicYear: string;
  semester: string;
  thresholdPercentage: number;
  overallAttainmentPercentage: number;
  coResults: COAttainmentResult[];
  historicalSemesterTrends: {
    semester: string;
    attainment: number;
  }[];
  studentPerformanceTiers: {
    tier: string;
    count: number;
    percentage: number;
  }[];
  nbaSummary: {
    nbaCode: string;
    totalCOs: number;
    cosAttained: number;
    cosPendingIntervention: number;
    accreditationStatus: 'Compliant' | 'Sub-optimal';
  };
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  posterImage?: string;
  category?: 'Workshop' | 'Conference' | 'Hackathon' | 'Seminar' | 'Cultural' | 'Sports' | 'General';
  organizer?: string;
  createdAt?: string;
}

export interface ClassTimetableEntry {
  id: string;
  department: string;
  semester: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  timeSlot: string; // e.g. "09:00 - 10:00"
  courseCode: string;
  courseName: string;
  roomNumber: string;
  facultyName: string;
}

export interface ExamScheduleEntry {
  id: string;
  courseCode: string;
  courseName: string;
  semester: string;
  academicYear: string;
  examDate: string;
  examTime: string; // e.g. "10:00 AM - 01:00 PM"
  venue: string;
  invigilator: string;
}
