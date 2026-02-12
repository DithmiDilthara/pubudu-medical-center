import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './config/.env' });

async function migrate() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log('Connected to database.');

        console.log('Adding day_of_week column to doctor_schedule...');
        try {
            await connection.execute("ALTER TABLE doctor_schedule ADD COLUMN day_of_week ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NULL AFTER doctor_id;");
            console.log('✓ Column day_of_week added.');
        } catch (e) {
            console.log('! Column day_of_week might already exist:', e.message);
        }

        console.log('Modifying schedule_date to allow NULL...');
        try {
            await connection.execute("ALTER TABLE doctor_schedule MODIFY COLUMN schedule_date DATE NULL;");
            console.log('✓ Column schedule_date modified.');
        } catch (e) {
            console.log('! Error modifying schedule_date:', e.message);
        }

        console.log('Adding timestamps to doctor_schedule...');
        try {
            await connection.execute("ALTER TABLE doctor_schedule ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;");
            console.log('✓ Timestamps added.');
        } catch (e) {
            console.log('! Timestamps might already exist:', e.message);
        }

        await connection.end();
        console.log('Migration script complete.');
    } catch (error) {
        console.error('Error during migration:', error);
    }
}

migrate();
