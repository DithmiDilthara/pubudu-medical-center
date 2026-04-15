import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Adult = sequelize.define('adult', {
  adult_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: 'adult_patient_unique'
  },
  nic: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: 'adult_nic_unique'
  }
}, {
  tableName: 'adult',
  timestamps: false
});

export default Adult;
