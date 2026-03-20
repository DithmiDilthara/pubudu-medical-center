import db from '../config/databaseConnection.js';
import dotenv from 'dotenv';

dotenv.config();

const fixPatientSchema = async () => {
  console.log('🔧 Fixing Patient Table Schema...\n');

  try {
    // Test database connection
    console.log('1️⃣ Testing Database Connection...');
    await db.query('SELECT 1');
    console.log('✅ Database connection successful\n');

    // Add blood_group column if it doesn't exist
    console.log('2️⃣ Adding blood_group column...');
    try {
      await db.query(`
        ALTER TABLE patient 
        ADD COLUMN blood_group VARCHAR(10) NULL 
        AFTER address
      `);
      console.log('✅ Added blood_group column\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Column blood_group already exists\n');
      } else {
        throw error;
      }
    }

    // Add allergies column if it doesn't exist
    console.log('3️⃣ Adding allergies column...');
    try {
      await db.query(`
        ALTER TABLE patient 
        ADD COLUMN allergies TEXT NULL 
        AFTER blood_group
      `);
      console.log('✅ Added allergies column\n');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  Column allergies already exists\n');
      } else {
        throw error;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PATIENT TABLE FIX COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Schema fix failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
};

fixPatientSchema();
