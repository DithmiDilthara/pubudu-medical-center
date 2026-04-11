import dotenv from 'dotenv';
import { Availability } from '../models/index.js';
import { Op } from 'sequelize';

dotenv.config({ path: './config/.env' });

async function check() {
    try {
        const now = new Date();
        console.log("Current System Time:", now.toLocaleString());

        const avails = await Availability.findAll({
            where: {
                [Op.or]: [
                    { day_of_week: 'SATURDAY' }, // April 11, 2026 is a Saturday
                    { schedule_date: '2026-04-11' }
                ],
                status: 'ACTIVE'
            }
        });

        console.log(`\nFound ${avails.length} ACTIVE sessions for Saturday / 2026-04-11:`);
        avails.forEach(a => {
            const sessionStart = new Date(`2026-04-11 ${a.start_time}`);
            const thirtyMinsBefore = new Date(sessionStart.getTime() - 30 * 60000);
            const canBook = now < thirtyMinsBefore;

            console.log(`- ID: ${a.schedule_id}, Dr: ${a.doctor_id}, Time: ${a.start_time}-${a.end_time}, 30m Window: ${thirtyMinsBefore.toLocaleString()}, Can Book Online: ${canBook}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
