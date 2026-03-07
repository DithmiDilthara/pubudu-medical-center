import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './config/.env' });

async function checkCounts() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        const [tables] = await connection.query('SHOW TABLES');
        const results = {};

        for (const tableRow of tables) {
            const tableName = Object.values(tableRow)[0];
            const [countRow] = await connection.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
            results[tableName] = countRow[0].count;
        }

        console.log('Row counts for all tables:');
        console.log(JSON.stringify(results, null, 2));
        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkCounts();
