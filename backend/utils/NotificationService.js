import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import axios from 'axios';
import ReceiptGenerator from './ReceiptGenerator.js';

dotenv.config();
dotenv.config({ path: './config/.env' });

// Improved transporter configuration using Gmail service for better reliability
const smtpConfig = {
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
};

const transporter = (process.env.EMAIL_USER && process.env.EMAIL_PASS) ? nodemailer.createTransport(smtpConfig) : null;

class NotificationService {
    /**
     * Send SMS via text.lk gateway
     */
    static async sendSMS(phone, message) {
        try {
            const token = process.env.TEXT_LK_TOKEN;
            const senderId = process.env.TEXT_LK_SENDER_ID || "Pubudu MC";
            const apiEndpoint = 'https://app.text.lk/api/v3/sms/send';

            if (!token) {
                console.log('TEXT_LK_TOKEN not set. Skipping SMS.');
                return false;
            }

            // Clean phone number
            let cleanPhone = phone.replace(/[^0-9]/g, '');
            
            // Format to 94XXXXXXXX if starts with 0
            if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
                cleanPhone = '94' + cleanPhone.substring(1);
            } else if (cleanPhone.length === 9) {
                cleanPhone = '94' + cleanPhone;
            }

            const response = await axios.post(apiEndpoint, {
                recipient: cleanPhone,
                sender_id: senderId,
                message: message,
                type: 'plain'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && (response.data.status === 'success' || response.data.status === 200)) {
                console.log(`SMS successfully sent to ${cleanPhone}`);
                return true;
            } else {
                console.error('Text.lk API error:', response.data);
                if (response.data?.message?.includes('authorized')) {
                    console.log('TIP: Ensure your Sender ID is approved in the Text.lk dashboard.');
                }
                return false;
            }
        } catch (error) {
            console.error('SMS Service Error:', error.response?.data || error.message);
            return false;
        }
    }

