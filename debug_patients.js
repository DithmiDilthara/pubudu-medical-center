import { User, Doctor, Appointment, Patient, Role } from './backend/models/index.js';
import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });

async function debug() {
    try {
        console.log('Finding a doctor user...');
        const doctorUser = await User.findOne({
            include: [{
                model: Role,
                as: 'role',
                where: { role_name: 'doctor' }
            }]
        });

        if (!doctorUser) {
            console.error('No doctor user found in database');
            process.exit(1);
        }

        console.log(`Testing with doctor user: ${doctorUser.email} (ID: ${doctorUser.user_id})`);

        const userId = doctorUser.user_id;

        // Simulate getMyPatients logic
        const doctor = await Doctor.findOne({ where: { user_id: userId } });
        if (!doctor) {
            console.log('Doctor profile not found');
            return;
        }

        console.log(`Doctor ID: ${doctor.doctor_id}`);

        const appointments = await Appointment.findAll({
            where: { doctor_id: doctor.doctor_id },
            include: [
                {
                    model: Patient,
                    as: 'patient',
                    include: [{ model: User, as: 'user', attributes: ['email', 'contact_number'] }]
                }
            ],
            order: [['appointment_date', 'DESC']]
        });

        console.log(`Found ${appointments.length} appointments`);

        const patientMap = new Map();

        appointments.forEach(apt => {
            if (apt.patient && !patientMap.has(apt.patient.patient_id)) {
                patientMap.set(apt.patient.patient_id, {
                    id: apt.patient.patient_id,
                    patientId: `PHE-${apt.patient.patient_id}`,
                    name: apt.patient.full_name,
                    contact: apt.patient.user ? apt.patient.user.contact_number : '',
                    email: apt.patient.user ? apt.patient.user.email : '',
                    dob: apt.patient.date_of_birth,
                    gender: apt.patient.gender,
                    lastVisit: apt.status === 'COMPLETED' ? apt.appointment_date : 'N/A',
                    primaryReason: apt.status === 'COMPLETED' ? 'Follow-up' : 'Consultation',
                    nic: apt.patient.nic
                });
            }
        });

        console.log('Success! Patients found:', patientMap.size);
        process.exit(0);
    } catch (error) {
        console.error('DEBUG ERROR:', error);
        process.exit(1);
    }
}

debug();
