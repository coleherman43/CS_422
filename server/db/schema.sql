-- Flock Manager Database Schema
-- Core tables for UOSW membership tracking system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workplaces table
CREATE TABLE workplaces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Members table
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    uo_id VARCHAR(20) NOT NULL UNIQUE, -- 95# number
    workplace_id INTEGER REFERENCES workplaces(id),
    role_id INTEGER REFERENCES roles(id),
    dues_status VARCHAR(20) DEFAULT 'unpaid' CHECK (dues_status IN ('paid', 'unpaid', 'exempt')),
    membership_status VARCHAR(20) DEFAULT 'active' CHECK (membership_status IN ('active', 'inactive', 'graduated', 'suspended')),
    major VARCHAR(100),
    phone VARCHAR(20),
    pronouns VARCHAR(50),
    graduation_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_date TIMESTAMP NOT NULL,
    location VARCHAR(200),
    created_by INTEGER REFERENCES members(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    qr_code_token VARCHAR(100),
    UNIQUE(member_id, event_id) -- Prevent duplicate check-ins
);

-- Admins table (for role-based access control)
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    role_id INTEGER REFERENCES roles(id),
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id) -- One admin record per member
);

-- Login tokens table (for magic link authentication)
CREATE TABLE login_tokens (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_uo_id ON members(uo_id);
CREATE INDEX idx_members_workplace ON members(workplace_id);
CREATE INDEX idx_members_role ON members(role_id);
CREATE INDEX idx_members_status ON members(membership_status);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_attendance_member ON attendance(member_id);
CREATE INDEX idx_attendance_event ON attendance(event_id);
CREATE INDEX idx_admins_member ON admins(member_id);
CREATE INDEX idx_login_tokens_token ON login_tokens(token);
CREATE INDEX idx_login_tokens_email ON login_tokens(email);
CREATE INDEX idx_login_tokens_expires ON login_tokens(expires_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to members table
CREATE TRIGGER update_members_updated_at 
    BEFORE UPDATE ON members 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

