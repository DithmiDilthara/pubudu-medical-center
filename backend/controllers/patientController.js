import { Payment, Patient, User } from '../models/index.js';
import bcrypt from 'bcryptjs';

/**
 * @desc    Create a new payment record
 * @route   POST /api/patient/payment
 * @access  Private (Patient)
 */
export const createPayment = async (req, res) => {
    try {
        const { amount, paymentMethod, transactionId, description } = req.body;
        const userId = req.user.user_id;

        // Find the patient record for this user
        const patient = await Patient.findOne({ where: { user_id: userId } });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient record not found'
            });
        }

        const payment = await Payment.create({
            patient_id: patient.patient_id,
            amount,
            payment_method: paymentMethod,
            transaction_id: transactionId,
            description,
            status: 'SUCCESS'
        });

        res.status(201).json({
            success: true,
            data: payment
        });
    } catch (error) {
        console.error('Payment creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during payment creation',
            error: error.message
        });
    }
};

/**
 * @desc    Get patient transaction history
 * @route   GET /api/patient/transactions
 * @access  Private (Patient)
 */
export const getTransactionHistory = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const patient = await Patient.findOne({ where: { user_id: userId } });
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient record not found'
            });
        }

        const transactions = await Payment.findAll({
            where: { patient_id: patient.patient_id },
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        console.error('Fetch transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during transaction fetch',
            error: error.message
        });
    }
};
/**
 * @desc    Update patient personal details
 * @route   PATCH /api/patient/update-details
 * @access  Private (Patient)
 */
export const updatePatientDetails = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { full_name, email, date_of_birth, gender, address } = req.body;

        // Validation
        if (date_of_birth) {
            const dob = new Date(date_of_birth);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (dob > today) {
                return res.status(400).json({
                    success: false,
                    message: 'Date of birth cannot be in the future'
                });
            }
        }

        if (email && !/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        if (gender && !['MALE', 'FEMALE', 'OTHER'].includes(gender)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid gender value'
            });
        }

        const user = await User.findByPk(userId, {
            include: [{ model: Patient, as: 'patient' }]
        });

        if (!user || !user.patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient profile not found'
            });
        }

        // Update User fields
        if (email) user.email = email;
        await user.save();

        // Update Patient fields
        if (full_name) user.patient.full_name = full_name;
        if (date_of_birth) user.patient.date_of_birth = date_of_birth;
        if (gender) user.patient.gender = gender;
        if (address) user.patient.address = address;
        await user.patient.save();

        res.status(200).json({
            success: true,
            message: 'Your details have been updated',
            data: {
                user_id: user.user_id,
                email: user.email,
                profile: user.patient
            }
        });
    } catch (error) {
        console.error('Update details error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during profile update',
            error: error.message
        });
    }
};
