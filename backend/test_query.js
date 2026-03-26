import { Appointment, Patient, Doctor, User, sequelize } from './models/index.js';
import { Op } from 'sequelize';

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const appointments = await Appointment.findAll({
            include: [
                { model: Doctor, as: 'doctor', attributes: ['full_name', 'specialization', 'doctor_fee', 'center_fee'] },
                { model: Patient, as: 'patient', attributes: ['full_name', 'nic'] }
            ],
            limit: 1
        });
        console.log('Query successful:', appointments.length);
        process.exit(0);
    } catch (error) {
        console.error('Query failed:');
        console.error(error);
        process.exit(1);
    }
}

test();
