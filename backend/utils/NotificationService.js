import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

class NotificationService {
    static async sendAppointmentConfirmation(patientEmail, appointmentDetails) {
        const { doctorName, date, time, patientName } = appointmentDetails;

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
          </div>
          <p>Please arrive 15 minutes early. If you need to cancel, please contact us at least 24 hours in advance.</p>
          <p>Regards,<br/>Team Pubudu Medical Center</p>
        </div>
      `
        };

        try {
            if (!process.env.EMAIL_USER) {
                console.log('Email service not configured. Skipping confirmation email.');
                return;
            }
            await transporter.sendMail(mailOptions);
            console.log(`Confirmation email sent to ${patientEmail}`);
        } catch (error) {
            console.error('Error sending confirmation email:', error);
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

    static async sendCancellationNotice(patientEmail, appointmentDetails) {
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
            if (!process.env.EMAIL_USER) return;
            await transporter.sendMail(mailOptions);
            console.log(`Cancellation email sent to ${patientEmail}`);
        } catch (error) {
            console.error('Error sending cancellation email:', error);
        }
    }
}

export default NotificationService;
