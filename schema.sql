-- ============================================================
-- Smart Campus AI Hub - PostgreSQL Schema & Vector Store
-- Target: PostgreSQL 15+ with pgvector extension enabled
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ------------------------------------------------------------
-- 1. Roles & Core User Management
-- ------------------------------------------------------------
CREATE TYPE user_role_type AS ENUM ('student', 'faculty', 'visitor', 'admin');

CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Nullable for visitor guest accounts
    role user_role_type NOT NULL,
    department VARCHAR(255) NOT NULL,
    student_or_emp_id VARCHAR(64),
    avatar_url TEXT,
    language_preference VARCHAR(8) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for authentication lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ------------------------------------------------------------
-- 2. Student & Faculty Skills / Expertise
-- ------------------------------------------------------------
CREATE TABLE user_skills (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(128) NOT NULL,
    proficiency_level VARCHAR(32) DEFAULT 'Intermediate', -- Beginner, Intermediate, Advanced, Expert
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_skill UNIQUE (user_id, skill_name)
);

CREATE INDEX idx_user_skills_name ON user_skills(skill_name);

-- ------------------------------------------------------------
-- 3. Faculty Education & Academic Credentials
-- ------------------------------------------------------------
CREATE TABLE faculty_education (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    degree VARCHAR(255) NOT NULL,
    specialization VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    years_experience INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_faculty_education_user ON faculty_education(user_id);

-- ------------------------------------------------------------
-- 4. Campus Events & Schedules (Admin Uploaded)
-- ------------------------------------------------------------
CREATE TABLE campus_events (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    event_date VARCHAR(128) NOT NULL,
    event_time VARCHAR(128) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    poster_image_url TEXT,
    category VARCHAR(64) DEFAULT 'General',
    organizer VARCHAR(255),
    created_by VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 5. Class Timetables (Admin Uploaded & Maintained)
-- ------------------------------------------------------------
CREATE TABLE class_timetables (
    id VARCHAR(64) PRIMARY KEY,
    department VARCHAR(255) NOT NULL,
    semester VARCHAR(64) NOT NULL,
    day_of_week VARCHAR(16) NOT NULL, -- Monday to Saturday
    time_slot VARCHAR(64) NOT NULL,   -- e.g. "09:00 - 10:00"
    course_code VARCHAR(32) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    room_number VARCHAR(64) NOT NULL,
    faculty_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_timetables_dept_sem ON class_timetables(department, semester);

-- ------------------------------------------------------------
-- 6. Exam Schedules (Admin Uploaded)
-- ------------------------------------------------------------
CREATE TABLE exam_schedules (
    id VARCHAR(64) PRIMARY KEY,
    course_code VARCHAR(32) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    semester VARCHAR(64) NOT NULL,
    academic_year VARCHAR(32) NOT NULL,
    exam_date DATE NOT NULL,
    exam_time VARCHAR(64) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    invigilator VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exam_schedules_course ON exam_schedules(course_code, semester);

-- ------------------------------------------------------------
-- 7. Verified Institutional Knowledge Base & Vector Store
-- ------------------------------------------------------------
CREATE TABLE kb_documents (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL, -- Timetable, Exam Schedules, Event Calendar, Department Info, etc.
    content TEXT NOT NULL,
    summary TEXT NOT NULL,
    verified_by VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    tags TEXT[],
    is_verified BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    embedding vector(768) -- Google Gemini text-embedding-004 dimensions
);

-- Fast HNSW cosine similarity index for RAG query retrieval
CREATE INDEX idx_kb_documents_embedding ON kb_documents USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_kb_documents_category ON kb_documents(category);

-- ------------------------------------------------------------
-- 8. Helpdesk Escalation Tickets
-- ------------------------------------------------------------
CREATE TABLE helpdesk_tickets (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_role user_role_type NOT NULL,
    query TEXT NOT NULL,
    category VARCHAR(128) NOT NULL,
    department VARCHAR(255) NOT NULL,
    priority VARCHAR(16) DEFAULT 'medium', -- low, medium, high
    status VARCHAR(32) DEFAULT 'open',     -- open, in_progress, resolved
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_tickets_user ON helpdesk_tickets(user_id);
CREATE INDEX idx_tickets_status ON helpdesk_tickets(status);

-- ------------------------------------------------------------
-- 9. Course Outcome (CO) & Attainment Analytics (Faculty Only)
-- ------------------------------------------------------------
CREATE TABLE courses (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    semester VARCHAR(64) NOT NULL,
    academic_year VARCHAR(32) NOT NULL,
    credits INT NOT NULL,
    faculty_id VARCHAR(64) REFERENCES users(id),
    attainment_threshold INT DEFAULT 60
);

CREATE TABLE course_outcomes (
    id VARCHAR(64) PRIMARY KEY,
    course_id VARCHAR(64) REFERENCES courses(id) ON DELETE CASCADE,
    code VARCHAR(16) NOT NULL, -- CO1, CO2, CO3...
    description TEXT NOT NULL,
    target_percentage INT DEFAULT 70,
    bloom_level VARCHAR(32) NOT NULL
);

CREATE TABLE assessment_records (
    id VARCHAR(64) PRIMARY KEY,
    course_id VARCHAR(64) REFERENCES courses(id) ON DELETE CASCADE,
    course_outcome_id VARCHAR(64) REFERENCES course_outcomes(id) ON DELETE CASCADE,
    student_id VARCHAR(64) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    assessment_name VARCHAR(128) NOT NULL,
    score NUMERIC(5, 2) NOT NULL,
    max_score NUMERIC(5, 2) NOT NULL
);

CREATE INDEX idx_assessment_records_course ON assessment_records(course_id, course_outcome_id);

-- ------------------------------------------------------------
-- 10. Research Collaboration Matcher (Student & Faculty Only)
-- ------------------------------------------------------------
CREATE TABLE research_projects (
    id VARCHAR(64) PRIMARY KEY,
    author_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    department VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT[] NOT NULL,
    target_outcomes TEXT,
    status VARCHAR(32) DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE collaboration_requests (
    id VARCHAR(64) PRIMARY KEY,
    sender_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    receiver_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    project_id VARCHAR(64) REFERENCES research_projects(id) ON DELETE SET NULL,
    proposed_role VARCHAR(128) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'pending', -- pending, accepted, declined
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
