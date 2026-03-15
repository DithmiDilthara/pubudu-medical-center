import db from '../config/databaseConnection.js';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: './config/.env' });

const verifyDatabase = async () => {
  console.log('🔍 Starting Database Verification...\n');

  try {
    // 1. Test database connection
    console.log('1️⃣ Testing Database Connection...');
    await db.query('SELECT 1');
    console.log('✅ Database connection successful\n');

    // 2. Check if all required tables exist
    console.log('2️⃣ Checking Required Tables...');
    const requiredTables = [
      'role',
      'users',
      'admin',
      'patient',
      'doctor',
      'receptionist',
      'doctor_schedule',
      'appointment',
      'medical_record',
      'payment'
    ];

    const [tables] = await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [process.env.DB_NAME]);

    const existingTables = tables.map(t => t.TABLE_NAME);
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));

    if (missingTables.length > 0) {
      console.log('❌ Missing tables:', missingTables.join(', '));
    } else {
      console.log('✅ All required tables exist');
    }
    console.log('📋 Existing tables:', existingTables.join(', '), '\n');

    // 3. Verify and insert roles
    console.log('3️⃣ Verifying Roles...');
    const [roles] = await db.query('SELECT * FROM role');
    
    if (roles.length === 0) {
      console.log('⚠️  No roles found. Inserting default roles...');
      await db.query(`
        INSERT INTO role (role_name) VALUES 
        ('admin'), ('doctor'), ('patient'), ('receptionist')
      `);
      console.log('✅ Default roles inserted');
    } else {
      console.log('✅ Roles found:');
      roles.forEach(role => {
        console.log(`   - ${role.role_name} (ID: ${role.role_id})`);
      });
    }
    console.log('');

    // 4. Check users table structure
    console.log('4️⃣ Verifying Users Table Structure...');
    const [usersColumns] = await db.query(`
      DESCRIBE users
    `);
    
    const requiredColumns = ['user_id', 'username', 'password_hash', 'email', 'contact_number', 'role_id'];
    const existingColumns = usersColumns.map(c => c.Field);
    const missingColumns = requiredColumns.filter(c => !existingColumns.includes(c));

    if (missingColumns.length > 0) {
      console.log('❌ Missing columns in users table:', missingColumns.join(', '));
    } else {
      console.log('✅ Users table structure is correct');
    }
    console.log('');

    // 5. Check patient table structure
    console.log('5️⃣ Verifying Patient Table Structure...');
    const [patientColumns] = await db.query(`
      DESCRIBE patient
    `);
    
    const requiredPatientColumns = ['patient_id', 'user_id', 'full_name', 'nic', 'gender', 'date_of_birth', 'address'];
    const existingPatientColumns = patientColumns.map(c => c.Field);
    const missingPatientColumns = requiredPatientColumns.filter(c => !existingPatientColumns.includes(c));

    if (missingPatientColumns.length > 0) {
      console.log('❌ Missing columns in patient table:', missingPatientColumns.join(', '));
    } else {
      console.log('✅ Patient table structure is correct');
    }
    console.log('');

    // 6. Check foreign key constraints
    console.log('6️⃣ Verifying Foreign Key Constraints...');
    const [constraints] = await db.query(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE
        TABLE_SCHEMA = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY
        TABLE_NAME
    `, [process.env.DB_NAME]);

    console.log(`✅ Found ${constraints.length} foreign key constraints:`);
    constraints.forEach(c => {
      console.log(`   - ${c.TABLE_NAME}.${c.COLUMN_NAME} -> ${c.REFERENCED_TABLE_NAME}.${c.REFERENCED_COLUMN_NAME}`);
    });
    console.log('');

    // 7. Check existing data
    console.log('7️⃣ Checking Existing Data...');
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
    const [patientCount] = await db.query('SELECT COUNT(*) as count FROM patient');
    const [doctorCount] = await db.query('SELECT COUNT(*) as count FROM doctor');
    const [receptionistCount] = await db.query('SELECT COUNT(*) as count FROM receptionist');
    const [adminCount] = await db.query('SELECT COUNT(*) as count FROM admin');

    console.log('📊 Data Summary:');
    console.log(`   - Total Users: ${userCount[0].count}`);
    console.log(`   - Total Patients: ${patientCount[0].count}`);
    console.log(`   - Total Doctors: ${doctorCount[0].count}`);
    console.log(`   - Total Receptionists: ${receptionistCount[0].count}`);
    console.log(`   - Total Admins: ${adminCount[0].count}`);
    console.log('');

    // 8. Test data integrity
    console.log('8️⃣ Testing Data Integrity...');
    const [orphanedUsers] = await db.query(`
      SELECT COUNT(*) as count 
      FROM users u 
      WHERE u.role_id NOT IN (SELECT role_id FROM role)
    `);

    if (orphanedUsers[0].count > 0) {
      console.log(`⚠️  Found ${orphanedUsers[0].count} users with invalid role_id`);
    } else {
      console.log('✅ All users have valid roles');
    }

    const [orphanedPatients] = await db.query(`
      SELECT COUNT(*) as count 
      FROM patient p 
      WHERE p.user_id NOT IN (SELECT user_id FROM users)
    `);

    if (orphanedPatients[0].count > 0) {
      console.log(`⚠️  Found ${orphanedPatients[0].count} patients without user accounts`);
    } else {
      console.log('✅ All patients have valid user accounts');
    }
    console.log('');

    // 9. Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DATABASE VERIFICATION COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Database is ready for authentication system!');

  } catch (error) {
    console.error('❌ Database verification failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
};

// Run verification
verifyDatabase();
