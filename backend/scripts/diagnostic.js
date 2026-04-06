import { User, Role, Patient, Adult, Child, sequelize } from '../models/index.js';

const diagnostic = async () => {
    try {
        console.log('--- Database Diagnostic ---');
        
        // 1. Check Role
        const role = await Role.findOne({ where: { role_name: 'Patient' } });
        console.log('Patient Role:', role ? `Found (ID: ${role.role_id})` : 'NOT FOUND');
        
        // 2. Check Tables
        const [tables] = await sequelize.query('SHOW TABLES');
        console.log('Tables in DB:', tables.map(t => Object.values(t)[0]));
        
        // 3. Describe Child Table
        try {
            const [columns] = await sequelize.query('DESCRIBE child');
            console.log('Child Table Columns:', columns.map(c => c.Field));
        } catch (e) {
            console.log('Child table error:', e.message);
        }

        // 4. Describe Adult Table
        try {
            const [columns] = await sequelize.query('DESCRIBE adult');
            console.log('Adult Table Columns:', columns.map(c => c.Field));
        } catch (e) {
            console.log('Adult table error:', e.message);
        }

        process.exit(0);
    } catch (error) {
        console.error('Diagnostic error:', error);
        process.exit(1);
    }
};

diagnostic();
