import { Op } from 'sequelize';
import { User, Patient, Appointment, Doctor } from '../models/index.js';

/**
 * @desc    Get dashboard statistics for receptionist
 * @route   GET /api/receptionist/stats
 * @access  Private (Receptionist)
 */
export const getDashboardStats = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const [
            todayAppointments,
            totalPatients,
            unpaidAppointments,
            todayPaidAppointments
        ] = await Promise.all([
            Appointment.count({ where: { appointment_date: today, status: { [Op.ne]: 'CANCELLED' } } }),
            Patient.count(),
            Appointment.count({ where: { payment_status: 'UNPAID', status: { [Op.ne]: 'CANCELLED' } } }),
            Appointment.findAll({
                where: {
                    appointment_date: today,
                    payment_status: 'PAID'
                },
                include: [{
                    model: Doctor,
                    as: 'doctor',
                    attributes: ['center_fee']
                }]
            })
        ]);

        const todayRevenue = todayPaidAppointments.reduce((sum, appt) => sum + parseFloat(appt.doctor?.center_fee || 0), 0);

        res.status(200).json({
            success: true,
            data: {
                todayAppointments,
                totalPatients,
                unpaidAppointments,
                todayRevenue
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

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
            full_name,
            nic,
            date_of_birth,
            address,
            blood_group,
            allergies
        } = req.body;
        
        // Map phone from frontend to contact_number used in controller logic
        const contact_number = req.body.phone || req.body.contact_number;

        // Validation
        if (!username || !password || !full_name || !nic) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

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
            address,
            blood_group,
            allergies,
            registration_source: 'RECEPTIONIST'
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
