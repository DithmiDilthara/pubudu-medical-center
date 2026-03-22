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

            // Check specific date logic
            if (slot.specific_date && slot.specific_date < todayStr) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot set availability for past date: ${slot.specific_date}`
                });
            }
        }

        // Separate recurring and specific date availability
        const recurring = availability.filter(slot => slot.day_of_week && !slot.specific_date);
        const specific = availability.filter(slot => slot.specific_date);
        const { clear_all_recurring } = req.body;

        // For recurring: Clear all existing recurring and replace (if provided or explicitly requested)
        if (recurring.length > 0 || clear_all_recurring) {
            await Availability.destroy({
                where: {
                    doctor_id: doctor.doctor_id,
                    specific_date: null
                }
            });
        }

        // Handle specific availability records
        if (specific.length > 0) {
            // Separate actual updates from deletions
            const toDelete = specific.filter(slot => slot.session_name === 'DELETED');
            const toUpsert = specific.filter(slot => slot.session_name !== 'DELETED');

            // Process deletions
            if (toDelete.length > 0) {
                await Availability.destroy({
                    where: {
                        doctor_id: doctor.doctor_id,
                        specific_date: { [Op.in]: toDelete.map(s => s.specific_date) }
                    }
                });
            }

            // Process upserts (delete then create to ensure clean slate for those dates)
            if (toUpsert.length > 0) {
                await Availability.destroy({
                    where: {
                        doctor_id: doctor.doctor_id,
                        specific_date: { [Op.in]: toUpsert.map(s => s.specific_date) }
                    }
                });

                await Availability.bulkCreate(
                    toUpsert.map(slot => ({
                        ...slot,
                        doctor_id: doctor.doctor_id
                    }))
                );

                // Handle cancellations for specific 'Unavailable' dates
                const unavailableDates = toUpsert.filter(s => s.session_name === 'Unavailable').map(s => s.specific_date);
                if (unavailableDates.length > 0) {
                    await cancelAffectedAppointments(doctor.doctor_id, { specific_date: unavailableDates });
                }
            }
        }

        // Handle recurring availability and its cancellation cascade
        if (recurring.length > 0 || clear_all_recurring) {
            // Get existing recurring days before they are wiped
            const oldRecurringAvails = await Availability.findAll({
                where: { doctor_id: doctor.doctor_id, specific_date: null }
            });
            const oldDays = oldRecurringAvails.map(a => a.day_of_week);

            // Wipe existing recurring
            await Availability.destroy({
                where: { doctor_id: doctor.doctor_id, specific_date: null }
            });

            if (recurring.length > 0) {
                const threeMonthsOut = new Date();
                threeMonthsOut.setMonth(threeMonthsOut.getMonth() + 3);

                await Availability.bulkCreate(
                    recurring.map(slot => ({
                        ...slot,
                        doctor_id: doctor.doctor_id,
                        end_date: threeMonthsOut
                    }))
                );

                // IDENTIFY REMOVED DAYS for the cascade
                const newDays = recurring.map(s => s.day_of_week);
                const removedDays = oldDays.filter(d => !newDays.includes(d));

                if (removedDays.length > 0) {
                    await cancelAffectedAppointments(doctor.doctor_id, { day_of_week: removedDays });
                }
            } else if (clear_all_recurring && oldDays.length > 0) {
                // If everything cleared, cancel all appointments on those days
                await cancelAffectedAppointments(doctor.doctor_id, { day_of_week: oldDays });
            }
        }

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
