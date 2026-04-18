import cron from 'node-cron';
import { Appointment } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * @desc   Midnight No-Show Sweep
 * @detail Runs every night at 23:59 (Sri Lanka time, UTC+5:30).
 *         Finds all appointments that are still PENDING or CONFIRMED
 *         from past dates (appointment_date < today) and marks them NO_SHOW.
 *         This keeps admin reports and receptionist dashboards accurate.
 */
export const startNoShowScheduler = () => {
    // Cron expression: '59 23 * * *' = every day at 23:59
    // timezone: Asia/Colombo = Sri Lanka Standard Time (UTC+5:30)
    cron.schedule('59 23 * * *', async () => {
        const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

        console.log(`[NoShow Scheduler] Running sweep at ${new Date().toISOString()}...`);

        try {
            const [affectedCount] = await Appointment.update(
                { status: 'NO_SHOW' },
                {
                    where: {
                        status: { [Op.in]: ['PENDING', 'CONFIRMED'] },
                        appointment_date: { [Op.lte]: today }
                    }
                }
            );

            console.log(`[NoShow Scheduler] Sweep complete. ${affectedCount} appointment(s) marked as NO_SHOW.`);

        } catch (error) {
            console.error('[NoShow Scheduler] ERROR during sweep:', error.message);
        }

    }, {
        timezone: 'Asia/Colombo'
    });

    console.log('✓ No-show midnight scheduler registered (runs daily at 23:59 Sri Lanka time).');
};
