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
    unique: true
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nic: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true
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
  }
}, {
  tableName: 'patient',
  timestamps: false
});

export default Patient;
