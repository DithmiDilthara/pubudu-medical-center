import Appointment from './models/Appointment.js';
import sequelize from './config/database.js';

async function syncAppointment() {
    try {
        await Appointment.sync({ alter: true });
        console.log('Appointment table synchronized successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error synchronizing Appointment table:', error);
        process.exit(1);
    }
}

syncAppointment();
