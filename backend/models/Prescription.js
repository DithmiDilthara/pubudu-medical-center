import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Prescription = sequelize.define('prescription', {
    prescription_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    appointment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    diagnosis: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    medications: {
        type: DataTypes.TEXT, // Could be JSON for better structure, but string is safer for simple SQLite/MySQL
        allowNull: true
    }
}, {
    tableName: 'prescription',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Prescription;
