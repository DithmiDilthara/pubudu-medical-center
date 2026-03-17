import { Appointment, Doctor, Patient } from './models/index.js';
import { Op } from 'sequelize';

async function checkDithmiApts() {
    try {
        const dithmi = await Patient.findOne({
            where: {
                full_name: { [Op.like]: '%Dithmi%' }
            }
        });

        if (!dithmi) {
            console.log('Patient Dithmi not found');
            return;
        }

        const apts = await Appointment.findAll({
            where: { 
                patient_id: dithmi.patient_id
            },
            include: [
                { model: Doctor, as: 'doctor' }
            ]
        });
        
        console.log(`Appointments for ${dithmi.full_name} (ID: ${dithmi.patient_id}):`);
        apts.forEach(apt => {
            console.log(`- ID: ${apt.appointment_id}, Doctor: ${apt.doctor?.full_name}, Status: ${apt.status}, Payment: ${apt.payment_status}, Date: ${apt.appointment_date}`);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

checkDithmiApts();
