import { Appointment, Doctor, Payment } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * @desc    Get detailed revenue report for the logged-in doctor
 * @route   GET /api/doctors/me/revenue
 * @access  Private (Doctor)
 */
export const getMyRevenue = async (req, res) => {
    try {
        const userId = req.user.user_id;

        // Ensure current user is a doctor and get their doctor_id
        const doctor = await Doctor.findOne({ where: { user_id: userId } });
        if (!doctor) {
            return res.status(403).json({ success: false, message: 'Access denied. Doctor profile not found.' });
        }

        const doctorId = doctor.doctor_id;

        const { startDate, endDate } = req.query;
        let dateWhere = { doctor_id: doctorId };

        if (startDate && endDate) {
            dateWhere.appointment_date = {
                [Op.between]: [startDate, endDate]
            };
        }

        // Fetch all appointments for the doctor
        const appointments = await Appointment.findAll({
            where: dateWhere,
            include: [{ model: Payment, as: 'payments' }],
            order: [['appointment_date', 'DESC'], ['time_slot', 'ASC']]
        });

        const sessionMap = new Map();
        let totalGross = 0;
        let totalRefunds = 0;

        appointments.forEach(appt => {
            // Unique key for session
            const sessionKey = `${appt.appointment_date}_${appt.time_slot}`;

            if (!sessionMap.has(sessionKey)) {
                sessionMap.set(sessionKey, {
                    date: appt.appointment_date,
                    time_slot: appt.time_slot,
                    completed_patients: 0,
                    gross_fee: 0,
                    refunded_patients: 0,
                    refund_amount: 0,
                    net_payout: 0
                });
            }

            const sessionStats = sessionMap.get(sessionKey);
            
            const docFee = Number(doctor.doctor_fee) || 0;

            // Gross fee calculations: Add COMPLETED appointments as Gross
            if (appt.status === 'COMPLETED' && appt.payment_status === 'PAID') {
                sessionStats.completed_patients += 1;
                sessionStats.gross_fee += docFee;
                totalGross += docFee;
            } 
            // Refund deductions: Treat anything marked REFUNDED as a deduction
            else if (appt.payment_status === 'REFUNDED') {
                sessionStats.refunded_patients += 1;
                sessionStats.refund_amount += docFee;
                totalRefunds += docFee;
            }
            
            // Re-calculate Session Net
            sessionStats.net_payout = sessionStats.gross_fee - sessionStats.refund_amount;
            sessionMap.set(sessionKey, sessionStats);
        });

        // Convert map to array and compute totals
        // Filter out sessions that had 0 activity
        const breakdown = Array.from(sessionMap.values()).filter(session => session.completed_patients > 0 || session.refunded_patients > 0);
        const totalNet = totalGross - totalRefunds;

        res.status(200).json({
            success: true,
            data: {
                totalGross,
                totalRefunds,
                totalNet,
                breakdown
            }
        });

    } catch (error) {
        console.error('Get doctor revenue error:', error);
        res.status(500).json({ success: false, message: 'Server error generating revenue report' });
    }
};
