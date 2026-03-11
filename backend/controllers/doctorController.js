import { Doctor, User, Availability, Appointment, Patient, Prescription } from '../models/index.js';

/**
 * @desc    Get all doctors with their specializations
 * @route   GET /api/doctors
 * @access  Public
 */
export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.findAll({
            attributes: ['doctor_id', 'full_name', 'specialization', 'license_no', 'doctor_fee', 'center_fee'],
            include: [{ model: User, as: 'user', attributes: ['email', 'contact_number'] }]
        });

        res.status(200).json({ success: true, data: doctors });
    } catch (error) {
        console.error('Get all doctors error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Get doctors by specialization
 * @route   GET /api/doctors/specialization/:specialization
 * @access  Public
 */
export const getDoctorsBySpecialization = async (req, res) => {
    try {
        const { specialization } = req.params;
        const doctors = await Doctor.findAll({
            where: { specialization },
            attributes: ['doctor_id', 'full_name', 'specialization']
        });

        res.status(200).json({ success: true, data: doctors });
    } catch (error) {
        console.error('Get doctors by specialization error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Get all patients assigned to a doctor
 * @route   GET /api/doctors/my-patients
 * @access  Private (Doctor)
 */
export const getMyPatients = async (req, res) => {
    try {
        const userId = req.user.user_id;

        // Find the doctor record
        const doctor = await Doctor.findOne({ where: { user_id: userId } });
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor profile not found' });
        }

        // Get all appointments for this doctor to find unique patients
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

        // Extract unique patients with their latest appointment data
        const patientMap = new Map();

        appointments.forEach(apt => {
            if (apt.patient && !patientMap.has(apt.patient.patient_id)) {
                patientMap.set(apt.patient.patient_id, {
                    id: apt.patient.patient_id,
                    patientId: `PHE-${apt.patient.patient_id}`,
                    name: apt.patient.full_name,
                    contact: apt.patient.user ? apt.patient.user.contact_number : '',
                    email: apt.patient.user ? apt.patient.user.email : '',
                    lastVisit: apt.status === 'COMPLETED' ? apt.appointment_date : 'N/A', // First encountered is most recent due to DESC order
                    primaryReason: apt.status === 'COMPLETED' ? 'Follow-up' : 'Consultation', // Dummy, can fetch from prescriptions if needed
                    nic: apt.patient.nic
                });
            }
        });

        res.status(200).json({ success: true, data: Array.from(patientMap.values()) });
    } catch (error) {
        console.error('Get my patients error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Get specific patient details for doctor view
 * @route   GET /api/doctors/patient/:patient_id
 * @access  Private (Doctor)
 */
export const getPatientDetails = async (req, res) => {
    try {
        const { patient_id } = req.params;
        const userId = req.user.user_id;

        // Basic verification that user is a doctor
        const doctor = await Doctor.findOne({ where: { user_id: userId } });
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor profile not found' });
        }

        // Optionally verify that this doctor has seen this patient (skip for simplicity if they need to fetch global records)

        const patient = await Patient.findByPk(patient_id, {
            include: [{ model: User, as: 'user', attributes: ['email', 'contact_number'] }]
        });

        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // Map to expected frontend structure
        const patientData = {
            id: `PHE-${patient.patient_id}`,
            patientId: patient.patient_id,
            name: patient.full_name,
            dob: patient.date_of_birth || 'N/A',
            gender: patient.gender,
            contact: patient.user ? patient.user.contact_number : 'N/A',
            email: patient.user ? patient.user.email : 'N/A',
            address: patient.address || 'N/A',
            pastDiagnoses: 'Available in medical history', // Placeholder
            medications: 'Available in medical history',
            labResults: 'Pending',
            allergies: 'None recorded'
        };

        res.status(200).json({ success: true, data: patientData });
    } catch (error) {
        console.error('Get patient details error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
