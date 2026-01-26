import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Role = sequelize.define('role', {
  role_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  role_name: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'role',
  timestamps: false
});

export default Role;
