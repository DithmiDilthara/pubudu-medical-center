import { Appointment, Patient, Doctor, Payment, User } from '../models/index.js';
import { generateHash, verifyNotifyHash } from '../utils/payhere.js';
import NotificationService from '../utils/NotificationService.js';

/**
 * @desc    Initiate a payment for an appointment
 * @route   POST /api/payments/initiate
 * @access  Private (Patient)
 */
export const initiatePayment = async (req, res) => {
    try {
        const { appointment_id } = req.body;
        const currentUser = req.user;

        const appointment = await Appointment.findByPk(appointment_id, {
            include: [
                { model: Doctor, as: 'doctor' },
                { model: Patient, as: 'patient', include: [{ model: User, as: 'user' }] }
            ]
        });

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Authorization check
        if (currentUser.role_id === 4) { // Patient
            const patient = await Patient.findOne({ where: { user_id: currentUser.user_id } });
            if (appointment.patient_id !== patient.patient_id) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }
        }

        if (appointment.payment_status === 'PAID') {
            return res.status(400).json({ success: false, message: 'Appointment already paid' });
        }

        const amount = appointment.doctor.session_fee || 3000.00;
        const merchantId = process.env.PAYHERE_MERCHANT_ID;
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
        const currency = 'LKR';
        const orderId = `APT_${appointment.appointment_id}_${Date.now()}`;

        const hash = generateHash(merchantId, orderId, amount, currency, merchantSecret);

        const paymentData = {
            sandbox: process.env.PAYHERE_MODE === 'sandbox',
            merchant_id: merchantId,
            return_url: `${process.env.FRONTEND_URL}/patient/appointments?payment=success`,
            cancel_url: `${process.env.FRONTEND_URL}/patient/appointments?payment=cancel`,
            notify_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payments/notify`,
            order_id: orderId,
            items: `Consultation with Dr. ${appointment.doctor.full_name}`,
            amount: amount,
            currency: currency,
            hash: hash,
            first_name: appointment.patient.full_name.split(' ')[0],
            last_name: appointment.patient.full_name.split(' ').slice(1).join(' ') || 'Patient',
            email: appointment.patient.user.email,
            phone: appointment.patient.phone || '0771234567',
            address: appointment.patient.address || 'Colombo, Sri Lanka',
            city: 'Colombo',
            country: 'Sri Lanka',
            custom_1: appointment.appointment_id.toString(),
            custom_2: appointment.patient_id.toString()
        };

        res.status(200).json({
            success: true,
            data: paymentData
        });

    } catch (error) {
        console.error('Initiate payment error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Handle PayHere notification (Webhook)
 * @route   POST /api/payments/notify
 * @access  Public
 */
export const handleNotify = async (req, res) => {
    try {
        const payload = req.body;
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

        // 1. Verify Hash
        if (!verifyNotifyHash(payload, merchantSecret)) {
            console.error('Invalid PayHere Notify Hash');
            return res.status(400).send('Invalid Hash');
        }

        const {
            order_id,
            payhere_amount,
            payhere_currency,
            status_code, // 2 = Success
            md5sig,
            custom_1: appointment_id,
            custom_2: patient_id,
            method,
            payment_id: payhere_payment_id
        } = payload;

        if (status_code === '2') {
            const appointment = await Appointment.findByPk(appointment_id, {
                include: [{ model: Doctor, as: 'doctor' }, { model: Patient, as: 'patient', include: [{ model: User, as: 'user' }] }]
            });

            if (appointment && appointment.payment_status !== 'PAID') {
                // Update Appointment
                appointment.payment_status = 'PAID';
                appointment.status = 'CONFIRMED';
                await appointment.save();

                // Create Payment Record
                await Payment.create({
                    patient_id: patient_id,
                    appointment_id: appointment_id,
                    amount: payhere_amount,
                    payment_method: method || 'PayHere',
                    transaction_id: payhere_payment_id,
                    status: 'SUCCESS',
                    description: `Payment for appointment ${appointment_id} via PayHere`
                });

                // Send Confirmation Email
                try {
                    if (appointment.patient.user.email) {
                        NotificationService.sendAppointmentConfirmation(appointment.patient.user.email, {
                            patientName: appointment.patient.full_name,
                            doctorName: appointment.doctor.full_name,
                            date: appointment.appointment_date,
                            time: appointment.time_slot,
                            paymentStatus: 'PAID'
                        });
                    }
                } catch (emailError) {
                    console.error('Notify webhook email error:', emailError);
                }
            }
        }

        res.status(200).send('OK');

    } catch (error) {
        console.error('PayHere Notify Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

/**
 * @desc    Verify payment after frontend completes (since local webhooks fail)
 * @route   POST /api/payments/verify
 * @access  Private
 */
export const verifyPayment = async (req, res) => {
    try {
        const { appointment_id, status } = req.body;
        const currentUser = req.user;

        // Find the appointment
        const appointment = await Appointment.findByPk(appointment_id, {
            include: [{ model: Doctor, as: 'doctor' }, { model: Patient, as: 'patient', include: [{ model: User, as: 'user' }] }]
        });

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Must be the owner or an admin/receptionist
        if (currentUser.role_id === 4) {
            const patient = await Patient.findOne({ where: { user_id: currentUser.user_id } });
            if (appointment.patient_id !== patient.patient_id) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }
        }

        if (appointment.payment_status !== 'PAID' && status === 'SUCCESS') {
            // Update Appointment
            appointment.payment_status = 'PAID';
            appointment.status = 'CONFIRMED';
            await appointment.save();

            // Check if record exists
            const existingPayment = await Payment.findOne({ where: { appointment_id: appointment_id } });
            if (!existingPayment) {
                // Create Payment Record
                await Payment.create({
                    patient_id: appointment.patient_id,
                    appointment_id: appointment_id,
                    amount: appointment.doctor.session_fee || 3000.00,
                    payment_method: 'PayHere',
                    transaction_id: `PH_${Date.now()}`,
                    status: 'SUCCESS',
                    description: `Payment for appointment ${appointment_id} via PayHere Verification`
                });
            }

            // Send Confirmation Email safely
            try {
                if (appointment.patient && appointment.patient.user && appointment.patient.user.email) {
                    NotificationService.sendAppointmentConfirmation(appointment.patient.user.email, {
                        patientName: appointment.patient.full_name,
                        doctorName: appointment.doctor.full_name,
                        date: appointment.appointment_date,
                        time: appointment.time_slot,
                        paymentStatus: 'PAID'
                    });
                }
            } catch (emailError) {
                console.error('Verify payment email error:', emailError);
            }
        }

        res.status(200).json({ success: true, message: 'Payment verified and updated' });

    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
