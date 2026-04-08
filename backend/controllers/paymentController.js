import { Appointment, Patient, Doctor, Payment, User } from '../models/index.js';
import { generateHash, verifyNotifyHash } from '../utils/payhere.js';
import NotificationService from '../utils/NotificationService.js';
import ReceiptGenerator from '../utils/ReceiptGenerator.js';

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

        const doctorFee = parseFloat(appointment.doctor.doctor_fee) || 0;
        const centerFee = parseFloat(appointment.doctor.center_fee) || 600;
        const amount = doctorFee + centerFee;
        
        const merchantId = process.env.PAYHERE_MERCHANT_ID;
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
        const currency = 'LKR';
        const orderId = `APT_${appointment.appointment_id}_${Date.now()}`;

        const hash = generateHash(merchantId, orderId, amount, currency, merchantSecret);

        // Extract city from address or use sensible default
        const address = appointment.patient.address || 'Not Provided';
        const addressParts = address.split(',');
        const city = addressParts.length > 1 ? addressParts[addressParts.length - 1].trim() : (address !== 'Not Provided' ? address : 'Colombo');

        const doctorName = appointment.doctor.full_name.startsWith('Dr.') ? appointment.doctor.full_name : `Dr. ${appointment.doctor.full_name}`;

        const paymentData = {
            sandbox: process.env.PAYHERE_MODE === 'sandbox',
            merchant_id: merchantId,
            return_url: `${process.env.FRONTEND_URL}/patient/appointments?payment=success`,
            cancel_url: `${process.env.FRONTEND_URL}/patient/appointments?payment=cancel`,
            notify_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payments/notify`,
            order_id: orderId,
            items: `Consultation with ${doctorName}`,
            amount: amount.toFixed(2),
            currency: currency,
            hash: hash,
            first_name: appointment.patient.full_name.split(' ')[0],
            last_name: appointment.patient.full_name.split(' ').slice(1).join(' ') || 'Patient',
            email: appointment.patient.user.email,
            phone: appointment.patient.user.contact_number || '0000000000',
            address: address,
            city: city,
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
                    payment_method: method || 'Online',
                    transaction_id: `ONL-${appointment_id}-${payhere_payment_id || Date.now()}`,
                    status: 'SUCCESS'
                });

                // Send Confirmation Email
                try {
                    NotificationService.sendPaymentSuccess(appointment.patient?.user?.email, appointment.patient?.user?.contact_number, {
                        patientName: appointment.patient.full_name,
                        doctorFee: Number(appointment.doctor?.doctor_fee) || 0,
                        centerFee: Number(appointment.doctor?.center_fee) || 600,
                        total: Number(payhere_amount) || (Number(appointment.doctor?.doctor_fee || 0) + Number(appointment.doctor?.center_fee || 600)),
                        appointmentId: appointment.appointment_id,
                        doctorName: appointment.doctor.full_name,
                        date: appointment.appointment_date,
                        time: appointment.time_slot,
                        appointmentNumber: appointment.appointment_number,
                        transactionId: payhere_payment_id,
                        method: (method?.toLowerCase().includes('payhere')) ? 'Online' : (method || 'Online')
                    });
                } catch (notifyError) {
                    console.error('Notify webhook notification error:', notifyError);
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
                const doctorFee = parseFloat(appointment.doctor.doctor_fee) || 0;
                const centerFee = parseFloat(appointment.doctor.center_fee) || 600;
                const amount = doctorFee + centerFee;

                // Create Payment Record
                await Payment.create({
                    patient_id: appointment.patient_id,
                    appointment_id: appointment_id,
                    amount: amount,
                    payment_method: 'Online',
                    transaction_id: `ONL-${appointment_id}-${Date.now()}`,
                    status: 'SUCCESS'
                });
            }

            // Send Confirmation Email safely
            try {
                const doctorFee = parseFloat(appointment.doctor.doctor_fee) || 0;
                const centerFee = parseFloat(appointment.doctor.center_fee) || 600;
                const amount = doctorFee + centerFee;

                const docFeeVal = Number(appointment.doctor?.doctor_fee) || 0;
                const centerFeeVal = Number(appointment.doctor?.center_fee) || 600;

                NotificationService.sendPaymentSuccess(appointment.patient?.user?.email, appointment.patient?.user?.contact_number, {
                    patientName: appointment.patient.full_name,
                    doctorFee: docFeeVal,
                    centerFee: centerFeeVal,
                    total: docFeeVal + centerFeeVal,
                    appointmentId: appointment.appointment_id,
                    doctorName: appointment.doctor.full_name,
                    date: appointment.appointment_date,
                    time: appointment.time_slot,
                    appointmentNumber: appointment.appointment_number,
                    transactionId: `PH_VERIFY_${Date.now()}`,
                    method: 'Online'
                });
            } catch (notifyError) {
                console.error('Verify payment notification error:', notifyError);
            }
        }

        res.status(200).json({ success: true, message: 'Payment verified and updated' });

    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

/**
 * @desc    Download a PDF receipt for an appointment
 * @route   GET /api/payments/:appointmentId/receipt
 * @access  Private (Patient, Receptionist, Admin)
 */
export const downloadReceipt = async (req, res) => {
    try {
        const { appointmentId } = req.params;
        const currentUser = req.user;

        // Fetch appointment with all necessary info
        const appointment = await Appointment.findByPk(appointmentId, {
            include: [
                { model: Doctor, as: 'doctor' },
                { model: Patient, as: 'patient' },
                { model: Payment, as: 'payment' }
            ]
        });

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // Authorization check
        if (currentUser.role_id === 4) { // Patient
            const patient = await Patient.findOne({ where: { user_id: currentUser.user_id } });
            if (appointment.patient_id !== patient.patient_id) {
                return res.status(403).json({ success: false, message: 'Unauthorized access to receipt' });
            }
        }

        // Debug info
        console.log("Appointment Doctor:", JSON.stringify(appointment.doctor, null, 2));
        console.log("Appointment Payment:", JSON.stringify(appointment.payment, null, 2));

        if (appointment.payment_status !== 'PAID') {
            return res.status(400).json({ success: false, message: 'This appointment has not been paid for yet.' });
        }

        // Format dates and times
        const dateOptions = { day: '2-digit', month: 'long', year: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
        
        const issueDateStr = new Intl.DateTimeFormat('en-GB', dateOptions).format(new Date());
        const issueTimeStr = new Intl.DateTimeFormat('en-US', timeOptions).format(new Date());
        const consultDateStr = new Intl.DateTimeFormat('en-GB', dateOptions).format(new Date(appointment.appointment_date));

        // Get fixed fees with strict Number casting and defaults
        const rawDoctorFee = appointment.doctor?.doctor_fee;
        const rawCenterFee = appointment.doctor?.center_fee;
        
        const doctorFee = Number(rawDoctorFee) || 0;
        const centerFee = Number(rawCenterFee) || 600;
        const total = doctorFee + centerFee;

        // Force 'Online' label for PayHere
        const rawMethod = appointment.payment?.payment_method || '';
        const displayMethod = (rawMethod && rawMethod.toLowerCase().includes('payhere')) 
            ? 'Online' 
            : rawMethod;

        console.log("Mapped Data for Receipt:", {
            doctorFee,
            centerFee,
            total,
            displayMethod,
            issueTime: issueTimeStr
        });

        // Generate PDF Buffer
        const pdfBuffer = await ReceiptGenerator.generateReceiptBuffer({
            receiptNumber: `REC-${appointment.appointment_id}-${appointment.payment?.payment_id || 'MNL'}`,
            date: issueDateStr,
            time: issueTimeStr,
            patientName: appointment.patient?.full_name || 'N/A',
            doctorName: appointment.doctor?.full_name || 'N/A',
            appointmentDate: consultDateStr,
            timeSlot: appointment.time_slot,
            appointmentNumber: `Q-${appointment.appointment_number}`,
            doctorFee: doctorFee,
            centerFee: centerFee,
            total: total,
            paymentMethod: displayMethod || 'N/A',
            transactionId: appointment.payment?.transaction_id || 'N/A'
        });

        // Send PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Receipt-APT${appointmentId}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Download receipt error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};
