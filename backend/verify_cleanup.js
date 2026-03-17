import { Appointment, sequelize } from './models/index.js';

async function verify() {
    try {
        console.log('--- Database Verification ---');

        // 1. Check Row Count
        const count = await Appointment.count();
        console.log(`Total appointments: ${count}`);

        // 2. Check if only ID 22 remains
        const appointments = await Appointment.findAll();
        appointments.forEach(a => {
            console.log(`Appointment ID found: ${a.appointment_id}`);
        });

        // 3. Verify Schema columns (check if notes/reason are present in raw query)
        const [results] = await sequelize.query('DESCRIBE appointment');
        const columns = results.map(r => r.Field);
        console.log('Columns in appointment table:', columns.join(', '));

        if (columns.includes('notes') || columns.includes('cancellation_reason')) {
            console.log('VERIFICATION FAILED: Columns "notes" or "cancellation_reason" still exist!');
        } else {
            console.log('VERIFICATION SUCCESS: Schema matches requirements.');
        }

        if (count === 1 && appointments[0].appointment_id === 22) {
            console.log('VERIFICATION SUCCESS: Data cleanup successful.');
        } else {
            console.log('VERIFICATION FAILED: Data mismatch.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verify();
