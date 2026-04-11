import sequelize from '../config/database.js';

async function syncRefundSystem() {
    try {
        console.log('🔄 Starting Refund System Schema Update...');
        
        // --- APPOINTMENT TABLE ---
        console.log('--- Updating [appointment] table ---');
        try {
            await sequelize.query("ALTER TABLE appointment ADD COLUMN cancelled_at DATETIME NULL");
            console.log('✅ Added cancelled_at to appointment');
        } catch (e) { console.log('⚠️ cancelled_at skip:', e.message); }

        try {
            await sequelize.query("ALTER TABLE appointment MODIFY COLUMN payment_status ENUM('UNPAID', 'PAID', 'PARTIAL', 'REFUNDED') NOT NULL DEFAULT 'UNPAID'");
            console.log('✅ Updated payment_status ENUM in appointment');
        } catch (e) { console.log('⚠️ payment_status modify skip:', e.message); }

        // --- PAYMENT TABLE ---
        console.log('--- Updating [payment] table ---');
        try {
            await sequelize.query("ALTER TABLE payment ADD COLUMN transaction_type ENUM('PAYMENT', 'REFUND') NOT NULL DEFAULT 'PAYMENT'");
            console.log('✅ Added transaction_type to payment');
        } catch (e) { console.log('⚠️ transaction_type skip:', e.message); }

        try {
            await sequelize.query("ALTER TABLE payment ADD COLUMN reason VARCHAR(255) NULL");
            console.log('✅ Added reason to payment');
        } catch (e) { console.log('⚠️ reason skip:', e.message); }

        try {
            await sequelize.query("ALTER TABLE payment ADD COLUMN processed_by INT NULL");
            console.log('✅ Added processed_by to payment');
        } catch (e) { console.log('⚠️ processed_by skip:', e.message); }

        console.log('🏁 Refund System Schema Update Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Schema update failed:', error);
        process.exit(1);
    }
}

syncRefundSystem();
