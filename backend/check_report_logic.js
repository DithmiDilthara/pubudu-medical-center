import { Appointment, Doctor, Patient } from './models/index.js';
import { Op } from 'sequelize';

async function testReportLogic() {
  try {
    const startDate = '2020-01-01'; // Far past to get all data
    const endDate = '2026-12-31';

    const where = {
      appointment_date: {
        [Op.between]: [startDate, endDate]
      }
    };

    const appointments = await Appointment.findAll({
      where,
      include: [
        { model: Doctor, as: 'doctor', attributes: ['full_name', 'specialization'] },
        { model: Patient, as: 'patient', attributes: ['full_name'] }
      ]
    });

    console.log(`Total appointments found: ${appointments.length}`);

    const summary = {
      total: appointments.length,
      completed: appointments.filter(a => a.status === 'COMPLETED').length,
      cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
      absent: appointments.filter(a => a.status === 'CANCELLED' && a.is_noshow).length,
      pending: appointments.filter(a => a.status === 'PENDING').length
    };

    console.log('Summary:', summary);

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
          noshow: 0
        };
      }
      
      const stats = doctorStatsMap[docId];
      stats.total += 1;
      if (a.status === 'COMPLETED') stats.completed += 1;
      if (a.status === 'CANCELLED') {
        stats.cancelled += 1;
        if (a.is_noshow) stats.noshow += 1;
      }
    });

    const doctorStats = Object.values(doctorStatsMap);
    console.log('Doctor Breakdown (First 2):', doctorStats.slice(0, 2));

    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

testReportLogic();
