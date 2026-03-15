/**
 * Example usage of the Admin-Controlled RBAC System
 * 
 * This file demonstrates how to use the authentication endpoints:
 * 1. Public Patient Registration
 * 2. Admin Adding Staff (Doctor/Receptionist)
 * 3. Login with JWT and role information
 */

// ============================================
// 1. PUBLIC PATIENT REGISTRATION
// ============================================
// Endpoint: POST /api/auth/register-patient
// Access: Public (no authentication required)

const patientRegistrationExample = async () => {
    const patientData = {
        username: 'john_doe',
        email: 'john.doe@email.com',
        password: 'SecurePassword123!',
        first_name: 'John',
        last_name: 'Doe',
        phone: '0771234567',
        date_of_birth: '1990-05-15',
        gender: 'Male',
        address: '123 Main Street, Colombo',
        emergency_contact: '0779876543',
        blood_group: 'O+'
    };

    try {
        const response = await fetch('http://localhost:3000/api/auth/register-patient', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData)
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('Patient registered successfully!');
            console.log('User:', result.data.user);
            console.log('Token:', result.data.token);
            
            // Store token in localStorage
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
        }
    } catch (error) {
        console.error('Registration error:', error);
    }
};

// ============================================
// 2. ADMIN ADDING DOCTOR
// ============================================
// Endpoint: POST /api/auth/add-staff
// Access: Private (Admin only - requires JWT token)

const adminAddDoctorExample = async (adminToken) => {
    const doctorData = {
        username: 'dr_smith',
        email: 'dr.smith@medicalcenter.com',
        password: 'TempPassword123!', // Temporary password
        role_name: 'Doctor',
        first_name: 'Sarah',
        last_name: 'Smith',
        phone: '0771234568',
        specialization: 'Cardiology',
        qualification: 'MBBS, MD (Cardiology)',
        experience_years: 10,
        consultation_fee: 3000.00,
        bio: 'Experienced cardiologist specializing in heart disease prevention and treatment.'
    };

    try {
        const response = await fetch('http://localhost:3000/api/auth/add-staff', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(doctorData)
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('Doctor created successfully!');
            console.log('User:', result.data.user);
            console.log('Profile:', result.data.profile);
            console.log('Created by Admin ID:', result.data.created_by);
        }
    } catch (error) {
        console.error('Error creating doctor:', error);
    }
};

// ============================================
// 3. ADMIN ADDING RECEPTIONIST
// ============================================
// Endpoint: POST /api/auth/add-staff
// Access: Private (Admin only - requires JWT token)

const adminAddReceptionistExample = async (adminToken) => {
    const receptionistData = {
        username: 'receptionist_mary',
        email: 'mary@medicalcenter.com',
        password: 'TempPassword123!', // Temporary password
        role_name: 'Receptionist',
        first_name: 'Mary',
        last_name: 'Johnson',
        phone: '0771234569',
        shift: 'Morning'
    };

    try {
        const response = await fetch('http://localhost:3000/api/auth/add-staff', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(receptionistData)
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('Receptionist created successfully!');
            console.log('User:', result.data.user);
            console.log('Profile:', result.data.profile);
        }
    } catch (error) {
        console.error('Error creating receptionist:', error);
    }
};

// ============================================
// 4. LOGIN (All Users)
// ============================================
// Endpoint: POST /api/auth/login
// Access: Public
// Returns: JWT token with role_name included

const loginExample = async () => {
    const credentials = {
        username: 'john_doe',
        password: 'SecurePassword123!'
    };

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('Login successful!');
            console.log('User:', result.data.user);
            console.log('Role:', result.data.user.role);
            console.log('Token:', result.data.token);
            
            // Store token and user info
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            
            // Token payload includes:
            // - user_id
            // - username
            // - role_id
            // - role_name (e.g., "Doctor", "Patient", "Admin", "Receptionist")
        }
    } catch (error) {
        console.error('Login error:', error);
    }
};

// ============================================
// 5. ACCESSING PROTECTED ROUTES
// ============================================

const accessProtectedRoute = async (token) => {
    try {
        // Example: Admin-only route
        const response = await fetch('http://localhost:3000/api/auth/admin-only', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('Access granted!');
            console.log(result.message);
        } else {
            console.log('Access denied:', result.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

// ============================================
// ROLE-BASED MIDDLEWARE USAGE (Backend)
// ============================================
/*
In your backend routes, use the authorize middleware like this:

import { verifyToken, authorizeRole } from '../middleware/authMiddleware.js';

// Single role
router.get('/admin-resource', verifyToken, authorizeRole(['Admin']), controller);

// Multiple roles
router.get('/medical-staff', verifyToken, authorizeRole(['Admin', 'Doctor', 'Receptionist']), controller);

// Or use the combined protect middleware
import { protect } from '../middleware/authMiddleware.js';

router.get('/admin-resource', ...protect(['Admin']), controller);
*/

// Export examples
export {
    patientRegistrationExample,
    adminAddDoctorExample,
    adminAddReceptionistExample,
    loginExample,
    accessProtectedRoute
};
