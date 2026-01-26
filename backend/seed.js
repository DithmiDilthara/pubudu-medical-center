import { sequelize, Role, User, Admin } from './models/index.js';

async function seedDatabase() {
  try {
    console.log('🔄 Starting database seed...');

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ alter: false });
    console.log('✓ Database synced');

    // Check if roles already exist
    const existingRoles = await Role.findAll();
    
    if (existingRoles.length === 0) {
      // Insert roles
      const roles = await Role.bulkCreate([
        { role_id: 1, role_name: 'Admin' },
        { role_id: 2, role_name: 'Doctor' },
        { role_id: 3, role_name: 'Receptionist' },
        { role_id: 4, role_name: 'Patient' }
      ]);
      console.log('✓ Roles created:', roles.length);
    } else {
      console.log('✓ Roles already exist:', existingRoles.length);
    }

    // Check if admin user exists
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    
    if (!existingAdmin) {
      // Create default admin user
      const adminUser = await User.create({
        username: 'admin',
        password_hash: 'admin123', // Will be hashed by model hook
        email: 'admin@pubudu.com',
        contact_number: 1234567890,
        role_id: 1
      });

      // Create admin profile
      await Admin.create({
        user_id: adminUser.user_id
      });

      console.log('✓ Default admin user created');
      console.log('  Username: admin');
      console.log('  Password: admin123');
    } else {
      console.log('✓ Admin user already exists');
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\nYou can now:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Login with username: admin, password: admin123');
    console.log('3. Register new patients via the registration page\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await sequelize.close();
  }
}

seedDatabase();
