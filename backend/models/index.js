import sequelize from '../config/database.js';
import Role from './Role.js';
import User from './User.js';
import Admin from './Admin.js';
import Patient from './Patient.js';
import Adult from './Adult.js';
import Child from './Child.js';
import Doctor from './Doctor.js';
import Receptionist from './Receptionist.js';
import Token from './Token.js';
import Payment from './Payment.js';
import Appointment from './Appointment.js';
import Availability from './Availability.js';
import MedicalRecord from './MedicalRecord.js';

// Define associations

// Role - User (One-to-Many)
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// User - Token (One-to-Many)
User.hasMany(Token, { foreignKey: 'user_id', as: 'tokens' });
Token.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - Admin (One-to-One)
User.hasOne(Admin, { foreignKey: 'user_id', as: 'admin', onDelete: 'CASCADE' });
Admin.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - Patient (One-to-One)
User.hasOne(Patient, { foreignKey: 'user_id', as: 'patient', onDelete: 'CASCADE' });
Patient.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Patient - Adult (One-to-One)
Patient.hasOne(Adult, { foreignKey: 'patient_id', as: 'adult', onDelete: 'CASCADE' });
Adult.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Patient - Child (One-to-One)
Patient.hasOne(Child, { foreignKey: 'patient_id', as: 'child', onDelete: 'CASCADE' });
Child.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// User - Doctor (One-to-One)
User.hasOne(Doctor, { foreignKey: 'user_id', as: 'doctor', onDelete: 'CASCADE' });
Doctor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User - Receptionist (One-to-One)
User.hasOne(Receptionist, { foreignKey: 'user_id', as: 'receptionist', onDelete: 'CASCADE' });
Receptionist.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Admin - Doctor (One-to-Many)
Admin.hasMany(Doctor, { foreignKey: 'admin_id', as: 'doctors' });
Doctor.belongsTo(Admin, { foreignKey: 'admin_id', as: 'admin' });

// Admin - Receptionist (One-to-Many)
Admin.hasMany(Receptionist, { foreignKey: 'admin_id', as: 'receptionists' });
Receptionist.belongsTo(Admin, { foreignKey: 'admin_id', as: 'admin' });

// Patient - Payment (One-to-Many)
Patient.hasMany(Payment, { foreignKey: 'patient_id', as: 'payments' });
Payment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Doctor - Availability (One-to-Many)
Doctor.hasMany(Availability, { foreignKey: 'doctor_id', as: 'availability', onDelete: 'CASCADE' });
Availability.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// Patient - Appointment (One-to-Many)
Patient.hasMany(Appointment, { foreignKey: 'patient_id', as: 'appointments', onDelete: 'CASCADE' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Doctor - Appointment (One-to-Many)
Doctor.hasMany(Appointment, { foreignKey: 'doctor_id', as: 'appointments', onDelete: 'CASCADE' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// Patient - MedicalRecord (One-to-Many)
Patient.hasMany(MedicalRecord, { foreignKey: 'patient_id', as: 'medical_records' });
MedicalRecord.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

// Doctor - MedicalRecord (One-to-Many)
Doctor.hasMany(MedicalRecord, { foreignKey: 'doctor_id', as: 'medical_records' });
MedicalRecord.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// Appointment - Payment (One-to-One)
Appointment.hasOne(Payment, { foreignKey: 'appointment_id', as: 'payment' });
Payment.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });

export {
  sequelize,
  Role,
  User,
  Admin,
  Patient,
  Adult,
  Child,
  Doctor,
  Receptionist,
  Token,
  Payment,
  Appointment,
  Availability,
  MedicalRecord
};
