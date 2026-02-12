import { Availability, sequelize } from './models/index.js';

async function testMapping() {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');

        // Create a test record
        const testSlot = await Availability.create({
            doctor_id: 3,
            day_of_week: 'MONDAY',
            specific_date: '2026-02-16',
            start_time: '09:00:00',
            end_time: '12:00:00',
            session_name: 'Test Session'
        });

        console.log('✓ Test record created via model:');
        console.log(JSON.stringify(testSlot, null, 2));

        // Cleanup
        await testSlot.destroy();
        console.log('✓ Test record cleaned up.');

        await sequelize.close();
    } catch (error) {
        console.error('Error during mapping test:', error);
    }
}

testMapping();
