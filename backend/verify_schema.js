import sequelize from './config/database.js';

async function verifySchema() {
    try {
        const [patientCols] = await sequelize.query("SHOW COLUMNS FROM patient");
        const [userCols] = await sequelize.query("SHOW COLUMNS FROM users");
        
        console.log('--- Patient Columns ---');
        patientCols.forEach(c => console.log(`${c.Field}: ${c.Type}`));
        
        console.log('\n--- User Columns ---');
        userCols.forEach(c => console.log(`${c.Field}: ${c.Type}`));
        
        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verifySchema();
