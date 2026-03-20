import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Patient = sequelize.define('patient', {
  patient_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: 'patient_user_unique'
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nic: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: 'patient_nic_unique'
  },
  gender: {
    type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
    allowNull: true
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  blood_group: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  registration_source: {
    type: DataTypes.ENUM('ONLINE', 'RECEPTIONIST'),
    allowNull: false,
    defaultValue: 'ONLINE'
  }
}, {
  tableName: 'patient',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Patient;
