# RBAC System Flow Diagrams

## 1. Patient Self-Registration Flow

```
┌─────────────────┐
│  Patient Visit  │
│  /register      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Fill Registration Form          │
│ - Username                      │
│ - Email                         │
│ - Password                      │
│ - Personal Info                 │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ POST /api/auth/register-patient │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Backend: registerPatient()      │
│ 1. Validate input               │
│ 2. Check username/email unique  │
│ 3. Get Patient role_id          │
│ 4. Hash password                │
│ 5. Create users record          │
│ 6. Create patient record        │
│ 7. Generate JWT (with role)     │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Response:                       │
│ - user: { role: "Patient" }     │
│ - token: "eyJhbGci..."          │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Frontend:                       │
│ 1. Store token in localStorage  │
│ 2. Store user in localStorage   │
│ 3. Update AuthContext state     │
│ 4. Redirect to /patient/dash... │
└─────────────────────────────────┘
```

---

## 2. Admin Adding Staff Flow

```
┌─────────────────┐
│  Admin Login    │
│  Has JWT Token  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Navigate to /admin/add-staff    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ ProtectedRoute Checks:          │
│ - Is authenticated?             │
│ - Has 'Admin' role?             │
└────────┬────────────────────────┘
         │ ✅ Allowed
         ▼
┌─────────────────────────────────┐
│ Select Staff Type:              │
│ [ ] Doctor                      │
│ [✓] Receptionist                │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Fill Staff Form:                │
│ - Username                      │
│ - Email                         │
│ - Temp Password                 │
│ - Role-specific fields          │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ POST /api/auth/add-staff        │
│ Headers:                        │
│   Authorization: Bearer {token} │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Backend Middleware:             │
│ 1. verifyToken()                │
│    - Extract token              │
│    - Verify JWT                 │
│    - Attach user to req.user    │
│ 2. authorizeRole(['Admin'])     │
│    - Check req.user.role_name   │
│    - Return 403 if not Admin    │
└────────┬────────────────────────┘
         │ ✅ Authorized
         ▼
┌─────────────────────────────────┐
│ Backend: addStaff()             │
│ 1. Get admin_id from req.user   │
│ 2. Validate input               │
│ 3. Check role is Doctor/Recep.  │
│ 4. Hash password                │
│ 5. Create users record          │
│ 6. Create profile record        │
│    - For Doctor: set admin_id   │
│ 7. Return success               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Response:                       │
│ - user: { role: "Doctor" }      │
│ - profile: { admin_id: 1 }      │
│ - created_by: 1                 │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Frontend:                       │
│ - Show success message          │
│ - Clear form                    │
│ - Admin can add another         │
└─────────────────────────────────┘
```

---

## 3. Login Flow (All Roles)

```
┌─────────────────┐
│  User Visit     │
│  / (Login Page) │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Enter Credentials:              │
│ - Username                      │
│ - Password                      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ POST /api/auth/login            │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Backend: login()                │
│ 1. Find user by username        │
│ 2. Include role info (JOIN)     │
│ 3. Check is_active              │
│ 4. Verify password (bcrypt)     │
│ 5. Update last_login            │
│ 6. Generate JWT:                │
│    - user_id                    │
│    - username                   │
│    - role_id                    │
│    - role_name ← IMPORTANT      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Response:                       │
│ - user: {                       │
│     user_id: 1,                 │
│     username: "john",           │
│     role: "Patient"             │
│   }                             │
│ - token: "eyJ..."               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Frontend:                       │
│ 1. Store token                  │
│ 2. Store user                   │
│ 3. Update AuthContext           │
│ 4. Redirect based on role:      │
│    - Patient → /patient/dash... │
│    - Doctor → /doctor/dash...   │
│    - Receptionist → /recep...   │
│    - Admin → /admin/dash...     │
└─────────────────────────────────┘
```

---

## 4. Protected Route Access Flow

