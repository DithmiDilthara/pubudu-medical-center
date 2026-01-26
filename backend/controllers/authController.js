import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { User, Role, Patient, Doctor, Receptionist, Admin, Token } from '../models/index.js';

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
// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Create token record in DB
    await Token.create({
      user_id: user.user_id,
      token: tokenHash,
      expires_at: new Date(Date.now() + 3600000) // 1 hour expiration
    });

    // Send Actual Email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"Pubudu Medical Center" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; borderRadius: 8px;">
          <h2 style="color: #0056b3; text-align: center;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You requested a password reset for your account at Pubudu Medical Center. Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #0056b3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666; text-align: center;">Pubudu Medical Center © 2026</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✓ Reset email sent to ${email}`);
    } catch (mailError) {
      console.error('Email sending failed:', mailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide token and new password' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find valid token
    const tokenRecord = await Token.findOne({ where: { token: tokenHash } });

    if (!tokenRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Check expiration
    if (new Date() > tokenRecord.expires_at) {
      await tokenRecord.destroy(); // Cleanup expired
      return res.status(400).json({ success: false, message: 'Token expired' });
    }

    // Determine User
    const user = await User.findByPk(tokenRecord.user_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update Password (hashed by hook)
    user.password_hash = newPassword;
    await user.save();

    // Delete used token (and potentially all other tokens for this user for security)
    await Token.destroy({ where: { user_id: user.user_id } });

    res.status(200).json({ success: true, message: 'Password reset successful. You can now login.' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get all reset tokens (Admin Debug)
// @route   GET /api/auth/tokens
// @access  Private (Admin)
export const getTokens = async (req, res) => {
  try {
    const tokens = await Token.findAll({
      include: [{ model: User, as: 'user', attributes: ['username', 'email'] }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ success: true, data: tokens });
  } catch (error) {
    console.error('Get tokens error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

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
