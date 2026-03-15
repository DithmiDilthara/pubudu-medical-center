import db from '../config/databaseConnection.js';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: './config/.env' });

const updateDatabase = async () => {
  console.log('🔧 Updating Database Schema...\n');

  try {
    // Test database connection
    console.log('1️⃣ Testing Database Connection...');
    await db.query('SELECT 1');
    console.log('✅ Database connection successful\n');

    // Add is_active column if it doesn't exist
    console.log('2️⃣ Adding is_active column...');
    try {
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN is_active BOOLEAN DEFAULT TRUE 
        AFTER role_id
      `);
      console.log('✅ Added is_active column\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Column is_active already exists\n');
      } else {
        throw error;
      }
    }

    // Add last_login column if it doesn't exist
    console.log('3️⃣ Adding last_login column...');
    try {
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN last_login DATETIME NULL 
        AFTER is_active
      `);
      console.log('✅ Added last_login column\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Column last_login already exists\n');
      } else {
        throw error;
      }
    }

    // Add created_at column if it doesn't exist
    console.log('4️⃣ Adding created_at column...');
    try {
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        AFTER last_login
      `);
      console.log('✅ Added created_at column\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Column created_at already exists\n');
      } else {
        throw error;
      }
    }

    // Add updated_at column if it doesn't exist
    console.log('5️⃣ Adding updated_at column...');
    try {
      await db.query(`
        ALTER TABLE users 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
        AFTER created_at
      `);
      console.log('✅ Added updated_at column\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Column updated_at already exists\n');
      } else {
        throw error;
      }
    }

    // Verify updated structure
    console.log('6️⃣ Verifying Updated Structure...');
    const [columns] = await db.query(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        COLUMN_KEY
      FROM 
        INFORMATION_SCHEMA.COLUMNS
      WHERE 
        TABLE_SCHEMA = ?
        AND TABLE_NAME = 'users'
      ORDER BY 
        ORDINAL_POSITION
    `, [process.env.DB_NAME]);

    console.log('✅ Current Users Table Structure:');
    console.table(columns);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DATABASE UPDATE COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Database update failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
};

// Run update
updateDatabase();
