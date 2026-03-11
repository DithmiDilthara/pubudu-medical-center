import bcrypt from 'bcryptjs';
import { User, Doctor, Admin, Availability } from './models/index.js';

const newDoctors = [
    {
        full_name: 'Dr. R.P. Jayasinghe',
        firstName: 'RPJayasinghe',
        specialization: 'General Physician',
        doctor_fee: 2000,
        center_fee: 600,
        availabilities: []
    },
    {
        full_name: 'Dr. Kapila Witharana',
        firstName: 'Kapila',
        specialization: 'Dermatology',
        doctor_fee: 2500,
        center_fee: 600,
        availabilities: [{ day_of_week: 'Saturday', start_time: '17:00:00', end_time: '20:00:00' }]
    },
    {
        full_name: 'Dr. Hiromel De Silva',
        firstName: 'Hiromel',
        specialization: 'Dermatology',
        doctor_fee: 2000,
        center_fee: 600,
        availabilities: [{ day_of_week: 'Sunday', start_time: '19:30:00', end_time: '20:30:00' }]
    },
    {
        full_name: 'Dr. Buddhika Illeperuma',
        firstName: 'Buddhika',
        specialization: 'Nephrology',
        doctor_fee: 2500,
        center_fee: 600,
        availabilities: [{ day_of_week: 'Tuesday', start_time: '18:30:00', end_time: '20:00:00' }]
    },
    {
        full_name: 'Dr. Charith Pathiranage',
        firstName: 'Charith',
        specialization: 'Ophthalmology',
        doctor_fee: 2500,
        center_fee: 600,
        availabilities: [{ day_of_week: 'Monday', start_time: '18:30:00', end_time: '20:30:00' }]
    },
    {
        full_name: 'Dr. Chinthaka De Silva',
        firstName: 'Chinthaka',
        specialization: 'Cardiology',
        doctor_fee: 3000,
        center_fee: 600,
        availabilities: [{ day_of_week: 'Saturday', start_time: '08:30:00', end_time: '10:30:00' }]
    },
    {
        full_name: 'Dr. Shanaka Mohotti',
        firstName: 'Shanaka',
        specialization: 'Neurology',
        doctor_fee: 2500,
        center_fee: 600,
        availabilities: [{ day_of_week: 'Sunday', start_time: '07:30:00', end_time: '10:00:00' }]
    }
];

async function insertDoctors() {
    try {
        const admin = await Admin.findOne();
        const adminId = admin ? admin.admin_id : 1; // Fallback to 1 if no admin

        for (const doc of newDoctors) {
            const username = `Doc_${doc.firstName}`;
            const password = `${doc.firstName}@12345`;
            const email = `${doc.full_name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}@gmail.com`;
            const license_no = `SLMC${Math.floor(1000 + Math.random() * 9000)}`;
            const contact_number = `077${Math.floor(1000000 + Math.random() * 9000000)}`;

            // Check if user already exists
            let user = await User.findOne({ where: { username } });
            if (!user) {
                user = await User.create({
                    username,
                    password_hash: password,
                    email,
                    contact_number,
                    role_id: 2
                });

                const newDoctor = await Doctor.create({
                    user_id: user.user_id,
                    admin_id: adminId,
                    full_name: doc.full_name,
                    specialization: doc.specialization,
                    license_no: license_no,
                    doctor_fee: doc.doctor_fee,
                    center_fee: doc.center_fee
                });

                // Add availabilities
                for (const avail of doc.availabilities) {
                    await Availability.create({
                        doctor_id: newDoctor.doctor_id,
                        day_of_week: avail.day_of_week,
                        start_time: avail.start_time,
                        end_time: avail.end_time
                    });
                }
                console.log(`Successfully added ${doc.full_name}`);
            } else {
                console.log(`Doctor ${doc.full_name} (username ${username}) already exists`);
            }
        }
        console.log("All done!");
        process.exit(0);
    } catch (error) {
        console.error("Error inserting doctors:", error);
        process.exit(1);
    }
}

insertDoctors();
