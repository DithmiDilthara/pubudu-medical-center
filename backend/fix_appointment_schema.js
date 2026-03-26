import sequelize from './config/database.js';

async function fixSchema() {
    try {
        console.log("Adding 'availability_id' to 'appointment' table...");
        await sequelize.query("ALTER TABLE appointment ADD COLUMN availability_id INT NULL AFTER appointment_date;");
        console.log("✓ 'availability_id' added successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Failed to fix table:", error);
        process.exit(1);
    }
}

fixSchema();
