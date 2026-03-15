-- ========================================
-- DATABASE VERIFICATION SCRIPT
-- ========================================

USE pubudud_echanneling_database;

-- ========================================
-- 1. VERIFY ALL TABLES EXIST
-- ========================================
SELECT 'Checking if all tables exist...' AS Status;

SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM 
    INFORMATION_SCHEMA.TABLES
WHERE 
    TABLE_SCHEMA = 'pubudud_echanneling_database'
ORDER BY 
    TABLE_NAME;

-- ========================================
-- 2. VERIFY ROLE TABLE AND DATA
-- ========================================
SELECT 'Checking Role Table...' AS Status;

-- Check if role table exists and has data
SELECT * FROM role;

-- If roles don't exist, insert them
INSERT IGNORE INTO role (role_name) VALUES 
    ('admin'),
    ('doctor'),
    ('patient'),
    ('receptionist');

-- Verify roles again
SELECT 'Roles after insertion:' AS Status;
SELECT * FROM role;

-- ========================================
-- 3. VERIFY USERS TABLE STRUCTURE
-- ========================================
SELECT 'Checking Users Table Structure...' AS Status;

DESCRIBE users;

-- Check existing users
SELECT 
    user_id,
    username,
    email,
    contact_number,
    role_id,
    (SELECT role_name FROM role WHERE role_id = users.role_id) AS role_name
FROM 
    users;

-- ========================================
-- 4. VERIFY PATIENT TABLE STRUCTURE
-- ========================================
SELECT 'Checking Patient Table Structure...' AS Status;

DESCRIBE patient;

-- Check existing patients
SELECT 
    p.patient_id,
    p.full_name,
    p.nic,
    p.gender,
    p.date_of_birth,
    u.username,
    u.email
FROM 
    patient p
    JOIN users u ON p.user_id = u.user_id;

-- ========================================
-- 5. VERIFY DOCTOR TABLE STRUCTURE
-- ========================================
SELECT 'Checking Doctor Table Structure...' AS Status;

DESCRIBE doctor;

SELECT 
    d.doctor_id,
    d.full_name,
    d.specialization,
    d.license_no,
    u.username
FROM 
    doctor d
    JOIN users u ON d.user_id = u.user_id;

-- ========================================
-- 6. VERIFY RECEPTIONIST TABLE STRUCTURE
-- ========================================
SELECT 'Checking Receptionist Table Structure...' AS Status;

DESCRIBE receptionist;

SELECT 
    r.receptionist_id,
    r.full_name,
    r.nic,
    u.username
FROM 
    receptionist r
    JOIN users u ON r.user_id = u.user_id;

-- ========================================
-- 7. VERIFY ADMIN TABLE STRUCTURE
-- ========================================
SELECT 'Checking Admin Table Structure...' AS Status;

DESCRIBE admin;

SELECT 
    a.admin_id,
    u.username,
    u.email
FROM 
    admin a
    JOIN users u ON a.user_id = u.user_id;

-- ========================================
-- 8. CHECK FOREIGN KEY CONSTRAINTS
-- ========================================
SELECT 'Checking Foreign Key Constraints...' AS Status;

SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE
    TABLE_SCHEMA = 'pubudud_echanneling_database'
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY
    TABLE_NAME, COLUMN_NAME;

-- ========================================
-- 9. VERIFY INDEXES
-- ========================================
SELECT 'Checking Indexes...' AS Status;

SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE
FROM
    INFORMATION_SCHEMA.STATISTICS
WHERE
    TABLE_SCHEMA = 'pubudud_echanneling_database'
ORDER BY
    TABLE_NAME, INDEX_NAME;

-- ========================================
-- 10. VERIFY DATA TYPES AND CONSTRAINTS
-- ========================================
SELECT 'Checking Users Table Constraints...' AS Status;

SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_KEY,
    EXTRA
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = 'pubudud_echanneling_database'
    AND TABLE_NAME = 'users';

-- ========================================
-- 11. TEST DATA INTEGRITY
-- ========================================
SELECT 'Testing Data Integrity...' AS Status;

-- Check for orphaned records (users without roles)
SELECT 
    'Users without valid roles' AS Issue,
    COUNT(*) AS Count
FROM 
    users u
WHERE 
    u.role_id NOT IN (SELECT role_id FROM role);

-- Check for patients without users
SELECT 
    'Patients without user accounts' AS Issue,
    COUNT(*) AS Count
FROM 
    patient p
WHERE 
    p.user_id NOT IN (SELECT user_id FROM users);

-- ========================================
-- 12. SUMMARY REPORT
-- ========================================
SELECT 'DATABASE SUMMARY REPORT' AS Status;

SELECT 
    'Total Roles' AS Metric,
    COUNT(*) AS Value
FROM role
UNION ALL
SELECT 
    'Total Users',
    COUNT(*)
FROM users
UNION ALL
SELECT 
    'Total Patients',
    COUNT(*)
FROM patient
UNION ALL
SELECT 
    'Total Doctors',
    COUNT(*)
FROM doctor
UNION ALL
SELECT 
    'Total Receptionists',
    COUNT(*)
FROM receptionist
UNION ALL
SELECT 
    'Total Admins',
    COUNT(*)
FROM admin;

-- ========================================
-- VERIFICATION COMPLETE
-- ========================================
SELECT 'Database verification complete!' AS Status;
