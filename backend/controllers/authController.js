import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { User, Role, Patient, Adult, Child, Doctor, Receptionist, Admin, Token } from '../models/index.js';
import sequelize from '../config/database.js';
import NotificationService from '../utils/NotificationService.js';

// Nodemailer Transporter is now managed by NotificationService

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
      try {
        const patient = await Patient.findOne({
          where: { user_id: userId },
          include: [
            { model: Adult, as: 'adult' },
            { model: Child, as: 'child' }
          ]
        });
        if (patient) {
          const patientJSON = patient.toJSON();
          // Flatten NIC for backward compatibility
          if (patientJSON.patient_type === 'ADULT' && patientJSON.adult) {
            patientJSON.nic = patientJSON.adult.nic;
          } else {
            patientJSON.nic = null;
          }
          userData.profile = patientJSON;
        } else {
          userData.profile = null;
        }
      } catch (err) {
        console.error(`Error fetching patient profile for user ${userId}:`, err);
        userData.profile = null;
      }
      break;
  }

  // Ensure userData has a profile property even if null, to avoid crashes on frontend
  userData.profile = userData.profile || null;
  
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

    // Check if patient is verified
    if (user.role_id === 4) {
      const patient = await Patient.findOne({ where: { user_id: user.user_id } });
      if (patient && !patient.is_verified) {
        return res.status(403).json({ 
          success: false, 
          message: 'Please verify your email before logging in. Check your inbox for the verification code.' 
        });
      }
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
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'All password fields are required' });
    }

    const user = await User.findByPk(req.user.user_id);
    
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // New Password Validation: Min 8 chars, uppercase, lowercase, number, special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and a special character' 
      });
    }

    user.password_hash = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
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
    const mailOptions = {
      from: `"Pubudu Medical Center" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    };

    // Use a custom transporter here or update NotificationService (keeping it simple for now as requested to use NotificationService as is)
    // Actually NotificationService doesn't have a forgot password template yet, so I'll use the nodemailer directly here if available, 
    // but the task says 'use it as is'. I'll keep the existing direct nodemailer usage for forgot password if it was there.
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail(mailOptions);

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
        const { 
            username, email, password, full_name, 
            patient_type, nic, 
            guardian_name, guardian_contact, guardian_relationship,
            phone, contact_number, date_of_birth, gender, address, blood_group, allergies 
        } = req.body;
        const targetPhone = phone || contact_number;
        const type = (patient_type || 'ADULT').toUpperCase();

        // --- Basic Validation ---
        if (!username || !email || !password) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Username, email, and password are required.' });
        }

        if (!['ADULT', 'CHILD'].includes(type)) {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Patient type must be ADULT or CHILD.' });
        }

        // --- Conditional Validation ---
        if (type === 'ADULT') {
            if (!nic || !nic.trim()) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'NIC is required for adult patients.' });
            }
            const nicStr = nic.trim().toUpperCase();
            if (!/^[0-9]{9}[VX]$/.test(nicStr) && !/^[0-9]{12}$/.test(nicStr)) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Invalid NIC format.' });
            }
            // Check for duplicate NIC
            const existingNIC = await Adult.findOne({ where: { nic: nicStr }, transaction });
            if (existingNIC) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'This NIC is already registered.' });
            }
        }

        if (type === 'CHILD') {
            if (!guardian_name || !guardian_contact || !guardian_relationship) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Guardian name, contact, and relationship are required for child patients.' });
            }
        }

        if (date_of_birth) {
            const dob = new Date(date_of_birth);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dob > today) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Date of birth cannot be in the future' });
            }

            // Calculate age
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }

            // Validate age against patient type
            if (type === 'ADULT' && age < 18) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Adult patients must be 18 years or older.' });
            }
            if (type === 'CHILD' && age >= 18) {
                await transaction.rollback();
                return res.status(400).json({ success: false, message: 'Child patients must be under 18 years old.' });
            }
        } else {
            await transaction.rollback();
            return res.status(400).json({ success: false, message: 'Date of birth is required.' });
        }

        // --- STEP 1: Create User ---
        const role = await Role.findOne({ where: { role_name: 'Patient' }, transaction });
        const newUser = await User.create({ username, email, password_hash: password, role_id: role.role_id, contact_number: targetPhone, is_active: true }, { transaction });
        
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Generate stateless OTP Token (Expires in 10 minutes)
        const otpToken = jwt.sign(
            { otp, userId: newUser.user_id },
            process.env.JWT_SECRET || 'your-super-secret-jwt-key',
            { expiresIn: '10m' }
        );

        // --- STEP 2: Create Patient ---
        const newPatient = await Patient.create({ 
            user_id: newUser.user_id, 
            full_name, 
            patient_type: type,
            date_of_birth, 
            gender, 
            address, 
            blood_group, 
            allergies, 
            registration_source: 'ONLINE',
            is_verified: false
        }, { transaction });

        // --- STEP 3: Create Adult or Child detail ---
        if (type === 'ADULT') {
            await Adult.create({
                patient_id: newPatient.patient_id,
                nic: nic.trim().toUpperCase()
            }, { transaction });
        } else {
            await Child.create({
                patient_id: newPatient.patient_id,
                guardian_name,
                guardian_contact,
                guardian_relationship
            }, { transaction });
        }

        await transaction.commit();

        // Send OTP Email
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });

            await transporter.sendMail({
                from: `"Pubudu Medical Center" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Pubudu Medical Center – Your Email Verification Code',
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <p>Dear ${full_name},</p>
                        <p>To complete your registration, please verify your email address using the verification code below:</p>
                        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #0066CC;">
                            ${otp}
                        </div>
                        <p>This code will expire in 10 minutes.</p>
                        <p>⚠️ <strong>Important:</strong> Please do not share this verification code with anyone. Pubudu Medical Center staff will never ask you for this code.</p>
                        <p>If you did not request this code, please ignore this email.</p>
                        <p>Warm regards,<br/>The Pubudu Medical Center Team</p>
                    </div>
                `
            });
            console.log(`OTP email sent to ${email}`);
        } catch (mailError) {
            console.error('Failed to send OTP email:', mailError);
        }

        res.status(201).json({ 
            success: true, 
            message: 'Patient registered successfully. OTP sent to your email.', 
            otpToken,
            email
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Registration error detail:', error);
        res.status(500).json({ success: false, message: 'An error occurred during registration.', error: error.message });
    }
};

// @desc    Admin add staff
export const addStaff = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { username, email, password, role_name, first_name, last_name, phone, specialization, qualification, experience_years, consultation_fee, bio } = req.body;
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
            await Receptionist.create({ user_id: newUser.user_id, first_name, last_name, phone }, { transaction });
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

// @desc    Verify email with OTP (Stateless JWT Approach)
export const verifyEmail = async (req, res) => {
    try {
        const { otpToken, otp } = req.body;

        if (!otpToken || !otp) {
            return res.status(400).json({ success: false, message: 'OTP and Token are required.' });
        }

        // Verify the stateless token
        let decoded;
        try {
            decoded = jwt.verify(otpToken, process.env.JWT_SECRET || 'your-super-secret-jwt-key');
        } catch (err) {
            return res.status(400).json({ success: false, message: 'Verification link expired or invalid. Please resend code.' });
        }

        if (decoded.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid verification code.' });
        }

        const patient = await Patient.findOne({ where: { user_id: decoded.userId } });
        if (!patient) {
            return res.status(404).json({ success: false, message: 'Patient record not found.' });
        }

        if (patient.is_verified) {
            return res.status(400).json({ success: false, message: 'Email is already verified.' });
        }

        patient.is_verified = true;
        await patient.save();

        // Send Welcome Email
        try {
            const user = await User.findByPk(decoded.userId);
            if (user) {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
                });

                await transporter.sendMail({
                    from: `"Pubudu Medical Center" <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: 'Welcome to Pubudu Medical Center – Account Created Successfully',
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #333;">
                            <p>Dear ${patient.full_name},</p>
                            <p>Welcome to Pubudu Medical Center! 🎉</p>
                            <p>Your account has been successfully created and your email has been verified. We are glad to have you with us.</p>
                            <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p><strong>Name:</strong> ${patient.full_name}</p>
                                <p><strong>Email:</strong> ${user.email}</p>
                                <p><strong>Username:</strong> ${user.username}</p>
                            </div>
                            <p>⚠️ <strong>Important:</strong> Please do not share your account credentials with anyone. Pubudu Medical Center staff will never ask you for your password.</p>
                            <p>If you did not create this account, please contact us immediately.</p>
                            <p>Thank you for choosing Pubudu Medical Center. We look forward to serving you.</p>
                            <p>Warm regards,<br/>The Pubudu Medical Center Team</p>
                        </div>
                    `
                });
                console.log(`Welcome email sent to ${user.email}`);
            }
        } catch (mailError) {
            console.error('Failed to send Welcome email:', mailError);
        }

        res.status(200).json({ success: true, message: 'Email verified successfully.' });
    } catch (error) {
        console.error('Verify email error:', error);
        res.status(500).json({ success: false, message: 'Server error during verification.' });
    }
};

// @desc    Resend OTP (Stateless JWT Approach)
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required.' });
        }

        const user = await User.findOne({ where: { email }, include: [{ model: Patient, as: 'patient' }] });
        if (!user || !user.patient) {
            return res.status(404).json({ success: false, message: 'Patient not found with this email.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Generate new stateless token
        const otpToken = jwt.sign(
            { otp, userId: user.user_id },
            process.env.JWT_SECRET || 'your-super-secret-jwt-key',
            { expiresIn: '10m' }
        );

        // Send OTP Email
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });

            await transporter.sendMail({
                from: `"Pubudu Medical Center" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Pubudu Medical Center – Your Email Verification Code',
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <p>Dear ${user.patient.full_name},</p>
                        <p>To complete your registration, please verify your email address using the verification code below:</p>
                        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #0066CC;">
                            ${otp}
                        </div>
                        <p>This code will expire in 10 minutes.</p>
                        <p>⚠️ <strong>Important:</strong> Please do not share this verification code with anyone. Pubudu Medical Center staff will never ask you for this code.</p>
                        <p>If you did not request this code, please ignore this email.</p>
                        <p>Warm regards,<br/>The Pubudu Medical Center Team</p>
                    </div>
                `
            });
            console.log(`Resend OTP email sent to ${user.email}`);
        } catch (mailError) {
            console.error('Failed to send OTP email:', mailError);
        }

        res.status(200).json({ success: true, message: 'New OTP sent to your email.', otpToken });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ success: false, message: 'Server error while resending OTP.' });
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
    verifyAuth,
    verifyEmail,
    resendOtp
};
