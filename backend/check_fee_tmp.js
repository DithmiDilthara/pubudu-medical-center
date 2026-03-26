import { Doctor, sequelize } from './models/index.js';
import fs from 'fs';

async function checkRawNames() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("SELECT full_name FROM doctor");

        let output = '--- Raw Doctor Names ---\n';
        results.forEach(r => {
            output += `"${r.full_name}"\n`;
        });

        fs.writeFileSync('raw_names_output.txt', output);
        console.log('Results written to raw_names_output.txt');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkRawNames();
