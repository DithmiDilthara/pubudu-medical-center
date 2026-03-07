import { sequelize, Role, User, Admin, Patient, Doctor, Receptionist, Availability, Appointment, Prescription, Payment } from './models/index.js';
import bcrypt from 'bcryptjs';

async function seedMockData() {
    try {
        console.log('🔄 Starting full database mock seeding...');

        // Quick sync check
        await sequelize.authenticate();

        // Hash password helper
        const hashPwd = async (pwd) => {
            const salt = await bcrypt.genSalt(10);
            return await bcrypt.hash(pwd, salt);
        };

        // Default password for all mock users
        const defaultPassword = await hashPwd('password123');

        // --- 1. PATIENTS ---
        console.log('Seeding Patients...');
        const patientUser1 = await User.create({
            username: 'johndoe', password_hash: defaultPassword, email: 'john@example.com', contact_number: 771234567, role_id: 4
        });
        const patient1 = await Patient.create({
            user_id: patientUser1.user_id, full_name: 'John Doe', nic: '951234567V', gender: 'MALE', date_of_birth: '1995-05-15', address: '123 Main St, Colombo'
        });

        const patientUser2 = await User.create({
            username: 'janedoe', password_hash: defaultPassword, email: 'jane@example.com', contact_number: 779876543, role_id: 4
        });
        const patient2 = await Patient.create({
            user_id: patientUser2.user_id, full_name: 'Jane Doe', nic: '987654321V', gender: 'FEMALE', date_of_birth: '1998-08-20', address: '456 Elm St, Kandy'
        });

        // --- 2. RECEPTIONISTS ---
        console.log('Seeding Receptionists...');
        const recUser1 = await User.create({
            username: 'rec_alice', password_hash: defaultPassword, email: 'alice@pubudu.com', contact_number: 711112222, role_id: 3
        });
        const receptionist1 = await Receptionist.create({
            user_id: recUser1.user_id, full_name: 'Alice Smith', nic: '901112222V', admin_id: 1
        });

        // --- 3. DOCTORS ---
        console.log('Seeding Doctors...');
        const docUser1 = await User.create({
            username: 'doc_brown', password_hash: defaultPassword, email: 'brown@pubudu.com', contact_number: 722223333, role_id: 2
        });
        const doctor1 = await Doctor.create({
            user_id: docUser1.user_id, full_name: 'Dr. Emmett Brown', specialization: 'Cardiology', license_no: 'MED-CARD-101', admin_id: 1
        });

        const docUser2 = await User.create({
            username: 'doc_strange', password_hash: defaultPassword, email: 'strange@pubudu.com', contact_number: 733334444, role_id: 2
        });
        const doctor2 = await Doctor.create({
            user_id: docUser2.user_id, full_name: 'Dr. Stephen Strange', specialization: 'Neurology', license_no: 'MED-NEURO-202', admin_id: 1
        });

        // --- 4. AVAILABILITY (Schedules) ---
        console.log('Seeding Doctor Schedules...');
        const numDaysFromNow = (days) => {
            const date = new Date();
            date.setDate(date.getDate() + days);
            return date.toISOString().split('T')[0];
        };

        const avail1 = await Availability.create({
            doctor_id: doctor1.doctor_id, day_of_week: 'MONDAY', start_time: '09:00:00', end_time: '12:00:00', session_name: 'Morning Session'
        });

        const avail2 = await Availability.create({
            doctor_id: doctor2.doctor_id, specific_date: numDaysFromNow(2), start_time: '14:00:00', end_time: '17:00:00', session_name: 'Afternoon Clinic'
        });

        // --- 5. APPOINTMENTS ---
        console.log('Seeding Appointments...');
        const apt1 = await Appointment.create({
            patient_id: patient1.patient_id, doctor_id: doctor1.doctor_id, appointment_date: numDaysFromNow(1), time_slot: '09:00 AM - 09:15 AM', status: 'CONFIRMED', payment_status: 'PAID', notes: 'Routine checkup'
        });

        const apt2 = await Appointment.create({
            patient_id: patient2.patient_id, doctor_id: doctor2.doctor_id, appointment_date: numDaysFromNow(2), time_slot: '14:15 PM - 14:30 PM', status: 'COMPLETED', payment_status: 'PAID', notes: 'Headache diagnosis'
        });

        // --- 6. PRESCRIPTIONS ---
        console.log('Seeding Prescriptions...');
        const pres1 = await Prescription.create({
            appointment_id: apt2.appointment_id, diagnosis: 'Migraine', notes: 'Rest in a dark room.', medications: 'Paracetamol 500mg, Ibuprofen 400mg'
        });

        // --- 7. PAYMENTS ---
        console.log('Seeding Payments...');
        const pay1 = await Payment.create({
            patient_id: patient1.patient_id, amount: 2500.00, payment_method: 'Card', transaction_id: 'TXN-001', description: 'Consultation fee for Dr. Brown', status: 'SUCCESS'
        });

        const pay2 = await Payment.create({
            patient_id: patient2.patient_id, amount: 3000.00, payment_method: 'Cash', transaction_id: 'TXN-002', description: 'Consultation fee for Dr. Strange', status: 'SUCCESS'
        });

        console.log('\n🎉 ALL MOCK DATA SEEDED SUCCESSFULLY!');
        console.log('Here are some credentials you can use for testing:');
        console.log('  Patient: username: johndoe , password: password123');
        console.log('  Doctor:  username: doc_brown , password: password123');
        console.log('  Recept:  username: rec_alice , password: password123');
        console.log('  Admin:   username: admin , password: admin123 (created earlier)');
        console.log('\n');

    } catch (error) {
        console.error('❌ Error seeding mock database:', error);
    } finally {
        await sequelize.close();
    }
}

seedMockData();
