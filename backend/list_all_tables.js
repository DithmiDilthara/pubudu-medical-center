import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './config/.env' });

async function checkTable() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        const [tables] = await connection.query('SHOW TABLES');
        console.log('Tables:');
        console.log(JSON.stringify(tables, null, 2));
        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkTable();
