import { MedicalRecord, Appointment, Patient, User, Doctor } from '../models/index.js';
import NotificationService from '../utils/NotificationService.js';

/**
 * @desc    Add a medical record for a patient consultation
 * @route   POST /api/clinical/record
 * @access  Private (Doctor)
 */
export const addMedicalRecord = async (req, res) => {
    try {
        const { appointment_id, patient_id, record_date, diagnosis, notes, prescription, follow_up_date } = req.body;
        const userId = req.user.user_id;

        const doctor = await Doctor.findOne({ where: { user_id: userId } });
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor record not found for this user' });

        // Create the Medical Record
        const medicalRecord = await MedicalRecord.create({
            patient_id,
            doctor_id: doctor.doctor_id,
            record_date: record_date || new Date().toISOString().split('T')[0],
            diagnosis,
            notes,
            prescription,
            follow_up_date: follow_up_date || null
        });

        // Update appointment status to COMPLETED if an appointment ID was provided
        if (appointment_id) {
            await Appointment.update({ status: 'COMPLETED' }, { where: { appointment_id } });

            // Send notification
            try {
                const appointmentWithPatient = await Appointment.findByPk(appointment_id, {
                    include: [{ model: Patient, as: 'patient', include: [{ model: User, as: 'user' }] }]
                });
                if (appointmentWithPatient?.patient?.user?.email) {
                    NotificationService.sendPrescriptionReady(
                        appointmentWithPatient.patient.user.email, 
                        appointmentWithPatient.patient.full_name
                    );
                }
            } catch (notifyError) {
                console.error('Failed to trigger medical record notification:', notifyError);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Medical record saved successfully',
            data: medicalRecord
        });

    } catch (error) {
        console.error('Add medical record error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
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
        if (currentUser.role_id === 4) { // Patient role ID
            const patient = await Patient.findOne({ where: { user_id: currentUser.user_id } });
            if (parseInt(patient_id) !== patient.patient_id) {
                return res.status(403).json({ success: false, message: 'Unauthorized access' });
            }
        }

        const history = await MedicalRecord.findAll({
            where: { patient_id },
            include: [{ 
                model: Doctor, 
                as: 'doctor', 
                attributes: ['full_name', 'specialization'] 
            }],
            order: [['record_date', 'DESC'], ['record_id', 'DESC']]
        });

        res.status(200).json({ success: true, data: history });

    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
