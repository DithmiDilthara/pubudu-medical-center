import sequelize from './config/database.js';
import { Appointment, Patient, Doctor } from './models/index.js';
import fs from 'fs';

async function checkAppointments() {
    try {
        const appointments = await Appointment.findAll({
            include: [
                { model: Patient, as: 'patient' },
                { model: Doctor, as: 'doctor' }
            ]
        });
        fs.writeFileSync('appointments_utf8.json', JSON.stringify(appointments, null, 2), 'utf8');
        console.log('Done writing appointments_utf8.json');
    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

checkAppointments();
