import sequelize from './config/database.js';
import fs from 'fs';

async function checkFees() {
    try {
        const [results] = await sequelize.query("SELECT doctor_id, full_name, doctor_fee, center_fee FROM doctor;");
        fs.writeFileSync('doctor_fees.txt', JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkFees();
