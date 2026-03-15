import NotificationService from '../utils/NotificationService.js';
import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });

async function verifyEmailAndReceipt() {
    console.log('--- Starting Verification: Email & PDF Receipt ---');
    console.log('Testing with Email:', process.env.EMAIL_USER);

    const testDetails = {
        patientName: 'Test Patient',
        amount: 2500.00,
        appointmentId: '123',
        doctorName: 'Dr. John Doe',
        date: '2026-03-20',
        time: '10:30 AM',
        appointmentNumber: 5,
        transactionId: 'TEST_TRX_999',
        method: 'PayHere (Test)'
    };

    try {
        console.log('Attempting to send test email with PDF receipt...');
        // We use the patient email from env or fall back to your own email for testing
        const targetEmail = process.env.EMAIL_USER; 
        
        await NotificationService.sendPaymentSuccess(targetEmail, null, testDetails);
        
        console.log('--- Verification Complete ---');
        console.log('SUCCESS: Check your inbox (' + targetEmail + ') for the receipt.');
    } catch (error) {
        console.error('--- Verification Failed ---');
        console.error('Error:', error);
    }
}

verifyEmailAndReceipt();
