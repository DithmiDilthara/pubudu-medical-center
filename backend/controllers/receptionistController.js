import { Op } from 'sequelize';
import { User, Patient, Adult, Child, Appointment, Doctor } from '../models/index.js';
import sequelize from '../config/database.js';

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
            // NIC is now in the Adult table — use a joined query
            const adultRecord = await Adult.findOne({
                where: { nic: query.trim().toUpperCase() },
                include: [{
                    model: Patient,
                    as: 'patient',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['contact_number', 'email', 'username']
                    }]
                }]
            });
            if (adultRecord && adultRecord.patient) {
                const patientData = adultRecord.patient.toJSON();
                patientData.nic = adultRecord.nic; // Flatten NIC for backward compatibility
                patient = patientData;
            }
        } else if (type === 'phone') {
            const user = await User.findOne({
                where: { contact_number: query },
                include: [{
                    model: Patient,
                    as: 'patient',
                    include: [
                        { model: Adult, as: 'adult' },
                        { model: Child, as: 'child' }
                    ]
                }]
            });

            if (user && user.patient) {
                const patientData = user.patient.toJSON();
                patientData.user = {
                    contact_number: user.contact_number,
                    email: user.email,
                    username: user.username
                };
                // Flatten NIC
                if (patientData.patient_type === 'ADULT' && patientData.adult) {
                    patientData.nic = patientData.adult.nic;
                } else {
                    patientData.nic = null;
                }
                patient = patientData;
            }
        } else if (type === 'name') {
            patient = await Patient.findOne({
                where: {
                    full_name: { [Op.like]: `%${query}%` }
                },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['contact_number', 'email', 'username']
                    },
                    { model: Adult, as: 'adult' },
                    { model: Child, as: 'child' }
                ]
            });
            if (patient) {
                const patientData = patient.toJSON();
                if (patientData.patient_type === 'ADULT' && patientData.adult) {
                    patientData.nic = patientData.adult.nic;
                } else {
                    patientData.nic = null;
                }
                patient = patientData;
            }
        } else {
            // Default search by NIC
            const adultRecord = await Adult.findOne({
                where: { nic: query.trim().toUpperCase() },
                include: [{
                    model: Patient,
                    as: 'patient',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['contact_number', 'email', 'username']
                    }]
                }]
            });
            if (adultRecord && adultRecord.patient) {
                const patientData = adultRecord.patient.toJSON();
                patientData.nic = adultRecord.nic;
                patient = patientData;
            }
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
    const transaction = await sequelize.transaction();
    try {
        const {
            username,
            password,
            email,
            full_name,
            patient_type,
            nic,
            guardian_name,
            guardian_contact,
            guardian_relationship,
            date_of_birth,
            address,
            blood_group,
            allergies
        } = req.body;
        
        const contact_number = req.body.phone || req.body.contact_number;
        const gender = req.body.gender;
        const type = (patient_type || 'ADULT').toUpperCase();

        // --- Basic Validation ---
        if (!username || !password || !full_name) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (!['ADULT', 'CHILD'].includes(type)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Patient type must be ADULT or CHILD.'
            });
        }

        // --- Conditional Validation ---
        if (type === 'ADULT') {
            if (!nic || !nic.trim()) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'NIC is required for adult patients.' });
            }
            const nicStr = nic.trim().toUpperCase();
            if (!/^[0-9]{9}[VX]$/.test(nicStr) && !/^[0-9]{12}$/.test(nicStr)) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Invalid NIC format.' });
            }
            const existingNIC = await Adult.findOne({ where: { nic: nicStr }, transaction });
            if (existingNIC) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'This NIC is already registered.' });
            }
        }

        if (type === 'CHILD') {
            if (!guardian_name || !guardian_contact || !guardian_relationship) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Guardian name, contact, and relationship are required for child patients.' });
            }
        }

        if (date_of_birth) {
            const dob = new Date(date_of_birth);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dob > today) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Date of birth cannot be in the future' });
            }

            // Calculate age
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }

            // Validate age against patient type
            if (type === 'ADULT' && age < 18) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Adult patients must be 18 years or older.' });
            }
            if (type === 'CHILD' && age >= 18) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Child patients must be under 18 years old.' });
            }
        } else {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Date of birth is required.' });
        }

        // Check if username already exists
        const existingUser = await User.findOne({ where: { username }, transaction });
        if (existingUser) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        // --- STEP 1: Create User ---
        const user = await User.create({
            username,
            password_hash: password,
            email,
            contact_number,
            role_id: 4
        }, { transaction });

        // --- STEP 2: Create Patient ---
        const patient = await Patient.create({
            user_id: user.user_id,
            full_name,
            patient_type: type,
            gender: gender ? gender.toUpperCase() : null,
            date_of_birth,
            address,
            blood_group,
            allergies,
            registration_source: 'RECEPTIONIST',
            is_verified: true
        }, { transaction });

        // --- STEP 3: Create Adult or Child detail ---
        if (type === 'ADULT') {
            await Adult.create({
                patient_id: patient.patient_id,
                nic: nic.trim().toUpperCase()
            }, { transaction });
        } else {
            await Child.create({
                patient_id: patient.patient_id,
                guardian_name,
                guardian_contact,
                guardian_relationship
            }, { transaction });
        }

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Patient registered successfully',
            data: patient
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Patient registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during patient registration',
            error: error.message
        });
    }
};
