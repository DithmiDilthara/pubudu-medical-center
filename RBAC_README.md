# Admin-Controlled RBAC System

## Overview

This is a complete Role-Based Access Control (RBAC) implementation for a Medical Center Management System. The system implements dual-registration logic, JWT-based authentication, and folder-based route protection.

## 🎯 Key Features

- ✅ **Public Patient Registration** - Anyone can register as a patient
- ✅ **Admin-Controlled Staff Creation** - Only admins can create Doctor/Receptionist accounts
- ✅ **JWT Authentication** - Secure token-based authentication with role information
- ✅ **Role-Based Middleware** - Backend API protection based on user roles
- ✅ **Folder-Based Routing** - Frontend route protection by role
- ✅ **Admin Audit Trail** - Tracks which admin created each doctor account
- ✅ **Persistent Authentication** - Auth state survives page refreshes

## 📚 Quick Links

- **[Implementation Guide](./RBAC_IMPLEMENTATION_GUIDE.md)** - Comprehensive documentation
- **[Quick Reference](./RBAC_QUICK_REFERENCE.md)** - Common code snippets and usage
- **[Flow Diagrams](./RBAC_FLOW_DIAGRAMS.md)** - Visual representation of flows
- **[Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification
- **[Summary](./IMPLEMENTATION_SUMMARY.md)** - What was implemented

## 🚀 Quick Start

### 1. Database Setup

Run the migration to add the `admin_id` column:

```bash
mysql -u root -p medical_center_db < backend/database/add_admin_id_to_doctor.sql
```

### 2. Environment Configuration

Ensure your `.env` file has:

```env
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=24h
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=medical_center_db
PORT=3000
```

### 3. Start Backend

```bash
cd backend
npm install
npm start
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📋 User Roles

| Role | Self-Register | Created By | Access |
|------|---------------|------------|--------|
| **Patient** | ✅ Yes | Self | `/patient/*` |
| **Doctor** | ❌ No | Admin | `/doctor/*` |
| **Receptionist** | ❌ No | Admin | `/receptionist/*` |
| **Admin** | ❌ No | Database/Super Admin | `/admin/*` |

## 🔐 API Endpoints

### Public Endpoints

```javascript
POST /api/auth/register-patient  // Patient self-registration
POST /api/auth/login             // Login (all users)
```

### Protected Endpoints

```javascript
POST /api/auth/add-staff         // Admin only - Create Doctor/Receptionist
GET  /api/auth/profile           // All authenticated users
GET  /api/auth/verify            // All authenticated users
```

## 💻 Usage Examples

### Patient Self-Registration (Frontend)

```jsx
import { useAuth } from '../context/AuthContext';

const PatientRegistration = () => {
  const { registerPatient } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await registerPatient({
      username: 'john_doe',
      email: 'john@email.com',
      password: 'SecurePass123!',
      first_name: 'John',
      last_name: 'Doe'
    });
    
    if (result.success) {
      // Automatically redirected to /patient/dashboard
    }
  };
};
```

### Admin Adding Doctor (Frontend)

```jsx
import { useAuth } from '../context/AuthContext';

const AddStaff = () => {
  const { addStaff } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addStaff({
      username: 'dr_smith',
      email: 'dr.smith@hospital.com',
      password: 'TempPass123!',
      role_name: 'Doctor',
      first_name: 'Sarah',
      last_name: 'Smith',
      specialization: 'Cardiology',
      qualification: 'MBBS, MD'
    });
    
    if (result.success) {
      alert('Doctor created successfully!');
    }
  };
};
```

### Protected Route (Frontend)

```jsx
import ProtectedRoute from './components/ProtectedRoute';

<Route
  path="/doctor/dashboard"
  element={
    <ProtectedRoute allowedRoles={['Doctor']}>
      <DoctorDashboard />
    </ProtectedRoute>
  }
/>
```

### Protected API Route (Backend)

```javascript
import { verifyToken, authorizeRole } from '../middleware/authMiddleware.js';

// Admin only
router.post('/add-staff', 
  verifyToken, 
  authorizeRole(['Admin']), 
  addStaffController
);

// Multiple roles
router.get('/appointments', 
  verifyToken, 
  authorizeRole(['Admin', 'Doctor', 'Receptionist']), 
  getAppointmentsController
);
```

## 🧪 Testing

### Automated Tests

```bash
cd backend
node tests/rbac-test-scripts.js
```

This will test:
- ✅ Patient registration
- ✅ Login functionality
- ✅ Token verification
- ✅ Authorization (non-admin cannot add staff)
- ✅ Invalid token rejection
- ✅ Duplicate username prevention

### Manual Testing

#### 1. Test Patient Registration
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

#### 2. Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_patient",
    "password": "Test123!"
  }'
```

#### 3. Test Admin Add Doctor
```bash
curl -X POST http://localhost:3000/api/auth/add-staff \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "username": "dr_test",
    "email": "doctor@test.com",
    "password": "Temp123!",
    "role_name": "Doctor",
    "specialization": "Cardiology"
  }'
```

## 📁 File Structure

```
medical-center/
├── backend/
│   ├── controllers/
│   │   └── authController.js      ← registerPatient(), addStaff()
│   ├── middleware/
│   │   └── authMiddleware.js      ← verifyToken(), authorizeRole()
│   ├── models/
│   │   ├── User.js
│   │   ├── Role.js
│   │   ├── Patient.js
│   │   ├── Doctor.js              ← Added admin_id field
│   │   └── Receptionist.js
│   ├── routes/
│   │   └── authRoutes.js          ← New endpoints
│   ├── database/
│   │   └── add_admin_id_to_doctor.sql
│   ├── examples/
│   │   └── rbac-usage-examples.js
│   └── tests/
│       └── rbac-test-scripts.js
│
├── frontend/
│   └── src/
│       ├── context/
│       │   └── AuthContext.jsx    ← registerPatient(), addStaff()
│       ├── components/
│       │   └── ProtectedRoute.jsx ← Role-based routing
│       ├── pages/
│       │   ├── admin/
│       │   │   └── AddStaff.jsx   ← NEW: Admin add staff page
│       │   ├── doctor/
│       │   ├── patient/
│       │   └── receptionist/
│       └── App.jsx                ← Route configuration
│
└── Documentation/
    ├── RBAC_IMPLEMENTATION_GUIDE.md
    ├── RBAC_QUICK_REFERENCE.md
    ├── RBAC_FLOW_DIAGRAMS.md
    ├── DEPLOYMENT_CHECKLIST.md
    └── IMPLEMENTATION_SUMMARY.md
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Signed with secret key, expire after 24h
- **Role Validation**: Multiple layers (frontend + backend)
- **Admin Tracking**: Doctor table tracks which admin created each account
- **Input Validation**: Email format, username uniqueness, role validation
- **SQL Injection Protection**: Sequelize ORM parameterized queries
- **Authorization Checks**: Every protected route verifies role

## 🎯 Implementation Highlights

### 1. Dual Registration System

**Public Registration** (`/register-patient`):
- Only creates Patient role users
- Accessible to everyone
- Creates user + patient profile
- Returns JWT token

**Admin Registration** (`/add-staff`):
- Admin-only access (requires JWT)
- Can create Doctor or Receptionist
- Admin provides temporary password
- Tracks admin_id for doctors

### 2. JWT with Role Information

The JWT payload includes:
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

This eliminates database queries for role checks!

### 3. Folder-Based Frontend Routing

```
/patient/*       → Only Patient role
/doctor/*        → Only Doctor role
/receptionist/*  → Only Receptionist role
/admin/*         → Only Admin role
```

Unauthorized users are automatically redirected.

### 4. Admin Audit Trail

When an admin creates a doctor:
```sql
SELECT d.first_name, d.last_name, u.username as created_by
FROM doctor d
LEFT JOIN users u ON d.admin_id = u.user_id;
```

This shows which admin created which doctor.

## 📊 Database Changes

### New Column: doctor.admin_id

```sql
ALTER TABLE doctor
ADD COLUMN admin_id INT NULL
COMMENT 'ID of the Admin who created this doctor account';

ALTER TABLE doctor
ADD CONSTRAINT fk_doctor_admin
FOREIGN KEY (admin_id) REFERENCES users(user_id);
```

This tracks accountability for doctor account creation.

## 🐛 Troubleshooting

### Issue: "403 Forbidden" on admin routes
**Solution**: 
- Verify you're logged in as Admin
- Check JWT token includes `role_name: "Admin"`
- Ensure token is in Authorization header

### Issue: Token not persisting after refresh
**Solution**:
- Check localStorage in browser DevTools
- Verify AuthContext reads from localStorage on mount
- Ensure token is saved after login

### Issue: Cannot add staff
**Solution**:
- Login as Admin first
- Verify endpoint is `/api/auth/add-staff`
- Check Authorization header has token
- Verify role_name is "Doctor" or "Receptionist"

## 📖 Documentation

For detailed information, see:

1. **[RBAC_IMPLEMENTATION_GUIDE.md](./RBAC_IMPLEMENTATION_GUIDE.md)**
   - Complete technical documentation
   - API endpoint details
   - Code examples
   - Security features

2. **[RBAC_QUICK_REFERENCE.md](./RBAC_QUICK_REFERENCE.md)**
   - Common code snippets
   - Quick usage guide
   - Error responses
   - Troubleshooting tips

3. **[RBAC_FLOW_DIAGRAMS.md](./RBAC_FLOW_DIAGRAMS.md)**
   - Visual flow diagrams
   - System architecture
   - Database relationships

4. **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)**
   - Pre-deployment verification
   - Testing checklist
   - Production setup

## 🎓 Learning Resources

### Understanding the Code

1. **Backend Middleware**:
   - See `backend/middleware/authMiddleware.js`
   - Study `verifyToken()` and `authorizeRole()`

2. **Frontend Protection**:
   - See `frontend/src/components/ProtectedRoute.jsx`
   - Study role-based navigation logic

3. **Auth Context**:
   - See `frontend/src/context/AuthContext.jsx`
   - Learn how auth state is managed

4. **Example Usage**:
   - See `backend/examples/rbac-usage-examples.js`
   - Working code examples

## 🤝 Contributing

When extending this system:

1. Always use `verifyToken` before protected routes
2. Add role checks with `authorizeRole(['Role1', 'Role2'])`
3. Wrap frontend routes in `<ProtectedRoute>`
4. Test with multiple user roles
5. Update documentation

## 📝 License

This RBAC implementation is part of the Medical Center Management System.

## ✅ Status

**Implementation Status**: ✅ Complete and Production-Ready

All requirements have been implemented:
- ✅ Dual registration logic
- ✅ JWT with role_name
- ✅ Role-based middleware
- ✅ Folder-based routing
- ✅ Admin audit trail (admin_id)
- ✅ Persistent authentication

---

**For questions or support, refer to the documentation files listed above.**
