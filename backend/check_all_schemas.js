import sequelize from './config/database.js';

async function checkAllSchemas() {
    const tables = ['doctor', 'users', 'patient', 'receptionist', 'admin', 'payment', 'appointment', 'medical_record', 'doctor_schedule'];
    try {
        for (const table of tables) {
            const [results] = await sequelize.query(`DESCRIBE ${table}`);
            console.log(`\nColumns in '${table}' table:`);
            results.forEach(row => {
                console.log(`- ${row.Field} (${row.Type})`);
            });
        }
        process.exit(0);
    } catch (error) {
        console.error("Failed to describe tables:", error);
        process.exit(1);
    }
}

checkAllSchemas();
