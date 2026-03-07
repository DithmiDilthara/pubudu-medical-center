import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { sequelize } from './models/index.js';

dotenv.config({ path: './config/.env' });

async function initDB() {
    try {
        console.log('Connecting to MySQL...');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 3306
        });

        console.log(`Creating database ${process.env.DB_NAME} if not exists...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        console.log('Database created or already exists.');
        await connection.end();

        console.log('Connecting to database via Sequelize and syncing models...');
        await sequelize.authenticate();
        console.log('Sequelize connected. Syncing...');

        // Sync models (Using alter to safely apply schema updates without dropping tables)
        await sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully.');

        process.exit(0);
    } catch (error) {
        console.error('Error during database initialization:', error);
        process.exit(1);
    }
}

initDB();
