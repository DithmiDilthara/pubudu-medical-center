import sequelize from './config/database.js';
import { Doctor, User } from './models/index.js';

async function check() {
  try {
    const doctorId = 14;
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      console.log('Doctor not found');
      return;
    }
    console.log('Doctor:', doctor.toJSON());
    
    const user = await User.findByPk(doctor.user_id);
    if (!user) {
      console.log('User not found for doctor');
    } else {
      console.log('User:', user.toJSON());
    }
  } catch (err) {
    console.error('Check error:', err);
  } finally {
    await sequelize.close();
  }
}

check();
