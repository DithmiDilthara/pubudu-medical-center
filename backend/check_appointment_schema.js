import sequelize from './config/database.js';

async function checkSchema() {
    try {
        const [results] = await sequelize.query("DESCRIBE appointment");
        console.log("Columns in 'appointment' table:");
        results.forEach(row => {
            console.log(`- ${row.Field} (${row.Type})`);
        });
        process.exit(0);
    } catch (error) {
        console.error("Failed to describe table:", error);
        process.exit(1);
    }
}

checkSchema();