```
┌─────────────────────────────────┐
│ User tries to access            │
│ /doctor/dashboard               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ ProtectedRoute Component        │
│ Props: allowedRoles=['Doctor']  │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Check 1: Loading?               │
│ - Show loading spinner          │
└────────┬────────────────────────┘
         │ ❌ Not loading
         ▼
┌─────────────────────────────────┐
│ Check 2: Authenticated?         │
│ - Check token exists            │
│ - Check user exists             │
└────────┬────────────────────────┘
         │
         ├─ ❌ Not authenticated
         │  └─→ Redirect to /login
         │
         └─ ✅ Authenticated
            ▼
┌─────────────────────────────────┐
│ Check 3: Has Required Role?     │
│ - user.role in allowedRoles?    │
└────────┬────────────────────────┘
         │
         ├─ ❌ Wrong role
         │  └─→ Redirect to /unauthorized
         │
         └─ ✅ Correct role
            ▼
┌─────────────────────────────────┐
│ Render Component                │
│ <DoctorDashboard />             │
└─────────────────────────────────┘
```

---

## 5. Backend API Protection Flow

```
┌─────────────────────────────────┐
│ Frontend API Call               │
│ GET /api/doctors                │
│ Headers:                        │
│   Authorization: Bearer {token} │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Middleware 1: verifyToken()     │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ 1. Extract token from header    │
│ 2. Verify JWT signature         │
│ 3. Check token not expired      │
└────────┬────────────────────────┘
         │
         ├─ ❌ Invalid/Expired
         │  └─→ Return 401 Unauthorized
         │
         └─ ✅ Valid
            ▼
┌─────────────────────────────────┐
│ 4. Decode JWT payload           │
│ 5. Fetch user from database     │
│ 6. Attach to req.user:          │
│    {                            │
│      user_id: 1,                │
│      username: "admin1",        │
│      role_name: "Admin"         │
│    }                            │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Middleware 2: authorizeRole()   │
│ allowedRoles: ['Admin', 'Recep']│
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Check: req.user.role_name in    │
│        allowedRoles?            │
└────────┬────────────────────────┘
         │
         ├─ ❌ Not allowed
         │  └─→ Return 403 Forbidden
         │
         └─ ✅ Allowed
            ▼
┌─────────────────────────────────┐
│ Execute Controller              │
│ - Access req.user if needed     │
│ - Process request               │
│ - Return response               │
└─────────────────────────────────┘
```

---

## 6. Database Relationships

```
┌──────────────────────┐
│       role           │
├──────────────────────┤
│ PK: role_id          │
│     role_name        │
│     (Admin, Doctor,  │
│      Patient, Recep) │
└──────────┬───────────┘
           │
           │ 1:N
           │
┌──────────▼───────────┐
│       users          │
├──────────────────────┤
│ PK: user_id          │
│     username         │
│     email            │
│     password_hash    │
│ FK: role_id          │◄────┐
│     is_active        │     │
│     last_login       │     │
└──────────┬───────────┘     │
           │                 │
           │ 1:1             │
           │                 │
     ┌─────┴────────┬────────┴────────┬──────────┐
     │              │                 │          │
┌────▼─────┐  ┌────▼─────┐  ┌────────▼──┐  ┌────▼────┐
│ patient  │  │  doctor  │  │receptionist│  │  admin  │
├──────────┤  ├──────────┤  ├───────────┤  │  (none) │
│PK:pat_id │  │PK:doc_id │  │PK: rec_id │  └─────────┘
│FK:user_id│  │FK:user_id│  │FK:user_id │
│first_name│  │first_name│  │first_name │
│last_name │  │last_name │  │last_name  │
│dob       │  │specialty │  │shift      │
│gender    │  │qualify.  │  └───────────┘
│address   │  │exp_years │
│blood_grp │  │consult.$ │
└──────────┘  │FK:admin_id├──────────────┐
              └──────────┘              │
                                        │
                           References users table
                           (Tracks which admin
                            created this doctor)
```

---

## 7. JWT Token Structure

