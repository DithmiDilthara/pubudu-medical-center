import sequelize from '../backend/config/database.js';

async function dropColumn() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Connection successful. Dropping column "status" from "doctor_schedule"...');
    
    await sequelize.query('ALTER TABLE doctor_schedule DROP COLUMN status');
    
    console.log('Column "status" dropped successfully.');
  } catch (error) {
    if (error.message.includes("check that column/key exists")) {
       console.log('Column "status" does not exist or was already dropped.');
    } else {
       console.error('Error dropping column:', error);
    }
  } finally {
    await sequelize.close();
    process.exit();
  }
}

dropColumn();
