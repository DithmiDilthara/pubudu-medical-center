import mysql from 'mysql2/promise';

async function fix() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'Dithmi12345',
        database: 'pubudud_echanneling_database',
        port: 3307
    });

    const [allTablesRow] = await connection.execute('SHOW TABLES');
    const tables = allTablesRow.map(row => Object.values(row)[0]);

    const tablesToClear = ['role', 'users', 'patient', 'doctor', 'receptionist'];

    for (const table of tablesToClear) {
        try {
            const [rows] = await connection.execute(`SHOW INDEX FROM \`${table}\``);
            const indexNames = [...new Set(rows.map(r => r.Key_name).filter(name => name !== 'PRIMARY'))];

            for (const name of indexNames) {
                try {
                    await connection.execute(`ALTER TABLE \`${table}\` DROP INDEX \`${name}\``);
                    console.log(`Dropped index ${name} from ${table}`);
                } catch (e) {
                    console.error(`Failed to drop ${name} from ${table}:`, e.message);
                }
            }
        } catch (e) {
            console.error(`Table ${table} might not exist yet or error:`, e.message);
        }
    }

    console.log('Done cleaning database indexes. Sequelize sync will recreate necessary ones.');
    process.exit(0);
}

fix();
