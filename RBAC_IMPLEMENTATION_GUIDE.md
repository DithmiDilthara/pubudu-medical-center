# Admin-Controlled RBAC Implementation Guide

## Overview

This document describes the complete Role-Based Access Control (RBAC) system implemented for the Medical Center application. The system includes dual-registration logic, role-based middleware, and folder-based routing in React.

## Table of Contents

1. [Database Schema](#database-schema)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [API Endpoints](#api-endpoints)
5. [Usage Examples](#usage-examples)
6. [Security Features](#security-features)

---

## Database Schema

### Users Table
The main users table with authentication credentials:
- `user_id` (Primary Key)
- `username`
- `email`
- `password_hash`
- `role_id` (Foreign Key to role table)
- `is_active`
- `last_login`
- `contact_number`

### Role Table
Defines available roles:
- `role_id` (Primary Key)
- `role_name` (Admin, Doctor, Patient, Receptionist)

### Profile Tables

#### Patient Table
- `patient_id` (Primary Key)
- `user_id` (Foreign Key to users)
- `first_name`, `last_name`, `phone`
- `date_of_birth`, `gender`, `address`
- `emergency_contact`, `blood_group`

#### Doctor Table
- `doctor_id` (Primary Key)
- `user_id` (Foreign Key to users)
- `first_name`, `last_name`, `phone`
- `specialization`, `qualification`
- `experience_years`, `consultation_fee`
- `bio`, `profile_image`, `is_available`
- **`admin_id`** (Foreign Key to users - tracks which admin created this doctor)

#### Receptionist Table
- `receptionist_id` (Primary Key)
- `user_id` (Foreign Key to users)
- `first_name`, `last_name`, `phone`
- `shift` (Morning, Evening, Night)

---

## Backend Implementation

### 1. Dual-Registration Logic

#### A. Public Patient Registration

**Endpoint:** `POST /api/auth/register-patient`

**Access:** Public (no authentication required)

**Purpose:** Allows anyone to register as a Patient

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@email.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "0771234567",
  "date_of_birth": "1990-05-15",
  "gender": "Male",
  "address": "123 Main Street",
  "emergency_contact": "0779876543",
  "blood_group": "O+"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Patient registered successfully.",
  "data": {
    "user": {
      "user_id": 1,
      "username": "john_doe",
      "email": "john@email.com",
      "role": "Patient"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Implementation:**
```javascript
// backend/controllers/authController.js
export const registerPatient = async (req, res) => {
  // 1. Validate required fields
  // 2. Check for existing username/email
  // 3. Get Patient role ID
  // 4. Hash password
  // 5. Create user record
  // 6. Create patient profile
  // 7. Generate JWT token
  // 8. Return user data and token
};
```

#### B. Admin-Only Staff Registration

**Endpoint:** `POST /api/auth/add-staff`

**Access:** Private (Admin only - requires JWT token)

**Purpose:** Admin can create Doctor or Receptionist accounts

**Request Body (Doctor):**
```json
{
  "username": "dr_smith",
  "email": "dr.smith@medicalcenter.com",
  "password": "TempPassword123!",
  "role_name": "Doctor",
  "first_name": "Sarah",
  "last_name": "Smith",
  "phone": "0771234568",
  "specialization": "Cardiology",
  "qualification": "MBBS, MD (Cardiology)",
  "experience_years": 10,
  "consultation_fee": 3000.00,
  "bio": "Experienced cardiologist..."
}
```

**Request Body (Receptionist):**
```json
{
  "username": "receptionist_mary",
  "email": "mary@medicalcenter.com",
  "password": "TempPassword123!",
  "role_name": "Receptionist",
  "first_name": "Mary",
  "last_name": "Johnson",
  "phone": "0771234569",
  "shift": "Morning"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Doctor account created successfully.",
  "data": {
    "user": {
      "user_id": 2,
      "username": "dr_smith",
      "email": "dr.smith@medicalcenter.com",
      "role": "Doctor"
    },
    "profile": {
      "doctor_id": 1,
      "user_id": 2,
      "specialization": "Cardiology",
      "admin_id": 1
    },
    "created_by": 1
  }
}
```

**Key Features:**
- Only accepts Doctor or Receptionist roles
- Automatically populates `admin_id` in doctor table
- Admin provides temporary password
- Validates admin authentication via JWT

### 2. Authentication & JWT

#### Login Endpoint

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "user_id": 1,
      "username": "john_doe",
      "email": "john@email.com",
      "role": "Patient"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**JWT Payload:**
```json
{
  "user_id": 1,
  "username": "john_doe",
  "role_id": 4,
  "role_name": "Patient",
  "iat": 1234567890,
  "exp": 1234654290
}
```

The `role_name` is included in the JWT payload, which is crucial for frontend role-based routing.

### 3. Role-Based Middleware

#### verifyToken Middleware

Verifies JWT token and attaches user info to request:

```javascript
// backend/middleware/authMiddleware.js
export const verifyToken = async (req, res, next) => {
  // 1. Extract token from Authorization header
  // 2. Verify token using JWT_SECRET
  // 3. Fetch user with role information
  // 4. Attach user to req.user
  // 5. Call next()
};
```

**Attached to req.user:**
```javascript
{
  user_id: 1,
  username: "john_doe",
  email: "john@email.com",
  role_id: 4,
  role_name: "Patient"
}
```

#### authorizeRole Middleware

Restricts access based on roles:

```javascript
export const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    // 1. Check if req.user exists
    // 2. Check if user's role is in allowedRoles
    // 3. Return 403 if not authorized
    // 4. Call next() if authorized
  };
};
```

**Usage Examples:**

```javascript
// Single role
router.get('/admin-only', 
  verifyToken, 
  authorizeRole(['Admin']), 
  controller
);

// Multiple roles
router.get('/medical-staff', 
  verifyToken, 
  authorizeRole(['Admin', 'Doctor', 'Receptionist']), 
  controller
);

// Using the combined protect middleware
import { protect } from '../middleware/authMiddleware.js';

router.get('/admin-only', 
  ...protect(['Admin']), 
  controller
);
```

### 4. Sequelize Models

All models are properly configured with associations:

**User Model:**
```javascript
// Associations in models/index.js
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
User.hasOne(Patient, { foreignKey: 'user_id', as: 'patientProfile' });
User.hasOne(Doctor, { foreignKey: 'user_id', as: 'doctorProfile' });
User.hasOne(Receptionist, { foreignKey: 'user_id', as: 'receptionistProfile' });
```

**Doctor Model with admin_id:**
```javascript
const Doctor = sequelize.define('Doctor', {
  // ... other fields
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  }
});
```

---

## Frontend Implementation

### 1. AuthContext

The AuthContext provides authentication state and functions throughout the app:

**Location:** `frontend/src/context/AuthContext.jsx`

**Key Functions:**

```javascript
// Public patient registration
const registerPatient = async (userData) => {
  const response = await api.post('/auth/register-patient', userData);
  // Store token and user in localStorage
  // Update state
};

// Admin adding staff
const addStaff = async (staffData) => {
  const response = await api.post('/auth/add-staff', staffData);
  // Returns success/error
};

// Login
const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  // Store token and user in localStorage
  // Update state
};

// Role checking
const hasRole = (requiredRoles) => {
  if (!user) return false;
  if (typeof requiredRoles === 'string') {
    return user.role === requiredRoles;
  }
  return requiredRoles.includes(user.role);
};
```

**Context Value:**
```javascript
{
  user,           // Current user object
  token,          // JWT token
  loading,        // Loading state
  error,          // Error message
  login,          // Login function
  registerPatient,// Public patient registration
  register,       // General registration (legacy)
  addStaff,       // Admin add staff
  logout,         // Logout function
  getProfile,     // Get user profile
  hasRole,        // Check if user has role
  isAuthenticated,// Check if authenticated
  api             // Axios instance
}
```

### 2. ProtectedRoute Component

**Location:** `frontend/src/components/ProtectedRoute.jsx`

Protects routes based on authentication and role:

```jsx
<ProtectedRoute allowedRoles={['Doctor']}>
  <DoctorDashboard />
</ProtectedRoute>
```

**Props:**
- `children` - Component to render if authorized
- `allowedRoles` - Array of allowed roles (e.g., `['Admin', 'Doctor']`)
- `redirectTo` - Path to redirect if not authenticated (default: '/')
- `unauthorizedPath` - Path to redirect if wrong role (default: '/unauthorized')

**Features:**
- Shows loading spinner while checking auth
- Redirects to login if not authenticated
- Redirects to unauthorized page if wrong role
- Preserves attempted URL for redirect after login

### 3. React Router Setup

**Location:** `frontend/src/App.jsx`

Folder-based routing with role protection:

```jsx
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<Login />} />
  <Route path="/register" element={<PatientRegistration />} />
  <Route path="/unauthorized" element={<Unauthorized />} />

  {/* Patient Routes */}
  <Route
    path="/patient/dashboard"
    element={
      <ProtectedRoute allowedRoles={['Patient']}>
        <PatientDashboard />
      </ProtectedRoute>
    }
  />

  {/* Doctor Routes */}
  <Route
    path="/doctor/dashboard"
    element={
      <ProtectedRoute allowedRoles={['Doctor']}>
        <DoctorDashboard />
      </ProtectedRoute>
    }
  />

  {/* Receptionist Routes */}
  <Route
    path="/receptionist/dashboard"
    element={
      <ProtectedRoute allowedRoles={['Receptionist']}>
        <ReceptionistDashboard />
      </ProtectedRoute>
    }
  />

  {/* Admin Routes */}
  <Route
    path="/admin/dashboard"
    element={
      <ProtectedRoute allowedRoles={['Admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    }
  />
  <Route
    path="/admin/add-staff"
    element={
      <ProtectedRoute allowedRoles={['Admin']}>
        <AddStaff />
      </ProtectedRoute>
    }
  />
</Routes>
```

**Folder Structure:**
```
src/pages/
├── admin/
│   ├── AdminDashboard.jsx
│   ├── AddStaff.jsx
│   ├── ManageDoctors.jsx
│   └── ManageReceptionist.jsx
├── doctor/
│   ├── DoctorDashboard.jsx
│   ├── DoctorAppointments.jsx
│   └── DoctorPatients.jsx
├── patient/
│   ├── PatientDashboard.jsx
│   ├── FindDoctor.jsx
│   └── Appointments.jsx
└── receptionist/
    ├── ReceptionistDashboard.jsx
    ├── AddPatient.jsx
    └── NewBooking.jsx
```

---

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register-patient` | Public patient registration |
| POST | `/api/auth/login` | User login |

### Protected Endpoints

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/api/auth/add-staff` | Admin | Create Doctor/Receptionist |
| GET | `/api/auth/profile` | All authenticated | Get user profile |
| GET | `/api/auth/verify` | All authenticated | Verify token validity |

---

## Usage Examples

### 1. Patient Self-Registration (Frontend)

```jsx
import { useAuth } from '../context/AuthContext';

const PatientRegistration = () => {
  const { registerPatient } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await registerPatient({
      username: 'john_doe',
      email: 'john@email.com',
      password: 'SecurePassword123!',
      first_name: 'John',
      last_name: 'Doe',
      phone: '0771234567',
      date_of_birth: '1990-05-15',
      gender: 'Male'
    });

    if (result.success) {
      // Redirect to patient dashboard
      navigate('/patient/dashboard');
    }
  };
};
```

### 2. Admin Adding Doctor (Frontend)

```jsx
import { useAuth } from '../context/AuthContext';

const AddStaff = () => {
  const { addStaff } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await addStaff({
      username: 'dr_smith',
      email: 'dr.smith@medicalcenter.com',
      password: 'TempPassword123!',
      role_name: 'Doctor',
      first_name: 'Sarah',
      last_name: 'Smith',
      specialization: 'Cardiology',
      qualification: 'MBBS, MD',
      experience_years: 10,
      consultation_fee: 3000.00
    });

    if (result.success) {
      alert('Doctor created successfully!');
    }
  };
};
```

### 3. Protected Backend Route

```javascript
import express from 'express';
import { verifyToken, authorizeRole } from '../middleware/authMiddleware.js';
import { getDoctorList } from '../controllers/doctorController.js';

const router = express.Router();

// Only Admin and Receptionist can access
router.get('/doctors', 
  verifyToken, 
  authorizeRole(['Admin', 'Receptionist']), 
  getDoctorList
);

export default router;
```

---

## Security Features

### 1. Password Security
- Passwords hashed using bcrypt with salt rounds of 12
- Minimum password length enforced
- No passwords stored in plain text

### 2. JWT Security
- Tokens expire after 24 hours (configurable)
- Tokens include user_id and role_name
- Secret key stored in environment variables
- Tokens verified on every protected request

### 3. Role Validation
- Backend validates roles before any database operation
- Frontend ProtectedRoute prevents unauthorized access
- Middleware ensures user has required role
- 403 Forbidden returned for unauthorized access

### 4. Admin Controls
- Only Admin can create Doctor/Receptionist accounts
- Admin ID tracked in doctor table for audit trail
- Role restrictions enforced at multiple layers

### 5. Input Validation
- Email format validation
- Username uniqueness check
- Role validation against allowed values
- SQL injection protection via Sequelize ORM

---

## Database Migration

To add the `admin_id` column to existing doctor table:

```sql
-- Run: backend/database/add_admin_id_to_doctor.sql

ALTER TABLE doctor
ADD COLUMN admin_id INT NULL
COMMENT 'ID of the Admin who created this doctor account';

ALTER TABLE doctor
ADD CONSTRAINT fk_doctor_admin
FOREIGN KEY (admin_id) REFERENCES users(user_id)
ON DELETE SET NULL
ON UPDATE CASCADE;

CREATE INDEX idx_doctor_admin_id ON doctor(admin_id);
```

---

## Environment Variables

Required in `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=medical_center_db
DB_DIALECT=mysql

# Server Configuration
PORT=3000
NODE_ENV=development
```

---

## Testing the Implementation

### 1. Test Patient Registration
```bash
curl -X POST http://localhost:3000/api/auth/register-patient \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_patient",
    "email": "patient@test.com",
    "password": "Test123!",
    "first_name": "Test",
    "last_name": "Patient"
  }'
```

### 2. Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_patient",
    "password": "Test123!"
  }'
```

### 3. Test Admin Adding Doctor
```bash
curl -X POST http://localhost:3000/api/auth/add-staff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "username": "dr_test",
    "email": "doctor@test.com",
    "password": "Temp123!",
    "role_name": "Doctor",
    "first_name": "Test",
    "last_name": "Doctor",
    "specialization": "General Medicine"
  }'
```

---

## Summary

This RBAC implementation provides:

✅ **Dual Registration Logic** - Public patient registration + Admin-controlled staff registration

✅ **Role-Based Middleware** - `authorize(['Admin', 'Doctor'])` for backend protection

✅ **Folder-Based Routing** - React Router with role-based access to page folders

✅ **JWT with Roles** - Token includes role_name for authorization

✅ **Admin Tracking** - Doctor table tracks which admin created each account

✅ **Security** - Password hashing, token expiration, role validation

✅ **Persistence** - localStorage maintains auth across page refreshes

✅ **Frontend Context** - AuthContext provides auth state app-wide

The system is production-ready and follows security best practices!
