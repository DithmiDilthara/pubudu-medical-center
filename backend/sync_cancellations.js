import 'dotenv/config';
import { Appointment, Availability } from './models/index.js';
import { Op } from 'sequelize';

async function cleanup() {
    const today = new Date();
    const todayStr =
        today.getFullYear() +
        '-' +
        String(today.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(today.getDate()).padStart(2, '0');

    console.log('--- DB CLEANUP ---');

    // 1. Delete past availability
    const deletedAvail = await Availability.destroy({
        where: { specific_date: { [Op.lt]: todayStr } }
    });
    console.log('Deleted past availabilities:', deletedAvail);

    // 2. Cancel appointments on unavailable dates
    const unavailables = await Availability.findAll({
        where: { session_name: 'Unavailable' }
    });
    let cancelledApts = 0;
    for (let av of unavailables) {
        if (av.specific_date) {
            const apts = await Appointment.findAll({
                where: {
                    doctor_id: av.doctor_id,
                    appointment_date: av.specific_date,
                    status: ['PENDING', 'CONFIRMED']
                }
            });
            for (let apt of apts) {
                apt.status = 'CANCELLED';
                await apt.save();
                cancelledApts++;
            }
        }
    }
    console.log('Cancelled out-of-sync appointments:', cancelledApts);

    // 3. Mark past appointments as COMPLETED
    const pastApts = await Appointment.findAll({
        where: {
            appointment_date: { [Op.lt]: todayStr },
            status: ['PENDING', 'CONFIRMED']
        }
    });
    for (let apt of pastApts) {
        apt.status = 'COMPLETED';
        await apt.save();
    }
    console.log('Marked past appointments completed:', pastApts.length);

    process.exit(0);
}

cleanup().catch(console.error);
