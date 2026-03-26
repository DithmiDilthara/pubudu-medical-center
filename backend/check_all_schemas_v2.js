import sequelize from './config/database.js';

async function checkAllSchemas() {
    const tableMap = {
        'doctor': 'doctor',
        'users': 'users',
        'patient': 'patient',
        'receptionist': 'receptionist',
        'admin': 'admin',
        'payment': 'payment',
        'appointment': 'appointment',
        'medical_record': 'medical_record',
        'doctor_schedule': 'doctor_schedule'
    };
    
    try {
        for (const [key, table] of Object.entries(tableMap)) {
            const [results] = await sequelize.query(`DESCRIBE ${table}`);
            console.log(`=== Table: ${table} ===`);
            results.forEach(row => {
                console.log(`${row.Field} | ${row.Type} | ${row.Null} | ${row.Key} | ${row.Default}`);
            });
            console.log("");
        }
        process.exit(0);
    } catch (error) {
        console.error("Failed to describe tables:", error);
        process.exit(1);
    }
}

checkAllSchemas();
