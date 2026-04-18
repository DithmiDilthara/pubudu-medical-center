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
    schedule_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'availability_id'
    },
    time_slot: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'RESCHEDULE_REQUIRED', 'NO_SHOW'),
        allowNull: false,
        defaultValue: 'PENDING'
    },
    payment_status: {
        type: DataTypes.ENUM('UNPAID', 'PAID', 'PARTIAL', 'REFUNDED', 'REFUND_DISMISSED'),
        allowNull: false,
        defaultValue: 'UNPAID'
    },
    cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    appointment_number: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

}, {
    tableName: 'appointment',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Appointment;
