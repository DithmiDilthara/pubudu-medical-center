import { registerPatient } from '../controllers/authController.js';
import httpMocks from 'node-mocks-http';

const test = async () => {
    const req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/auth/register-patient',
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
    });

    const res = httpMocks.createResponse();

    try {
        await registerPatient(req, res);
        console.log('Result Status:', res.statusCode);
        console.log('Result Data:', res._getJSONData());
    } catch (e) {
        console.error('CRASHED WITH:', e);
    }
};

test();
