-- Migration: Update qr_code_token column to VARCHAR(500) to match schema
-- This fixes the issue where QR tokens (144 chars) exceed the current VARCHAR(100) limit

-- Update the attendance table's qr_code_token column
ALTER TABLE attendance 
ALTER COLUMN qr_code_token TYPE VARCHAR(500);

-- Add a comment to document the change
COMMENT ON COLUMN attendance.qr_code_token IS 'QR code token for validation (updated from VARCHAR(100) to VARCHAR(500))';

