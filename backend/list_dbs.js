import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './config/.env' });

async function checkDatabases() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT
        });

        const [dbs] = await connection.query('SHOW DATABASES');
        for (const db of dbs) {
            console.log(`Database: ${db.Database}`);
        }
        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkDatabases();
