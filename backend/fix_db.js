import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './config/.env' });

async function fixDb() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log('Connected to database.');

        console.log('Adding specific_date column...');
        try {
            await connection.execute('ALTER TABLE availability ADD COLUMN specific_date DATE AFTER day_of_week;');
            console.log('✓ Column specific_date added.');
        } catch (e) {
            console.log('! Column specific_date might already exist or error:', e.message);
        }

        console.log('Modifying day_of_week to allow NULL...');
        try {
            await connection.execute("ALTER TABLE availability MODIFY COLUMN day_of_week ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NULL;");
            console.log('✓ Column day_of_week modified.');
        } catch (e) {
            console.log('! Error modifying day_of_week:', e.message);
        }

        await connection.end();
        console.log('Database fix complete.');
    } catch (error) {
        console.error('Error fixing database:', error);
    }
}

fixDb();
