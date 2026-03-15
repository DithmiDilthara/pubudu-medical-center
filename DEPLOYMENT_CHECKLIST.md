# RBAC Implementation Deployment Checklist

## Pre-Deployment Checklist

### Database Changes
- [ ] Backup your existing database
- [ ] Run the migration script to add `admin_id` to doctor table:
  ```bash
  mysql -u root -p medical_center_db < backend/database/add_admin_id_to_doctor.sql
  ```
- [ ] Verify the column was added:
  ```sql
  DESCRIBE doctor;
  ```
- [ ] Ensure you have at least one Admin user in your database

### Backend Verification
- [ ] Install any missing dependencies:
  ```bash
  cd backend
  npm install
  ```
- [ ] Verify `.env` file contains:
  - `JWT_SECRET` (change default!)
  - `JWT_EXPIRES_IN`
  - Database credentials
- [ ] Test backend server starts without errors:
  ```bash
  npm start
  ```
- [ ] Verify new routes are accessible:
  - `POST /api/auth/register-patient`
  - `POST /api/auth/add-staff`

### Frontend Verification
- [ ] Install any missing dependencies:
  ```bash
  cd frontend
  npm install
  ```
- [ ] Verify `VITE_API_URL` in `.env` points to backend
- [ ] Test frontend starts without errors:
  ```bash
  npm run dev
  ```
- [ ] Check for console errors in browser

---

## Testing Checklist

### 1. Patient Registration (Public)
- [ ] Navigate to registration page
- [ ] Fill out patient registration form
- [ ] Submit form
- [ ] Verify:
  - [ ] User created in `users` table with Patient role
  - [ ] Profile created in `patient` table
  - [ ] JWT token received
  - [ ] Redirected to patient dashboard
  - [ ] Can access `/patient/*` routes
  - [ ] Cannot access other role routes

### 2. Admin Adding Doctor
- [ ] Login as Admin
- [ ] Navigate to `/admin/add-staff`
- [ ] Select "Doctor" role
- [ ] Fill out doctor form with:
  - [ ] Username
  - [ ] Email
  - [ ] Temporary password
  - [ ] Specialization
  - [ ] Qualification
  - [ ] Other details
- [ ] Submit form
- [ ] Verify:
  - [ ] User created in `users` table with Doctor role
  - [ ] Profile created in `doctor` table
  - [ ] `admin_id` field populated with your admin ID
  - [ ] Success message shown
  - [ ] Doctor can login with credentials
  - [ ] Doctor can access `/doctor/*` routes

### 3. Admin Adding Receptionist
- [ ] Login as Admin
- [ ] Navigate to `/admin/add-staff`
- [ ] Select "Receptionist" role
- [ ] Fill out receptionist form
- [ ] Submit form
- [ ] Verify:
  - [ ] User created with Receptionist role
  - [ ] Profile created in `receptionist` table
  - [ ] Receptionist can login
  - [ ] Can access `/receptionist/*` routes

### 4. Login Testing
- [ ] Patient can login
- [ ] Doctor can login
- [ ] Receptionist can login
- [ ] Admin can login
- [ ] JWT token includes `role_name`
- [ ] Token stored in localStorage
- [ ] User info stored in localStorage

### 5. Authorization Testing
- [ ] Patient CANNOT access `/doctor/*` routes
- [ ] Patient CANNOT access `/admin/*` routes
- [ ] Doctor CANNOT access `/patient/*` routes
- [ ] Doctor CANNOT access `/admin/add-staff`
- [ ] Non-admin CANNOT access `/api/auth/add-staff` API
- [ ] Unauthorized users redirected to `/unauthorized`
- [ ] Unauthenticated users redirected to login

### 6. Token Persistence
- [ ] Login as any user
- [ ] Refresh page
- [ ] Verify still logged in
- [ ] Navigate to different pages
- [ ] Close and reopen browser
- [ ] Token should persist
- [ ] Logout clears localStorage

### 7. Error Handling
- [ ] Try registering with existing username → 409 error
- [ ] Try registering with existing email → 409 error
- [ ] Try login with wrong password → 401 error
- [ ] Try accessing protected route without token → 401 error
- [ ] Try accessing wrong role route → 403 error
- [ ] Try adding staff without admin role → 403 error

---

## Security Checklist

### Backend Security
- [ ] Passwords are hashed (never stored in plain text)
- [ ] JWT secret is strong and not default value
- [ ] JWT tokens expire (default 24h)
- [ ] All protected routes use `verifyToken` middleware
- [ ] Role-based routes use `authorizeRole` middleware
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (using Sequelize ORM)
- [ ] CORS configured properly

### Frontend Security
- [ ] API calls use Authorization header
- [ ] Token stored in localStorage (not cookies for this implementation)
- [ ] No sensitive data in localStorage except token
- [ ] ProtectedRoute prevents unauthorized access
- [ ] Role validation before showing UI elements
- [ ] Logout clears all auth data
- [ ] No API keys or secrets in frontend code

---

## Database Audit

After implementation, verify data integrity:

