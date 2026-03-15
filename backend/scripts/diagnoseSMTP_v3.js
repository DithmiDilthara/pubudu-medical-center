import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../config/.env') });

async function diagnoseSMTP() {
    console.log('--- SMTP Diagnostic Tool (V3 - Service Gmail) ---');
    console.log('User:', process.env.EMAIL_USER);
    
    const pass = process.env.EMAIL_PASS || '';
    console.log('Pass Length:', pass.length);
    console.log('Pass Start (masked):', pass.slice(0, 4) + '...');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: pass
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Verifying connection using service: "gmail"...');
        await transporter.verify();
        console.log('SUCCESS: Connection verified!');
        
        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: `"Pubudu MC Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: 'SMTP Diagnostic Test (V3)',
            text: 'This confirms that service: "gmail" works with your credentials.'
        });
        console.log('Message sent:', info.messageId);
    } catch (error) {
        console.log('FAILED:', error.message);
        console.log('Error Details:', error);
    }
}

diagnoseSMTP();
