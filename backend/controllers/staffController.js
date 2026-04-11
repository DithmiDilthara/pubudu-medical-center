import { User, Role, Admin, Doctor, Receptionist, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';

/**
 * @desc    Get all administrative staff (Admins and Super Admins)
 * @route   GET /api/staff
 * @access  Private/SuperAdmin
 */
export const getAllStaff = async (req, res) => {
  try {
    const staff = await User.findAll({
      where: {
        role_id: { [Op.in]: [1, 5] }
      },
      attributes: ['user_id', 'username', 'email', 'contact_number', 'role_id', 'is_active', 'created_at'],
      include: [
        { model: Role, as: 'role', attributes: ['role_name'] },
        { model: Admin, as: 'admin' }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching admins', error: error.message });
  }
};

/**
 * @desc    Create a new staff member
 * @route   POST /api/staff
 * @access  Private/SuperAdmin
 */
export const createStaff = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { username, email, password, role_id, phone, full_name, ...profileData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { [Op.or]: [{ username }, { email }] }, transaction });
    if (existingUser) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    // 1. Create User
    const user = await User.create({
      username,
      email,
      password_hash: password, // Hashed by hook
      role_id,
      contact_number: phone,
      is_active: true
    }, { transaction });

    // 2. Create specific profile based on role_id
    if (role_id === 1 || role_id === 5) {
      await Admin.create({ user_id: user.user_id }, { transaction });
    } else if (role_id === 2) {
      await Doctor.create({ 
        user_id: user.user_id, 
        full_name, 
        specialization: profileData.specialization,
        license_no: profileData.license_no,
        doctor_fee: profileData.doctor_fee,
        center_fee: profileData.center_fee,
        consultation_fee: (Number(profileData.doctor_fee) || 0) + (Number(profileData.center_fee) || 0),
        gender: profileData.gender
      }, { transaction });
    } else if (role_id === 3) {
      await Receptionist.create({ 
        user_id: user.user_id, 
        full_name, 
        nic: profileData.nic 
      }, { transaction });
    }

    await transaction.commit();
    res.status(201).json({ success: true, message: 'Staff member created successfully', data: { user_id: user.user_id, username } });
  } catch (error) {
    await transaction.rollback();
    console.error('Create staff error:', error);
    res.status(500).json({ success: false, message: 'Server error while creating staff', error: error.message });
  }
};

/**
 * @desc    Update a staff member
 * @route   PUT /api/staff/:id
 * @access  Private/SuperAdmin
 */
export const updateStaff = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { username, email, password, role_id, phone, full_name, is_active, ...profileData } = req.body;

    const user = await User.findByPk(id, { transaction });
    if (!user) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update User data
    const userData = { username, email, role_id, contact_number: phone, is_active };
    if (password) {
        userData.password_hash = password;
    }
    await user.update(userData, { transaction });

    // Update Profile data
    if (role_id === 2) {
        const doctor = await Doctor.findOne({ where: { user_id: id }, transaction });
        if (doctor) {
            await doctor.update({
                full_name,
                specialization: profileData.specialization,
                license_no: profileData.license_no,
                doctor_fee: profileData.doctor_fee,
                center_fee: profileData.center_fee,
                consultation_fee: (Number(profileData.doctor_fee) || 0) + (Number(profileData.center_fee) || 0),
                gender: profileData.gender
            }, { transaction });
        }
    } else if (role_id === 3) {
        const receptionist = await Receptionist.findOne({ where: { user_id: id }, transaction });
        if (receptionist) {
            await receptionist.update({ full_name, nic: profileData.nic }, { transaction });
        }
    }

    await transaction.commit();
    res.status(200).json({ success: true, message: 'Staff member updated successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Update staff error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating staff', error: error.message });
  }
};

/**
 * @desc    Delete a staff member
 * @route   DELETE /api/staff/:id
 * @access  Private/SuperAdmin
 */
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    // 🛡️ SELF-DELETION CHECK
    if (parseInt(id) === req.user.user_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Security Violation: You cannot delete your own Super Admin account.' 
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    // Note: CASCADE defined in associations will handle profile deletion
    await user.destroy();
    res.status(200).json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting staff', error: error.message });
  }
};
