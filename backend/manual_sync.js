import sequelize from './config/database.js';

async function manualSync() {
    try {
        console.log('Applying manual schema updates via SQL...');
        
        // Add columns to patient
        try {
            await sequelize.query("ALTER TABLE patient ADD COLUMN registration_source ENUM('ONLINE', 'RECEPTIONIST') NOT NULL DEFAULT 'ONLINE'");
            console.log('Added registration_source to patient');
        } catch (e) { console.log('registration_source possibly exists or error:', e.message); }

        try {
            await sequelize.query("ALTER TABLE patient ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
            console.log('Added timestamps to patient');
        } catch (e) { console.log('Patient timestamps possibly exist or error:', e.message); }

        // Add columns to users
        try {
            await sequelize.query("ALTER TABLE users ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
            console.log('Added timestamps to users');
        } catch (e) { console.log('User timestamps possibly exist or error:', e.message); }

        // Add columns to appointment
        try {
            await sequelize.query("ALTER TABLE appointment ADD COLUMN cancellation_reason VARCHAR(255) NULL");
            console.log('Added cancellation_reason to appointment');
        } catch (e) { console.log('cancellation_reason possibly exists or error:', e.message); }

        try {
            await sequelize.query("ALTER TABLE appointment ADD COLUMN is_noshow BOOLEAN NOT NULL DEFAULT 0");
            console.log('Added is_noshow to appointment');
        } catch (e) { console.log('is_noshow possibly exists or error:', e.message); }

        console.log('Manual sync complete!');
        process.exit(0);
    } catch (error) {
        console.error('Manual sync failed:', error);
        process.exit(1);
    }
}

manualSync();
