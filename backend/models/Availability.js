import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Availability = sequelize.define('availability', {
    availability_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'schedule_id'
    },
    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    day_of_week: {
        type: DataTypes.ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'),
        allowNull: true
    },
    specific_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'schedule_date'
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    session_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'status'
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
