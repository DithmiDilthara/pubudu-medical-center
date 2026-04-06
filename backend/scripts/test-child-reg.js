import axios from 'axios';
import fs from 'fs';

const testRegistration = async () => {
    try {
        const response = await axios.post('http://localhost:3000/api/auth/register-patient', {
            username: `childtester_${Date.now()}`,
            password: "Password123!",
            email: `child_${Date.now()}@test.com`,
            phone: "0771234567",
            full_name: "Test Child",
            patient_type: "CHILD",
            gender: "MALE",
            date_of_birth: "2015-05-15",
            address: "123 Child St",
            blood_group: "O+",
            allergies: "None",
            guardian_name: "Test Guardian",
            guardian_contact: "0779876543",
            guardian_relationship: "Father"
        });
        fs.writeFileSync('test-out.json', JSON.stringify({status: response.status, data: response.data}, null, 2));
    } catch (e) {
        fs.writeFileSync('test-out.json', JSON.stringify({
            status: e.response ? e.response.status : false,
            data: e.response ? e.response.data : e.message
        }, null, 2));
    }
}

testRegistration();
