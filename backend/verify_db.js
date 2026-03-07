import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { sequelize } from './models/index.js';

dotenv.config({ path: './config/.env' });

async function verifyDB() {
    try {
        const [results] = await sequelize.query('SHOW TABLES;');
        console.log('Tables in database:');
        console.log(results.map(row => Object.values(row)[0]));
        process.exit(0);
    } catch (error) {
        console.error('Error verifying database:', error);
        process.exit(1);
    }
}

verifyDB();
