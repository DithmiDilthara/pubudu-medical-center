import { User, Patient, Appointment, sequelize } from './models/index.js';

async function syncReportsSchema() {
    try {
        console.log('Surgically syncing database schema for reports...');
        await User.sync({ alter: true });
        await Patient.sync({ alter: true });
        await Appointment.sync({ alter: true });
        console.log('Schema synced successfully for relevant tables!');
        process.exit(0);
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

syncReportsSchema();
