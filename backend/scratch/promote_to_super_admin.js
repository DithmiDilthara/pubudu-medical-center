import { Role, User } from '../models/index.js';
import sequelize from '../config/database.js';

async function promoteToSuperAdmin() {
    try {
        console.log('🔄 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Connected.');

        // 1. Ensure Super Admin role exists
        let superAdminRole = await Role.findOne({ where: { role_name: 'Super Admin' } });
        if (!superAdminRole) {
            console.log('➕ Creating Super Admin role...');
            superAdminRole = await Role.create({ role_id: 5, role_name: 'Super Admin' });
            console.log('✅ Role created with ID 5.');
        } else {
            console.log('✅ Role already exists.');
        }

        // 2. Promote the current 'admin' user
        const adminUser = await User.findOne({ where: { username: 'admin' } });
        if (adminUser) {
            console.log(`⬆️ Promoting user '${adminUser.username}' to Super Admin...`);
            await adminUser.update({ role_id: 5 });
            console.log('✅ User promoted successfully.');
        } else {
            console.log('⚠️ Primary admin user not found. Please promote the owner manually.');
        }

    } catch (error) {
        console.error('❌ Error during promotion:', error);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

promoteToSuperAdmin();
