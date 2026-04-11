import { Availability, Appointment } from '../models/index.js';

async function check() {
    try {
        const avails = await Availability.findAll();
        console.log("Total Availabilities:", avails.length);
        avails.forEach(a => {
            console.log(`ID: ${a.schedule_id}, Dr: ${a.doctor_id}, Day: ${a.day_of_week}, Date: ${a.schedule_date}, Time: ${a.start_time}-${a.end_time}, Status: ${a.status}`);
        });

        const appts = await Appointment.findAll({ limit: 5, order: [['created_at', 'DESC']] });
        console.log("\nRecent Appointments:");
        appts.forEach(a => {
            console.log(`ID: ${a.appointment_id}, Patient: ${a.patient_id}, Dr: ${a.doctor_id}, Date: ${a.appointment_date}, Schedule: ${a.schedule_id}, Status: ${a.status}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
