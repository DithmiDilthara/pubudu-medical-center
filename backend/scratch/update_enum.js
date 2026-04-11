import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });

async function run() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });
    
    await conn.query("ALTER TABLE appointment MODIFY COLUMN payment_status ENUM('UNPAID', 'PAID', 'PARTIAL', 'REFUNDED', 'REFUND_DISMISSED') NOT NULL DEFAULT 'UNPAID'");
    console.log('✅ Updated payment_status ENUM in MySQL');
    await conn.end();
}
run();
