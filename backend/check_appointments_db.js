import sequelize from './config/database.js';
import { Appointment, Patient, Doctor } from './models/index.js';

async function checkAppointments() {
    try {
        const appointments = await Appointment.findAll({
            include: [
                { 
                    model: Patient, 
                    as: 'patient',
                    where: { full_name: { [sequelize.Sequelize.Op.like]: '%Dithmi%' } }
                },
                { model: Doctor, as: 'doctor' }
            ]
        });
        console.log(`Found ${appointments.length} appointments for Dithmi.`);
        appointments.forEach(apt => {
            console.log(`ID: ${apt.appointment_id}, Date: ${apt.appointment_date}, Status: ${apt.status}, Doctor: ${apt.doctor?.full_name}`);
        });
    } catch (error) {
        console.error("ERROR in check_appointments_db.js:", error.message);
    } finally {
        process.exit();
    }
}

checkAppointments();
