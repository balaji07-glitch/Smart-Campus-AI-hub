import {
  User,
  CampusBuilding,
  CampusRoom,
  MapPathwayNode,
  MapPathwayEdge,
  KBDocument,
  ResearchProfile,
  ResearchProject,
  Course,
  AssessmentRecord,
  HelpdeskTicket,
  CollaborationRequest,
  CampusEvent,
  ClassTimetableEntry,
  ExamScheduleEntry,
} from '../types';

export const initialUsers: User[] = [
  {
    id: 'usr_student_1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@campus.edu',
    role: 'student',
    department: 'Computer Science & Engineering',
    studentOrEmpId: 'CS2023-042',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    languagePreference: 'en',
    studentYear: '3rd Year',
    skills: ['Python', 'Data Analysis', 'Web Development', 'PyTorch', 'Graph Neural Networks'],
  },
  {
    id: 'usr_faculty_1',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@campus.edu',
    role: 'faculty',
    department: 'Artificial Intelligence & Robotics',
    studentOrEmpId: 'FAC-AIR-08',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    languagePreference: 'en',
    skills: ['Deep Learning', 'Autonomous Navigation', 'Assistive Robotics', 'Computer Vision'],
    education: [
      {
        id: 'edu_1',
        degree: 'Ph.D. in Computer Science & Robotics',
        specialization: 'Autonomous Systems & Multi-Agent Planning',
        institution: 'Carnegie Mellon University',
        yearsExperience: 12,
      },
      {
        id: 'edu_2',
        degree: 'M.S. in Electrical & Computer Engineering',
        specialization: 'Computer Vision & Embedded AI',
        institution: 'ETH Zurich',
        yearsExperience: 15,
      },
    ],
  },
  {
    id: 'usr_admin_1',
    name: 'Marcus Vance',
    email: 'marcus.vance@campus.edu',
    role: 'admin',
    department: 'Academic Registrar & IT Governance',
    studentOrEmpId: 'ADM-DIR-01',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    languagePreference: 'en',
    skills: ['Campus Governance', 'Curriculum Accreditation', 'Database Systems'],
  },
  {
    id: 'usr_visitor_1',
    name: 'Sophia Chen',
    email: 'sophia.chen@guest.org',
    role: 'visitor',
    department: 'Campus Guest / Prospective Researcher',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    languagePreference: 'en',
    skills: [],
  },
];

export const campusBuildings: CampusBuilding[] = [
  {
    id: 'bldg_turing',
    name: 'Alan Turing Hall',
    code: 'TH',
    description: 'School of Computing, AI Research Labs & Data Center',
    floors: [0, 1, 2, 3],
    coordinates: { x: 180, y: 160 },
    color: '#3B82F6',
  },
  {
    id: 'bldg_ramanujan',
    name: 'Ramanujan Science Complex',
    code: 'RC',
    description: 'Mathematics, Physics & Microelectronics Labs',
    floors: [0, 1, 2],
    coordinates: { x: 440, y: 150 },
    color: '#8B5CF6',
  },
  {
    id: 'bldg_curie',
    name: 'Marie Curie Bio-Tech Tower',
    code: 'CT',
    description: 'Biomedical Engineering & Genomics Core Facility',
    floors: [0, 1, 2, 3],
    coordinates: { x: 680, y: 180 },
    color: '#EC4899',
  },
  {
    id: 'bldg_library',
    name: 'Tagore Central Library',
    code: 'TL',
    description: 'Digital Knowledge Commons, Quiet Reading Zones & Media Labs',
    floors: [0, 1, 2],
    coordinates: { x: 260, y: 380 },
    color: '#10B981',
  },
  {
    id: 'bldg_student_center',
    name: 'Vivekananda Student Hub & Canteen',
    code: 'SH',
    description: 'Food Court, Student Clubs, ATM & Wellness Center',
    floors: [0, 1],
    coordinates: { x: 530, y: 390 },
    color: '#F59E0B',
  },
  {
    id: 'bldg_admin',
    name: 'Main Administrative Block',
    code: 'AB',
    description: 'Office of the Dean, Registrar, Admissions & Financial Aid',
    floors: [0, 1, 2],
    coordinates: { x: 390, y: 550 },
    color: '#6366F1',
  },
];

