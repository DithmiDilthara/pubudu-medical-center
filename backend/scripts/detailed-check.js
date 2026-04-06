import sequelize from '../config/database.js';
import fs from 'fs';

const checkDb = async () => {
    const result = {
        adults: [],
        patients_with_nic: null,
        patients_no_nic: null,
        errors: []
    };

    try {
        const [adults] = await sequelize.query('SELECT * FROM adult');
        result.adults = adults;

        try {
            const [patients] = await sequelize.query('SELECT patient_id, nic, patient_type FROM patient LIMIT 5');
            result.patients_with_nic = patients;
        } catch (e) {
            result.errors.push("NIC column query failed: " + e.message);
            const [patientsNoNIC] = await sequelize.query('SELECT patient_id, patient_type FROM patient LIMIT 5');
            result.patients_no_nic = patientsNoNIC;
        }

        fs.writeFileSync('db_state.json', JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (e) {
        console.error("Critical error:", e);
        process.exit(1);
    }
};

checkDb();
