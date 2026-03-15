import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: './config/.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
  }
);

async function check() {
  try {
    const [cols] = await sequelize.query('DESCRIBE medical_record;');
    fs.writeFileSync('cols.json', JSON.stringify(cols, null, 2), 'utf8');
  } catch (err) {
    console.error(err.message);
  } finally {
    await sequelize.close();
  }
}
check();
