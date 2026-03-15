-- ========================================
-- UPDATE USERS TABLE FOR AUTHENTICATION
-- ========================================

USE pubudud_echanneling_database;

-- Add is_active column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE 
AFTER role_id;

-- Add last_login column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login DATETIME NULL 
AFTER is_active;

-- Rename password_hash column to match if needed (already exists)
-- ALTER TABLE users CHANGE COLUMN password password_hash VARCHAR(255) NOT NULL;

-- Add created_at and updated_at for tracking (optional)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
AFTER last_login;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
AFTER created_at;

-- Verify the updated structure
DESCRIBE users;

SELECT 'Users table updated successfully!' AS Status;
