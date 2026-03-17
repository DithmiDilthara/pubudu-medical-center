import { sequelize } from './models/index.js';

async function performCleanup() {
    try {
        console.log('Starting database cleanup...');

        // 1. Delete all appointments EXCEPT ID 22
        const [deleteResult] = await sequelize.query('DELETE FROM appointment WHERE appointment_id != 22');
        console.log('Appointments deleted successfully.');

        // 2. Remove columns 'notes' and 'cancellation_reason'
        // Using raw SQL for schema modification
        await sequelize.query('ALTER TABLE appointment DROP COLUMN notes');
        console.log("Column 'notes' removed.");

        await sequelize.query('ALTER TABLE appointment DROP COLUMN cancellation_reason');
        console.log("Column 'cancellation_reason' removed.");

        console.log('Cleanup completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

performCleanup();