export const campusRooms: CampusRoom[] = [
  // Alan Turing Hall - Ground Floor
  {
    id: 'rm_th_g01',
    buildingId: 'bldg_turing',
    floor: 0,
    roomNumber: 'TH-G01',
    name: 'Ada Lovelace Auditorium',
    type: 'auditorium',
    department: 'Computer Science',
    accessibilityTags: ['ramp_accessible', 'wide_doorway', 'audio_beacon', 'braille_signage'],
    coordinates: { x: 30, y: 40, width: 140, height: 90 },
    description: '250-seat lecture hall with wheelchair accessibility zones and hearing loop.',
  },
  {
    id: 'rm_th_g02',
    buildingId: 'bldg_turing',
    floor: 0,
    roomNumber: 'TH-G02',
    name: 'Robotics & Embedded Systems Lab',
    type: 'lab',
    department: 'Computer Science',
    accessibilityTags: ['ramp_accessible', 'step_free', 'wide_doorway'],
    coordinates: { x: 190, y: 40, width: 130, height: 90 },
    description: 'Equipped with ROS testbeds, cobots, and 3D prototyping benches.',
  },
  {
    id: 'rm_th_g_washroom',
    buildingId: 'bldg_turing',
    floor: 0,
    roomNumber: 'TH-GW01',
    name: 'Universal Accessible Restroom',
    type: 'washroom',
    department: 'Facilities',
    accessibilityTags: ['accessible_restroom', 'ramp_accessible', 'braille_signage', 'tactile_paving'],
    coordinates: { x: 340, y: 40, width: 70, height: 50 },
    isNearestCategory: 'washroom',
    description: 'ADA-compliant universal restroom with emergency assistance pull cord.',
  },
  {
    id: 'rm_th_g_lift',
    buildingId: 'bldg_turing',
    floor: 0,
    roomNumber: 'TH-E01',
    name: 'Central Glass Elevator',
    type: 'elevator',
    department: 'Facilities',
    accessibilityTags: ['elevator_access', 'braille_signage', 'audio_beacon', 'step_free'],
    coordinates: { x: 340, y: 100, width: 70, height: 60 },
    isNearestCategory: 'elevator',
    description: 'Tactile buttons, voice floor announcements, automatic door sensors.',
  },
  {
    id: 'rm_th_g_exit',
    buildingId: 'bldg_turing',
    floor: 0,
    roomNumber: 'TH-EX01',
    name: 'North Emergency Exit & Ramp',
    type: 'exit',
    department: 'Safety',
    accessibilityTags: ['ramp_accessible', 'step_free', 'wide_doorway'],
    coordinates: { x: 430, y: 60, width: 60, height: 70 },
    isNearestCategory: 'exit',
    description: 'Direct step-free emergency egress to the central courtyard.',
  },

  // Alan Turing Hall - Floor 1
  {
    id: 'rm_th_101',
    buildingId: 'bldg_turing',
    floor: 1,
    roomNumber: 'TH-101',
    name: 'Deep Learning & GPU Cluster Lab',
    type: 'lab',
    department: 'Artificial Intelligence',
    accessibilityTags: ['elevator_access', 'wide_doorway', 'braille_signage'],
    coordinates: { x: 30, y: 40, width: 140, height: 90 },
    description: 'NVIDIA DGX compute station and vision computing workstations.',
  },
  {
    id: 'rm_th_102',
    buildingId: 'bldg_turing',
    floor: 1,
    roomNumber: 'TH-102',
    name: 'Dr. Elena Rostova - Faculty Office',
    type: 'office',
    department: 'Artificial Intelligence',
    accessibilityTags: ['elevator_access', 'braille_signage', 'step_free'],
    coordinates: { x: 190, y: 40, width: 100, height: 90 },
    description: 'Office hours: Mon & Wed 2:00 PM - 4:00 PM.',
  },
  {
    id: 'rm_th_1_washroom',
    buildingId: 'bldg_turing',
    floor: 1,
    roomNumber: 'TH-1W01',
    name: 'Universal Restroom (Floor 1)',
    type: 'washroom',
    department: 'Facilities',
    accessibilityTags: ['accessible_restroom', 'elevator_access', 'braille_signage'],
    coordinates: { x: 340, y: 40, width: 70, height: 50 },
    isNearestCategory: 'washroom',
  },
  {
    id: 'rm_th_1_lift',
    buildingId: 'bldg_turing',
    floor: 1,
    roomNumber: 'TH-E01',
    name: 'Central Glass Elevator (Floor 1)',
    type: 'elevator',
    department: 'Facilities',
    accessibilityTags: ['elevator_access', 'braille_signage', 'audio_beacon'],
    coordinates: { x: 340, y: 100, width: 70, height: 60 },
    isNearestCategory: 'elevator',
  },

  // Ramanujan Science Complex
  {
    id: 'rm_rc_g01',
    buildingId: 'bldg_ramanujan',
    floor: 0,
    roomNumber: 'RC-G01',
    name: 'Quantum Optics & Laser Lab',
    type: 'lab',
    department: 'Physics',
    accessibilityTags: ['ramp_accessible', 'step_free', 'wide_doorway'],
    coordinates: { x: 40, y: 40, width: 150, height: 90 },
  },
  {
    id: 'rm_rc_g02',
    buildingId: 'bldg_ramanujan',
    floor: 0,
    roomNumber: 'RC-G02',
    name: 'Applied Mathematics Seminar Room',
    type: 'classroom',
    department: 'Mathematics',
    accessibilityTags: ['ramp_accessible', 'braille_signage', 'audio_beacon'],
    coordinates: { x: 210, y: 40, width: 140, height: 90 },
  },
  {
    id: 'rm_rc_g_washroom',
    buildingId: 'bldg_ramanujan',
    floor: 0,
    roomNumber: 'RC-GW01',
    name: 'Accessible Restroom (Ramanujan Ground)',
    type: 'washroom',
    department: 'Facilities',
    accessibilityTags: ['accessible_restroom', 'ramp_accessible'],
    coordinates: { x: 370, y: 40, width: 70, height: 50 },
    isNearestCategory: 'washroom',
  },

  // Tagore Central Library
  {
    id: 'rm_tl_g01',
    buildingId: 'bldg_library',
    floor: 0,
    roomNumber: 'TL-G01',
    name: 'Digital Knowledge Commons & Circulation Desk',
    type: 'library',
    department: 'Library Services',
    accessibilityTags: ['ramp_accessible', 'tactile_paving', 'wide_doorway', 'braille_signage'],
    coordinates: { x: 40, y: 40, width: 180, height: 100 },
    description: 'Assistive reading terminals, screen magnifiers, and research helpdesk.',
  },
  {
    id: 'rm_tl_g02',
    buildingId: 'bldg_library',
    floor: 0,
    roomNumber: 'TL-G02',
    name: 'Quiet Research Carrels (Accessible)',
    type: 'library',
    department: 'Library Services',
    accessibilityTags: ['ramp_accessible', 'step_free'],
    coordinates: { x: 240, y: 40, width: 140, height: 100 },
  },
  {
    id: 'rm_tl_g_exit',
    buildingId: 'bldg_library',
    floor: 0,
    roomNumber: 'TL-EX01',
    name: 'Main South Ramp Exit',
    type: 'exit',
    department: 'Safety',
    accessibilityTags: ['ramp_accessible', 'step_free', 'tactile_paving'],
    coordinates: { x: 400, y: 50, width: 60, height: 70 },
    isNearestCategory: 'exit',
  },

  // Vivekananda Student Center & Canteen
  {
    id: 'rm_sh_g01',
    buildingId: 'bldg_student_center',
    floor: 0,
    roomNumber: 'SH-G01',
    name: 'Annapurna Canteen & Organic Coffee Bar',
    type: 'canteen',
    department: 'Dining Services',
    accessibilityTags: ['ramp_accessible', 'wide_doorway', 'step_free', 'braille_signage'],
    coordinates: { x: 40, y: 40, width: 220, height: 110 },
    isNearestCategory: 'canteen',
    description: 'Full hot food cafeteria, dietary options (vegan/halal/gluten-free), and wheelchair accessible seating.',
  },
  {
    id: 'rm_sh_g02',
    buildingId: 'bldg_student_center',
    floor: 0,
    roomNumber: 'SH-G02',
    name: 'Student Wellness & First Aid Center',
    type: 'facility',
    department: 'Health Services',
    accessibilityTags: ['ramp_accessible', 'accessible_restroom', 'step_free'],
    coordinates: { x: 280, y: 40, width: 130, height: 110 },
    description: '24/7 nursing station and accessible triage.',
  },
  {
    id: 'rm_sh_parking',
    buildingId: 'bldg_student_center',
    floor: 0,
    roomNumber: 'SH-PK01',
    name: 'Accessible Priority Parking Lot B',
    type: 'parking',
    department: 'Campus Security',
    accessibilityTags: ['step_free', 'tactile_paving', 'wide_doorway'],
    coordinates: { x: 430, y: 40, width: 70, height: 110 },
    isNearestCategory: 'parking',
    description: 'Dedicated EV charging and disabled permit parking slots with zero curb elevation.',
  },

  // Main Administrative Block
  {
    id: 'rm_ab_g01',
    buildingId: 'bldg_admin',
    floor: 0,
    roomNumber: 'AB-G01',
    name: 'Office of Admissions & Student Credentials',
    type: 'office',
    department: 'Registrar',
    accessibilityTags: ['ramp_accessible', 'braille_signage', 'wide_doorway', 'audio_beacon'],
    coordinates: { x: 40, y: 40, width: 160, height: 100 },
    description: 'SSO keycard issuance, transcripts, and official seals.',
  },
  {
    id: 'rm_ab_g_washroom',
    buildingId: 'bldg_admin',
    floor: 0,
    roomNumber: 'AB-GW01',
    name: 'Accessible Restroom (Admin Ground)',
    type: 'washroom',
    department: 'Facilities',
    accessibilityTags: ['accessible_restroom', 'ramp_accessible'],
    coordinates: { x: 350, y: 40, width: 70, height: 50 },
    isNearestCategory: 'washroom',
  },
];

