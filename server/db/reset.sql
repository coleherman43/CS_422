-- Reset database - Drop all tables in correct order
-- This handles foreign key constraints by dropping dependent tables first

-- Drop tables in reverse order of creation
DROP TABLE IF EXISTS login_tokens CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS workplaces CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Drop functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop extensions
DROP EXTENSION IF EXISTS "uuid-ossp";

