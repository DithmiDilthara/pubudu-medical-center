# 🚀 Quick Start Guide

## Authentication System Implementation Complete!

Your medical center application now has a fully functional authentication system.

---

## 📋 What Was Implemented

### Backend ✅
- ✅ Sequelize models for all database tables
- ✅ User authentication with JWT
- ✅ Password hashing with bcrypt
- ✅ Login/Register API endpoints
- ✅ Role-based access control middleware
- ✅ Input validation and sanitization
- ✅ Database seeder script

### Frontend ✅
- ✅ Updated Login page with API integration
- ✅ Updated Patient Registration page
- ✅ AuthContext for state management
- ✅ Role-based route redirection
- ✅ Form validation and error handling

---

## 🎯 Getting Started (3 Steps)

### Step 1: Seed the Database
Open terminal in the project root:

```powershell
cd backend
npm run seed
```

This creates:
- 4 roles (Admin, Doctor, Receptionist, Patient)
- Default admin user (username: `admin`, password: `admin123`)

### Step 2: Start the Backend Server
```powershell
cd backend
npm run dev
```

Server will run on: **http://localhost:3000**

### Step 3: Start the Frontend
Open a new terminal:

```powershell
cd frontend
npm run dev
```

App will run on: **http://localhost:5173**

---

## 🧪 Test the System

### Test Login
1. Go to **http://localhost:5173**
2. Login with:
   - **Username:** `admin`
   - **Password:** `admin123`
   - **Role:** Admin
3. You'll be redirected to `/admin/dashboard`

### Test Patient Registration
1. Go to **http://localhost:5173/register**
2. Fill in the registration form
3. After successful registration, you'll auto-login
4. You'll be redirected to `/patient/dashboard`

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new patient | No |
| POST | `/api/auth/login` | Login (all roles) | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/logout` | Logout | Yes |

---

## 👥 User Roles

| Role ID | Role Name | Access Level |
|---------|-----------|--------------|
| 1 | Admin | Full system access |
| 2 | Doctor | Medical staff |
| 3 | Receptionist | Front desk |
| 4 | Patient | End users |

---

## 🗂️ File Structure

```
backend/
├── config/
│   ├── .env                    # Environment variables
│   └── database.js             # Sequelize configuration
├── controllers/
│   └── authController.js       # Authentication logic
├── middleware/
│   ├── authMiddleware.js       # JWT verification
│   └── roleMiddleware.js       # Role-based access
├── models/
│   ├── index.js                # Model associations
│   ├── Role.js                 # Role model
│   ├── User.js                 # User model
│   ├── Admin.js                # Admin model
│   ├── Patient.js              # Patient model
│   ├── Doctor.js               # Doctor model
│   └── Receptionist.js         # Receptionist model
├── routes/
│   └── authRoutes.js           # Auth API routes
├── utils/
│   └── validators.js           # Input validators
├── index.js                    # Server entry
└── seed.js                     # Database seeder

frontend/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx     # Auth state management
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   └── PatientRegistration.jsx  # Registration page
│   └── components/             # Headers & Sidebars
```

---

## 🔐 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ Protected API routes
- ✅ Input validation (client & server)
- ✅ NIC format validation
- ✅ Email validation
- ✅ XSS prevention
- ✅ SQL injection prevention (Sequelize)

---

## ⚙️ Environment Variables

Your `.env` file is already configured:

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

---

## 🎨 Features

### Login Page
- Multi-role selection (Admin, Doctor, Receptionist, Patient)
- Real-time form validation
- Error messages
- Role-based redirection

### Registration Page
- Full patient registration form
- NIC validation (supports old & new format)
- Email validation (optional)
- Phone validation (optional)
- Password confirmation
- Terms and conditions
- Auto-login after registration

---

## 🐛 Troubleshooting

### Database Connection Error
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database `pubudud_echanneling_database` exists

### CORS Errors
- Ensure backend is running on port 3000
- Check CORS is enabled in backend

### Login Not Working
- Run the seed script first: `npm run seed`
- Clear browser localStorage
- Check console for errors

### Token Errors
- Clear localStorage in browser DevTools
- Re-login
- Check JWT_SECRET is set in `.env`

---

## 📚 Additional Documentation

- **Full Guide:** [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md)
- **Summary:** [AUTHENTICATION_SUMMARY.md](AUTHENTICATION_SUMMARY.md)

---

## ✅ Checklist

Before testing, make sure you've done:
- [x] Backend models created
- [x] Controllers implemented
- [x] Middleware added
- [x] Routes configured
- [x] Frontend updated
- [ ] **Database seeded** ← Do this now!
- [ ] **Backend running** ← Start server
- [ ] **Frontend running** ← Start app
- [ ] **Test login** ← Try admin login
- [ ] **Test registration** ← Create patient account

---

## 🎉 You're Ready!

Everything is set up. Just run the three commands:

1. `cd backend && npm run seed`
2. `cd backend && npm run dev`
3. `cd frontend && npm run dev` (in new terminal)

Then open **http://localhost:5173** and start testing!

---

**Need Help?** Check the error messages in:
- Backend terminal (for API errors)
- Browser console (for frontend errors)
- MySQL logs (for database errors)
