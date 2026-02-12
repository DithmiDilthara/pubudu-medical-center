import { Prescription, Appointment, Availability, Patient, User, Doctor } from '../models/index.js';
import NotificationService from '../utils/NotificationService.js';

/**
 * @desc    Add a prescription to an appointment
 * @route   POST /api/clinical/prescription
 * @access  Private (Doctor)
 */
export const addPrescription = async (req, res) => {
    try {
        const { appointment_id, diagnosis, notes, medications } = req.body;
        const userId = req.user.user_id;

        const doctor = await Doctor.findOne({ where: { user_id: userId } });
        const appointment = await Appointment.findByPk(appointment_id);

        if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
        if (appointment.doctor_id !== doctor.doctor_id) {
            return res.status(403).json({ success: false, message: 'You are not assigned to this appointment' });
        }

        const prescription = await Prescription.create({
            appointment_id,
            diagnosis,
            notes,
            medications
        });

        // Update appointment status to COMPLETED
        await Appointment.update({ status: 'COMPLETED' }, { where: { appointment_id } });

        // Send notification
        try {
            const appointment = await Appointment.findByPk(appointment_id, {
                include: [{ model: Patient, as: 'patient', include: [{ model: User, as: 'user' }] }]
            });
            if (appointment && appointment.patient && appointment.patient.user && appointment.patient.user.email) {
                NotificationService.sendPrescriptionReady(appointment.patient.user.email, appointment.patient.full_name);
            }
        } catch (notifyError) {
            console.error('Failed to trigger prescription notification:', notifyError);
        }

        res.status(201).json({
            success: true,
            data: prescription
        });

    } catch (error) {
        console.error('Add prescription error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Get medical history for a patient
 * @route   GET /api/clinical/history/:patient_id
 * @access  Private (Doctor, Patient themselves)
 */
export const getMedicalHistory = async (req, res) => {
    try {
        const { patient_id } = req.params;
        const currentUser = req.user;

        // Authorization check
        if (currentUser.role_id === 4) { // Patient
            const patient = await Patient.findOne({ where: { user_id: currentUser.user_id } });
            if (parseInt(patient_id) !== patient.patient_id) {
                return res.status(403).json({ success: false, message: 'Unauthorized access' });
            }
        }

        const history = await Prescription.findAll({
            include: [{
                model: Appointment,
                as: 'appointment',
                where: { patient_id },
                include: [{ model: Doctor, as: 'doctor', attributes: ['full_name', 'specialization'] }]
            }],
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({ success: true, data: history });

    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
