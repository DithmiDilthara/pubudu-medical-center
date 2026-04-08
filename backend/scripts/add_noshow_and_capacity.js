import db from '../config/databaseConnection.js';
import dotenv from 'dotenv';

dotenv.config();

const migrate = async () => {
    console.log('🚀 Starting Migration: Adding NO_SHOW and max_patients...');

    try {
        // 1. Add NO_SHOW to appointment status ENUM
        console.log('⏳ Updating Appointment status ENUM...');
        await db.query(`
            ALTER TABLE appointment 
            MODIFY COLUMN status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'RESCHEDULE_REQUIRED', 'NO_SHOW') 
            NOT NULL DEFAULT 'PENDING'
        `);
        console.log('✅ Appointment status ENUM updated successfully.');

        // 2. Add max_patients to doctor_schedule
        console.log('⏳ Adding max_patients to doctor_schedule...');
        try {
            await db.query(`
                ALTER TABLE doctor_schedule 
                ADD COLUMN max_patients INT NOT NULL DEFAULT 20 
                AFTER status
            `);
            console.log('✅ max_patients column added successfully.');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️  max_patients column already exists.');
            } else {
                throw error;
            }
        }

        console.log('🎉 Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await db.end();
        process.exit(0);
    }
};

migrate();
