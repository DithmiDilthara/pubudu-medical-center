import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Appointment = sequelize.define('appointment', {
    appointment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    appointment_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    time_slot: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'),
        allowNull: false,
        defaultValue: 'PENDING'
    },
    payment_status: {
        type: DataTypes.ENUM('UNPAID', 'PAID', 'PARTIAL'),
        allowNull: false,
        defaultValue: 'UNPAID'
    },
    appointment_number: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    is_noshow: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'appointment',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Appointment;
