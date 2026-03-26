import db from './config/databaseConnection.js';
import bcrypt from 'bcryptjs';

const createVerifiedPatient = async () => {
    try {
        const username = 'VerifiedPatient';
        const password = 'Password123!';
        const email = 'verified@test.com';
        const role_id = 4; // Patient

        // Check if user exists
        const [existing] = await db.query('SELECT user_id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            console.log('User already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        
        const [result] = await db.query(
            'INSERT INTO users (username, password_hash, email, contact_number, role_id, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, email, '0712345678', role_id, true]
        );

        const userId = result.insertId;

        await db.query(
            'INSERT INTO patient (user_id, full_name, nic, gender, date_of_birth, address, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, 'Verified Test Patient', '200012345678', 'MALE', '1990-01-01', 'Test Address', true]
        );

        console.log('✅ Created verified patient: VerifiedPatient / Password123!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.end();
        process.exit(0);
    }
};

createVerifiedPatient();
