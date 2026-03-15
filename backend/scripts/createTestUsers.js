import db from '../config/databaseConnection.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: './config/.env' });

const createTestUsers = async () => {
  console.log('👤 Creating Test Users...\n');

  try {
    // Test database connection
    console.log('1️⃣ Testing Database Connection...');
    await db.query('SELECT 1');
    console.log('✅ Database connection successful\n');

    // Get role IDs
    console.log('2️⃣ Fetching Role IDs...');
    const [roles] = await db.query('SELECT * FROM role');
    const roleMap = {};
    roles.forEach(role => {
      roleMap[role.role_name.toLowerCase()] = role.role_id;
    });
    console.log('✅ Roles found:', Object.keys(roleMap).join(', '), '\n');

    // Create test users
    const testUsers = [
      {
        username: 'Anuja_01',
        email: 'admin@test.com',
        password: 'Admin@123',
        role: 'admin',
        contact_number: '0771234567'
      },
      {
        username: 'doctor_john',
        email: 'doctor@test.com',
        password: 'Doctor@123',
        role: 'doctor',
        contact_number: '0771234568'
      },
      {
        username: 'patient_jane',
        email: 'patient@test.com',
        password: 'Patient@123',
        role: 'patient',
        contact_number: '0771234569'
      },
      {
        username: 'receptionist_mary',
        email: 'receptionist@test.com',
        password: 'Receptionist@123',
        role: 'receptionist',
        contact_number: '0771234570'
      }
    ];

    console.log('3️⃣ Creating Test Users...');
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const [existing] = await db.query(
          'SELECT user_id FROM users WHERE username = ?',
          [userData.username]
        );

        if (existing.length > 0) {
          console.log(`ℹ️  User '${userData.username}' already exists`);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        // Get role ID
        const roleId = roleMap[userData.role];

        // Insert user
        const [result] = await db.query(
          `INSERT INTO users (username, password_hash, email, contact_number, role_id, is_active) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userData.username, hashedPassword, userData.email, userData.contact_number, roleId, true]
        );

        console.log(`✅ Created user: ${userData.username} (${userData.role}) - Password: ${userData.password}`);

        // Create profile based on role
        if (userData.role === 'patient') {
          await db.query(
            `INSERT INTO patient (user_id, full_name, nic, gender, date_of_birth, address) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [result.insertId, 'Jane Doe', '199512345678', 'FEMALE', '1995-01-15', '123 Main St']
          );
        } else if (userData.role === 'doctor') {
          await db.query(
            `INSERT INTO doctor (user_id, full_name, specialization, license_no) 
             VALUES (?, ?, ?, ?)`,
            [result.insertId, 'Dr. John Smith', 'Cardiology', 'DOC12345']
          );
        } else if (userData.role === 'receptionist') {
          await db.query(
            `INSERT INTO receptionist (user_id, full_name, nic) 
             VALUES (?, ?, ?)`,
            [result.insertId, 'Mary Johnson', '199612345678']
          );
        } else if (userData.role === 'admin') {
          await db.query(
            `INSERT INTO admin (user_id) 
             VALUES (?)`,
            [result.insertId]
          );
        }

      } catch (error) {
        console.error(`❌ Error creating user '${userData.username}':`, error.message);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ TEST USERS CREATED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    testUsers.forEach(u => {
      console.log(`${u.role.toUpperCase().padEnd(15)} - Username: ${u.username.padEnd(20)} Password: ${u.password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Failed to create test users:', error.message);
    console.error('Full error:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
};

// Run creation
createTestUsers();
