import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env from project root/backend
dotenv.config({ path: 'c:/Users/user/Desktop/pubudu-medical-center/backend/config/.env' });

const main = async () => {
    try {
        console.log('Connecting to database...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log(`Connected to database: ${process.env.DB_NAME}`);
        const [tables] = await connection.query('SHOW TABLES');
        const dbName = process.env.DB_NAME;
        const tablesKey = `Tables_in_${dbName}`;

        for (const tableRow of tables) {
            const tableName = tableRow[tablesKey];
            console.log(`\n--- TABLE: ${tableName} ---`);
            const [columns] = await connection.query(`DESCRIBE ${tableName}`);
            console.table(columns);
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
};

main();
