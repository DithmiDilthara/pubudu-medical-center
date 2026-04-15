import jwt from 'jsonwebtoken';
import { User, Role } from '../models/index.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findByPk(decoded.user_id, {
        attributes: ['user_id', 'username', 'email', 'role_id'],
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['role_name']
          }
        ]
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists'
        });
      }

      // Attach user to request
      req.user = user;
      next();

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
        error: error.message
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication',
      error: error.message
    });
  }
};

// Optional protect - verifies token if present, but allows guest access if absent
export const optionalProtect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.user_id, {
        attributes: ['user_id', 'username', 'email', 'role_id'],
        include: [{ model: Role, as: 'role', attributes: ['role_name'] }]
      });
      req.user = user || null;
      next();
    } catch (error) {
      req.user = null;
      next();
    }
  } catch (error) {
    req.user = null;
    next();
  }
};

// Verify user is authenticated (alias for protect)
// Verify user has any of the specified roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!roles.includes(req.user.role_id)) {
      return res.status(403).json({
        success: false,
        message: `Role ID ${req.user.role_id} is not authorized to access this resource`
      });
    }

    next();
  };
};

export const authenticate = protect;
export const verifyToken = protect;
