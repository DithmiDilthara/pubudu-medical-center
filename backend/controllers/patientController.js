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
        const { full_name, email, date_of_birth, gender, address, contact_number, nic } = req.body;

        // Validation - Full Name
        if (full_name) {
            if (full_name.trim().length < 3) {
                return res.status(400).json({ success: false, message: 'Full name must be at least 3 characters' });
            }
            if (!/^[a-zA-Z\s.]+$/.test(full_name)) {
                return res.status(400).json({ success: false, message: 'Full name can only contain letters, spaces and periods' });
            }
        }

        // Validation - Email (Locked in UI, but good to have)
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        // Validation - NIC
        if (nic) {
            const nicStr = nic.trim().toUpperCase();
            if (!/^[0-9]{9}[VX]$/.test(nicStr) && !/^[0-9]{12}$/.test(nicStr)) {
                return res.status(400).json({ success: false, message: 'Invalid NIC format' });
            }
        }

        // Validation - Phone Number
        if (contact_number) {
            const digits = contact_number.replace(/\D/g, "");
            const validPrefixes = ['070', '071', '072', '074', '075', '076', '077', '078'];
            const prefix = digits.substring(0, 3);
            
            if (digits.length !== 10) {
                return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
            }
            if (!digits.startsWith('07')) {
                return res.status(400).json({ success: false, message: 'Phone number must start with 07' });
            }
            if (!validPrefixes.includes(prefix)) {
                return res.status(400).json({ success: false, message: 'Invalid Sri Lankan mobile prefix' });
            }
        }

        // Validation - Date of Birth
        if (date_of_birth) {
            const dob = new Date(date_of_birth);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (dob > today) {
                return res.status(400).json({ success: false, message: 'Date of birth cannot be in the future' });
            }
        }

        // Validation - Address
        if (address && address.trim().length < 5) {
            return res.status(400).json({ success: false, message: 'Address must be at least 5 characters' });
        }

        if (gender && !['MALE', 'FEMALE', 'OTHER'].includes(gender)) {
            return res.status(400).json({ success: false, message: 'Invalid gender value' });
        }

        const user = await User.findByPk(userId, {
            include: [{ model: Patient, as: 'patient' }]
        });

        if (!user || !user.patient) {
            return res.status(404).json({ success: false, message: 'Patient profile not found' });
        }

        // Update User table fields
        if (email) user.email = email;
        if (contact_number) user.contact_number = contact_number;
        await user.save();

        // Update Patient table fields
        if (full_name) user.patient.full_name = full_name;
        if (date_of_birth) user.patient.date_of_birth = date_of_birth;
        if (gender) user.patient.gender = gender;
        if (address) user.patient.address = address;
        if (nic) user.patient.nic = nic; // NIC is usually locked in UI but editable in DB if needed
        await user.patient.save();

        res.status(200).json({
            success: true,
            message: 'Your details have been updated',
            data: {
                user_id: user.user_id,
                email: user.email,
                contact_number: user.contact_number,
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
