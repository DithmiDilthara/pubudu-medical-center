import { Appointment, Patient, Doctor, User, Availability } from '../models/index.js';
import NotificationService from '../utils/NotificationService.js';
import { Op } from 'sequelize';

/**
 * @desc    Create a new appointment
 * @route   POST /api/appointments
 * @access  Private (Patient, Receptionist)
 */
export const createAppointment = async (req, res) => {
    try {
        const { doctor_id, appointment_date, time_slot, schedule_id, patient_id, notes, skipNotification } = req.body;
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

        // --- NEW SAFETY CHECK ---
        // 1. Fetch the selected session to ensure it exists and is ACTIVE
        const session = await Availability.findByPk(schedule_id);
        if (!session) {
            return res.status(404).json({ success: false, message: 'The selected clinical session no longer exists.' });
        }

        if (session.status !== 'ACTIVE') {
            return res.status(400).json({ success: false, message: 'This clinical session has been cancelled and is no longer accepting bookings.' });
        }

        // 2. Check for Specific Date Exclusions (Blackouts)
        // Even if the recurring session is active, a specific date might be blocked.
        const exclusion = await Availability.findOne({
            where: {
                doctor_id,
                schedule_date: appointment_date,
                status: 'CANCELLED',
                is_exclusion: true
            }
        });

        if (exclusion) {
            return res.status(400).json({ success: false, message: 'The doctor is unavailable on this specific date (Session Cancelled).' });
        }
        // -------------------------

        // In session-based booking, multiple people can book the same session block.
        // There is no longer a check for individual 30-minute slots.

        // Calculate next appointment number for this doctor and date
        const lastAppointment = await Appointment.findOne({
            where: {
                doctor_id,
                appointment_date,
                status: { [Op.ne]: 'CANCELLED' }
            },
            order: [['appointment_number', 'DESC']]
        });

        const nextNumber = lastAppointment ? (lastAppointment.appointment_number || 0) + 1 : 1;

        const appointment = await Appointment.create({
            patient_id: targetPatientId,
            doctor_id,
            appointment_date,
            schedule_id,
            time_slot, // Stores the full session range string
            status: 'PENDING',
            payment_status: 'UNPAID',
            appointment_number: nextNumber,
            notes: notes || ""
        });

        // Send confirmation notification (Async)
        if (!skipNotification) {
            try {
                const patient = await Patient.findByPk(targetPatientId, { include: [{ model: User, as: 'user' }] });
                const doctor = await Doctor.findByPk(doctor_id);
                if (patient && (patient.user?.email || patient.user?.contact_number)) {
                    NotificationService.sendAppointmentConfirmation(patient.user?.email, patient.user?.contact_number, {
                        patientName: patient.full_name,
                        doctorName: doctor.full_name,
                        date: appointment_date,
                        time: time_slot,
                        appointmentNumber: appointment.appointment_number,
                        paymentStatus: appointment.payment_status
                    });
                }
            } catch (notifyError) {
                console.error('Failed to trigger notification:', notifyError);
            }
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

        const { cancellation_reason, is_noshow } = req.body;
        appointment.status = 'CANCELLED';
        if (cancellation_reason) appointment.cancellation_reason = cancellation_reason;
        if (is_noshow !== undefined) appointment.is_noshow = is_noshow;
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

        // Auto-complete past appointments
        const todayStr = new Date().toISOString().split('T')[0];
        await Appointment.update(
            { status: 'COMPLETED' },
            {
                where: {
                    appointment_date: { [Op.lt]: todayStr },
                    status: { [Op.in]: ['PENDING', 'CONFIRMED'] }
                }
            }
        );

        let where = {};

        if (role_id === 4) { // Patient
            if (doctor_id) {
                // If a patient is asking for a doctor's appointments, only show essential info
                where = { doctor_id, status: { [Op.in]: ['PENDING', 'CONFIRMED'] } };
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

        // Add payment status filter if provided (Receptionist/Admin)
        if (req.query.payment_status && (role_id === 3 || role_id === 1)) {
            where.payment_status = req.query.payment_status;
        }

        const include = [
            { model: Doctor, as: 'doctor', attributes: ['full_name', 'specialization', 'doctor_fee', 'center_fee'] }
        ];

        // Only include patient info if it's NOT a patient looking at another doctor's slots
        if (role_id !== 4 || !doctor_id) {
            include.push({ 
                model: Patient, 
                as: 'patient', 
                attributes: ['patient_id', 'full_name', 'nic'],
                include: [{ model: User, as: 'user', attributes: ['contact_number', 'email'] }]
            });
        } else {
            // For patients looking at doctor's slots, don't return patient details for privacy
            include.push({ model: Patient, as: 'patient', attributes: ['patient_id'] }); // Or omit
        }

        const appointments = await Appointment.findAll({
            where,
            include,
            order: [['appointment_id', 'DESC']]
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

/**
 * @desc    Get next available queue number
 * @route   GET /api/appointments/next-number
 * @access  Private
 */
export const getNextNumber = async (req, res) => {
    try {
        const { doctor_id, date } = req.query;

        if (!doctor_id || !date) {
            return res.status(400).json({ success: false, message: 'Doctor ID and Date are required' });
        }

        const lastAppointment = await Appointment.findOne({
            where: {
                doctor_id,
                appointment_date: date,
                status: { [Op.ne]: 'CANCELLED' }
            },
            order: [['appointment_number', 'DESC']]
        });

        const nextNumber = lastAppointment ? (lastAppointment.appointment_number || 0) + 1 : 1;

        res.status(200).json({ success: true, nextNumber });
    } catch (error) {
        console.error('Get next number error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
/**
 * @desc    Cancel all appointments for a doctor on a specific date (Doctor Session Cancel)
 * @route   PUT /api/appointments/cancel-session
 * @access  Private (Receptionist, Admin)
 */
export const cancelDoctorSession = async (req, res) => {
    try {
        const { doctor_id, appointment_date, cancellation_reason } = req.body;

        if (!doctor_id || !appointment_date) {
            return res.status(400).json({ success: false, message: 'Doctor ID and Date are required' });
        }

        const [affectedCount] = await Appointment.update(
            { 
                status: 'CANCELLED',
                cancellation_reason: cancellation_reason || 'Doctor cancelled the session'
            },
            {
                where: {
                    doctor_id,
                    appointment_date,
                    status: { [Op.in]: ['PENDING', 'CONFIRMED'] }
                }
            }
        );

        res.status(200).json({ 
            success: true, 
            message: `Successfully cancelled ${affectedCount} appointments for the session`,
            data: { affectedCount }
        });
    } catch (error) {
        console.error('Cancel doctor session error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Reschedule an appointment
 * @route   PUT /api/appointments/:id/reschedule
 * @access  Private (Receptionist)
 */
export const rescheduleAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { appointment_date, time_slot, schedule_id } = req.body;

        if (!appointment_date || !time_slot) {
            return res.status(400).json({ success: false, message: 'Date and time slot are required' });
        }

        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // In session-based booking, multiple people can book the same time range.
        // We will no longer block rescheduling based on time_slot existence.

        // Handle appointment number if date changed
        if (appointment_date !== appointment.appointment_date) {
            const lastAppointment = await Appointment.findOne({
                where: {
                    doctor_id: appointment.doctor_id,
                    appointment_date,
                    status: { [Op.ne]: 'CANCELLED' }
                },
                order: [['appointment_number', 'DESC']]
            });
            appointment.appointment_number = lastAppointment ? (lastAppointment.appointment_number || 0) + 1 : 1;
        }

        appointment.appointment_date = appointment_date;
        appointment.time_slot = time_slot;
        if (schedule_id) appointment.schedule_id = schedule_id;
        appointment.status = 'CONFIRMED'; // Auto-confirm when rescheduled by staff
        await appointment.save();

        // Send reschedule notification (Async)
        try {
            const patient = await Patient.findByPk(appointment.patient_id, { include: [{ model: User, as: 'user' }] });
            const doctor = await Doctor.findByPk(appointment.doctor_id);
            if (patient && (patient.user?.email || patient.user?.contact_number)) {
                NotificationService.sendRescheduleNotice(patient.user?.email, patient.user?.contact_number, {
                    patientName: patient.full_name,
                    doctorName: doctor.full_name,
                    date: appointment_date,
                    time: time_slot,
                    appointmentNumber: appointment.appointment_number
                });
            }
        } catch (notifyError) {
            console.error('Failed to trigger reschedule notification:', notifyError);
        }

        res.status(200).json({ 
            success: true, 
            message: 'Appointment rescheduled successfully', 
            data: appointment 
        });

    } catch (error) {
        console.error('Reschedule appointment error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
