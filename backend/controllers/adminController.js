import { User, Doctor, Receptionist, Admin, Appointment, Payment, Patient, Adult, Availability, MedicalRecord, sequelize } from '../models/index.js';
import { Op } from 'sequelize';
import ReportGenerator from '../utils/ReportGenerator.js';
import NotificationService from '../utils/NotificationService.js';

/**
 * @desc    Get system-wide statistics (counts)
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
export const getSystemStats = async (req, res) => {
  try {
    const [doctorCount, patientCount, receptionistCount, appointmentCount, paidAppointments] = await Promise.all([
      Doctor.count(),
      Patient.count(),
      Receptionist.count(),
      Appointment.count(),
      Appointment.findAll({
        where: { payment_status: { [Op.in]: ['PAID', 'REFUNDED', 'PARTIAL'] } },
        include: [{ model: Doctor, as: 'doctor', attributes: ['center_fee'] }]
      })
    ]);

    const totalRevenue = paidAppointments.reduce((sum, appt) => sum + parseFloat(appt.doctor?.center_fee || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        doctors: doctorCount,
        patients: patientCount,
        receptionists: receptionistCount,
        appointments: appointmentCount,
        totalRevenue: totalRevenue
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
      payment_status: { [Op.in]: ['PAID', 'REFUNDED', 'PARTIAL'] }
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

    // Group by Doctor for Chart
    const doctorStats = {};
    appointments.forEach(a => {
      const docName = a.doctor?.full_name || 'Unknown';
      if (!doctorStats[docName]) doctorStats[docName] = { revenue: 0, patients: 0 };
      doctorStats[docName].revenue += parseFloat(a.doctor?.center_fee || 0);
      doctorStats[docName].patients += 1;
    });

    const chartData = Object.entries(doctorStats).map(([name, stats]) => ({
      name,
      revenue: stats.revenue,
      patients: stats.patients
    }));

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: totalCenterRevenue,
        appointmentCount: appointments.length,
        chartData,
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
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['email', 'contact_number']
        },
        { model: Adult, as: 'adult' }
      ],
      order: [['created_at', 'DESC']]
    });

    const summary = {
      total: patients.length,
      online: patients.filter(p => p.registration_source === 'ONLINE').length,
      receptionist: patients.filter(p => p.registration_source === 'RECEPTIONIST').length
    };

    // Chart Data: Registration Source
    const chartData = [
      { name: 'Online', count: summary.online },
      { name: 'Receptionist', count: summary.receptionist }
    ];

    res.status(200).json({
      success: true,
      data: {
        summary,
        chartData,
        patients: patients.map(p => ({
          name: p.full_name,
          nic: p.patient_type === 'ADULT' && p.adult ? p.adult.nic : (p.patient_type === 'CHILD' ? 'CHILD' : 'N/A'),
          patient_type: p.patient_type,
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
        { model: Doctor, as: 'doctor', attributes: ['full_name', 'specialization'] },
        { model: Patient, as: 'patient', attributes: ['full_name'] }
      ]
    });

    const summary = {
      total: appointments.length,
      completed: appointments.filter(a => a.status === 'COMPLETED').length,
      cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
      reschedule_required: appointments.filter(a => a.status === 'RESCHEDULE_REQUIRED').length,
      absent: appointments.filter(a => a.status === 'NO_SHOW').length,
      pending: appointments.filter(a => a.status === 'PENDING').length
    };

    // Group by Doctor for detailed table
    const doctorStatsMap = {};
    appointments.forEach(a => {
      const docId = a.doctor_id || 'unknown';
      if (!doctorStatsMap[docId]) {
        doctorStatsMap[docId] = {
          doctor_name: a.doctor?.full_name || 'Unknown',
          specialisation: a.doctor?.specialization || 'General',
          total: 0,
          completed: 0,
          cancelled: 0,
          reschedule_required: 0,
          noshow: 0
        };
      }
      
      const stats = doctorStatsMap[docId];
      stats.total += 1;
      if (a.status === 'COMPLETED') stats.completed += 1;
      if (a.status === 'RESCHEDULE_REQUIRED') stats.reschedule_required += 1;
      if (a.status === 'CANCELLED') stats.cancelled += 1;
      if (a.status === 'NO_SHOW') stats.noshow += 1;
    });

    const doctorStats = Object.values(doctorStatsMap);

    // Chart Data: Volume per doctor
    const chartData = doctorStats.map(d => ({
      name: d.doctor_name,
      appointments: d.total
    }));

    res.status(200).json({
      success: true,
      data: {
        period: { start: startDate, end: endDate },
        generated: new Date().toISOString().split('T')[0],
        totalAppointments: summary.total,
        totalCompleted: summary.completed,
        totalCancelled: summary.cancelled,
        totalRescheduleRequired: summary.reschedule_required,
        totalNoShow: summary.absent,
        totalPending: summary.pending,
        doctors: doctorStats,
        chartData, // Keep this for the UI bar chart
        summary // Keep this for existing UI components if any
      }
    });
  } catch (error) {
    console.error('Appointment report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Export Report as PDF
 * @route   GET /api/admin/reports/export/:type
 * @access  Private/Admin
 */
