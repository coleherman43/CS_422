# Data Dictionary

This document describes the database schema for the Flock Manager system.

## Tables

### roles
**Purpose**: Store admin role types and their descriptions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique role identifier |
| name | VARCHAR(50) | NOT NULL, UNIQUE | Role name (President, Treasurer, etc.) |
| description | TEXT | | Role description |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

**Relationships**: 
- One-to-many with `members` table (role_id)

### workplaces
**Purpose**: Store member workplace locations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique workplace identifier |
| name | VARCHAR(100) | NOT NULL, UNIQUE | Workplace name (EMU, Library, etc.) |
| location | VARCHAR(200) | | Physical location description |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

**Relationships**: 
- One-to-many with `members` table (workplace_id)

### members
**Purpose**: Store member information and status

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique member identifier |
| name | VARCHAR(100) | NOT NULL | Member's full name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Member's email address |
| uo_id | VARCHAR(20) | NOT NULL, UNIQUE | UO 95# number |
| workplace_id | INTEGER | FOREIGN KEY | Reference to workplaces table |
| role_id | INTEGER | FOREIGN KEY | Reference to roles table |
| dues_status | VARCHAR(20) | DEFAULT 'unpaid', CHECK | paid, unpaid, or exempt |
| membership_status | VARCHAR(20) | DEFAULT 'active', CHECK | active, inactive, graduated, or suspended |
| major | VARCHAR(100) | | Member's academic major |
| phone | VARCHAR(20) | | Member's phone number |
| pronouns | VARCHAR(50) | | Member's preferred pronouns |
| graduation_year | INTEGER | | Expected graduation year |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Relationships**: 
- Many-to-one with `workplaces` table (workplace_id)
- Many-to-one with `roles` table (role_id)
- One-to-many with `events` table (created_by)
- One-to-many with `attendance` table (member_id)
- One-to-one with `admins` table (member_id)

### events
**Purpose**: Store union events and meetings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique event identifier |
| title | VARCHAR(200) | NOT NULL | Event title |
| description | TEXT | | Event description |
| event_date | TIMESTAMP | NOT NULL | Event date and time |
| location | VARCHAR(200) | | Event location |
| created_by | INTEGER | FOREIGN KEY | Reference to members table (creator) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

**Relationships**: 
- Many-to-one with `members` table (created_by)
- One-to-many with `attendance` table (event_id)

### attendance
**Purpose**: Track member event check-ins

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique attendance record identifier |
| member_id | INTEGER | FOREIGN KEY, NOT NULL | Reference to members table |
| event_id | INTEGER | FOREIGN KEY, NOT NULL | Reference to events table |
| checked_in_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Check-in timestamp |
| qr_code_token | VARCHAR(500) | | QR code token for validation (schema says 500, but actual DB may have 100 - needs migration) |

**Constraints**: 
- UNIQUE(member_id, event_id) - Prevents duplicate check-ins
- FOREIGN KEY constraints with CASCADE DELETE

**Relationships**: 
- Many-to-one with `members` table (member_id)
- Many-to-one with `events` table (event_id)

### admins
**Purpose**: Store admin permissions and role assignments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique admin record identifier |
| member_id | INTEGER | FOREIGN KEY, NOT NULL, UNIQUE | Reference to members table |
| role_id | INTEGER | FOREIGN KEY | Reference to roles table |
| permissions | JSONB | DEFAULT '{}' | Admin permissions object |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp |

**Constraints**: 
- UNIQUE(member_id) - One admin record per member
- FOREIGN KEY constraints with CASCADE DELETE

**Relationships**: 
- One-to-one with `members` table (member_id)
- Many-to-one with `roles` table (role_id)

## Indexes

### Performance Indexes
- `idx_members_email` - Fast email lookups
- `idx_members_uo_id` - Fast UO ID lookups
- `idx_members_workplace` - Fast workplace filtering
- `idx_members_role` - Fast role filtering
- `idx_members_status` - Fast status filtering
- `idx_events_date` - Fast date-based event queries
- `idx_attendance_member` - Fast member attendance history
- `idx_attendance_event` - Fast event attendance lists
- `idx_admins_member` - Fast admin lookups

## Triggers

### update_members_updated_at
**Purpose**: Automatically update the `updated_at` timestamp when member records are modified

**Function**: `update_updated_at_column()`
**Trigger**: `update_members_updated_at` on `members` table
**Action**: BEFORE UPDATE

## Data Types and Constraints

### Enums and Check Constraints
- `dues_status`: 'paid', 'unpaid', 'exempt'
- `membership_status`: 'active', 'inactive', 'graduated', 'suspended'

### Foreign Key Relationships
- All foreign keys use CASCADE DELETE for data integrity
- Referential integrity maintained through PostgreSQL constraints

### JSONB Usage
- `admins.permissions` uses JSONB for flexible permission storage
- Allows for complex permission structures without schema changes

## Sample Data

The `seed.sql` file contains sample data including:
- 4 roles (President, Treasurer, Executive Member, Member)
- 6 workplaces (EMU, Central Kitchen, Library, etc.)
- 6 sample members with various statuses
- 4 sample events
- 11 sample attendance records
- 3 admin role assignments

