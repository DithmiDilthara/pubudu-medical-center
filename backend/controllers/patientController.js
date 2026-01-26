import { Payment, Patient } from '../models/index.js';

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
