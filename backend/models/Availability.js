import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Availability = sequelize.define('availability', {
    schedule_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    day_of_week: {
        type: DataTypes.ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'),
        allowNull: true
    },
    schedule_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    }
}, {
    tableName: 'doctor_schedule',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default Availability;
