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
        const { doctorName, date, time, patientName, appointmentNumber, paymentStatus } = appointmentDetails;

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
            <p><strong>Payment Status:</strong> <span style="color: ${paymentStatus === 'PAID' ? '#059669' : '#DC2626'}; fontWeight: bold;">${paymentStatus || 'Pending'}</span></p>
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
            const smsMessage = `Pubudu MC: Dear ${patientName}, your appointment with ${doctorName} on ${date} at ${time} is confirmed. Appt No: ${appointmentNumber}. Payment: ${paymentStatus || 'Pending'}. Please arrive 15 mins early.`;
            await this.sendSMS(patientPhone, smsMessage);
        }
    }

    static async sendPaymentSuccess(patientEmail, patientPhone, paymentDetails) {
        const { 
            patientName, 
            doctorFee, 
            centerFee, 
            total,
            appointmentId, 
            doctorName, 
            date, 
            time, 
            appointmentNumber, 
            transactionId, 
            method 
        } = paymentDetails;

        // 1. Send Email with PDF Receipt
        if (patientEmail && process.env.EMAIL_USER) {
            try {
                // Generate PDF Receipt
                const pdfBuffer = await ReceiptGenerator.generateReceiptBuffer({
                    receiptNumber: `REC-${appointmentId}-${Date.now().toString().slice(-4)}`,
                    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
                    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                    patientName,
                    doctorName: doctorName || 'Medical Consultation',
                    appointmentDate: date || 'N/A',
                    timeSlot: time || 'N/A',
                    appointmentNumber: appointmentNumber || 'N/A',
                    doctorFee: doctorFee || 0,
                    centerFee: centerFee || 0,
                    total: total || (Number(doctorFee || 0) + Number(centerFee || 0)),
                    paymentMethod: method || 'Online',
                    transactionId
                });

                const mailOptions = {
                    from: `"Pubudu Medical Center" <${process.env.EMAIL_USER}>`,
                    to: patientEmail,
                    subject: 'Payment Successful & Appointment Confirmed - Pubudu Medical Center',
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #059669;">Payment Successful & Appointment Confirmed</h2>
                            <p>Dear ${patientName},</p>
                            <p>Your payment of <strong>LKR ${total}</strong> has been received, and your appointment with <strong>${doctorName}</strong> has been successfully confirmed.</p>
                            
                            <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p><strong>Doctor:</strong> ${doctorName}</p>
                                <p><strong>Date:</strong> ${date}</p>
                                <p><strong>Time:</strong> ${time}</p>
                                <p><strong>Appointment Number:</strong> ${appointmentNumber || 'N/A'}</p>
                                <p><strong>Transaction ID:</strong> ${transactionId || 'N/A'}</p>
                            </div>

                            <p>Please find your official receipt attached to this email as a PDF.</p>
                            <p>We look forward to seeing you. Please arrive 15 minutes before your scheduled time.</p>
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
                    console.log(`Payment success & confirmation email sent to ${patientEmail}`);
                }
            } catch (error) {
                console.error('Error sending payment success email:', error);
            }
        }

        // 2. Send SMS
        if (patientPhone) {
            const smsMessage = `Pubudu MC: Payment success! Your appt with ${doctorName} on ${date} at ${time} is CONFIRMED. Appt No: ${appointmentNumber}. Receipt emailed. Thank you!`;
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

    static async sendRescheduleNotice(patientEmail, patientPhone, appointmentDetails) {
        const { doctorName, date, time, patientName, appointmentNumber } = appointmentDetails;

        const mailOptions = {
            from: `"Pubudu Medical Center" <${process.env.EMAIL_USER}>`,
            to: patientEmail,
            subject: 'Appointment Rescheduled - Pubudu Medical Center',
            html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2563eb;">Appointment Rescheduled</h2>
          <p>Dear ${patientName},</p>
          <p>Your appointment has been successfully rescheduled at Pubudu Medical Center.</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Doctor:</strong> ${doctorName}</p>
            <p><strong>New Date:</strong> ${date}</p>
            <p><strong>New Time:</strong> ${time}</p>
            <p><strong>Appointment Number:</strong> ${appointmentNumber || 'N/A'}</p>
          </div>
          <p>Please arrive 15 minutes before your new schedule. Regards,<br/>Team Pubudu Medical Center</p>
        </div>
      `
        };

        try {
            if (transporter && patientEmail) {
                await transporter.sendMail(mailOptions);
                console.log(`Reschedule email sent to ${patientEmail}`);
            }
        } catch (error) {
            console.warn('Email delivery failed:', error.message);
        }

        if (patientPhone) {
            const smsMessage = `Pubudu MC: Dear ${patientName}, your appointment with ${doctorName} has been rescheduled to ${date} at ${time}. Appt No: ${appointmentNumber}. See you then!`;
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

    /**
     * Send account credentials to new staff members
     */
    static async sendStaffCredentials(email, staffDetails) {
        const { fullName, username, password, role } = staffDetails;
        const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        const mailOptions = {
            from: `"Pubudu Medical Center" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Your Pubudu Medical Center Account Credentials`,
            html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #2563eb; margin: 0;">Welcome to the Team!</h2>
            <p style="color: #64748b;">Your staff account has been created successfully.</p>
          </div>
          
          <p>Dear ${fullName},</p>
          <p>An account has been created for you as a <strong>${role}</strong> at Pubudu Medical Center. You can now access the staff portal using the credentials below:</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <p style="margin: 0 0 10px 0;"><strong>Username:</strong> ${username}</p>
            <p style="margin: 0;"><strong>Temporary Password:</strong> ${password}</p>
          </div>
          
          <div style="background: #fff7ed; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #ffedd5;">
            <p style="margin: 0; color: #9a3412; font-size: 14px;">
              <strong>Important:</strong> For security reasons, please log in and change your password immediately after your first access.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; borderRadius: 8px; fontWeight: bold; display: inline-block;">
              Login to Portal
            </a>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            This is an automated message from Pubudu Medical Center. Please do not reply to this email.
          </p>
        </div>
      `
        };

        try {
            if (transporter && email) {
                await transporter.sendMail(mailOptions);
                console.log(`Credential email sent to ${email} for ${role}: ${username}`);
                return true;
            }
            console.warn('Email skipped: Transporter or email missing');
            return false;
        } catch (error) {
            console.error('Error sending staff credentials email:', error);
            return false;
        }
    }
}

export default NotificationService;
