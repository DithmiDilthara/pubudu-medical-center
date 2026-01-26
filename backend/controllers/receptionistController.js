import { Op } from 'sequelize';
import { User, Patient } from '../models/index.js';

/**
 * @desc    Search for a patient by NIC, phone, or name
 * @route   GET /api/receptionist/search-patient
 * @access  Private (Receptionist)
 */
export const searchPatient = async (req, res) => {
    try {
        const { query, type } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        let patient = null;

        if (type === 'nic') {
            patient = await Patient.findOne({
                where: { nic: query },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['contact_number', 'email', 'username']
                }]
            });
        } else if (type === 'phone') {
            const user = await User.findOne({
                where: { contact_number: query },
                include: [{
                    model: Patient,
                    as: 'patient'
                }]
            });

            if (user && user.patient) {
                // Construct a similar structure to Patient.findOne return
                const patientData = user.patient.toJSON();
                patientData.user = {
                    contact_number: user.contact_number,
                    email: user.email,
                    username: user.username
                };
                patient = patientData;
            }
        } else if (type === 'name') {
            patient = await Patient.findOne({
                where: {
                    full_name: { [Op.like]: `%${query}%` }
                },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['contact_number', 'email', 'username']
                }]
            });
        } else {
            // Default search by NIC if type is not specified or invalid
            patient = await Patient.findOne({
                where: { nic: query },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['contact_number', 'email', 'username']
                }]
            });
        }

        if (patient) {
            return res.status(200).json({
                success: true,
                exists: true,
                data: patient
            });
        } else {
            return res.status(200).json({
                success: true,
                exists: false,
                message: 'Patient not found'
            });
        }

    } catch (error) {
        console.error('Search patient error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during patient search',
            error: error.message
        });
    }
};

/**
 * @desc    Register a new patient (by Receptionist)
 * @route   POST /api/receptionist/register-patient
 * @access  Private (Receptionist)
 */
export const registerPatient = async (req, res) => {
    try {
        const {
            username,
            password,
            email,
            contact_number,
            full_name,
            nic,
            gender,
            date_of_birth,
            address
        } = req.body;

        // Validation
        if (!username || !password || !full_name || !nic) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if username already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Check if NIC already exists
        const existingNIC = await Patient.findOne({ where: { nic } });
        if (existingNIC) {
            return res.status(400).json({
                success: false,
                message: 'NIC already registered'
            });
        }

        // Create user (password will be hashed by the model hook)
        const user = await User.create({
            username,
            password_hash: password,
            email,
            contact_number,
            role_id: 4 // Patient role
        });

        // Create patient record
        const patient = await Patient.create({
            user_id: user.user_id,
            full_name,
            nic,
            gender: gender.toUpperCase(),
            date_of_birth,
            address
        });

        res.status(201).json({
            success: true,
            message: 'Patient registered successfully',
            data: patient
        });

    } catch (error) {
        console.error('Patient registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during patient registration',
            error: error.message
        });
    }
};
