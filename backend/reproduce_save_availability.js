import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, 'config/.env') });

async function run() {
    try {
        const secret = process.env.JWT_SECRET || 'your_jwt_secret';

        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        const [doctors] = await conn.execute('SELECT user_id FROM doctor LIMIT 1');
        await conn.end();

        if (doctors.length === 0) {
            console.error('No doctor user found');
            return;
        }

        const userId = doctors[0].user_id;
        console.log('Using doctor user_id:', userId);

        const token = jwt.sign({ user_id: userId, role: 'doctor' }, secret, { expiresIn: '1h' });

        // 2. Payload
        const payload = {
            availability: [{
                specific_date: '2026-02-18',
                day_of_week: null,
                start_time: '18:00',
                end_time: '20:00',
                session_name: 'Unavailable' // or 'Available'
            }]
        };

        // 3. Request
        console.log('Sending payload:', JSON.stringify(payload, null, 2));

        const response = await fetch('http://localhost:3000/api/clinical/availability', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('API Error Status:', response.status);
            console.error('API Error Data:', data);
        } else {
            console.log('Response:', data);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

run();
