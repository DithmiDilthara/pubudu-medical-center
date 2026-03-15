/**
 * Test Scripts for RBAC Implementation
 * 
 * Run these scripts to test the authentication and authorization system
 * 
 * Usage:
 * 1. Start your backend server
 * 2. Update API_URL if needed
 * 3. Run: node backend/tests/rbac-test-scripts.js
 */

const API_URL = 'http://localhost:3000/api';

// Utility function to make API requests
async function apiRequest(endpoint, method = 'GET', data = null, token = null) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();
        
        return {
            status: response.status,
            success: result.success,
            data: result.data,
            message: result.message,
            error: result.error
        };
    } catch (error) {
        return {
            status: 0,
            success: false,
            error: error.message
        };
    }
}

// Test 1: Patient Self-Registration
async function testPatientRegistration() {
    console.log('\n========================================');
    console.log('TEST 1: Patient Self-Registration');
    console.log('========================================\n');

    const patientData = {
        username: `test_patient_${Date.now()}`,
        email: `patient_${Date.now()}@test.com`,
        password: 'TestPass123!',
        first_name: 'Test',
        last_name: 'Patient',
        phone: '0771234567',
        date_of_birth: '1990-01-01',
        gender: 'Male',
        blood_group: 'O+'
    };

    console.log('Registering patient:', patientData.username);
    const result = await apiRequest('/auth/register-patient', 'POST', patientData);

    if (result.success) {
        console.log('✅ SUCCESS: Patient registered');
        console.log('User ID:', result.data.user.user_id);
        console.log('Username:', result.data.user.username);
        console.log('Role:', result.data.user.role);
        console.log('Token received:', result.data.token ? 'Yes' : 'No');
        return { token: result.data.token, username: patientData.username, password: patientData.password };
    } else {
        console.log('❌ FAILED:', result.message || result.error);
        return null;
    }
}

// Test 2: Patient Login
async function testPatientLogin(username, password) {
    console.log('\n========================================');
    console.log('TEST 2: Patient Login');
    console.log('========================================\n');

    console.log('Logging in as:', username);
    const result = await apiRequest('/auth/login', 'POST', { username, password });

    if (result.success) {
        console.log('✅ SUCCESS: Login successful');
        console.log('User ID:', result.data.user.user_id);
        console.log('Role:', result.data.user.role);
        console.log('Token received:', result.data.token ? 'Yes' : 'No');
        return result.data.token;
    } else {
        console.log('❌ FAILED:', result.message || result.error);
        return null;
    }
}

// Test 3: Token Verification
async function testTokenVerification(token) {
    console.log('\n========================================');
    console.log('TEST 3: Token Verification');
    console.log('========================================\n');

    console.log('Verifying token...');
    const result = await apiRequest('/auth/verify', 'GET', null, token);

    if (result.success) {
        console.log('✅ SUCCESS: Token is valid');
        console.log('User:', result.data.user.username);
        console.log('Role:', result.data.user.role_name);
        return true;
    } else {
        console.log('❌ FAILED:', result.message || result.error);
        return false;
    }
}

// Test 4: Non-Admin Cannot Add Staff
async function testNonAdminAddStaff(patientToken) {
    console.log('\n========================================');
    console.log('TEST 4: Non-Admin Cannot Add Staff');
    console.log('========================================\n');

    const staffData = {
        username: 'should_fail',
        email: 'should_fail@test.com',
        password: 'Test123!',
        role_name: 'Doctor',
        first_name: 'Should',
        last_name: 'Fail'
    };

    console.log('Attempting to add staff with patient token...');
    const result = await apiRequest('/auth/add-staff', 'POST', staffData, patientToken);

    if (!result.success && result.status === 403) {
        console.log('✅ SUCCESS: Patient correctly denied (403 Forbidden)');
        console.log('Message:', result.message);
        return true;
    } else {
        console.log('❌ FAILED: Patient should not be able to add staff');
        return false;
    }
}

// Test 5: Admin Add Doctor (requires manual admin login)
async function testAdminAddDoctor(adminToken) {
    console.log('\n========================================');
    console.log('TEST 5: Admin Add Doctor');
    console.log('========================================\n');

    if (!adminToken) {
        console.log('⚠️  SKIPPED: Admin token not provided');
        console.log('To test: Login as admin and provide token');
        return null;
    }

    const doctorData = {
        username: `dr_test_${Date.now()}`,
        email: `doctor_${Date.now()}@test.com`,
        password: 'TempPass123!',
        role_name: 'Doctor',
        first_name: 'Test',
        last_name: 'Doctor',
        specialization: 'General Medicine',
        qualification: 'MBBS',
        experience_years: 5,
        consultation_fee: 2500.00
    };

    console.log('Adding doctor:', doctorData.username);
    const result = await apiRequest('/auth/add-staff', 'POST', doctorData, adminToken);

    if (result.success) {
        console.log('✅ SUCCESS: Doctor added by admin');
        console.log('User ID:', result.data.user.user_id);
        console.log('Username:', result.data.user.username);
        console.log('Role:', result.data.user.role);
        console.log('Admin ID:', result.data.created_by);
        console.log('Doctor can login with temp password');
        return { username: doctorData.username, password: doctorData.password };
    } else {
        console.log('❌ FAILED:', result.message || result.error);
        return null;
    }
}

