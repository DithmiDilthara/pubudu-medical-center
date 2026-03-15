import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../config/.env') });

async function diagnoseSMTP() {
    console.log('--- SMTP Diagnostic Tool ---');
    console.log('User:', process.env.EMAIL_USER);
    // Mask password for safety
    const pass = process.env.EMAIL_PASS || '';
    console.log('Pass:', pass.slice(0, 4) + '****' + pass.slice(-4));
    
    const smtpConfig = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        debug: true, // Enable debug output
        logger: true // Log to console
    };

    console.log('Config:', JSON.stringify({ ...smtpConfig, auth: { ...smtpConfig.auth, pass: '****' } }, null, 2));

    const transporter = nodemailer.createTransport(smtpConfig);

    try {
        console.log('Verifying connection...');
        const success = await transporter.verify();
        console.log('Connection verified successfully:', success);

        console.log('Sending diagnostic email...');
        const info = await transporter.sendMail({
            from: `"Diagnostic tool" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: 'SMTP Diagnostic Test',
            text: 'If you receive this, your SMTP configuration is working correctly.',
            html: '<b>Diagnostic Test</b><p>SMTP configuration is working.</p>'
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        console.log('Response:', info.response);
    } catch (error) {
        console.error('DIAGNOSTIC FAILED:');
        console.error(error);
        
        if (error.code === 'EAUTH') {
            console.log('\n--- Troubleshooting Tip ---');
            console.log('This looks like an authentication error.');
            console.log('1. Ensure "App Passwords" are enabled for your Gmail account.');
            console.log('2. Make sure you used a 16-character App Password, not your regular password.');
            console.log('3. Double-check for typos (e.g. quotes or spaces in .env).');
        }
    }
}

diagnoseSMTP();