export const campusNodes: MapPathwayNode[] = [
  { id: 'node_th_entrance', buildingId: 'bldg_turing', floor: 0, name: 'Turing Hall Main Entrance (Ramp)', x: 180, y: 220, isRamp: true, isAccessible: true },
  { id: 'node_th_f1_lobby', buildingId: 'bldg_turing', floor: 1, name: 'Turing Hall Floor 1 Elevator Lobby', x: 180, y: 160, isElevator: true, isAccessible: true },
  { id: 'node_rc_entrance', buildingId: 'bldg_ramanujan', floor: 0, name: 'Ramanujan Entrance (Step-Free)', x: 440, y: 210, isRamp: true, isAccessible: true },
  { id: 'node_ct_entrance', buildingId: 'bldg_curie', floor: 0, name: 'Curie Tower South Vestibule', x: 680, y: 240, isRamp: true, isAccessible: true },
  { id: 'node_tl_entrance', buildingId: 'bldg_library', floor: 0, name: 'Tagore Library North Gateway', x: 260, y: 340, isRamp: true, isAccessible: true },
  { id: 'node_sh_entrance', buildingId: 'bldg_student_center', floor: 0, name: 'Student Hub & Canteen Plaza', x: 530, y: 350, isAccessible: true },
  { id: 'node_ab_entrance', buildingId: 'bldg_admin', floor: 0, name: 'Administrative Block Grand Portico', x: 390, y: 500, isRamp: true, isAccessible: true },
  { id: 'node_plaza_center', name: 'Central Campus Lawn & Fountain', x: 380, y: 280, isOutdoor: true, isAccessible: true },
  { id: 'node_west_path', name: 'West Sycamore Boulevard', x: 210, y: 290, isOutdoor: true, isAccessible: true },
  { id: 'node_east_path', name: 'East Academic Walkway', x: 580, y: 270, isOutdoor: true, isAccessible: true },
  { id: 'node_south_promenade', name: 'South Garden Promenade', x: 390, y: 420, isOutdoor: true, isAccessible: true },
];

export const campusEdges: MapPathwayEdge[] = [
  {
    from: 'node_th_entrance',
    to: 'node_west_path',
    distanceMeters: 45,
    hasStairs: false,
    hasElevator: false,
    hasRamp: true,
    isAccessible: true,
    instruction: 'Exit Turing Hall via the tactile ramp toward West Sycamore Boulevard.',
  },
  {
    from: 'node_west_path',
    to: 'node_tl_entrance',
    distanceMeters: 55,
    hasStairs: false,
    hasElevator: false,
    hasRamp: false,
    isAccessible: true,
    instruction: 'Continue south on the smooth stone corridor toward Tagore Central Library.',
  },
  {
    from: 'node_west_path',
    to: 'node_plaza_center',
    distanceMeters: 60,
    hasStairs: false,
    hasElevator: false,
    hasRamp: false,
    isAccessible: true,
    instruction: 'Turn east onto the paved pathway crossing the central campus fountain.',
  },
  {
    from: 'node_plaza_center',
    to: 'node_rc_entrance',
    distanceMeters: 70,
    hasStairs: false,
    hasElevator: false,
    hasRamp: true,
    isAccessible: true,
    instruction: 'Follow the tactile paving northeast toward Ramanujan Science Complex.',
  },
  {
    from: 'node_rc_entrance',
    to: 'node_ct_entrance',
    distanceMeters: 80,
    hasStairs: false,
    hasElevator: false,
    hasRamp: true,
    isAccessible: true,
    instruction: 'Head east on the covered canopy walk to the Marie Curie Bio-Tech Tower.',
  },
  {
    from: 'node_plaza_center',
    to: 'node_south_promenade',
    distanceMeters: 50,
    hasStairs: false,
    hasElevator: false,
    hasRamp: false,
    isAccessible: true,
    instruction: 'Walk south through the shaded promenade toward the Student Hub & Admin Quad.',
  },
  {
    from: 'node_south_promenade',
    to: 'node_sh_entrance',
    distanceMeters: 45,
    hasStairs: false,
    hasElevator: false,
    hasRamp: true,
    isAccessible: true,
    instruction: 'Turn east toward the Vivekananda Student Hub & Canteen terrace.',
  },
  {
    from: 'node_south_promenade',
    to: 'node_ab_entrance',
    distanceMeters: 40,
    hasStairs: false,
    hasElevator: false,
    hasRamp: true,
    isAccessible: true,
    instruction: 'Proceed straight south to the Main Administrative Block entrance.',
  },
  {
    from: 'node_th_entrance',
    to: 'node_th_f1_lobby',
    distanceMeters: 25,
    hasStairs: false,
    hasElevator: true,
    hasRamp: true,
    isAccessible: true,
    instruction: 'Take Central Glass Elevator E01 to Floor 1.',
  },
];

