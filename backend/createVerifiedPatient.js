import { User, Patient } from './models/index.js';
import sequelize from './config/database.js';

const createVerifiedPatient = async () => {
    try {
        const username = 'VerifiedPatient';
        const password = 'Password123!';
        const email = 'verified@test.com';
        const role_id = 4; // Patient

        // Delete existing
        const existing = await User.findOne({ where: { username } });
        if (existing) {
            await existing.destroy();
        }

        const user = await User.create({
            username,
            password_hash: password, // Sequelize hook will hash it
            email,
            contact_number: '0712345678',
            role_id,
            is_active: true
        });

        await Patient.create({
            user_id: user.user_id,
            full_name: 'Verified Test Patient',
            nic: '200012345678',
            gender: 'MALE',
            date_of_birth: '1990-01-01',
            address: 'Test Address',
            is_verified: true
        });

        console.log('✅ Created verified patient: VerifiedPatient / Password123!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
};

createVerifiedPatient();
