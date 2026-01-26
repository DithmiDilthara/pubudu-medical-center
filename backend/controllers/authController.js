import jwt from 'jsonwebtoken';
import { User, Role, Patient, Doctor, Receptionist, Admin } from '../models/index.js';

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      user_id: user.user_id, 
      username: user.username,
      role_id: user.role_id 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Get user profile with role-specific data
const getUserProfile = async (userId, roleId) => {
  const user = await User.findByPk(userId, {
    attributes: ['user_id', 'username', 'email', 'contact_number', 'role_id'],
    include: [
      {
        model: Role,
        as: 'role',
        attributes: ['role_name']
      }
    ]
  });

  if (!user) return null;

  const userData = user.toJSON();

  // Fetch role-specific data based on role_id
  switch (roleId) {
    case 1: // Admin
      const admin = await Admin.findOne({ where: { user_id: userId } });
      userData.profile = admin;
      break;
    case 2: // Doctor
      const doctor = await Doctor.findOne({ where: { user_id: userId } });
      userData.profile = doctor;
      break;
    case 3: // Receptionist
      const receptionist = await Receptionist.findOne({ where: { user_id: userId } });
      userData.profile = receptionist;
      break;
    case 4: // Patient
      const patient = await Patient.findOne({ where: { user_id: userId } });
      userData.profile = patient;
      break;
  }

  return userData;
};

// @desc    Register a new patient
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const {
      username,
      password,
      email,
      contact_number,
      full_name,
      nic,
      gender,
      date_of_birth,
      address
    } = req.body;

    // Validation
    if (!username || !password || !full_name || !nic) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Check if NIC already exists
    const existingNIC = await Patient.findOne({ where: { nic } });
    if (existingNIC) {
      return res.status(400).json({
        success: false,
        message: 'NIC already registered'
      });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
    }

    // Create user (password will be hashed by the model hook)
    const user = await User.create({
      username,
      password_hash: password,
      email,
      contact_number,
      role_id: 4 // Patient role
    });

    // Create patient record
    await Patient.create({
      user_id: user.user_id,
      full_name,
      nic,
      gender,
      date_of_birth,
      address
    });

    // Generate token
    const token = generateToken(user);

    // Get full user profile
    const userProfile = await getUserProfile(user.user_id, user.role_id);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: {
        user: userProfile,
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Find user
    const user = await User.findOne({ 
      where: { username },
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
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user);

    // Get full user profile
    const userProfile = await getUserProfile(user.user_id, user.role_id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userProfile,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const userProfile = await getUserProfile(req.user.user_id, req.user.role_id);

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: userProfile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { email, contact_number, full_name, address, gender, date_of_birth } = req.body;
    const userId = req.user.user_id;
    const roleId = req.user.role_id;

    // Update user table
    const updateData = {};
    if (email !== undefined) updateData.email = email;
    if (contact_number !== undefined) updateData.contact_number = contact_number;

    if (Object.keys(updateData).length > 0) {
      await User.update(updateData, { where: { user_id: userId } });
    }

    // Update role-specific table
    const profileUpdateData = {};
    if (full_name !== undefined) profileUpdateData.full_name = full_name;
    if (address !== undefined) profileUpdateData.address = address;
    if (gender !== undefined) profileUpdateData.gender = gender;
    if (date_of_birth !== undefined) profileUpdateData.date_of_birth = date_of_birth;

    if (Object.keys(profileUpdateData).length > 0) {
      switch (roleId) {
        case 4: // Patient
          await Patient.update(profileUpdateData, { where: { user_id: userId } });
          break;
        case 3: // Receptionist
          if (full_name !== undefined) {
            await Receptionist.update({ full_name }, { where: { user_id: userId } });
          }
          break;
        case 2: // Doctor
          if (full_name !== undefined) {
            await Doctor.update({ full_name }, { where: { user_id: userId } });
          }
          break;
      }
    }

    // Get updated profile
    const userProfile = await getUserProfile(userId, roleId);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: userProfile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.user_id;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password (will be hashed by model hook)
    user.password_hash = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // You could implement token blacklisting here if needed
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
