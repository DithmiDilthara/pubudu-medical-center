import sequelize from './config/database.js';
import './models/index.js';

async function syncDb() {
    try {
        await sequelize.sync({ alter: true });
        console.log('Database synchronized successfully with model changes.');
        process.exit(0);
    } catch (error) {
        console.error('Error synchronizing database:', error);
        process.exit(1);
    }
}

syncDb();
