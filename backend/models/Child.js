import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Child = sequelize.define('child', {
  child_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: 'child_patient_unique'
  },
  guardian_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  guardian_contact: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  guardian_relationship: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: 'child',
  timestamps: false
});

export default Child;
