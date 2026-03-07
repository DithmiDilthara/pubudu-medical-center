import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Doctor = sequelize.define('doctor', {
  doctor_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: 'doctor_user_unique'
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  specialization: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  license_no: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: 'doctor_license_unique'
  },
  session_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 3000.00
  }
}, {
  tableName: 'doctor',
  timestamps: false
});

export default Doctor;
