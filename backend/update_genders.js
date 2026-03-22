import sequelize from './config/database.js';
import Doctor from './models/Doctor.js';

async function updateGenders() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        const doctors = await Doctor.findAll();
        for (const doc of doctors) {
            console.log(`Current -> ID: ${doc.doctor_id}, Name: ${doc.full_name}, Gender: ${doc.gender}`);
            const nameLower = doc.full_name.toLowerCase();
            if (nameLower.includes('buddika') || nameLower.includes('shanaka')) {
                await doc.update({ gender: 'MALE' });
                console.log(`Updated ${doc.full_name} to MALE`);
            }
        }
        console.log('Update complete.');
    } catch (error) {
        console.error('Error updating genders:', error);
    } finally {
        await sequelize.close();
    }
}

updateGenders();
