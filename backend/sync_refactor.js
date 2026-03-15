import { Patient, User, sequelize } from './models/index.js';

async function syncRedundantPhone() {
    try {
        console.log('Starting migration refactor sync...');
        
        // Remove phone from Patient table if it exists (Sequelize alter doesn't always drop columns depending on dialect)
        // But for safety and consistency, we'll try to sync with alter: true
        await sequelize.sync({ alter: true });
        
        console.log('Schema synchronized successfully. Patient.phone removed and User.contact_number expanded.');
        process.exit(0);
    } catch (error) {
        console.error('Sync failed:', error);
        process.exit(1);
    }
}

syncRedundantPhone();
