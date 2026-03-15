import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../config/.env') });

async function diagnoseSMTP() {
    console.log('--- SMTP Diagnostic Tool (V2) ---');
    console.log('User:', process.env.EMAIL_USER);
    
    let pass = process.env.EMAIL_PASS || '';
    console.log('Raw Pass Length:', pass.length);
    console.log('Raw Pass Start:', pass.slice(0, 5));
    
    // Check for accidental quotes in the string itself
    if (pass.startsWith('"') && pass.endsWith('"')) {
        console.log('WARNING: Pass starts and ends with quotes. Stripping them...');
        pass = pass.slice(1, -1);
    }
    
    const configs = [
        { name: 'Gmail 587 (TLS)', host: 'smtp.gmail.com', port: 587, secure: false },
        { name: 'Gmail 465 (SSL)', host: 'smtp.gmail.com', port: 465, secure: true }
    ];

    for (const config of configs) {
        console.log(`\nTesting ${config.name}...`);
        const transporter = nodemailer.createTransport({
            ...config,
            auth: {
                user: process.env.EMAIL_USER,
                pass: pass
            },
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 10000
        });

        try {
            await transporter.verify();
            console.log(`SUCCESS: ${config.name} is working!`);
            
            console.log('Sending test email...');
            const info = await transporter.sendMail({
                from: `"Pubudu MC" <${process.env.EMAIL_USER}>`,
                to: process.env.EMAIL_USER,
                subject: 'SMTP Diagnostic Test ' + config.name,
                text: 'Authentication successful using ' + config.name
            });
            console.log('Message sent:', info.messageId);
            return; // Stop after first success
        } catch (error) {
            console.log(`FAILED: ${config.name} - ${error.message}`);
        }
    }
    
    console.log('\nAll configurations failed.');
}

diagnoseSMTP();
