import { Availability, Doctor, User, Appointment, Patient } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * @desc    Set/Update doctor availability
 * @route   POST /api/availability
 * @access  Private (Doctor)
 */
export const setAvailability = async (req, res) => {
    try {
        const { availability } = req.body; // Array of {day_of_week, start_time, end_time, session_name}
        const userId = req.user.user_id;

        const doctor = await Doctor.findOne({ where: { user_id: userId } });
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

        // Validate all slots
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];

        for (const slot of availability) {
            // Check time logic
            if (slot.start_time >= slot.end_time) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid time range: ${slot.start_time} - ${slot.end_time}. End time must be after start time.`
                });
            }

            // ENFORCE OPERATING HOURS: 07:00 - 21:00
            if (slot.start_time < '07:00' || slot.end_time > '21:00') {
              return res.status(400).json({
                  success: false,
                  message: "Session times must be within operating hours (07:00–21:00)"
              });
            }

            // ENFORCE MINIMUM DURATION: 1 HOUR (60 MINUTES)
            const start = new Date(`1970-01-01T${slot.start_time}`);
            const end = new Date(`1970-01-01T${slot.end_time}`);
            const durationMinutes = (end - start) / (1000 * 60);
            
            if (durationMinutes < 60) {
              return res.status(400).json({
                  success: false,
                  message: "Session must be at least 1 hour long"
              });
            }

            // Check specific date logic
            if (slot.specific_date && slot.specific_date < todayStr) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot set availability for past date: ${slot.specific_date}`
                });
            }

            // --- CHANGE 2: OVERLAP CHECK ---
            const whereClause = {
                doctor_id: doctor.doctor_id,
            };

            if (slot.specific_date) {
                whereClause.specific_date = slot.specific_date;
            } else if (slot.day_of_week) {
                whereClause.day_of_week = slot.day_of_week;
                whereClause.specific_date = null;
            }

            const existingSessions = await Availability.findAll({ where: whereClause });

            for (const existing of existingSessions) {
                // newStart < existingEnd AND newEnd > existingStart
                if (slot.start_time < existing.end_time && slot.end_time > existing.start_time) {
                    return res.status(400).json({
                        success: false,
                        message: `This time slot overlaps with an existing session (${existing.start_time}-${existing.end_time}). Please choose a different time.`
                    });
                }
            }
        }

        // Add the sessions (Additive approach)
        const sessionsToCreate = availability.map(slot => {
            const data = {
                ...slot,
                doctor_id: doctor.doctor_id,
                session_name: slot.session_name || 'Available'
            };
            if (slot.day_of_week && !slot.specific_date) {
                const threeMonthsOut = new Date();
                threeMonthsOut.setMonth(threeMonthsOut.getMonth() + 3);
                data.end_date = threeMonthsOut;
            }
            return data;
        });

        await Availability.bulkCreate(sessionsToCreate);

        res.status(201).json({
            success: true,
            message: 'Availability updated successfully'
        });

    } catch (error) {
        console.error('Set availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * @desc    Delete a specific availability slot
 * @route   DELETE /api/availability/:id
 * @access  Private (Doctor)
 */
export const deleteAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user_id;

        const doctor = await Doctor.findOne({ where: { user_id: userId } });
        if (!doctor) return res.status(404).json({ success: false, message: 'Doctor profile not found' });

        const slot = await Availability.findOne({
            where: {
                availability_id: id,
                doctor_id: doctor.doctor_id
            }
        });

        if (!slot) return res.status(404).json({ success: false, message: 'Availability slot not found' });

        // Handle cancellation cascade if it was a confirmed/pending slot on that day
        if (slot.specific_date) {
            await cancelAffectedAppointments(doctor.doctor_id, { specific_date: [slot.specific_date] });
        } else if (slot.day_of_week) {
            await cancelAffectedAppointments(doctor.doctor_id, { day_of_week: [slot.day_of_week] });
        }

        await slot.destroy();

        res.status(200).json({ success: true, message: 'Availability slot removed' });
    } catch (error) {
        console.error('Delete availability error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Get availability for a specific doctor
 * @route   GET /api/availability/:doctor_id
 * @access  Public/Private
 */
export const getDoctorAvailability = async (req, res) => {
    try {
        const { doctor_id } = req.params;

        // Auto-cleanup past specific dates
        const today = new Date();
        const todayStr =
            today.getFullYear() +
            '-' +
            String(today.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(today.getDate()).padStart(2, '0');

        await Availability.destroy({
            where: {
                doctor_id,
                specific_date: { [Op.lt]: todayStr }
            }
        });

        const availability = await Availability.findAll({
            where: { doctor_id },
            order: [['day_of_week', 'ASC'], ['start_time', 'ASC']]
        });

        res.status(200).json({ success: true, data: availability });
    } catch (error) {
        console.error('Get availability error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Helper function to cancel appointments and notify patients
async function cancelAffectedAppointments(doctorId, filter) {
    const today = new Date().toISOString().split('T')[0];

    const affected = await Appointment.findAll({
        where: {
            doctor_id: doctorId,
            appointment_date: { [Op.gte]: today },
            status: ['PENDING', 'CONFIRMED']
        },
        include: [
            { model: Patient, as: 'patient', include: [{ model: User, as: 'user' }] },
            { model: Doctor, as: 'doctor' }
        ]
    });

    const toCancel = affected.filter(appt => {
        if (filter.specific_date) {
            return filter.specific_date.includes(appt.appointment_date);
        }
        if (filter.day_of_week) {
            const dateObj = new Date(appt.appointment_date);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
            return filter.day_of_week.includes(dayName);
        }
        return false;
    });

    if (toCancel.length > 0) {
        const { default: NotificationService } = await import('../utils/NotificationService.js');
        for (const appt of toCancel) {
            appt.status = 'CANCELLED';
            await appt.save();

            if (appt.patient?.user?.email || appt.patient?.user?.contact_number) {
                NotificationService.sendCancellationNotice(appt.patient.user?.email, appt.patient.user?.contact_number, {
                    doctorName: appt.doctor.full_name,
                    patientName: appt.patient.full_name,
                    date: appt.appointment_date,
                    time: appt.time_slot,
                    reason: 'Doctor schedule changed'
                });
            }
        }
    }
}
