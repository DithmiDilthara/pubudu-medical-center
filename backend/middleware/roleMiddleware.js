// Role-based access control middleware

// Role IDs from database
const ROLES = {
  ADMIN: 1,
  DOCTOR: 2,
  RECEPTIONIST: 3,
  PATIENT: 4,
  SUPER_ADMIN: 5
};

// Check if user has required role
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Convert role names to role IDs if strings are passed
    const roleIds = roles.map(role => {
      if (typeof role === 'string') {
        return ROLES[role.toUpperCase()];
      }
      return role;
    });

    if (!roleIds.includes(req.user.role_id)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Alias for authorizeRoles
export const authorizeRole = authorizeRoles;

// Specific role middlewares for convenience
export const isAdmin = authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN);
export const isSuperAdmin = authorizeRoles(ROLES.SUPER_ADMIN);
export const isDoctor = authorizeRoles(ROLES.DOCTOR);
export const isReceptionist = authorizeRoles(ROLES.RECEPTIONIST);
export const isPatient = authorizeRoles(ROLES.PATIENT);

// Combined role checks
export const isAdminOrDoctor = authorizeRoles(ROLES.ADMIN, ROLES.DOCTOR, ROLES.SUPER_ADMIN);
export const isAdminOrReceptionist = authorizeRoles(ROLES.ADMIN, ROLES.RECEPTIONIST, ROLES.SUPER_ADMIN);
export const isStaff = authorizeRoles(ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.SUPER_ADMIN);

export { ROLES };