```
┌──────────────────────────────────────────────┐
│              JWT TOKEN                       │
├──────────────────────────────────────────────┤
│                                              │
│  HEADER                                      │
│  {                                           │
│    "alg": "HS256",                           │
│    "typ": "JWT"                              │
│  }                                           │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  PAYLOAD                                     │
│  {                                           │
│    "user_id": 1,                             │
│    "username": "john_doe",                   │
│    "role_id": 4,                             │
│    "role_name": "Patient",  ← IMPORTANT!     │
│    "iat": 1234567890,       (issued at)      │
│    "exp": 1234654290        (expires)        │
│  }                                           │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  SIGNATURE                                   │
│  HMACSHA256(                                 │
│    base64UrlEncode(header) + "." +           │
│    base64UrlEncode(payload),                 │
│    JWT_SECRET                                │
│  )                                           │
│                                              │
└──────────────────────────────────────────────┘

Used for:
✓ Authentication (verifyToken middleware)
✓ Authorization (authorizeRole middleware)
✓ Frontend role-based routing
✓ Identifying user without database query
```

---

## 8. localStorage Structure

```
┌──────────────────────────────────────────────┐
│         Browser localStorage                 │
├──────────────────────────────────────────────┤
│                                              │
│  Key: "token"                                │
│  Value: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."   │
│         (Full JWT token string)              │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  Key: "user"                                 │
│  Value: {                                    │
│    "user_id": 1,                             │
│    "username": "john_doe",                   │
│    "email": "john@email.com",                │
│    "role": "Patient"        ← Used by UI     │
│  }                                           │
│  (JSON string)                               │
│                                              │
└──────────────────────────────────────────────┘

Managed by:
- AuthContext on login/register
- Cleared on logout
- Read on app initialization
- Persists across page refreshes
```

---

## 9. File Structure Overview

```
medical-center/
│
├── backend/
│   ├── controllers/
│   │   └── authController.js
│   │       ├── register()        (legacy)
│   │       ├── registerPatient() ← NEW
│   │       ├── addStaff()        ← NEW
│   │       ├── login()           (returns role_name)
│   │       └── getProfile()
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │       ├── verifyToken()
│   │       └── authorizeRole()   ← RBAC
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Role.js
│   │   ├── Patient.js
│   │   ├── Doctor.js            (+ admin_id)
│   │   └── Receptionist.js
│   │
│   ├── routes/
│   │   └── authRoutes.js
│   │       ├── POST /register-patient  ← NEW
│   │       └── POST /add-staff         ← NEW
│   │
│   └── database/
│       └── add_admin_id_to_doctor.sql  ← NEW
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   │       ├── registerPatient()   ← NEW
    │   │       ├── addStaff()          ← NEW
    │   │       ├── login()
    │   │       └── hasRole()
    │   │
    │   ├── components/
    │   │   └── ProtectedRoute.jsx
    │   │       └── Role-based routing
    │   │
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   └── AddStaff.jsx        ← NEW
    │   │   ├── doctor/
    │   │   │   └── DoctorDashboard.jsx
    │   │   ├── patient/
    │   │   │   └── PatientDashboard.jsx
    │   │   └── receptionist/
    │   │       └── ReceptionistDashboard.jsx
    │   │
    │   └── App.jsx
    │       └── Role-based route config
    │
    └── .env
        └── VITE_API_URL
```

---

## Key Concepts

### 1. Dual Registration
- **Public:** Anyone can register as Patient
- **Admin-Controlled:** Only Admin can create Doctor/Receptionist

### 2. Role-Based Access Control (RBAC)
- **Backend:** Middleware checks JWT role_name
- **Frontend:** ProtectedRoute checks user.role

### 3. Admin Tracking
- When Admin creates Doctor, their user_id is stored in doctor.admin_id
- Provides audit trail of who created which doctors

### 4. JWT with Roles
- JWT payload includes role_name
- No database query needed for role checks
- Used by both frontend and backend

### 5. Persistence
- Token and user stored in localStorage
- Auth state restored on page refresh
- Cleared on logout
```