export const initialKBDocuments: KBDocument[] = [
  {
    id: 'kb_doc_01',
    title: 'Fall 2026 Midterm & End-Semester Examination Schedule',
    category: 'Exam Schedules',
    summary: 'Official dates, hall ticket guidelines, and accessibility accommodations for midterm and final exams.',
    content: `UNIVERSITY ACADEMIC REGISTRAR - OFFICIAL CIRCULAR #EX-2026-44
Applicable to all Undergraduate and Postgraduate programs for Fall Semester 2026.

1. Midterm Examinations:
- Dates: October 12, 2026 to October 19, 2026.
- Slot A: 09:30 AM to 11:30 AM. Slot B: 02:00 PM to 04:00 PM.
- Venue: Alan Turing Hall (Lecture Halls TH-G01, TH-101) and Ramanujan Complex (RC-G01, RC-G02).

2. Final End-Semester Examinations:
- Dates: December 07, 2026 to December 22, 2026.
- Hall tickets will be released digitally on the student portal 14 days prior.

3. Disability & Special Accommodation Norms:
- Students registered with the Campus Accessibility Office are entitled to 30 minutes compensatory extra time per 2-hour paper, a scribe upon request, and seating in ground-floor accessible halls (TH-G01 / RC-G01).
- Requests must be lodged with the Office of Admissions & Examinations at least 7 days before commencement.`,
    verifiedBy: 'Dr. Aris Thorne (Academic Dean & Registrar)',
    lastUpdated: '2026-08-20',
    tags: ['exam', 'midterm', 'schedule', 'hall ticket', 'accommodations', 'dates'],
    isVerified: true,
  },
  {
    id: 'kb_doc_02',
    title: 'Master Class Timetable & Lecture Slot Matrix 2026-27',
    category: 'Timetable',
    summary: 'Departmental timetable slots, lab timing blocks, and classroom assignments.',
    content: `CAMPUS ACADEMIC COUNCIL - TIMETABLE BULLETIN 2026
Standard Lecture and Laboratory blocks across all engineering & science departments.

1. Regular Lecture Timings:
- Slot 1: 08:30 AM - 09:25 AM
- Slot 2: 09:30 AM - 10:25 AM
- Morning Tea Break: 10:25 AM - 10:45 AM
- Slot 3: 10:45 AM - 11:40 AM
- Slot 4: 11:45 AM - 12:40 PM
- Lunch Break: 12:40 PM - 01:40 PM (Annapurna Canteen)
- Afternoon Labs & Practical Workshops: 01:45 PM - 04:30 PM

2. Key Core Courses:
- CS301 (Data Structures & Algorithms): Mon, Wed, Fri 09:30 AM in TH-G01.
- AI402 (Machine Learning & Neural Nets): Tue, Thu 10:45 AM in TH-101.
- EE201 (Signals & Systems): Mon, Wed 01:45 PM in RC-G02.

3. Attendance Rule: Minimum 75% attendance in both lectures and laboratories is strictly mandatory for semester exam clearance.`,
    verifiedBy: 'Prof. K. Venkatesh (Head of Timetable Committee)',
    lastUpdated: '2026-08-28',
    tags: ['timetable', 'slots', 'classes', 'lecture hours', 'attendance', 'CS301', 'AI402'],
    isVerified: true,
  },
  {
    id: 'kb_doc_03',
    title: 'Tagore Central Library Policies & Digital Commons Access',
    category: 'Facilities',
    summary: 'Library operating hours, book lending quotas, quiet zones, and digital database access.',
    content: `TAGORE CENTRAL LIBRARY - OPERATING REGULATIONS 2026

1. Operating Hours:
- Monday through Friday: 08:00 AM to 11:00 PM.
- Saturday & Sunday: 09:00 AM to 08:00 PM.
- 24/7 Quiet Reading Hall: Open continuously during exam weeks with institutional keycard entry.

2. Borrowing Quotas:
- Undergraduate Students: 6 books for 21 days (renewable twice online).
- Postgraduate & Research Scholars: 10 books for 45 days.
- Faculty Members: 20 books for the full semester.

3. Digital Knowledge Commons & Assistive Tech:
- Access to IEEE Xplore, ACM Digital Library, SpringerLink, and ScienceDirect via campus Wi-Fi or EduVPN.
- 12 dedicated Assistive Terminals located on Ground Floor (TL-G01) featuring JAWS, NVDA, braille embossers, and motorized adjustable height desks.`,
    verifiedBy: 'Sumantha Sen (University Chief Librarian)',
    lastUpdated: '2026-08-15',
    tags: ['library', 'hours', 'borrowing', 'books', 'IEEE', 'digital commons', 'assistive tech'],
    isVerified: true,
  },
  {
    id: 'kb_doc_04',
    title: 'Institutional Code of Conduct, Anti-Ragging & Equal Opportunity Policy',
    category: 'Official Rules & Policies',
    summary: 'Campus zero-tolerance policies, anti-harassment committee, grievance mechanisms.',
    content: `CAMPUS ETHICS, EQUALITY & SAFETY DIRECTIVE #POL-2026-02

1. Zero Tolerance on Ragging & Harassment:
- The institution enforces absolute zero tolerance toward any form of ragging, bullying, or discrimination based on race, gender, caste, language, or disability.
- 24/7 Anti-Ragging Helpline: Dial extension 4444 or email antiragging@campus.edu.

2. Grievance Redressal & Helpdesk:
- Any student or staff member may file a grievance through the Smart Campus Helpdesk.
- Urgent matters receive preliminary review within 24 hours by the Dean of Student Welfare.

3. Campus Green & Accessible Mobility Norms:
- Motorized personal vehicles are restricted to designated perimeter parking lots (SH-PK01).
- Electric campus shuttles run every 10 minutes along the central loop, fully wheelchair accessible.`,
    verifiedBy: 'Office of the Vice-Chancellor & Legal Counsel',
    lastUpdated: '2026-07-30',
    tags: ['rules', 'anti-ragging', 'conduct', 'grievance', 'safety', 'shuttle', 'equality'],
    isVerified: true,
  },
  {
    id: 'kb_doc_05',
    title: 'Annapurna Canteen, Food Services & Student Wellness Amenities',
    category: 'Facilities',
    summary: 'Dining hours, meal plan rates, nutritional standards, and campus medical clinic hours.',
    content: `STUDENT AFFAIRS & CAMPUS SERVICES NOTICE #CS-2026-19

1. Dining Hall Hours (Vivekananda Student Hub):
- Breakfast: 07:30 AM - 09:30 AM
- Lunch: 12:30 PM - 02:30 PM
- Evening Snacks & Café: 04:30 PM - 06:30 PM
- Dinner: 07:30 PM - 09:30 PM

2. Student Wellness & First Aid Clinic (SH-G02):
- Resident physician on duty Mon-Sat 09:00 AM - 05:00 PM.
- 24-hour emergency nursing assistance and ambulance dispatch on standby. Contact Ext. 108.
- Psychological counseling and wellness consultations available free of charge by appointment.`,
    verifiedBy: 'Directorate of Student Welfare',
    lastUpdated: '2026-08-10',
    tags: ['canteen', 'food', 'meals', 'wellness', 'clinic', 'first aid', 'counseling'],
    isVerified: true,
  },
  {
    id: 'kb_doc_06',
    title: 'Department of Computer Science & Engineering - Degree Guidelines',
    category: 'Department Info',
    summary: 'Curriculum structure, lab safety, research labs, and academic advising.',
    content: `SCHOOL OF COMPUTING - CSE DEPARTMENT HANDBOOK 2026

1. Faculty Office Locations:
- Head of Department (Dr. Elena Rostova): Turing Hall Room TH-102.
- Department Office & Academic Advising: Turing Hall TH-104.

2. Major Research Facilities:
- Deep Learning & Vision Lab: TH-101.
- Robotics & Autonomous Vehicles Sandbox: TH-G02.
- High Performance Cloud & Cyber Security Center: TH-201.

3. Capstone Projects & Internships:
- Final year research capstone requires submission of an NBA-compliant outcome portfolio and demonstration at the Annual Tech Colloquium.`,
    verifiedBy: 'Dr. Elena Rostova (HOD, Computer Science)',
    lastUpdated: '2026-08-25',
    tags: ['department', 'computer science', 'CSE', 'faculty', 'labs', 'capstone', 'advising'],
    isVerified: true,
  },
];

