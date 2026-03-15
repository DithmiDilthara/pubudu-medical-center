# RBAC Quick Reference Guide

## Quick Start

### Backend Routes Summary

```javascript
// Public Routes
POST   /api/auth/register-patient    // Patient self-registration
POST   /api/auth/login               // Login (all users)

// Admin-Only Routes  
POST   /api/auth/add-staff           // Add Doctor/Receptionist (requires Admin JWT)

// Protected Routes (all authenticated users)
GET    /api/auth/profile             // Get user profile
GET    /api/auth/verify              // Verify token
```

---

## Common Code Snippets

### 1. Protect a Backend Route

```javascript
import { verifyToken, authorizeRole } from '../middleware/authMiddleware.js';

// Single role
router.get('/admin-resource', verifyToken, authorizeRole(['Admin']), controller);

// Multiple roles
router.get('/medical-staff', verifyToken, authorizeRole(['Admin', 'Doctor']), controller);
```

### 2. Frontend Protected Route

```jsx
import ProtectedRoute from '../components/ProtectedRoute';

<Route
  path="/doctor/dashboard"
  element={
    <ProtectedRoute allowedRoles={['Doctor']}>
      <DoctorDashboard />
    </ProtectedRoute>
  }
/>
```

### 3. Use Auth Functions in Component

```jsx
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { user, login, logout, hasRole, addStaff } = useAuth();

  // Check role
  if (hasRole('Admin')) {
    // Show admin features
  }

  // Add staff (admin only)
  const result = await addStaff({
    username: 'new_doctor',
    email: 'doctor@example.com',
    password: 'TempPass123!',
    role_name: 'Doctor',
    specialization: 'Cardiology'
  });
};
```

### 4. Access Current User in Backend Controller

```javascript
export const someController = async (req, res) => {
  // User info attached by verifyToken middleware
  const { user_id, username, role_name } = req.user;
  
  if (role_name === 'Admin') {
    // Admin-specific logic
  }
};
```

---

## Role Matrix

| Feature | Patient | Doctor | Receptionist | Admin |
|---------|---------|--------|--------------|-------|
| Self Register | ✅ | ❌ | ❌ | ❌ |
| Login | ✅ | ✅ | ✅ | ✅ |
| View Own Profile | ✅ | ✅ | ✅ | ✅ |
| Book Appointments | ✅ | ❌ | ✅ | ✅ |
| View Medical Records | ✅ | ✅ | ❌ | ✅ |
| Manage Availability | ❌ | ✅ | ❌ | ✅ |
| Add Staff | ❌ | ❌ | ❌ | ✅ |
| View Reports | ❌ | ❌ | ❌ | ✅ |

---

## Frontend Pages by Role

```
/patient/*          -> Patient only
/doctor/*           -> Doctor only
/receptionist/*     -> Receptionist only
/admin/*            -> Admin only
```

---

## JWT Token Structure

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

The `role_name` field is used for authorization checks.

---

## Error Responses

### 401 Unauthorized
- No token provided
- Invalid token
- Token expired
- User account deactivated

### 403 Forbidden
- User authenticated but lacks required role
- Example: Patient trying to access admin route

### 409 Conflict
- Username already exists
- Email already exists

### 400 Bad Request
- Missing required fields
- Invalid role specified
- Invalid input format

---

## Database Commands

### Run Migration
```bash
# Add admin_id to doctor table
mysql -u root -p medical_center_db < backend/database/add_admin_id_to_doctor.sql
```

### Check Doctor Table
```sql
-- Verify admin_id column exists
DESCRIBE doctor;

-- See which admin created which doctors
SELECT d.doctor_id, d.first_name, d.last_name, 
       u.username as admin_username
FROM doctor d
LEFT JOIN users u ON d.admin_id = u.user_id;
```

---

## Testing Checklist

- [ ] Patient can self-register via `/register-patient`
- [ ] Patient receives JWT token after registration
- [ ] Patient can login and access patient routes
- [ ] Admin can create Doctor accounts via `/add-staff`
- [ ] Admin can create Receptionist accounts via `/add-staff`
- [ ] Doctor's `admin_id` is populated correctly
- [ ] Non-admin cannot access `/add-staff`
- [ ] Patient cannot access `/doctor/*` routes
- [ ] Doctor cannot access `/patient/*` routes
- [ ] Token persists after page refresh
- [ ] Logout clears token and redirects to login

---

## Common Issues & Solutions

### Issue: Token not persisting after refresh
**Solution:** Check that AuthContext initializes from localStorage on mount

### Issue: 403 Forbidden on protected route
**Solution:** Verify JWT contains `role_name` and user has correct role

### Issue: Admin can't add staff
**Solution:** Ensure admin is logged in and token is included in Authorization header

### Issue: Routes not protected
**Solution:** Wrap route in `<ProtectedRoute>` component with `allowedRoles` prop

### Issue: admin_id is null in doctor table
**Solution:** Run migration script and ensure `addStaff` controller sets `admin_id`

---

## Environment Setup

### Required .env variables
```env
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=medical_center_db
PORT=3000
```

### CORS Configuration (if needed)
```javascript
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));
```

---

## Next Steps

1. Run database migration to add `admin_id` column
2. Test public patient registration
3. Create admin user manually (if not exists)
4. Test admin adding doctor/receptionist
5. Verify role-based routing in frontend
6. Implement password reset functionality (optional)
7. Add email verification (optional)
8. Implement refresh tokens (optional)

---

## Support

For questions or issues, refer to:
- Full documentation: `RBAC_IMPLEMENTATION_GUIDE.md`
- Usage examples: `backend/examples/rbac-usage-examples.js`
- Frontend example: `frontend/src/pages/admin/AddStaff.jsx`
