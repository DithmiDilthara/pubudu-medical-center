import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './config/.env' });

async function listTables() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log('Connected to database.');
        const [rows] = await connection.execute('SHOW TABLES;');
        const tableList = rows.map(row => Object.values(row)[0]);
        console.log('--- ALL TABLES ---');
        tableList.forEach(t => console.log(t));
        console.log('--- END TABLES ---');
        await connection.end();
    } catch (error) {
        console.error('Error listing tables:', error);
    }
}

listTables();
