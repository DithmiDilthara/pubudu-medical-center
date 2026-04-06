import sequelize from '../config/database.js';

const checkDb = async () => {
    try {
        const [adults] = await sequelize.query('SELECT * FROM adult');
        console.log('Adult table contents:', adults);

        const [patients] = await sequelize.query('SELECT * FROM patient');
        console.log('Patient table contents:', patients.map(p => ({ id: p.patient_id, name: p.full_name, type: p.patient_type })));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

checkDb();