// Test 6: Admin Add Receptionist (requires manual admin login)
async function testAdminAddReceptionist(adminToken) {
    console.log('\n========================================');
    console.log('TEST 6: Admin Add Receptionist');
    console.log('========================================\n');

    if (!adminToken) {
        console.log('⚠️  SKIPPED: Admin token not provided');
        return null;
    }

    const receptionistData = {
        username: `recep_test_${Date.now()}`,
        email: `recep_${Date.now()}@test.com`,
        password: 'TempPass123!',
        role_name: 'Receptionist',
        first_name: 'Test',
        last_name: 'Receptionist',
        shift: 'Morning'
    };

    console.log('Adding receptionist:', receptionistData.username);
    const result = await apiRequest('/auth/add-staff', 'POST', receptionistData, adminToken);

    if (result.success) {
        console.log('✅ SUCCESS: Receptionist added by admin');
        console.log('User ID:', result.data.user.user_id);
        console.log('Username:', result.data.user.username);
        console.log('Role:', result.data.user.role);
        return { username: receptionistData.username, password: receptionistData.password };
    } else {
        console.log('❌ FAILED:', result.message || result.error);
        return null;
    }
}

// Test 7: Invalid Token
async function testInvalidToken() {
    console.log('\n========================================');
    console.log('TEST 7: Invalid Token Rejection');
    console.log('========================================\n');

    const invalidToken = 'invalid.token.here';
    console.log('Attempting to verify invalid token...');
    const result = await apiRequest('/auth/verify', 'GET', null, invalidToken);

    if (!result.success && result.status === 401) {
        console.log('✅ SUCCESS: Invalid token correctly rejected (401 Unauthorized)');
        console.log('Message:', result.message);
        return true;
    } else {
        console.log('❌ FAILED: Invalid token should be rejected');
        return false;
    }
}

// Test 8: Duplicate Username
async function testDuplicateUsername() {
    console.log('\n========================================');
    console.log('TEST 8: Duplicate Username Prevention');
    console.log('========================================\n');

    const username = `duplicate_test_${Date.now()}`;
    const patientData = {
        username,
        email: `first_${Date.now()}@test.com`,
        password: 'Test123!',
        first_name: 'First',
        last_name: 'User'
    };

    console.log('Creating first user:', username);
    const first = await apiRequest('/auth/register-patient', 'POST', patientData);

    if (!first.success) {
        console.log('❌ FAILED: Could not create first user');
        return false;
    }

    console.log('Attempting to create duplicate...');
    const duplicate = await apiRequest('/auth/register-patient', 'POST', {
        ...patientData,
        email: `second_${Date.now()}@test.com`
    });

    if (!duplicate.success && duplicate.status === 409) {
        console.log('✅ SUCCESS: Duplicate username correctly rejected (409 Conflict)');
        console.log('Message:', duplicate.message);
        return true;
    } else {
        console.log('❌ FAILED: Duplicate username should be rejected');
        return false;
    }
}

// Main test runner
async function runAllTests() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   RBAC IMPLEMENTATION TEST SUITE      ║');
    console.log('╚════════════════════════════════════════╝');

    const results = {
        passed: 0,
        failed: 0,
        skipped: 0
    };

    // Test 1: Patient Registration
    const patient = await testPatientRegistration();
    if (patient) results.passed++; else results.failed++;

    if (patient) {
        // Test 2: Patient Login
        const patientToken = await testPatientLogin(patient.username, patient.password);
        if (patientToken) results.passed++; else results.failed++;

        if (patientToken) {
            // Test 3: Token Verification
            const verified = await testTokenVerification(patientToken);
            if (verified) results.passed++; else results.failed++;

            // Test 4: Non-Admin Cannot Add Staff
            const denied = await testNonAdminAddStaff(patientToken);
            if (denied) results.passed++; else results.failed++;
        }
    }

    // Test 7: Invalid Token
    const invalidRejected = await testInvalidToken();
    if (invalidRejected) results.passed++; else results.failed++;

    // Test 8: Duplicate Username
    const duplicatePrevented = await testDuplicateUsername();
    if (duplicatePrevented) results.passed++; else results.failed++;

    // Admin tests (manual - requires admin login)
    console.log('\n========================================');
    console.log('ADMIN TESTS (Manual)');
    console.log('========================================\n');
    console.log('To test admin functions:');
    console.log('1. Login as admin to get token');
    console.log('2. Run these functions with admin token:');
    console.log('   - testAdminAddDoctor(adminToken)');
    console.log('   - testAdminAddReceptionist(adminToken)');
    console.log('\nExample:');
    console.log('const adminToken = "YOUR_ADMIN_TOKEN";');
    console.log('await testAdminAddDoctor(adminToken);');
    console.log('await testAdminAddReceptionist(adminToken);');

    // Summary
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║          TEST SUMMARY                  ║');
    console.log('╚════════════════════════════════════════╝\n');
    console.log(`✅ Passed:  ${results.passed}`);
    console.log(`❌ Failed:  ${results.failed}`);
    console.log(`⚠️  Skipped: ${results.skipped} (admin tests - requires manual login)`);
    console.log('\n');

    if (results.failed === 0) {
        console.log('🎉 All automated tests passed!');
    } else {
        console.log('⚠️  Some tests failed. Please review the output above.');
    }
}

// Export functions for manual testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        testPatientRegistration,
        testPatientLogin,
        testTokenVerification,
        testNonAdminAddStaff,
        testAdminAddDoctor,
        testAdminAddReceptionist,
        testInvalidToken,
        testDuplicateUsername,
        runAllTests
    };
}

// Run tests if executed directly
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runAllTests().catch(console.error);
}