export const initialResearchProfiles: ResearchProfile[] = [
  {
    userId: 'usr_faculty_1',
    name: 'Dr. Elena Rostova',
    role: 'faculty',
    department: 'Artificial Intelligence & Robotics',
    designation: 'Associate Professor & HOD',
    email: 'elena.rostova@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Pioneering multimodal neural architectures, spatial navigation transformers, and assistive robotics for inclusive campus environments.',
    interests: ['Spatial AI', 'Robotics & SLAM', 'Multimodal LLMs', 'Computer Vision', 'Assistive Tech'],
    skills: ['PyTorch', 'ROS2', 'CUDA', 'Point Cloud Processing', 'Transformer Optimization', 'OpenCV'],
    publications: [
      {
        id: 'pub_1',
        title: 'Zero-Shot Indoor Navigation Using Multimodal Floor Plan Grounding',
        journalOrConference: 'IEEE Transactions on Robotics (T-RO)',
        year: 2025,
        citations: 48,
        doi: '10.1109/TRO.2025.1092837',
      },
      {
        id: 'pub_2',
        title: 'Accessible Path Optimization for Autonomous Wheelchair Systems',
        journalOrConference: 'ACM SIGACCESS Conf. on Computers and Accessibility (ASSETS)',
        year: 2024,
        citations: 34,
        doi: '10.1145/3663548.3675619',
      },
      {
        id: 'pub_3',
        title: 'Low-Latency Edge Transformers for Real-Time Sensor Fusion',
        journalOrConference: 'CVPR Workshop on Embedded Vision',
        year: 2023,
        citations: 72,
        doi: '10.1109/CVPRW.2023.00392',
      },
    ],
    orcidId: '0000-0002-1825-0097',
    googleScholarUrl: 'https://scholar.google.com/citations?user=elena_rostova',
    openForCollaboration: true,
    availableHoursPerWeek: 10,
  },
  {
    userId: 'usr_faculty_2',
    name: 'Dr. Vikramaditya Rao',
    role: 'faculty',
    department: 'Biomedical & Neural Engineering',
    designation: 'Professor & Chair',
    email: 'vikram.rao@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Investigating neural signal decoders, wearable EEG interfaces, and sensory augmentation devices for motor rehabilitation.',
    interests: ['Neural Interfaces', 'Bio-Signal Processing', 'Wearable Sensors', 'Brain-Computer Interfaces (BCI)', 'Rehabilitation Robotics'],
    skills: ['EEG Signal Analysis', 'Signal Processing (MATLAB)', 'TensorFlow', 'Embedded C/C++', 'Biosensor Fabrication'],
    publications: [
      {
        id: 'pub_4',
        title: 'Non-Invasive Brain-to-Text Decoding with Temporal Convolutional Networks',
        journalOrConference: 'Nature Biomedical Engineering',
        year: 2025,
        citations: 89,
        doi: '10.1038/s41551-025-01289-w',
      },
      {
        id: 'pub_5',
        title: 'Wearable Tactile Haptics for Visually Impaired Spatial Orientation',
        journalOrConference: 'IEEE Transactions on Haptics',
        year: 2023,
        citations: 41,
        doi: '10.1109/TOH.2023.3289012',
      },
    ],
    orcidId: '0000-0001-9844-3120',
    googleScholarUrl: 'https://scholar.google.com/citations?user=vikram_rao',
    openForCollaboration: true,
    availableHoursPerWeek: 8,
  },
  {
    userId: 'usr_student_1',
    name: 'Aarav Sharma',
    role: 'student',
    department: 'Computer Science & Engineering',
    designation: 'Undergraduate Senior & Research Fellow',
    email: 'aarav.sharma@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    bio: 'Senior undergraduate researcher enthusiastic about Graph Neural Networks, topological campus routing, and speech-based assistive agents.',
    interests: ['Graph Neural Networks', 'Natural Language Processing', 'Spatial Pathfinding', 'Accessibility Systems', 'Voice AI'],
    skills: ['Python', 'PyTorch Geometric', 'FastAPI', 'React/TypeScript', 'Web Audio API', 'PostgreSQL'],
    publications: [
      {
        id: 'pub_6',
        title: 'Topological Campus Graph Modeling for Accessibility-Aware Routing',
        journalOrConference: 'Student Research Competition, ACM SIGSPATIAL',
        year: 2025,
        citations: 12,
        doi: '10.1145/3688941.3690122',
      },
    ],
    orcidId: '0009-0004-7712-4491',
    googleScholarUrl: 'https://scholar.google.com/citations?user=aarav_sharma',
    openForCollaboration: true,
    availableHoursPerWeek: 15,
  },
  {
    userId: 'usr_student_2',
    name: 'Ananya Deshmukh',
    role: 'student',
    department: 'Biomedical & Neural Engineering',
    designation: 'M.Tech Research Scholar',
    email: 'ananya.deshmukh@campus.edu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Working on sensor fusion for gait analysis and real-time obstacle detection using stereo-vision and ultrasonic array helmets.',
    interests: ['Assistive Sensors', 'Computer Vision', 'Embedded IoT', 'Gait Biomarkers', 'Human-Robot Interaction'],
    skills: ['OpenCV', 'Raspberry Pi', 'Sensor Fusion (Kalman Filters)', 'Python', 'SolidWorks'],
    publications: [
      {
        id: 'pub_7',
        title: 'Ultrasonic Sensory Substitution Headset for Ambient Hazard Detection',
        journalOrConference: 'IEEE Sensors Letters',
        year: 2024,
        citations: 19,
        doi: '10.1109/LSENS.2024.3398112',
      },
    ],
    orcidId: '0009-0008-3312-9904',
    openForCollaboration: true,
    availableHoursPerWeek: 20,
  },
];

