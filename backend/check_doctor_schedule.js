import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './config/.env' });

async function checkSchema() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log('Connected to database.');
        const [rows] = await connection.execute('DESCRIBE doctor_schedule;');
        console.log(JSON.stringify(rows, null, 2));
        await connection.end();
    } catch (error) {
        console.error('Error checking schema:', error);
    }
}

checkSchema();
