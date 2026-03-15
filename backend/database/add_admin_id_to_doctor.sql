-- Migration: Add admin_id column to doctor table
-- This column tracks which admin created each doctor account

-- Add the admin_id column to the doctor table
ALTER TABLE doctor
ADD COLUMN admin_id INT NULL
COMMENT 'ID of the Admin who created this doctor account';

-- Add foreign key constraint to reference users table
ALTER TABLE doctor
ADD CONSTRAINT fk_doctor_admin
FOREIGN KEY (admin_id) REFERENCES users(user_id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Create an index on admin_id for better query performance
CREATE INDEX idx_doctor_admin_id ON doctor(admin_id);

-- Verify the changes
DESCRIBE doctor;
