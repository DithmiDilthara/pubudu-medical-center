import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MedicalRecord = sequelize.define('medical_record', {
    record_id: {
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
    record_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    diagnosis: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    prescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    follow_up_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
}, {
    tableName: 'medical_record',
    timestamps: false // The table schema didn't show created_at/updated_at fields
});

export default MedicalRecord;
