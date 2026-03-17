import { Appointment, Doctor, Patient } from './models/index.js';

async function checkUnpaid() {
    try {
        const apts = await Appointment.findAll({
            where: { 
                payment_status: 'UNPAID',
                status: ['PENDING', 'CONFIRMED', 'RESCHEDULED']
            },
            include: [
                { model: Doctor, as: 'doctor' },
                { model: Patient, as: 'patient' }
            ]
        });
        
        console.log('Unpaid Appointments:');
        apts.forEach(apt => {
            console.log(`- ID: ${apt.appointment_id}, Patient: ${apt.patient?.full_name}, Doctor: ${apt.doctor?.full_name}, Status: ${apt.status}, Date: ${apt.appointment_date}`);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUnpaid();
