import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Receptionist = sequelize.define('receptionist', {
  receptionist_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: 'receptionist_user_unique'
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nic: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: 'receptionist_nic_unique'
  }
}, {
  tableName: 'receptionist',
  timestamps: false
});

export default Receptionist;
