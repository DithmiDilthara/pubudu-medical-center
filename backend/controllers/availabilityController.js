import { Availability, Doctor, User } from '../models/index.js';

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

        // For specific: Create or Update (Destroying specific dates in the payload first)
        const specificDates = [...new Set(specific.map(s => s.specific_date))];
        if (specificDates.length > 0) {
            await Availability.destroy({
                where: {
                    doctor_id: doctor.doctor_id,
                    specific_date: specificDates
                }
            });
        }

        const threeMonthsOut = new Date();
        threeMonthsOut.setMonth(threeMonthsOut.getMonth() + 3);

        const newAvailability = await Availability.bulkCreate(
            availability
                .filter(slot => slot.session_name !== 'DELETED') // Don't recreate deleted ones
                .map(slot => ({
                    ...slot,
                    doctor_id: doctor.doctor_id,
                    // If it's recurring (day_of_week set and no specific_date), set end_date
                    end_date: (slot.day_of_week && !slot.specific_date) ? threeMonthsOut : null
                }))
        );

        res.status(201).json({
            success: true,
            message: 'Availability updated successfully',
            data: newAvailability
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
