import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('payment', {
    payment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    patient_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    payment_method: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'SUCCESS'
    },
    appointment_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    transaction_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    transaction_type: {
        type: DataTypes.ENUM('PAYMENT', 'REFUND'),
        allowNull: false,
        defaultValue: 'PAYMENT'
    },
    reason: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    processed_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'payment',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Payment;
