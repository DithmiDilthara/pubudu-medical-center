import NotificationService from './utils/NotificationService.js';
import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });

async function testSMS() {
    console.log("Starting SMS Test...");
    console.log("Using Token:", process.env.TEXT_LK_TOKEN ? "X...X" : "MISSING");
    
    const testPhone = "0771234567"; // FIXME: Replace with your actual phone number for a real test
    const testName = "Test Patient";
    const doctorName = "Dr. Smith";
    const appointmentNumber = 5;
    const date = "2024-03-20";
    const time = "10:30 AM";

    console.log("TIP: If you get 'Sender ID not authorized', your ID 'Pubudu MC' might still be pending approval at Text.lk.");

    console.log("1. Testing Base sendSMS...");
    await NotificationService.sendSMS(testPhone, "Test SMS from Pubudu MC");

    console.log("2. Testing sendAppointmentConfirmation...");
    await NotificationService.sendAppointmentConfirmation("test@example.com", testPhone, {
        patientName: testName,
        doctorName: doctorName,
        date: date,
        time: time,
        appointmentNumber: appointmentNumber
    });

    console.log("Test execution finished. Check Text.lk logs or your phone.");
}

testSMS();