```sql
-- Check all users have roles
SELECT u.user_id, u.username, r.role_name 
FROM users u 
LEFT JOIN role r ON u.role_id = r.role_id;

-- Check all patients have profiles
SELECT u.user_id, u.username, p.patient_id, p.first_name, p.last_name
FROM users u
JOIN role r ON u.role_id = r.role_id
LEFT JOIN patient p ON u.user_id = p.user_id
WHERE r.role_name = 'Patient';

-- Check all doctors have profiles and admin_id
SELECT u.user_id, u.username, d.doctor_id, d.specialization, d.admin_id,
       admin.username as created_by_admin
FROM users u
JOIN role r ON u.role_id = r.role_id
LEFT JOIN doctor d ON u.user_id = d.user_id
LEFT JOIN users admin ON d.admin_id = admin.user_id
WHERE r.role_name = 'Doctor';

-- Check all receptionists have profiles
SELECT u.user_id, u.username, rec.receptionist_id, rec.shift
FROM users u
JOIN role r ON u.role_id = r.role_id
LEFT JOIN receptionist rec ON u.user_id = rec.user_id
WHERE r.role_name = 'Receptionist';
```

---

## Performance Checklist

- [ ] Database indexes on foreign keys
- [ ] JWT verification doesn't query database unnecessarily
- [ ] Role checks use in-memory JWT data
- [ ] Frontend caches user data in AuthContext
- [ ] No unnecessary re-renders in ProtectedRoute
- [ ] API responses are optimized

---

## Documentation Checklist

- [ ] Team members know how to use `/register-patient`
- [ ] Admin knows how to use `/admin/add-staff`
- [ ] Developers understand middleware usage
- [ ] Frontend developers know how to use ProtectedRoute
- [ ] API documentation updated with new endpoints
- [ ] Database schema documented with admin_id field

---

## Production Deployment Checklist

### Environment Variables
- [ ] Change `JWT_SECRET` to strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database credentials
- [ ] Set appropriate `JWT_EXPIRES_IN` value
- [ ] Configure CORS for production domain

### Security Hardening
- [ ] HTTPS enabled
- [ ] Rate limiting on auth endpoints
- [ ] Password strength requirements enforced
- [ ] Brute force protection on login
- [ ] XSS protection headers
- [ ] CSRF protection (if using cookies)

### Monitoring
- [ ] Log failed login attempts
- [ ] Log unauthorized access attempts
- [ ] Monitor token expiration issues
- [ ] Track admin actions (adding staff)
- [ ] Error tracking configured

### Backup
- [ ] Database backup before deployment
- [ ] Rollback plan prepared
- [ ] Test restoration procedure

---

## Troubleshooting Guide

### Issue: "admin_id is NULL in doctor table"
**Solution:**
1. Ensure migration script ran successfully
2. Check that `addStaff` controller is setting `admin_id`
3. Verify admin user is authenticated when creating doctor

### Issue: "403 Forbidden when accessing admin routes"
**Solution:**
1. Verify user is logged in as Admin
2. Check JWT token includes correct role_name
3. Ensure token is sent in Authorization header
4. Verify middleware is checking role correctly

### Issue: "Token not persisting after refresh"
**Solution:**
1. Check AuthContext reads from localStorage on mount
2. Verify localStorage.setItem is called after login
3. Check browser's localStorage in DevTools
4. Ensure token verification endpoint works

### Issue: "Cannot register patient"
**Solution:**
1. Verify Patient role exists in database
2. Check endpoint is `/register-patient` not `/register`
3. Ensure all required fields are provided
4. Check backend logs for errors

### Issue: "Routes not protected"
**Solution:**
1. Ensure component is wrapped in `<ProtectedRoute>`
2. Check `allowedRoles` prop is set correctly
3. Verify user object has `role` property
4. Check ProtectedRoute component is imported

---

## Success Criteria

✅ Patients can self-register through public endpoint
✅ Admin can create Doctor accounts
✅ Admin can create Receptionist accounts
✅ Doctor's admin_id is tracked
✅ Each role can only access their designated routes
✅ JWT includes role_name
✅ Middleware protects backend routes
✅ ProtectedRoute protects frontend routes
✅ Auth persists across page refreshes
✅ No security vulnerabilities
✅ All tests pass

---

## Next Steps (Optional Enhancements)

- [ ] Implement password reset functionality
- [ ] Add email verification for new accounts
- [ ] Implement refresh tokens
- [ ] Add 2FA for admin accounts
- [ ] Create audit log for admin actions
- [ ] Implement account deactivation
- [ ] Add profile update endpoints
- [ ] Create admin dashboard to view all users
- [ ] Implement bulk user import
- [ ] Add role management (add/edit roles)

---

## Sign-off

- [ ] Development complete
- [ ] All tests passed
- [ ] Documentation reviewed
- [ ] Security audit passed
- [ ] Database migration successful
- [ ] Ready for production deployment

**Deployed by:** _________________
**Date:** _________________
**Version:** _________________

---

## Contact

For issues or questions:
- Review `RBAC_IMPLEMENTATION_GUIDE.md`
- Check `RBAC_QUICK_REFERENCE.md`
- Examine example code in `backend/examples/`
