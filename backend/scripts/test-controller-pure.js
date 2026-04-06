import { registerPatient } from '../controllers/authController.js';

const mockRes = {
    statusCode: 200,
    status(code) {
        this.statusCode = code;
        return this;
    },
    json(data) {
        console.log('RESPONSE:', JSON.stringify(data, null, 2));
        return this;
    }
};

const mockReq = {
    body: {
        username: `ChildTest_${Date.now()}`,
        email: `child_${Date.now()}@test.com`,
        password: "Password123!",
        full_name: "Test Child",
        patient_type: "CHILD",
        gender: "MALE",
        date_of_birth: "2010-01-01",
        address: "Test Address",
        contact_number: "0771234567",
        guardian_name: "Test Guardian",
        guardian_contact: "0771112223",
        guardian_relationship: "Father",
        agreeTerms: true
    }
};

const test = async () => {
    try {
        await registerPatient(mockReq, mockRes);
    } catch (e) {
        console.error('CRASHED WITH ERROR:', e);
    }
    process.exit(0);
};

test();
