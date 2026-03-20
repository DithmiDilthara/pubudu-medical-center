import sequelize from './config/database.js';
import fs from 'fs';
async function verify() {
    try {
        const [u] = await sequelize.query('SELECT COUNT(*) as count FROM users WHERE user_id IN (3, 4, 5)');
        const [s] = await sequelize.query('SELECT COUNT(*) as count FROM doctor_schedule WHERE schedule_id IN (20, 21, 22)');
        const [tables] = await sequelize.query('SHOW TABLES LIKE "prescription"');
        const fileExists = fs.existsSync('./models/Prescription.js');
        console.log(JSON.stringify({
            usersCount: u[0].count,
            scheduleCount: s[0].count,
            tableExists: tables.length > 0,
            fileExists
        }, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}
verify();
