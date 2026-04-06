import sequelize from '../config/database.js';

const migrate = async () => {
  try {
    console.log('🔄 Starting data migration...');
    
    // Step 1: Migrate existing NIC data from patient to adult table
    try {
      const [patients] = await sequelize.query(
        `SELECT patient_id, nic FROM patient WHERE nic IS NOT NULL AND nic != ''`
      );

      if (patients.length === 0) {
        console.log('ℹ️  No existing patients with NIC found. Skipping data insertion.');
      } else {
        console.log(`📦 Found ${patients.length} patients with NIC data. Migrating...`);
        let migrated = 0;
        let skipped = 0;
        
        for (const patient of patients) {
          const [existing] = await sequelize.query(
            `SELECT adult_id FROM adult WHERE patient_id = ?`,
            { replacements: [patient.patient_id] }
          );
          
          if (existing.length > 0) {
            skipped++;
            continue;
          }
          
          await sequelize.query(
            `INSERT INTO adult (patient_id, nic) VALUES (?, ?)`,
            { replacements: [patient.patient_id, patient.nic] }
          );
          migrated++;
        }
        console.log(`✅ Step 1: Migrated ${migrated} NIC records to adult table. Skipped ${skipped} (already existed).`);
      }
    } catch (e) {
      console.log('⚠️ Error reading patient NICs. Maybe the column is already dropped? Details:', e.message);
    }

    // Step 2: Set patient_type to ADULT for all existing patients (if patient_type exists)
    try {
      await sequelize.query(
        `UPDATE patient SET patient_type = 'ADULT' WHERE patient_type IS NULL OR patient_type = ''`
      );
      console.log(`✅ Step 2: Set patient_type = 'ADULT' for existing patients.`);
    } catch (e) {
      console.log('⚠️ Error setting patient_type.', e.message);
    }

    // Step 3: Remove the nic column from patient table
    try {
      await sequelize.query(`ALTER TABLE patient DROP COLUMN nic`);
      console.log('✅ Step 3: Removed old nic column from patient table.');
    } catch (err) {
      if (err.message.includes("Can't DROP") || err.message.includes('Unknown column') || err.message.includes("doesn't exist")) {
        console.log('ℹ️  Step 3: nic column already removed. Skipping.');
      } else {
        throw err;
      }
    }

    console.log('🎉 Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();
