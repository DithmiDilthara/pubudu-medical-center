import { Availability, Doctor, User, Appointment, Patient, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * @desc    Set/Update doctor availability
 * @route   POST /api/availability
 * @access  Private (Doctor)
 */
export const setAvailability = async (req, res) => {
    try {
        const { availability, doctor_id } = req.body; // Array of {day_of_week, start_time, end_time}
        const currentUser = req.user;

        let doctor;
        if (currentUser.role_id === 1 || currentUser.role_id === 3) { // Admin or Receptionist
          if (!doctor_id) return res.status(400).json({ success: false, message: 'Doctor ID is required for staff' });
          doctor = await Doctor.findByPk(doctor_id);
        } else {
          doctor = await Doctor.findOne({ where: { user_id: currentUser.user_id } });
        }

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
            if (slot.schedule_date && slot.schedule_date < todayStr) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot set availability for past date: ${slot.schedule_date}`
                });
            }

            // --- CHANGE 2: OVERLAP CHECK ---
            const whereClause = {
                doctor_id: doctor.doctor_id,
                status: 'ACTIVE' // Only check overlap with ACTIVE sessions
            };

            if (slot.schedule_date) {
                whereClause.schedule_date = slot.schedule_date;
            } else if (slot.day_of_week) {
                whereClause.day_of_week = slot.day_of_week;
                whereClause.schedule_date = null;
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
                doctor_id: doctor.doctor_id
            };
            if (slot.day_of_week && !slot.schedule_date) {
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

export const deleteAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;

        let doctor;
        let slot;

        if (currentUser.role_id === 1 || currentUser.role_id === 3) { // Admin or Receptionist
          // Staff can find any slot
          slot = await Availability.findByPk(id);
          if (slot) {
            doctor = await Doctor.findByPk(slot.doctor_id);
          }
        } else {
          // Doctor can only find their own slot (Backwards compatibility safeguard)
          doctor = await Doctor.findOne({ where: { user_id: currentUser.user_id } });
          if (doctor) {
            slot = await Availability.findOne({
                where: {
                    schedule_id: id,
                    doctor_id: doctor.doctor_id
                }
            });
          }
        }

        if (!slot || !doctor) return res.status(404).json({ success: false, message: 'Availability slot or Doctor not found' });
        if (slot.status === 'CANCELLED') return res.status(400).json({ success: false, message: 'Slot is already cancelled' });

        // Handle cancellation cascade if it was a confirmed/pending slot on that day
        if (slot.schedule_date) {
            await cancelAffectedAppointments(doctor.doctor_id, { schedule_date: [slot.schedule_date] });
        } else if (slot.day_of_week) {
            await cancelAffectedAppointments(doctor.doctor_id, { day_of_week: [slot.day_of_week] });
        }

        await slot.update({ status: 'CANCELLED' });

        res.status(200).json({ success: true, message: 'Availability slot cancelled safely' });
    } catch (error) {
        console.error('Delete availability error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Cancel a single day of a recurring session (Exclusion)
 * @route   POST /api/availability/cancel-instance
 * @access  Private (Receptionist, Admin)
 */
export const cancelSingleInstance = async (req, res) => {
    try {
        const { doctor_id, schedule_date, start_time, end_time } = req.body;

        if (!doctor_id || !schedule_date || !start_time || !end_time) {
            return res.status(400).json({ success: false, message: 'Doctor, Date, and Time range are required' });
        }

        // 1. Create the exclusion record
        const exclusion = await Availability.create({
            doctor_id,
            schedule_date,
            start_time,
            end_time,
            is_exclusion: true,
            status: 'CANCELLED'
        });

        // 2. Move affected appointments to RESCHEDULE_REQUIRED
        await cancelAffectedAppointments(doctor_id, { schedule_date: [schedule_date] });

        res.status(201).json({
            success: true,
            message: 'Single session instance cancelled successfully.',
            data: exclusion
        });
    } catch (error) {
        console.error('Cancel single instance error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Update an existing availability session
 * @route   PUT /api/clinical/availability/:id
 * @access  Private (Receptionist, Admin)
 */
export const updateAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { start_time, end_time, schedule_date, max_patients, status } = req.body;

        const session = await Availability.findByPk(id);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        // Check if patients are already booked for this session
        const bookingCount = await Appointment.count({
            where: {
                schedule_id: id,
                status: { [Op.ne]: 'CANCELLED' }
            }
        });

        const hasBookings = bookingCount > 0;

        // Validation Rules
        if (max_patients !== undefined) {
            if (max_patients < 20) {
                return res.status(400).json({ success: false, message: 'Minimum patient capacity must be at least 20.' });
            }
            if (hasBookings && max_patients < bookingCount) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Cannot reduce capacity below the current ${bookingCount} booked patients.` 
                });
            }
            session.max_patients = max_patients;
        }

        if (hasBookings) {
            // Restricted Edit Mode
            if (start_time && start_time !== session.start_time) {
                return res.status(400).json({ success: false, message: 'Cannot change start time of an active session with patients. Please reschedule patients instead.' });
            }
            if (end_time && end_time !== session.end_time) {
                // We might allow increasing end time, but reducing it is risky if it cuts off patient slots
                if (end_time < session.end_time) {
                    return res.status(400).json({ success: false, message: 'Cannot reduce end time of an active session with patients.' });
                }
                session.end_time = end_time;
            }
            if (schedule_date && schedule_date !== session.schedule_date) {
                return res.status(400).json({ success: false, message: 'Cannot change date of an active session with patients. Please cancel this session and create a new one.' });
            }
        } else {
            // Full Edit Mode (No bookings yet)
            if (start_time) session.start_time = start_time;
            if (end_time) session.end_time = end_time;
            if (schedule_date) session.schedule_date = schedule_date;
        }

        if (status) session.status = status;

        await session.save();

        res.status(200).json({
            success: true,
            message: 'Session updated successfully',
            data: session
        });

    } catch (error) {
        console.error('Update availability error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
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

        await Availability.update(
            { status: 'CANCELLED' },
            {
                where: {
                    doctor_id,
                    schedule_date: { [Op.lt]: todayStr },
                    status: 'ACTIVE'
                }
            }
        );

        // Filter: Staff see all, Patients/Public only see ACTIVE
        const where = { doctor_id };
        // Filter: Staff see all, Patients/Public only see ACTIVE
        // REMOVED: where.status = 'ACTIVE' for public/patient.
        // We MUST return CANCELLED/exclusions to the frontend so calendars can properly black them out.
        const currentUser = req.user;

        const availability = await Availability.findAll({
            where,
            order: [
                ['schedule_date', 'DESC'], // Specific dates first for override priority
                ['day_of_week', 'ASC'], 
                ['start_time', 'ASC']
            ]
        });

        // MASKING LOGIC (Handled in the resolution engine)
        // If a patient is viewing, we don't return both the recurring slot AND the exclusion for the same date.
        // The frontend mapping will treat is_exclusion: true + status: CANCELLED as a blackout.

        // AGGREGATED BOOKING COUNTS FOR PROACTIVE CALENDAR
        // We need to know how many people are booked for each schedule_id on each specific date
        const bookingCounts = await Appointment.findAll({
            attributes: [
                'schedule_id',
                'appointment_date',
                [sequelize.fn('COUNT', sequelize.col('appointment_id')), 'count']
            ],
            where: {
                doctor_id,
                appointment_date: { [Op.gte]: todayStr },
                status: { [Op.ne]: 'CANCELLED' }
            },
            group: ['schedule_id', 'appointment_date'],
            raw: true
        });

        res.status(200).json({ 
            success: true, 
            data: availability,
            bookingCounts: bookingCounts.map(c => ({
                schedule_id: c.schedule_id,
                date: c.appointment_date,
                count: parseInt(c.count)
            }))
        });
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
        if (filter.schedule_date) {
            return filter.schedule_date.includes(appt.appointment_date);
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
            appt.status = 'RESCHEDULE_REQUIRED';
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
