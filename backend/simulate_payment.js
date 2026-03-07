import axios from 'axios';
import crypto from 'crypto';

const PAYHERE_MERCHANT_ID = '1234313';
const PAYHERE_MERCHANT_SECRET = 'NDE1MzE5NzMwMjIxMDk4ODM4MDIyMTMyOTY4MzgxNDEyNjQwMTA5OA==';
const BACKEND_URL = 'http://localhost:3000';

async function simulateNotify(appointmentId, patientId, amount) {
    const orderId = `APT_${appointmentId}_TEST`;
    const currency = 'LKR';
    const statusCode = '2'; // Success
    const paymentId = 'PAYMENT_123456789';

    // MD5 Signature generation (Simulation)
    // Format: merchant_id + order_id + payhere_amount + payhere_currency + status_code + UPPERCASE(MD5(merchant_secret))
    const secretHash = crypto.createHash('md5').update(PAYHERE_MERCHANT_SECRET).digest('hex').toUpperCase();
    const rawString = PAYHERE_MERCHANT_ID + orderId + amount + currency + statusCode + secretHash;
    const md5sig = crypto.createHash('md5').update(rawString).digest('hex').toUpperCase();

    const payload = {
        merchant_id: PAYHERE_MERCHANT_ID,
        order_id: orderId,
        payment_id: paymentId,
        payhere_amount: amount,
        payhere_currency: currency,
        status_code: statusCode,
        md5sig: md5sig,
        custom_1: appointmentId,
        custom_2: patientId,
        method: 'VISA',
        status_message: 'Success'
    };

    try {
        console.log(`Sending simulated notify for appointment ${appointmentId}...`);
        const response = await axios.post(`${BACKEND_URL}/api/payments/notify`, payload);
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error simulating notify:', error.response?.data || error.message);
    }
}

// You can run this with: node simulate_payment.js <appointment_id> <patient_id> <amount>
const args = process.argv.slice(2);
if (args.length >= 3) {
    simulateNotify(args[0], args[1], args[2]);
} else {
    console.log('Usage: node simulate_payment.js <appointment_id> <patient_id> <amount>');
    // Example: node simulate_payment.js 1 1 3000.00
}
