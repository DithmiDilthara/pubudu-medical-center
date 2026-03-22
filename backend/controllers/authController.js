import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { User, Role, Patient, Doctor, Receptionist, Admin, Token } from '../models/index.js';
import sequelize from '../config/database.js';

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      user_id: user.user_id,
      username: user.username,
      role_id: user.role_id,
      role_name: user.role ? user.role.role_name : undefined
    },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key',
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
        attributes: ['role_id', 'role_name']
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

// @desc    Register a new user (Legacy/Generic)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { username, password, email, role_name } = req.body;
    
    // Default to Patient if no role provided
    const requestedRole = role_name || 'Patient';
    
    // Redirect based on role if needed, or handle generically
    if (requestedRole === 'Patient') {
        return registerPatient(req, res);
    }
    
    return res.status(400).json({ success: false, message: 'General registration restricted to patients. Please use appropriate endpoints for staff.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const user = await User.findOne({
      where: { username },
      include: [{
        model: Role,
        as: 'role',
        attributes: ['role_id', 'role_name']
      }]
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    if (!user.is_active) {
      return res.status(401).json({ success: false, message: 'Your account has been deactivated.' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    await user.update({ last_login: new Date() });
    const token = generateToken(user);
    const userProfile = await getUserProfile(user.user_id, user.role_id);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: { user: userProfile, token }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Get current user profile
export const getProfile = async (req, res) => {
  try {
    const userProfile = await getUserProfile(req.user.user_id, req.user.role_id);
    if (!userProfile) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: userProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { email, contact_number, full_name, address, gender, date_of_birth } = req.body;
    const userId = req.user.user_id;
    const roleId = req.user.role_id;

    const updateData = {};
    if (email !== undefined) updateData.email = email;
    const targetPhone = contact_number || req.body.phone;
    if (targetPhone !== undefined) updateData.contact_number = targetPhone;

    if (Object.keys(updateData).length > 0) {
      await User.update(updateData, { where: { user_id: userId } });
    }

    const profileUpdateData = { full_name, address, gender, date_of_birth };
    
    if (date_of_birth) {
        const dob = new Date(date_of_birth);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dob > today) {
            return res.status(400).json({
                success: false,
                message: 'Date of birth cannot be in the future'
            });
        }
    }

    // Filter undefined
    Object.keys(profileUpdateData).forEach(key => profileUpdateData[key] === undefined && delete profileUpdateData[key]);

    if (Object.keys(profileUpdateData).length > 0) {
      switch (roleId) {
        case 4: await Patient.update(profileUpdateData, { where: { user_id: userId } }); break;
        case 3: await Receptionist.update(profileUpdateData, { where: { user_id: userId } }); break;
        case 2: await Doctor.update(profileUpdateData, { where: { user_id: userId } }); break;
      }
    }

    const userProfile = await getUserProfile(userId, roleId);
    res.status(200).json({ success: true, message: 'Profile updated successfully', data: userProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.user_id);
    
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.password_hash = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    await Token.create({
      user_id: user.user_id,
      token: tokenHash,
      expires_at: new Date(Date.now() + 3600000)
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await transporter.sendMail({
      from: `"Pubudu Medical Center" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    });

    res.status(200).json({ success: true, message: 'Reset link sent to email' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokenRecord = await Token.findOne({ where: { token: tokenHash } });

    if (!tokenRecord || new Date() > tokenRecord.expires_at) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = await User.findByPk(tokenRecord.user_id);
    user.password_hash = newPassword;
    await user.save();
    await tokenRecord.destroy();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Logout user
export const logout = async (req, res) => {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Register a new patient (Public)
export const registerPatient = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { username, email, password, full_name, nic, phone, contact_number, date_of_birth, gender, address, blood_group, allergies } = req.body;
        const targetPhone = phone || contact_number;

        if (!username || !email || !password) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Username, email, and password are required.' });
        }

        if (date_of_birth) {
            const dob = new Date(date_of_birth);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (dob > today) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Date of birth cannot be in the future' });
            }
        }

        const role = await Role.findOne({ where: { role_name: 'Patient' }, transaction });
        const newUser = await User.create({ username, email, password_hash: password, role_id: role.role_id, contact_number: targetPhone, is_active: true }, { transaction });
        await Patient.create({ user_id: newUser.user_id, full_name, nic, date_of_birth, gender, address, blood_group, allergies, registration_source: 'ONLINE' }, { transaction });

        await transaction.commit();
        res.status(201).json({ success: true, message: 'Patient registered successfully.', data: { user: { user_id: newUser.user_id, username, email, role: 'Patient' }, token: generateToken(newUser) } });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, message: 'An error occurred during registration.', error: error.message });
    }
};

// @desc    Admin add staff
export const addStaff = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { username, email, password, role_name, first_name, last_name, phone, specialization, qualification, experience_years, consultation_fee, bio, shift } = req.body;
        const admin_id = req.user.user_id;

        if (!['Doctor', 'Receptionist'].includes(role_name)) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const role = await Role.findOne({ where: { role_name }, transaction });
        const newUser = await User.create({ username, email, password_hash: password, role_id: role.role_id, contact_number: phone, is_active: true }, { transaction });

        if (role_name === 'Doctor') {
            await Doctor.create({ user_id: newUser.user_id, first_name, last_name, phone, specialization, qualification, experience_years, consultation_fee, bio, is_available: true, admin_id }, { transaction });
        } else {
            await Receptionist.create({ user_id: newUser.user_id, first_name, last_name, phone, shift }, { transaction });
        }

        await transaction.commit();
        res.status(201).json({ success: true, message: `${role_name} account created success.`, data: { user: { user_id: newUser.user_id, username, email, role: role_name } } });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, message: 'An error occurred.', error: error.message });
    }
};

// @desc    Get all tokens (Admin)
export const getTokens = async (req, res) => {
  try {
    const tokens = await Token.findAll({ include: [{ model: User, as: 'user', attributes: ['username', 'email'] }] });
    res.status(200).json({ success: true, data: tokens });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Verify token
export const verifyAuth = async (req, res) => {
  try {
    const userProfile = await getUserProfile(req.user.user_id, req.user.role_id);
    res.status(200).json({ success: true, data: { user: userProfile } });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

export default {
    register,
    registerPatient,
    addStaff,
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout,
    forgotPassword,
    resetPassword,
    getTokens,
    verifyAuth
};
