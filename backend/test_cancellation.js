import { Appointment, Doctor, Patient, User, Availability } from './models/index.js';
import NotificationService from './utils/NotificationService.js';

// Mock NotificationService temporarily to track if sendCancellationNotice is called
const originalSend = NotificationService.sendCancellationNotice;
let emailsSent = 0;
NotificationService.sendCancellationNotice = async (email, details) => {
    emailsSent++;
    console.log(`[MOCK EMAIL SENT] To: ${email} | Details:`, details);
};

export async function testCancellationCascade() {
    console.log("Starting DB mock test...");

    // 1. Setup a dummy Doctor and Patient
    const doctor = await Doctor.findOne();
    const patient = await Patient.findOne({ include: [{ model: User, as: 'user' }] });

    if (!doctor || !patient) {
        console.log("No doctor or patient found for testing.");
        return;
    }

    const testDate = '2027-01-01'; // Future date

    // 2. Create a dummy appointment
    const newAppt = await Appointment.create({
        patient_id: patient.patient_id,
        doctor_id: doctor.doctor_id,
        appointment_date: testDate,
        time_slot: '10:00:00',
        status: 'PENDING',
        fee: 1000.00
    });
    console.log(`Created Appointment ID: ${newAppt.appointment_id}`);

    // 3. Simulate specific date cancellation payload
    const payload = [
        { specific_date: testDate, start_time: '09:00:00', end_time: '17:00:00', session_name: 'Unavailable' }
    ];

    // Simulate the exact logic from availabilityController
    const unavailableDates = payload.filter(s => s.session_name !== 'Available').map(s => s.specific_date);

    if (unavailableDates.length > 0) {
        const affectedAppointments = await Appointment.findAll({
            where: {
                doctor_id: doctor.doctor_id,
                appointment_date: unavailableDates,
                status: ['PENDING', 'CONFIRMED']
            },
            include: [
                { model: Patient, as: 'patient', include: [{ model: User, as: 'user' }] },
                { model: Doctor, as: 'doctor' }
            ]
        });

        console.log(`Found ${affectedAppointments.length} appointments to cancel.`);

        if (affectedAppointments.length > 0) {
            for (const appt of affectedAppointments) {
                appt.status = 'CANCELLED';
                await appt.save();

                if (appt.patient && appt.patient.user && appt.patient.user.email) {
                    NotificationService.sendCancellationNotice(appt.patient.user.email, {
                        doctorName: appt.doctor.full_name,
                        patientName: appt.patient.full_name,
                        date: appt.appointment_date,
                        time: appt.time_slot,
                        reason: 'Doctor is unavailable'
                    });
                }
            }
        }
    }

    // 4. Verify Appointment status changed
    const verifyAppt = await Appointment.findByPk(newAppt.appointment_id);
    console.log(`Verification: Appointment is now ${verifyAppt.status}`);
    console.log(`Verification: Emails sent: ${emailsSent}`);

    // Cleanup
    await Appointment.destroy({ where: { appointment_id: newAppt.appointment_id } });
    NotificationService.sendCancellationNotice = originalSend;
    console.log("Test finished.");
}

testCancellationCascade().catch(console.error);
