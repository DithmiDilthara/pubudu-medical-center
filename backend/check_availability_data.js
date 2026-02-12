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

        console.log('Connected to database.');
        const [rows] = await connection.execute('SELECT * FROM availability LIMIT 10;');
        console.log('Sample data from availability:');
        console.log(JSON.stringify(rows, null, 2));
        await connection.end();
    } catch (error) {
        console.error('Error checking data:', error);
    }
}

checkData();
