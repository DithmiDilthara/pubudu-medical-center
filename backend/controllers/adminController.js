import { User, Doctor, Receptionist, Admin } from '../models/index.js';

// @desc    Create a new doctor (Admin only)
// @route   POST /api/admin/doctors
// @access  Private/Admin
export const createDoctor = async (req, res) => {
  try {
    const {
      username,
      password,
      email,
      contact_number,
      full_name,
      specialization,
      license_no
    } = req.body;

    // Validation
    if (!username || !password || !full_name || !specialization || !license_no) {
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

    // Check if license number already exists
    const existingLicense = await Doctor.findOne({ where: { license_no } });
    if (existingLicense) {
      return res.status(400).json({
        success: false,
        message: 'License number already registered'
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

    // Get admin_id from authenticated user
    const adminRecord = await Admin.findOne({ where: { user_id: req.user.user_id } });
    if (!adminRecord) {
      return res.status(403).json({
        success: false,
        message: 'Admin record not found'
      });
    }

    // Create user with Doctor role (role_id: 2)
    const user = await User.create({
      username,
      password_hash: password,
      email,
      contact_number,
      role_id: 2 // Doctor role
    });

    // Create doctor record
    const doctor = await Doctor.create({
      user_id: user.user_id,
      admin_id: adminRecord.admin_id,
      full_name,
      specialization,
      license_no
    });

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: {
        user_id: user.user_id,
        username: user.username,
        doctor_id: doctor.doctor_id,
        full_name: doctor.full_name,
        specialization: doctor.specialization,
        license_no: doctor.license_no
      }
    });

  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating doctor',
      error: error.message
    });
  }
};

// @desc    Get all doctors
// @route   GET /api/admin/doctors
// @access  Private/Admin
export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'username', 'email', 'contact_number']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: doctors
    });

  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching doctors',
      error: error.message
    });
  }
};

// @desc    Update doctor
// @route   PUT /api/admin/doctors/:id
// @access  Private/Admin
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, specialization, email, contact_number } = req.body;

    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Update doctor info
    if (full_name) doctor.full_name = full_name;
    if (specialization) doctor.specialization = specialization;
    await doctor.save();

    // Update user info
    if (email || contact_number) {
      const user = await User.findByPk(doctor.user_id);
      if (email) user.email = email;
      if (contact_number) user.contact_number = contact_number;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Doctor updated successfully',
      data: doctor
    });

  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating doctor',
      error: error.message
    });
  }
};

// @desc    Delete doctor
// @route   DELETE /api/admin/doctors/:id
// @access  Private/Admin
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Delete user (cascade will delete doctor record)
    await User.destroy({ where: { user_id: doctor.user_id } });

    res.status(200).json({
      success: true,
      message: 'Doctor deleted successfully'
    });

  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting doctor',
      error: error.message
    });
  }
};

// @desc    Create a new receptionist (Admin only)
// @route   POST /api/admin/receptionists
// @access  Private/Admin
export const createReceptionist = async (req, res) => {
  try {
    const {
      username,
      password,
      email,
      contact_number,
      full_name,
      nic
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
    const existingNIC = await Receptionist.findOne({ where: { nic } });
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

    // Get admin_id from authenticated user
    const adminRecord = await Admin.findOne({ where: { user_id: req.user.user_id } });
    if (!adminRecord) {
      return res.status(403).json({
        success: false,
        message: 'Admin record not found'
      });
    }

    // Create user with Receptionist role (role_id: 3)
    const user = await User.create({
      username,
      password_hash: password,
      email,
      contact_number,
      role_id: 3 // Receptionist role
    });

    // Create receptionist record
    const receptionist = await Receptionist.create({
      user_id: user.user_id,
      admin_id: adminRecord.admin_id,
      full_name,
      nic
    });

    res.status(201).json({
      success: true,
      message: 'Receptionist created successfully',
      data: {
        user_id: user.user_id,
        username: user.username,
        receptionist_id: receptionist.receptionist_id,
        full_name: receptionist.full_name,
        nic: receptionist.nic
      }
    });

  } catch (error) {
    console.error('Create receptionist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating receptionist',
      error: error.message
    });
  }
};

// @desc    Get all receptionists
// @route   GET /api/admin/receptionists
// @access  Private/Admin
export const getReceptionists = async (req, res) => {
  try {
    const receptionists = await Receptionist.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['user_id', 'username', 'email', 'contact_number']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: receptionists
    });

  } catch (error) {
    console.error('Get receptionists error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching receptionists',
      error: error.message
    });
  }
};

// @desc    Update receptionist
// @route   PUT /api/admin/receptionists/:id
// @access  Private/Admin
export const updateReceptionist = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, contact_number } = req.body;

    const receptionist = await Receptionist.findByPk(id);
    if (!receptionist) {
      return res.status(404).json({
        success: false,
        message: 'Receptionist not found'
      });
    }

    // Update receptionist info
    if (full_name) receptionist.full_name = full_name;
    await receptionist.save();

    // Update user info
    if (email || contact_number) {
      const user = await User.findByPk(receptionist.user_id);
      if (email) user.email = email;
      if (contact_number) user.contact_number = contact_number;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Receptionist updated successfully',
      data: receptionist
    });

  } catch (error) {
    console.error('Update receptionist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating receptionist',
      error: error.message
    });
  }
};

// @desc    Delete receptionist
// @route   DELETE /api/admin/receptionists/:id
// @access  Private/Admin
export const deleteReceptionist = async (req, res) => {
  try {
    const { id } = req.params;

    const receptionist = await Receptionist.findByPk(id);
    if (!receptionist) {
      return res.status(404).json({
        success: false,
        message: 'Receptionist not found'
      });
    }

    // Delete user (cascade will delete receptionist record)
    await User.destroy({ where: { user_id: receptionist.user_id } });

    res.status(200).json({
      success: true,
      message: 'Receptionist deleted successfully'
    });

  } catch (error) {
    console.error('Delete receptionist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting receptionist',
      error: error.message
    });
  }
};
