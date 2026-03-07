import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './config/.env' });

async function checkUsers() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        const [users] = await connection.query('SELECT * FROM users');
        console.log('All users:');
        console.log(JSON.stringify(users, null, 2));

        const [patients] = await connection.query('SELECT * FROM patient');
        console.log('All patients:');
        console.log(JSON.stringify(patients, null, 2));

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUsers();