    static async sendAppointmentConfirmation(patientEmail, patientPhone, appointmentDetails) {
        const { doctorName, date, time, patientName, appointmentNumber } = appointmentDetails;

        // 1. Send Email
        const mailOptions = {
            from: `"Pubudu Medical Center" <${process.env.EMAIL_USER}>`,
            to: patientEmail,
            subject: 'Appointment Confirmation - Pubudu Medical Center',
            html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0066CC;">Appointment Confirmed</h2>
          <p>Dear ${patientName},</p>
          <p>Your appointment has been successfully booked at Pubudu Medical Center.</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Doctor:</strong> ${doctorName}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Appointment Number:</strong> ${appointmentNumber || 'N/A'}</p>
          </div>
          <p>Please arrive 15 minutes early. If you need to cancel, please contact us at least 24 hours in advance.</p>
          <p>Regards,<br/>Team Pubudu Medical Center</p>
        </div>
      `
        };

        try {
            if (transporter && patientEmail) {
                await transporter.sendMail(mailOptions);
                console.log(`Confirmation email sent to ${patientEmail}`);
            }
        } catch (error) {
            console.warn('Email delivery failed (likely SMTP not configured):', error.message);
        }

        // 2. Send SMS
        if (patientPhone) {
            const smsMessage = `Pubudu MC: Dear ${patientName}, your appointment with ${doctorName} on ${date} at ${time} is confirmed. Appt No: ${appointmentNumber}. Please arrive 15 mins early.`;
            await this.sendSMS(patientPhone, smsMessage);
        }
    }

    static async sendPaymentSuccess(patientEmail, patientPhone, paymentDetails) {
        const { patientName, amount, appointmentId, doctorName, date, time, appointmentNumber, transactionId, method } = paymentDetails;

        // 1. Send Email with PDF Receipt
        if (patientEmail && process.env.EMAIL_USER) {
            try {
                // Generate PDF Receipt
                const pdfBuffer = await ReceiptGenerator.generateReceiptBuffer({
                    receiptNumber: `REC-${appointmentId}-${Date.now().toString().slice(-4)}`,
                    date: new Date().toLocaleDateString(),
                    patientName,
                    doctorName: doctorName || 'Medical Consultation',
                    appointmentDate: date || 'N/A',
                    timeSlot: time || 'N/A',
                    appointmentNumber: appointmentNumber || 'N/A',
                    amount,
                    paymentMethod: method || 'Online',
                    transactionId
                });

                const mailOptions = {
                    from: `"Pubudu Medical Center" <${process.env.EMAIL_USER}>`,
                    to: patientEmail,
                    subject: 'Payment Successful & Receipt - Pubudu Medical Center',
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #0066CC;">Payment Received</h2>
                            <p>Dear ${patientName},</p>
                            <p>Thank you for your payment of <strong>LKR ${amount}</strong> for your appointment at Pubudu Medical Center.</p>
                            <p>Your payment has been successfully processed. Please find your official receipt attached to this email as a PDF.</p>
                            <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p><strong>Appointment ID:</strong> #${appointmentId}</p>
                                <p><strong>Transaction ID:</strong> ${transactionId || 'N/A'}</p>
                            </div>
                            <p>We look forward to seeing you.</p>
                            <p>Regards,<br/>Team Pubudu Medical Center</p>
                        </div>
                    `,
                    attachments: [
                        {
                            filename: `Receipt-APT${appointmentId}.pdf`,
                            content: pdfBuffer
                        }
                    ]
                };

                if (transporter) {
                    await transporter.sendMail(mailOptions);
                    console.log(`Payment success email with receipt sent to ${patientEmail}`);
                }
            } catch (error) {
                console.error('Error sending payment success email:', error);
            }
        }

        // 2. Send SMS
        if (patientPhone) {
            const smsMessage = `Pubudu MC: Dear ${patientName}, your payment of LKR ${amount} for appointment #${appointmentId} was successful. We've emailed your receipt. Thank you!`;
            await this.sendSMS(patientPhone, smsMessage);
        }
    }

    static async sendCancellationNotice(patientEmail, patientPhone, appointmentDetails) {
        const { doctorName, date, time, patientName, reason } = appointmentDetails;

        const mailOptions = {
            from: `"Pubudu Medical Center" <${process.env.EMAIL_USER}>`,
            to: patientEmail,
            subject: 'Appointment Cancelled - Pubudu Medical Center',
            html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #ef4444;">Appointment Cancelled</h2>
          <p>Dear ${patientName},</p>
          <p>We regret to inform you that your appointment with <strong>${doctorName}</strong> on <strong>${date}</strong> at <strong>${time}</strong> has been cancelled.</p>
          <p>${reason ? `Reason: ${reason}` : 'The doctor is unavailable on this date.'}</p>
          <p>We apologize for the inconvenience. Please log in to your patient portal to reschedule.</p>
          <p>Regards,<br/>Team Pubudu Medical Center</p>
        </div>
      `
        };

        try {
            if (process.env.EMAIL_USER && patientEmail) {
                await transporter.sendMail(mailOptions);
                console.log(`Cancellation email sent to ${patientEmail}`);
            }
        } catch (error) {
            console.error('Error sending cancellation email:', error);
        }

        // Send SMS
        if (patientPhone) {
            const smsMessage = `Pubudu MC: Dear ${patientName}, your appointment with ${doctorName} on ${date} at ${time} has been CANCELLED. Reason: ${reason || 'Schedule change'}. Please login to reschedule.`;
            await this.sendSMS(patientPhone, smsMessage);
        }
    }

    static async sendPrescriptionReady(patientEmail, patientName) {
        const mailOptions = {
            from: `"Pubudu Medical Center" <${process.env.EMAIL_USER}>`,
            to: patientEmail,
            subject: 'Medical Record Updated - Pubudu Medical Center',
            html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0066CC;">Consultation Complete</h2>
          <p>Dear ${patientName},</p>
          <p>Your consultation is complete and your medical records/prescriptions have been updated in the portal.</p>
          <p>You can view your history by logging into your patient dashboard.</p>
          <p>Regards,<br/>Team Pubudu Medical Center</p>
        </div>
      `
        };

        try {
            if (!process.env.EMAIL_USER) return;
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending prescription notification:', error);
        }
    }
}

export default NotificationService;