export const initialResearchProjects: ResearchProject[] = [
  {
    id: 'proj_01',
    authorId: 'usr_faculty_1',
    authorName: 'Dr. Elena Rostova',
    authorRole: 'faculty',
    department: 'Artificial Intelligence & Robotics',
    title: 'Autonomous Campus Navigation Guide for Visually Impaired Visitors',
    description: 'Developing a wearable device coupled with indoor BLE beacons and spatial visual question answering (VQA) to give real-time pedestrian audio prompts across campus hallways.',
    requiredSkills: ['PyTorch', 'ROS2', 'Web Audio API', 'Point Cloud Processing', 'Computer Vision'],
    targetOutcomes: 'Deploy operational testbed in Turing Hall and submit joint paper to IROS/ICRA 2027.',
    status: 'open',
    createdAt: '2026-08-15',
  },
  {
    id: 'proj_02',
    authorId: 'usr_faculty_2',
    authorName: 'Dr. Vikramaditya Rao',
    authorRole: 'faculty',
    department: 'Biomedical & Neural Engineering',
    title: 'Cognitive Load Tracking During High-Stakes STEM Examinations',
    description: 'Correlating non-intrusive photoplethysmography (PPG) and EEG headset metrics with student problem-solving velocity during algorithm exams to optimize instructional pacing.',
    requiredSkills: ['EEG Signal Analysis', 'Biosensor Fabrication', 'TensorFlow', 'PostgreSQL'],
    targetOutcomes: 'IRB-approved pilot study with 40 participants across CS301 and EE201 cohorts.',
    status: 'open',
    createdAt: '2026-08-22',
  },
];

export const initialCourses: Course[] = [
  {
    id: 'course_cs301',
    code: 'CS301',
    name: 'Data Structures & Algorithmic Analysis',
    department: 'Computer Science & Engineering',
    semester: 'Fall 2026',
    academicYear: '2026-2027',
    credits: 4,
    facultyId: 'usr_faculty_1',
    facultyName: 'Dr. Elena Rostova',
    attainmentThreshold: 60, // 60% standard benchmark
    courseOutcomes: [
      {
        id: 'co_cs301_1',
        code: 'CO1',
        description: 'Analyze the asymptotic complexity of iterative and recursive algorithms.',
        targetPercentage: 65,
        bloomLevel: 'Analyze',
      },
      {
        id: 'co_cs301_2',
        code: 'CO2',
        description: 'Design and implement advanced tree and heap data structures for high-performance applications.',
        targetPercentage: 65,
        bloomLevel: 'Create',
      },
      {
        id: 'co_cs301_3',
        code: 'CO3',
        description: 'Implement graph traversal and shortest-path algorithms (Dijkstra, A*, Floyd-Warshall).',
        targetPercentage: 60,
        bloomLevel: 'Apply',
      },
      {
        id: 'co_cs301_4',
        code: 'CO4',
        description: 'Evaluate divide-and-conquer and dynamic programming paradigms on NP-hard approximations.',
        targetPercentage: 60,
        bloomLevel: 'Evaluate',
      },
      {
        id: 'co_cs301_5',
        code: 'CO5',
        description: 'Synthesize optimal amortized data structures to solve complex systems-engineering challenges.',
        targetPercentage: 65,
        bloomLevel: 'Create',
      },
    ],
    programOutcomes: [
      { id: 'po_1', code: 'PO1', description: 'Engineering Knowledge: Apply knowledge of computing mathematics and engineering fundamentals.' },
      { id: 'po_2', code: 'PO2', description: 'Problem Analysis: Identify, formulate, and analyze complex engineering problems.' },
      { id: 'po_3', code: 'PO3', description: 'Design/Development of Solutions: Design solutions for complex computing systems.' },
      { id: 'po_5', code: 'PO5', description: 'Modern Tool Usage: Create, select, and apply appropriate computing tools and simulation techniques.' },
    ],
  },
  {
    id: 'course_ai402',
    code: 'AI402',
    name: 'Machine Learning & Deep Neural Systems',
    department: 'Artificial Intelligence',
    semester: 'Fall 2026',
    academicYear: '2026-2027',
    credits: 4,
    facultyId: 'usr_faculty_1',
    facultyName: 'Dr. Elena Rostova',
    attainmentThreshold: 65,
    courseOutcomes: [
      {
        id: 'co_ai402_1',
        code: 'CO1',
        description: 'Formulate supervised learning loss objectives using gradient calculus.',
        targetPercentage: 70,
        bloomLevel: 'Apply',
      },
      {
        id: 'co_ai402_2',
        code: 'CO2',
        description: 'Construct convolutional and recurrent neural models for spatio-temporal signals.',
        targetPercentage: 65,
        bloomLevel: 'Create',
      },
      {
        id: 'co_ai402_3',
        code: 'CO3',
        description: 'Implement attention mechanisms and transformer multi-head architectures.',
        targetPercentage: 60,
        bloomLevel: 'Analyze',
      },
    ],
    programOutcomes: [
      { id: 'po_1', code: 'PO1', description: 'Engineering Knowledge' },
      { id: 'po_3', code: 'PO3', description: 'Design/Development of Solutions' },
    ],
  },
];

