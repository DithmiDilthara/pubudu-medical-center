import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './config/.env' });

async function checkPatients() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        const [patients] = await connection.query('SELECT * FROM patient');
        console.log('All patients:');
        for (const p of patients) {
            console.log(`ID: ${p.patient_id}, Name: ${p.full_name}, UserID: ${p.user_id}`);
        }

        const [doctors] = await connection.query('SELECT * FROM doctor');
        console.log('All doctors:');
        for (const d of doctors) {
            console.log(`ID: ${d.doctor_id}, Name: ${d.full_name}, UserID: ${d.user_id}`);
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkPatients();
