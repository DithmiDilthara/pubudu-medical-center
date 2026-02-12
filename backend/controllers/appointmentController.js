import { Appointment, Patient, Doctor, User } from '../models/index.js';
import NotificationService from '../utils/NotificationService.js';

/**
 * @desc    Create a new appointment
 * @route   POST /api/appointments
 * @access  Private (Patient, Receptionist)
 */
export const createAppointment = async (req, res) => {
    try {
        const { doctor_id, appointment_date, time_slot, patient_id } = req.body;
        const currentUser = req.user;

        let targetPatientId = patient_id;

        // If patient is booking for themselves
        if (currentUser.role_id === 4) {
            const patient = await Patient.findOne({ where: { user_id: currentUser.user_id } });
            if (!patient) return res.status(404).json({ success: false, message: 'Patient profile not found' });
            targetPatientId = patient.patient_id;
        }

        if (!targetPatientId) {
            return res.status(400).json({ success: false, message: 'Patient ID is required' });
        }

        // Check if slot already taken
        const existingAppointment = await Appointment.findOne({
            where: {
                doctor_id,
                appointment_date,
                time_slot,
                status: ['PENDING', 'CONFIRMED']
            }
        });

        if (existingAppointment) {
            return res.status(400).json({ success: false, message: 'This time slot is already booked' });
        }

        const appointment = await Appointment.create({
            patient_id: targetPatientId,
            doctor_id,
            appointment_date,
            time_slot,
            status: 'PENDING',
            payment_status: 'UNPAID'
        });

        // Send confirmation notification (Async)
        try {
            const patient = await Patient.findByPk(targetPatientId, { include: [{ model: User, as: 'user' }] });
            const doctor = await Doctor.findByPk(doctor_id);
            if (patient && patient.user && patient.user.email) {
                NotificationService.sendAppointmentConfirmation(patient.user.email, {
                    patientName: patient.full_name,
                    doctorName: doctor.full_name,
                    date: appointment_date,
                    time: time_slot
                });
            }
        } catch (notifyError) {
            console.error('Failed to trigger notification:', notifyError);
        }

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully',
            data: appointment
        });

    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Cancel an appointment
 * @route   PUT /api/appointments/:id/cancel
 * @access  Private (Patient, Receptionist, Doctor)
 */
export const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findByPk(id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Authorization: Patients can only cancel their own
        if (req.user.role_id === 4) {
            const patient = await Patient.findOne({ where: { user_id: req.user.user_id } });
            if (appointment.patient_id !== patient.patient_id) {
                return res.status(403).json({ success: false, message: 'Unauthorized to cancel this appointment' });
            }
        }

        appointment.status = 'CANCELLED';
        await appointment.save();

        res.status(200).json({ success: true, message: 'Appointment cancelled successfully', data: appointment });

    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Get all appointments (Filtered by role)
 * @route   GET /api/appointments
 * @access  Private
 */
export const getAppointments = async (req, res) => {
    try {
        const { role_id, user_id } = req.user;
        const { doctor_id } = req.query;
        let where = {};

        if (role_id === 4) { // Patient
            if (doctor_id) {
                // If a patient is asking for a doctor's appointments, only show essential info
                where = { doctor_id, status: ['PENDING', 'CONFIRMED'] };
            } else {
                // Otherwise, show only their own appointments
                const patient = await Patient.findOne({ where: { user_id } });
                if (!patient) return res.status(200).json({ success: true, data: [] });
                where = { patient_id: patient.patient_id };
            }
        } else if (role_id === 2) { // Doctor
            const doctor = await Doctor.findOne({ where: { user_id } });
            if (!doctor) return res.status(200).json({ success: true, data: [] });
            where = { doctor_id: doctor.doctor_id };
        } else if (role_id === 3 || role_id === 1) { // Receptionist or Admin
            if (doctor_id) where.doctor_id = doctor_id;
        }

        const include = [
            { model: Doctor, as: 'doctor', attributes: ['full_name', 'specialization'] }
        ];

        // Only include patient info if it's NOT a patient looking at another doctor's slots
        if (role_id !== 4 || !doctor_id) {
            include.push({ model: Patient, as: 'patient', attributes: ['full_name', 'nic'] });
        } else {
            // For patients looking at doctor's slots, don't return patient details for privacy
            include.push({ model: Patient, as: 'patient', attributes: ['patient_id'] }); // Or omit
        }

        const appointments = await Appointment.findAll({
            where,
            include,
            order: [['appointment_date', 'DESC'], ['time_slot', 'ASC']]
        });

        res.status(200).json({ success: true, data: appointments });

    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * @desc    Update appointment status (Confirm, Complete)
 * @route   PUT /api/appointments/:id/status
 * @access  Private (Receptionist, Doctor)
 */
export const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, payment_status } = req.body;

        const appointment = await Appointment.findByPk(id);
        if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

        if (status) appointment.status = status;
        if (payment_status) appointment.payment_status = payment_status;

        await appointment.save();

        res.status(200).json({ success: true, message: 'Status updated', data: appointment });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