export const initialAssessments: AssessmentRecord[] = [
  // CS301 Assessments mapped to CO1..CO5
  // Student 1: Aarav
  { id: 'as_1', courseId: 'course_cs301', courseOutcomeId: 'CO1', studentId: 'S101', studentName: 'Aarav Sharma', assessmentName: 'Midterm 1', score: 18, maxScore: 20 },
  { id: 'as_2', courseId: 'course_cs301', courseOutcomeId: 'CO2', studentId: 'S101', studentName: 'Aarav Sharma', assessmentName: 'Lab Exam 1', score: 22, maxScore: 25 },
  { id: 'as_3', courseId: 'course_cs301', courseOutcomeId: 'CO3', studentId: 'S101', studentName: 'Aarav Sharma', assessmentName: 'Assignment 2', score: 28, maxScore: 30 },
  { id: 'as_4', courseId: 'course_cs301', courseOutcomeId: 'CO4', studentId: 'S101', studentName: 'Aarav Sharma', assessmentName: 'End-Sem Theory', score: 14, maxScore: 25 }, // 56% (Below threshold)
  { id: 'as_5', courseId: 'course_cs301', courseOutcomeId: 'CO5', studentId: 'S101', studentName: 'Aarav Sharma', assessmentName: 'Capstone Project', score: 23, maxScore: 25 },

  // Student 2: Riya
  { id: 'as_6', courseId: 'course_cs301', courseOutcomeId: 'CO1', studentId: 'S102', studentName: 'Riya Patel', assessmentName: 'Midterm 1', score: 16, maxScore: 20 },
  { id: 'as_7', courseId: 'course_cs301', courseOutcomeId: 'CO2', studentId: 'S102', studentName: 'Riya Patel', assessmentName: 'Lab Exam 1', score: 19, maxScore: 25 },
  { id: 'as_8', courseId: 'course_cs301', courseOutcomeId: 'CO3', studentId: 'S102', studentName: 'Riya Patel', assessmentName: 'Assignment 2', score: 25, maxScore: 30 },
  { id: 'as_9', courseId: 'course_cs301', courseOutcomeId: 'CO4', studentId: 'S102', studentName: 'Riya Patel', assessmentName: 'End-Sem Theory', score: 12, maxScore: 25 }, // 48% (Below threshold)
  { id: 'as_10', courseId: 'course_cs301', courseOutcomeId: 'CO5', studentId: 'S102', studentName: 'Riya Patel', assessmentName: 'Capstone Project', score: 18, maxScore: 25 },

  // Student 3: Rohan
  { id: 'as_11', courseId: 'course_cs301', courseOutcomeId: 'CO1', studentId: 'S103', studentName: 'Rohan Iyer', assessmentName: 'Midterm 1', score: 17, maxScore: 20 },
  { id: 'as_12', courseId: 'course_cs301', courseOutcomeId: 'CO2', studentId: 'S103', studentName: 'Rohan Iyer', assessmentName: 'Lab Exam 1', score: 21, maxScore: 25 },
  { id: 'as_13', courseId: 'course_cs301', courseOutcomeId: 'CO3', studentId: 'S103', studentName: 'Rohan Iyer', assessmentName: 'Assignment 2', score: 22, maxScore: 30 },
  { id: 'as_14', courseId: 'course_cs301', courseOutcomeId: 'CO4', studentId: 'S103', studentName: 'Rohan Iyer', assessmentName: 'End-Sem Theory', score: 13, maxScore: 25 }, // 52% (Below threshold)
  { id: 'as_15', courseId: 'course_cs301', courseOutcomeId: 'CO5', studentId: 'S103', studentName: 'Rohan Iyer', assessmentName: 'Capstone Project', score: 20, maxScore: 25 },

  // Student 4: Kavya
  { id: 'as_16', courseId: 'course_cs301', courseOutcomeId: 'CO1', studentId: 'S104', studentName: 'Kavya Nair', assessmentName: 'Midterm 1', score: 15, maxScore: 20 },
  { id: 'as_17', courseId: 'course_cs301', courseOutcomeId: 'CO2', studentId: 'S104', studentName: 'Kavya Nair', assessmentName: 'Lab Exam 1', score: 18, maxScore: 25 },
  { id: 'as_18', courseId: 'course_cs301', courseOutcomeId: 'CO3', studentId: 'S104', studentName: 'Kavya Nair', assessmentName: 'Assignment 2', score: 26, maxScore: 30 },
  { id: 'as_19', courseId: 'course_cs301', courseOutcomeId: 'CO4', studentId: 'S104', studentName: 'Kavya Nair', assessmentName: 'End-Sem Theory', score: 11, maxScore: 25 }, // 44% (Below threshold)
  { id: 'as_20', courseId: 'course_cs301', courseOutcomeId: 'CO5', studentId: 'S104', studentName: 'Kavya Nair', assessmentName: 'Capstone Project', score: 19, maxScore: 25 },

  // Student 5: Dev
  { id: 'as_21', courseId: 'course_cs301', courseOutcomeId: 'CO1', studentId: 'S105', studentName: 'Dev Sen', assessmentName: 'Midterm 1', score: 19, maxScore: 20 },
  { id: 'as_22', courseId: 'course_cs301', courseOutcomeId: 'CO2', studentId: 'S105', studentName: 'Dev Sen', assessmentName: 'Lab Exam 1', score: 23, maxScore: 25 },
  { id: 'as_23', courseId: 'course_cs301', courseOutcomeId: 'CO3', studentId: 'S105', studentName: 'Dev Sen', assessmentName: 'Assignment 2', score: 27, maxScore: 30 },
  { id: 'as_24', courseId: 'course_cs301', courseOutcomeId: 'CO4', studentId: 'S105', studentName: 'Dev Sen', assessmentName: 'End-Sem Theory', score: 18, maxScore: 25 }, // 72%
  { id: 'as_25', courseId: 'course_cs301', courseOutcomeId: 'CO5', studentId: 'S105', studentName: 'Dev Sen', assessmentName: 'Capstone Project', score: 24, maxScore: 25 },

  // Student 6: Ananya
  { id: 'as_26', courseId: 'course_cs301', courseOutcomeId: 'CO1', studentId: 'S106', studentName: 'Ananya Roy', assessmentName: 'Midterm 1', score: 14, maxScore: 20 },
  { id: 'as_27', courseId: 'course_cs301', courseOutcomeId: 'CO2', studentId: 'S106', studentName: 'Ananya Roy', assessmentName: 'Lab Exam 1', score: 17, maxScore: 25 },
  { id: 'as_28', courseId: 'course_cs301', courseOutcomeId: 'CO3', studentId: 'S106', studentName: 'Ananya Roy', assessmentName: 'Assignment 2', score: 20, maxScore: 30 },
  { id: 'as_29', courseId: 'course_cs301', courseOutcomeId: 'CO4', studentId: 'S106', studentName: 'Ananya Roy', assessmentName: 'End-Sem Theory', score: 10, maxScore: 25 }, // 40% (Below threshold)
  { id: 'as_30', courseId: 'course_cs301', courseOutcomeId: 'CO5', studentId: 'S106', studentName: 'Ananya Roy', assessmentName: 'Capstone Project', score: 17, maxScore: 25 },
];

export const initialTickets: HelpdeskTicket[] = [
  {
    id: 'tkt_01',
    userId: 'usr_student_1',
    userName: 'Aarav Sharma',
    userEmail: 'aarav.sharma@campus.edu',
    userRole: 'student',
    query: 'Request for motorized wheelchair ramp access keys at East Quad Gate 3 during weekend hackathon.',
    category: 'Facilities & Accessibility',
    department: 'Facilities',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2026-09-08 14:30',
    resolutionNotes: 'Security control desk notified. RFID permission enabled on student badge.',
  },
  {
    id: 'tkt_02',
    userId: 'usr_visitor_1',
    userName: 'Sophia Chen',
    userEmail: 'sophia.chen@guest.org',
    userRole: 'visitor',
    query: 'Inquiry regarding visitor Wi-Fi credential duration and parking validation for Guest Lecture on Sept 14.',
    category: 'IT & Parking',
    department: 'IT Governance',
    priority: 'medium',
    status: 'open',
    createdAt: '2026-09-09 11:15',
  },
];

