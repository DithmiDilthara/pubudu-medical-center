# Authentication System Setup Guide

## Backend Setup

### 1. Database Schema
Your MySQL database has been set up with the following tables:
- `role` - User roles (Admin, Doctor, Receptionist, Patient)
- `users` - Main user authentication table
- `admin`, `patient`, `doctor`, `receptionist` - Role-specific data tables

### 2. Seed the Database
Run this command to populate initial roles and create an admin user:
```bash
cd backend
node seed.js
```

This will create:
- 4 roles (Admin, Doctor, Receptionist, Patient)
- Default admin account:
  - Username: `admin`
  - Password: `admin123`

### 3. Start the Backend Server
```bash
cd backend
npm run dev
```

The server will run on `http://localhost:3000`

### 4. API Endpoints

**Public Routes:**
- `POST /api/auth/register` - Patient registration
- `POST /api/auth/login` - Login for all roles

**Protected Routes (require authentication):**
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

## Frontend Setup

### 1. Start the Frontend
```bash
cd frontend
npm run dev
```

The app will run on `http://localhost:5173`

### 2. Features Implemented

**Login Page (`/`)**
- Multi-role login (Admin, Doctor, Receptionist, Patient)
- Form validation
- Error handling
- Automatic redirection based on role

**Patient Registration (`/register`)**
- Complete registration form
- Field validation (NIC, email, phone)
- Password strength requirements
- Automatic login after registration

**Authentication Flow:**
1. User logs in → JWT token generated
2. Token stored in localStorage
3. Token included in all API requests
4. Auto-redirect to role-specific dashboard

## Testing the System

### Test Accounts

**Admin:**
- Username: `admin`
- Password: `admin123`
- Redirects to: `/admin/dashboard`

**Patient (Register New):**
1. Go to `/register`
2. Fill in the registration form
3. Auto-login after registration
4. Redirects to: `/patient/dashboard`

## Role-Based Access Control

The system supports 4 roles:
- **Admin (role_id: 1)** - Full system access
- **Doctor (role_id: 2)** - Medical staff
- **Receptionist (role_id: 3)** - Front desk staff
- **Patient (role_id: 4)** - End users

## Security Features

1. **Password Hashing** - Passwords encrypted with bcrypt
2. **JWT Authentication** - Secure token-based auth
3. **Input Validation** - Server and client-side validation
4. **Protected Routes** - Middleware-based access control
5. **XSS Prevention** - Input sanitization

## File Structure

```
backend/
├── config/
│   ├── .env                 # Environment variables
│   └── database.js          # Sequelize connection
├── controllers/
│   └── authController.js    # Authentication logic
├── middleware/
│   ├── authMiddleware.js    # JWT verification
│   └── roleMiddleware.js    # Role-based access
├── models/
│   ├── index.js             # Model associations
│   ├── Role.js
│   ├── User.js
│   ├── Admin.js
│   ├── Patient.js
│   ├── Doctor.js
│   └── Receptionist.js
├── routes/
│   └── authRoutes.js        # Auth API routes
├── utils/
│   └── validators.js        # Validation helpers
├── index.js                 # Server entry point
└── seed.js                  # Database seeder

frontend/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx  # Auth state management
│   ├── pages/
│   │   ├── Login.jsx        # Login page
│   │   └── PatientRegistration.jsx  # Registration
│   └── components/          # Header/Sidebar components
```

## Next Steps

1. **Run the seed script** to populate the database
2. **Start backend and frontend servers**
3. **Test login** with admin credentials
4. **Test patient registration**
5. **Implement doctor/receptionist management** (admin features)
6. **Add more features** as needed

## Environment Variables

Make sure your `.env` file has these values:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Dithmi12345
DB_NAME=pubudud_echanneling_database
DB_PORT=3307

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

PORT=3000
NODE_ENV=development
```

## Common Issues

**Database Connection Error:**
- Check MySQL is running
- Verify database credentials in `.env`
- Ensure database exists

**Token Errors:**
- Clear browser localStorage
- Re-login
- Check JWT_SECRET is set

**CORS Errors:**
- Ensure backend is running
- Check CORS is enabled in `index.js`
