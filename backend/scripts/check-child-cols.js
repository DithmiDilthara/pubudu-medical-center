import { sequelize } from '../models/index.js';

const checkChild = async () => {
    try {
        const [columns] = await sequelize.query('DESCRIBE child');
        console.log('--- CHILD TABLE COLUMNS ---');
        columns.forEach(c => console.log(c.Field));
        process.exit(0);
    } catch (e) {
        console.log('Error:', e.message);
        process.exit(1);
    }
};

checkChild();