export const exportReport = async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    // 1. Fetch data similar to the report functions
    let reportData = {};
    
    if (type === 'revenue') {
      const where = { payment_status: { [Op.in]: ['PAID', 'REFUNDED', 'PARTIAL'] } };
      if (startDate && endDate) where.appointment_date = { [Op.between]: [startDate, endDate] };
      const appointments = await Appointment.findAll({
        where,
        include: [
          { model: Doctor, as: 'doctor', attributes: ['center_fee', 'full_name', 'specialization'] },
          { model: Patient, as: 'patient', attributes: ['full_name'] }
        ]
      });
      // Aggregate by Doctor
      const doctorAggregation = {};
      let grandTotalVolume = 0;
      let grandTotalRevenue = 0;

      appointments.forEach(appt => {
        const docId = appt.doctor_id || 'unknown';
        const doc = appt.doctor;
        const centerFee = parseFloat(doc?.center_fee || 0);

        if (!doctorAggregation[docId]) {
          doctorAggregation[docId] = {
            doctor_name: doc?.full_name || 'Unknown',
            specialisation: doc?.specialization || 'General',
            patient_volume: 0,
            center_fee: centerFee,
            total_revenue: 0
          };
        }

        doctorAggregation[docId].patient_volume += 1;
        doctorAggregation[docId].total_revenue += centerFee;
        grandTotalVolume += 1;
        grandTotalRevenue += centerFee;
      });

      reportData = {
        totalRevenue: grandTotalRevenue,
        appointmentCount: grandTotalVolume,
        doctors: Object.values(doctorAggregation),
        grandTotal: {
          volume: grandTotalVolume,
          revenue: grandTotalRevenue
        }
      };
    } else if (type === 'patients') {
      const where = {};
      if (startDate && endDate) where.created_at = { [Op.between]: [new Date(startDate), new Date(endDate + 'T23:59:59')] };
      const patients = await Patient.findAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['email', 'contact_number'] },
          { model: Adult, as: 'adult' },
          { model: Child, as: 'child' }
        ],
        order: [['created_at', 'DESC']]
      });
      reportData = {
        summary: {
          total: patients.length,
          online: patients.filter(p => p.registration_source === 'ONLINE').length,
          receptionist: patients.filter(p => p.registration_source === 'RECEPTIONIST').length
        },
        patients: patients.map(p => ({
          name: p.full_name,
          nic: p.patient_type === 'ADULT' && p.adult ? p.adult.nic : (p.patient_type === 'CHILD' ? 'CHILD' : 'N/A'),
          source: p.registration_source,
          contact: p.user?.contact_number || 'N/A'
        }))
      };
    } else if (type === 'appointments') {
      const where = {};
      if (startDate && endDate) where.appointment_date = { [Op.between]: [startDate, endDate] };
      const appointments = await Appointment.findAll({
        where,
        include: [
          { model: Doctor, as: 'doctor', attributes: ['full_name'] },
          { model: Patient, as: 'patient', attributes: ['full_name'] }
        ]
      });
      reportData = {
        summary: {
          total: appointments.length,
          cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
          reschedule_required: appointments.filter(a => a.status === 'RESCHEDULE_REQUIRED').length,
          absent: appointments.filter(a => a.status === 'NO_SHOW').length
        },
        appointments: appointments.map(a => ({
          patient_name: a.patient?.full_name,
          doctor_name: a.doctor?.full_name,
          date: a.appointment_date,
          status: a.status
        }))
      };
    } else {
      return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    // 2. Generate PDF
    const pdfBuffer = await ReportGenerator.generateReportBuffer(type, reportData, { startDate, endDate });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_report_${new Date().toISOString().split('T')[0]}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Export report error:', error);
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
      consultation_fee: (Number(doctor_fee) || 0) + (Number(center_fee) || 0),
      gender
    });

    // Send credentials email
    if (email) {
      await NotificationService.sendStaffCredentials(email, {
        fullName: full_name,
        username: username,
        password: password, // Plain password before hashing
        role: 'Doctor'
      });
    }

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
    const { 
      full_name, 
      specialization, 
      email, 
      contact_number, 
      doctor_fee, 
      center_fee, 
      gender,
      license_no 
    } = req.body;

    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor record not found'
      });
    }

    // Update doctor professional details
    if (full_name) doctor.full_name = full_name;
    if (specialization) doctor.specialization = specialization;
    if (license_no) doctor.license_no = license_no;
    if (doctor_fee !== undefined) doctor.doctor_fee = doctor_fee;
    if (center_fee !== undefined) doctor.center_fee = center_fee;
    if (gender) doctor.gender = gender;
    
    // Safety check for fees
    const dFee = parseFloat(doctor.doctor_fee) || 0;
    const cFee = parseFloat(doctor.center_fee) || 0;
    doctor.consultation_fee = dFee + cFee;
    
    try {
      await doctor.save();
    } catch (saveError) {
      console.error('Doctor Save Error:', saveError);
      return res.status(400).json({
        success: false,
        message: 'Failed to update doctor professional details',
        error: saveError.message,
        details: saveError.errors?.map(e => e.message)
      });
    }

    // Update associated user account if details provided
    if (email || contact_number) {
      if (doctor.user_id) {
        const user = await User.findByPk(doctor.user_id);
        if (user) {
          if (email) user.email = email;
          if (contact_number) user.contact_number = contact_number;
          
          try {
            await user.save();
          } catch (userSaveError) {
            console.error('User Save Error:', userSaveError);
            return res.status(400).json({
              success: false,
              message: 'Failed to update user account details (Email might be in use)',
              error: userSaveError.message,
              details: userSaveError.errors?.map(e => e.message)
            });
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Doctor information updated successfully',
      data: doctor
    });

  } catch (error) {
    console.error('Update doctor controller crash:', error);
    res.status(500).json({
      success: false,
      message: 'A server crash occurred while updating the doctor',
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

    // 1. Delete associated Medical Records
    await MedicalRecord.destroy({ where: { doctor_id: id } });

    // 2. Delete associated Payments and Appointments
    // We need to find the appointments first to get their IDs for deleting payments
    const appointments = await Appointment.findAll({ where: { doctor_id: id } });
    const appointmentIds = appointments.map(a => a.appointment_id);

    if (appointmentIds.length > 0) {
      await Payment.destroy({ where: { appointment_id: { [Op.in]: appointmentIds } } });
      await Appointment.destroy({ where: { appointment_id: { [Op.in]: appointmentIds } } });
    }

    // 3. Delete associated Availability (Schedules)
    await Availability.destroy({ where: { doctor_id: id } });

    // 4. Delete the Doctor record
    await Doctor.destroy({ where: { doctor_id: id } });

    // 5. Delete the User record
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

    // Send credentials email
    if (email) {
      await NotificationService.sendStaffCredentials(email, {
        fullName: full_name,
        username: username,
        password: password, // Plain password before hashing
        role: 'Receptionist'
      });
    }

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
/**
 * @desc    Get Patient Registration Stats for Pie Chart
 * @route   GET /api/admin/patient-registration-stats
 * @access  Private/Admin
 */
export const getPatientRegistrationStats = async (req, res) => {
  try {
    const onlineCount = await Patient.count({ where: { registration_source: 'ONLINE' } });
    const receptionistCount = await Patient.count({ where: { registration_source: 'RECEPTIONIST' } });
    const totalCount = onlineCount + receptionistCount;

    res.status(200).json({
      success: true,
      data: {
        online: onlineCount,
        receptionist: receptionistCount,
        total: totalCount
      }
    });
  } catch (error) {
    console.error('Get patient registration stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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

    // 2. Revenue Trend based on Period
    const revenueTrendData = await Appointment.findAll({
      where: {
        payment_status: 'PAID',
        appointment_date: { [Op.gte]: startDate.toISOString().split('T')[0] }
      },
      include: [{ model: Doctor, as: 'doctor', attributes: ['full_name', 'center_fee'] }],
      attributes: ['appointment_date', 'created_at'], 
      raw: true,
      nest: true
    });

    // Group by Doctor for the specified Period
    const doctorMap = {};
    revenueTrendData.forEach(appt => {
      const docName = appt.doctor?.full_name || 'Unknown';
      if (!doctorMap[docName]) {
        doctorMap[docName] = 0;
      }
      doctorMap[docName] += parseFloat(appt.doctor?.center_fee || 0);
    });

    const revenueTrend = Object.entries(doctorMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue); // Sort by highest revenue

    res.status(200).json({
      success: true,
      data: {
        weeklyTrend,
        revenueTrend
      }
    });

  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