export const initialCollabRequests: CollaborationRequest[] = [
  {
    id: 'req_01',
    senderId: 'usr_student_1',
    senderName: 'Aarav Sharma',
    senderRole: 'student',
    receiverId: 'usr_faculty_1',
    receiverName: 'Dr. Elena Rostova',
    projectId: 'proj_01',
    projectTitle: 'Autonomous Campus Navigation Guide for Visually Impaired Visitors',
    proposedRole: 'Undergraduate GNN and Graph Navigation Co-Researcher',
    message: 'Dear Dr. Rostova, I have published on topological campus graph models at ACM SIGSPATIAL and would love to contribute to the audio prompt pipeline.',
    status: 'accepted',
    createdAt: '2026-08-20',
  },
];

export const initialCampusEvents: CampusEvent[] = [
  {
    id: 'evt_01',
    title: 'Annual Interdisciplinary AI & Robotics Hackathon 2026',
    description: '48-hour student and faculty innovation hackathon focused on assistive technologies, autonomous indoor navigation, and intelligent campus accessibility.',
    date: '2026-10-15 to 2026-10-17',
    time: '09:00 AM - 06:00 PM',
    venue: 'Turing Hall, Ground Floor Auditorium & Open Courtyard',
    posterImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
    category: 'Hackathon',
    organizer: 'Department of Computer Science & Robotics Club',
    createdAt: '2026-09-01',
  },
  {
    id: 'evt_02',
    title: 'Distinguished Guest Lecture: Next-Gen Neuromorphic Computing',
    description: 'Keynote by Prof. K. Venkatesh (MIT CSAIL) on sub-milliwatt edge neural processing for real-time sensor fusion.',
    date: '2026-09-24',
    time: '02:00 PM - 04:30 PM',
    venue: 'Edison Hall, First Floor Seminar Hall (EH-101)',
    posterImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
    category: 'Seminar',
    organizer: 'Office of Dean of Research & IEEE Student Chapter',
    createdAt: '2026-09-05',
  },
  {
    id: 'evt_03',
    title: 'Campus Career & Research Industry Showcase 2026',
    description: 'Over 45 technology and research organizations recruiting for full-time R&D roles, undergraduate fellowships, and doctoral sponsorships.',
    date: '2026-11-04',
    time: '10:00 AM - 05:00 PM',
    venue: 'Central Campus Gymnasium & Student Center Complex',
    posterImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    category: 'Conference',
    organizer: 'University Placement & Industry Liaison Cell',
    createdAt: '2026-09-08',
  },
];

export const initialClassTimetables: ClassTimetableEntry[] = [
  {
    id: 'tt_01',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    dayOfWeek: 'Monday',
    timeSlot: '09:00 - 10:00',
    courseCode: 'CS301',
    courseName: 'Data Structures and Algorithms',
    roomNumber: 'TH-G01',
    facultyName: 'Dr. Elena Rostova',
  },
  {
    id: 'tt_02',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    dayOfWeek: 'Monday',
    timeSlot: '10:15 - 11:15',
    courseCode: 'CS302',
    courseName: 'Database Management Systems',
    roomNumber: 'TH-G03',
    facultyName: 'Dr. Ramesh Sundaram',
  },
  {
    id: 'tt_03',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    dayOfWeek: 'Monday',
    timeSlot: '11:30 - 01:00',
    courseCode: 'CS301L',
    courseName: 'Advanced Algorithms Laboratory',
    roomNumber: 'TH-102 (AI Lab)',
    facultyName: 'Dr. Elena Rostova',
  },
  {
    id: 'tt_04',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    dayOfWeek: 'Tuesday',
    timeSlot: '09:00 - 10:00',
    courseCode: 'CS303',
    courseName: 'Operating Systems & Concurrency',
    roomNumber: 'TH-G01',
    facultyName: 'Prof. David Sterling',
  },
  {
    id: 'tt_05',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    dayOfWeek: 'Tuesday',
    timeSlot: '10:15 - 11:15',
    courseCode: 'CS301',
    courseName: 'Data Structures and Algorithms',
    roomNumber: 'TH-G01',
    facultyName: 'Dr. Elena Rostova',
  },
  {
    id: 'tt_06',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    dayOfWeek: 'Wednesday',
    timeSlot: '09:00 - 11:00',
    courseCode: 'CS304',
    courseName: 'Computer Networks & Security',
    roomNumber: 'TH-G02',
    facultyName: 'Dr. Priya Nambiar',
  },
  {
    id: 'tt_07',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    dayOfWeek: 'Thursday',
    timeSlot: '10:15 - 12:15',
    courseCode: 'AI401',
    courseName: 'Deep Learning & Neural Architectures',
    roomNumber: 'TH-102 (AI Lab)',
    facultyName: 'Dr. Elena Rostova',
  },
  {
    id: 'tt_08',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    dayOfWeek: 'Friday',
    timeSlot: '02:00 - 04:00',
    courseCode: 'CS399',
    courseName: 'Capstone Project Colloquium',
    roomNumber: 'TH-Auditorium',
    facultyName: 'Academic Committee',
  },
];

export const initialExamSchedules: ExamScheduleEntry[] = [
  {
    id: 'exam_01',
    courseCode: 'CS301',
    courseName: 'Data Structures and Algorithms',
    semester: 'Semester 5 (Fall 2026)',
    academicYear: '2026-2027',
    examDate: '2026-11-18',
    examTime: '09:30 AM - 12:30 PM',
    venue: 'Turing Hall - Examination Wing A (Rooms G01, G02, G03)',
    invigilator: 'Dr. Elena Rostova & Prof. S. Sen',
  },
  {
    id: 'exam_02',
    courseCode: 'CS302',
    courseName: 'Database Management Systems',
    semester: 'Semester 5 (Fall 2026)',
    academicYear: '2026-2027',
    examDate: '2026-11-21',
    examTime: '09:30 AM - 12:30 PM',
    venue: 'Edison Hall - Main Hall Rooms 101 & 102',
    invigilator: 'Dr. Ramesh Sundaram & Staff',
  },
  {
    id: 'exam_03',
    courseCode: 'CS303',
    courseName: 'Operating Systems & Concurrency',
    semester: 'Semester 5 (Fall 2026)',
    academicYear: '2026-2027',
    examDate: '2026-11-24',
    examTime: '02:00 PM - 05:00 PM',
    venue: 'Turing Hall - Examination Wing B',
    invigilator: 'Prof. David Sterling',
  },
  {
    id: 'exam_04',
    courseCode: 'AI401',
    courseName: 'Deep Learning & Neural Architectures',
    semester: 'Semester 7 (Fall 2026)',
    academicYear: '2026-2027',
    examDate: '2026-11-27',
    examTime: '09:30 AM - 12:30 PM',
    venue: 'Curie Complex - Ground Floor Hall CC-G01',
    invigilator: 'Dr. Elena Rostova',
  },
];
