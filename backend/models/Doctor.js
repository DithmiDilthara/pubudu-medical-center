import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Doctor = sequelize.define('Doctor', {
    doctor_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: 'unique_user_id_doctor',
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    full_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    specialization: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    gender: {
        type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER'),
        allowNull: true
    },
    license_no: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    doctor_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    center_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    consultation_fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    admin_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'admin',
            key: 'admin_id'
        },
        comment: 'ID of the Admin who created this doctor account'
    }
}, {
  tableName: 'doctor',
  timestamps: false
});

export default Doctor;
