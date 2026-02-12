import { Doctor, User, Availability } from '../models/index.js';

/**
 * @desc    Get all doctors with their specializations
 * @route   GET /api/doctors
 * @access  Public
 */
export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.findAll({
            attributes: ['doctor_id', 'full_name', 'specialization', 'license_no'],
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
