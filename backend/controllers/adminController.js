import { User, Doctor, Receptionist, Admin, Appointment, Payment, Patient, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * @desc    Get system-wide statistics (counts)
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getSystemStats = async (req, res) => {
  try {
    const [doctorCount, patientCount, receptionistCount, appointmentCount] = await Promise.all([
      Doctor.count(),
      Patient.count(),
      Receptionist.count(),
      Appointment.count()
    ]);

    res.status(200).json({
      success: true,
      data: {
        doctors: doctorCount,
        patients: patientCount,
        receptionists: receptionistCount,
        appointments: appointmentCount
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {
      payment_status: 'PAID'
    };

    if (startDate && endDate) {
      where.appointment_date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const appointments = await Appointment.findAll({
      where,
      include: [
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['center_fee', 'full_name']
        },
        {
          model: Patient,
          as: 'patient',
          attributes: ['full_name']
        }
      ]
    });

    const totalCenterRevenue = appointments.reduce((sum, appt) => sum + parseFloat(appt.doctor?.center_fee || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalCenterRevenue,
        appointmentCount: appointments.length,
        appointments: appointments.map(a => ({
          appointment_id: a.appointment_id,
          patient_name: a.patient?.full_name,
          doctor_name: a.doctor?.full_name,
          date: a.appointment_date,
          center_fee: parseFloat(a.doctor?.center_fee || 0)
        }))
      }
    });

  } catch (error) {
    console.error('Revenue report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get Patient Registration Report
 * @route   GET /api/admin/reports/patients
 * @access  Private/Admin
 */
export const getPatientRegistrationReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};

    if (startDate && endDate) {
      where.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59')]
      };
    }

    const patients = await Patient.findAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['email', 'contact_number']
      }],
      order: [['created_at', 'DESC']]
    });

    const summary = {
      total: patients.length,
      online: patients.filter(p => p.registration_source === 'ONLINE').length,
      receptionist: patients.filter(p => p.registration_source === 'RECEPTIONIST').length
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        patients: patients.map(p => ({
          name: p.full_name,
          nic: p.nic,
          source: p.registration_source,
          date: p.created_at,
          contact: p.user?.contact_number || 'N/A'
        }))
      }
    });
  } catch (error) {
    console.error('Patient report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Get Appointment Report
 * @route   GET /api/admin/reports/appointments
 * @access  Private/Admin
 */
export const getAppointmentReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};

    if (startDate && endDate) {
      where.appointment_date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const appointments = await Appointment.findAll({
      where,
      include: [
        { model: Doctor, as: 'doctor', attributes: ['full_name'] },
        { model: Patient, as: 'patient', attributes: ['full_name'] }
      ]
    });

    const summary = {
      total: appointments.length,
      cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
      cancelledUnpaid: appointments.filter(a => a.status === 'CANCELLED' && a.cancellation_reason === 'Unpaid').length,
      absent: appointments.filter(a => a.status === 'CANCELLED' && a.is_noshow).length
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        appointments: appointments.map(a => ({
          id: a.appointment_id,
          patient: a.patient?.full_name,
          doctor: a.doctor?.full_name,
          date: a.appointment_date,
          status: a.status,
          payment: a.payment_status,
          reason: a.cancellation_reason,
          absent: a.is_noshow
        }))
      }
    });
  } catch (error) {
    console.error('Appointment report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

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
      license_no,
      doctor_fee,
      center_fee,
      gender
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
      license_no,
      doctor_fee,
      center_fee,
      gender
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
        license_no: doctor.license_no,
        doctor_fee: doctor.doctor_fee,
        center_fee: doctor.center_fee,
        gender: doctor.gender
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
    const { full_name, specialization, email, contact_number, doctor_fee, center_fee, gender } = req.body;

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
    if (doctor_fee !== undefined) doctor.doctor_fee = doctor_fee;
    if (center_fee !== undefined) doctor.center_fee = center_fee;
    if (gender) doctor.gender = gender;
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

    // Delete doctor record first to avoid FK constraint issues
    await Doctor.destroy({ where: { doctor_id: id } });

    // Then delete the user
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
      nic,
      shift
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
      nic,
      shift
    });

    res.status(201).json({
      success: true,
      message: 'Receptionist created successfully',
      data: {
        user_id: user.user_id,
        username: user.username,
        receptionist_id: receptionist.receptionist_id,
        full_name: receptionist.full_name,
        nic: receptionist.nic,
        shift: receptionist.shift
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
    const { full_name, email, contact_number, shift } = req.body;

    const receptionist = await Receptionist.findByPk(id);
    if (!receptionist) {
      return res.status(404).json({
        success: false,
        message: 'Receptionist not found'
      });
    }

    // Update receptionist info
    if (full_name) receptionist.full_name = full_name;
    if (shift) receptionist.shift = shift;
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

    // Delete receptionist record first
    await Receptionist.destroy({ where: { receptionist_id: id } });

    // Then delete the user
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
// @desc    Get data specifically for the Admin Dashboard (Charts)
// @route   GET /api/admin/dashboard-data
// @access  Private/Admin
export const getDashboardData = async (req, res) => {
  try {
    const { period } = req.query; // 'Daily', 'Weekly', 'Monthly' for revenue
    
    // 1. Weekly Appointment Trends (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const appointments = await Appointment.findAll({
      where: {
        appointment_date: { [Op.gte]: sevenDaysAgo.toISOString().split('T')[0] }
      },
      attributes: ['appointment_date'],
      raw: true
    });

    // Group by day name
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyTrendMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      weeklyTrendMap[d.toISOString().split('T')[0]] = 0;
    }

    appointments.forEach(a => {
      if (weeklyTrendMap[a.appointment_date] !== undefined) {
        weeklyTrendMap[a.appointment_date]++;
      }
    });

    const weeklyTrend = Object.entries(weeklyTrendMap)
      .map(([date, count]) => ({
        name: dayNames[new Date(date).getDay()],
        value: count,
        fullDate: date
      }))
      .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

    // 2. Revenue Breakdown by Doctor (Based on Period)
    let startDate = new Date();
    if (period === 'Daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'Monthly') {
      startDate.setDate(1);
    } else { // Default Weekly
      startDate.setDate(startDate.getDate() - 7);
    }

    const revenueData = await Appointment.findAll({
      where: {
        payment_status: 'PAID',
        appointment_date: { [Op.gte]: startDate.toISOString().split('T')[0] }
      },
      include: [
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['full_name', 'center_fee']
        }
      ]
    });

    // Group by Doctor
    const doctorRevenueMap = {};
    revenueData.forEach(appt => {
      const docName = appt.doctor?.full_name || 'Unknown';
      const fee = parseFloat(appt.doctor?.center_fee || 0);
      doctorRevenueMap[docName] = (doctorRevenueMap[docName] || 0) + fee;
    });

    const revenueByDoctor = Object.entries(doctorRevenueMap).map(([name, value]) => ({
      name,
      value
    }));

    res.status(200).json({
      success: true,
      data: {
        weeklyTrend,
        revenueByDoctor
      }
    });

  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
