import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './config/.env' });

async function checkData() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        const [users] = await connection.query('SELECT user_id, username, email, role_id FROM users');
        console.log('Users:');
        console.log(JSON.stringify(users, null, 2));

        const [patients] = await connection.query('SELECT patient_id, full_name, user_id FROM patient');
        console.log('Patients:');
        console.log(JSON.stringify(patients, null, 2));

        const [doctors] = await connection.query('SELECT doctor_id, full_name, user_id FROM doctor');
        console.log('Doctors:');
        console.log(JSON.stringify(doctors, null, 2));

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkData();
