import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './config/.env' });

async function checkDoctor() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log('Connected to database.');
        const [rows] = await connection.execute('SELECT * FROM doctor WHERE doctor_id = 3;');
        console.log('Doctor data:');
        console.log(rows);
        await connection.end();
    } catch (error) {
        console.error('Error checking doctor:', error);
    }
}

checkDoctor();
