import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiCalendar, 
  FiUsers, 
  FiClock, 
  FiClipboard, 
  FiFileText, 
  FiBarChart2, 
  FiPhone,
  FiCheckCircle, 
  FiChevronRight,
  FiActivity
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import DoctorHeader from '../../components/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';
import AppointmentCard from '../../components/AppointmentCard';
import AppointmentCalendar from '../../components/AppointmentCalendar';
import StatsCard from '../../components/StatsCard';

function DoctorDashboard() {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState('Doctor');
  const [isLoading, setIsLoading] = useState(true);
  const [allAppointments, setAllAppointments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    upcomingAppointments: 0,
    completedToday: 0
  });


  const getLocalDateString = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, -1);
    return localISOTime.split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDateString(new Date()));

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setDoctorName(response.data.data.profile.full_name);
        }
      } catch (error) {
        console.error("Error fetching dashboard profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Fetch appointments and stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch specific doctor appointments
        const apptRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch unique patients assigned to doctor
        const patientRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/doctors/my-patients`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (apptRes.data.success && patientRes.data.success) {
          const appts = apptRes.data.data;
          const patientsList = patientRes.data.data;

          setAllAppointments(appts);
          const todayDate = getLocalDateString(new Date());

          // Calculate stats
          const todayAppts = appts.filter(apt => apt.appointment_date === todayDate);
          const upcomingAppts = appts.filter(apt => apt.appointment_date >= todayDate && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED');
          const completedTodayCnt = todayAppts.filter(apt => apt.status === 'COMPLETED').length;

          setStats({
            todayAppointments: todayAppts.length,
            totalPatients: patientsList.length,
            upcomingAppointments: upcomingAppts.length,
            completedToday: completedTodayCnt
          });

        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const filtered = allAppointments.filter(apt => apt.appointment_date === selectedDate);
    setAppointments(filtered);
  }, [selectedDate, allAppointments]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div style={styles.pageContainer}>
      <DoctorSidebar onLogout={handleLogout} />

      <motion.div 
        className="main-wrapper" 
        style={styles.mainWrapper}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <DoctorHeader doctorName={doctorName} />

        <main style={styles.contentPadding}>
          <motion.div variants={itemVariants} style={styles.pageHeader}>
            <div style={styles.headerSection}>
              <h1 style={styles.welcomeTitle}>Welcome back, {doctorName}!</h1>
              <p style={styles.welcomeSubtitle}>Precision Care & Management Dashboard</p>
            </div>
            <div style={styles.headerRight}>
               <div style={styles.dateBadge}>
                  <FiCalendar />
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
               </div>
            </div>
          </motion.div>

          {/* Statistics Grid */}
          <motion.div variants={itemVariants} style={styles.statsGrid}>
            <StatsCard 
              title="Today's Appointments" 
              value={stats.todayAppointments} 
              icon={<FiCalendar style={{ fontSize: '20px' }} />} 
              gradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" 
              shadow="rgba(59, 130, 246, 0.25)"
              delay={0.1}
            />
            <StatsCard 
              title="Total Patients" 
              value={stats.totalPatients} 
              icon={<FiUsers style={{ fontSize: '20px' }} />} 
              gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)" 
              shadow="rgba(16, 185, 129, 0.25)"
              delay={0.2}
            />
            <StatsCard 
              title="Upcoming Appointments" 
              value={stats.upcomingAppointments} 
              icon={<FiClock style={{ fontSize: '20px' }} />} 
              gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" 
              shadow="rgba(139, 92, 246, 0.25)"
              delay={0.3}
            />
            <StatsCard 
              title="Completed Today" 
              value={stats.completedToday} 
              icon={<FiCheckCircle style={{ fontSize: '20px' }} />} 
              gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" 
              shadow="rgba(245, 158, 11, 0.25)"
              delay={0.4}
            />
          </motion.div>

          <motion.div variants={itemVariants} style={styles.dashboardGrid}>
            {/* Left Column: Calendar Focus & Selected Schedule */}
            <div style={styles.scheduleColumn}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Appointment Calendar</h2>
              </div>
              
              <div style={styles.calendarContainer}>
                <AppointmentCalendar 
                  appointments={allAppointments} 
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </div>

              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>
                  Schedule for: {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                <button 
                  style={styles.viewAllLink} 
                  onClick={() => navigate('/doctor/appointments')}
                >
                  View All
                </button>
              </div>

              <div style={styles.scheduleCard}>
                <div style={styles.appointmentsList}>
                  {appointments.length > 0 ? (
                    appointments.map((appt, idx) => (
                      <motion.div 
                        key={appt.id || appt.appointment_id} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx, duration: 0.3 }}
                        style={styles.cardWrapper}
                      >
                        <AppointmentCard 
                          appt={appt} 
                          role="doctor"
                          variant="grid"
                          onViewDetails={() => navigate('/doctor/patient-details', { 
                            state: { 
                              patientId: appt.patient_id,
                              appointment_id: appt.appointment_id 
                            } 
                          })}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div style={styles.emptyState}>
                      <FiCalendar style={styles.emptyIcon} />
                      <p style={styles.emptyText}>No appointments scheduled for this date.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Financial Quick Actions */}
            <div style={styles.calendarColumn}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Financials</h2>
              </div>
              <div style={styles.chartSection}>
                 <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/doctor/revenue')}
                    style={{
                      ...styles.statCard, 
                      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                      color: "white",
                      cursor: "pointer",
                      border: "none",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      padding: "32px",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}
                 >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '24px' }}>
                      <div style={{ ...styles.statIconWrapper, backgroundColor: "rgba(255,255,255,0.1)", color: "white" }}>
                        <FiBarChart2 style={styles.statIcon} />
                      </div>
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                        View Detailed Report
                      </div>
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '800', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>My Revenue</h3>
                      <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1', opacity: 0.9 }}>
                        Track your earnings, monitor completed sessions, and view refund deductions accurately.
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px', color: '#38bdf8', fontSize: '14px', fontWeight: '700' }}>
                      Open Report Dashboard <FiChevronRight />
                    </div>
                 </motion.div>
              </div>
            </div>
          </motion.div>
        </main>
      </motion.div>
    </div>
  );
}

const styles = {
  // ... existing styles ...
  pageContainer: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "'Inter', sans-serif"
  },
  mainWrapper: {
    flex: 1,
    marginLeft: "280px",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column"
  },
  contentPadding: {
    padding: "32px",
    flex: 1,
    maxWidth: "1400px",
    margin: "0 auto",
    width: "100%"
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "32px",
  },
  headerSection: {
    marginBottom: 0,
  },
  welcomeTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 4px 0",
    letterSpacing: "-1px",
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  welcomeSubtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500",
    fontFamily: "'Inter', sans-serif"
  },
  dateBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    color: "#475569",
    fontSize: "14px",
    fontWeight: "600",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "24px",
    marginBottom: "40px"
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02)",
    border: "1px solid #f1f5f9",
    cursor: "default"
  },
  statIconWrapper: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  statIcon: {
    fontSize: "24px"
  },
  statInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px"
  },
  statLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#64748b",
    margin: 0,
    fontFamily: "'Inter', sans-serif"
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#1e293b",
    margin: 0,
    lineHeight: 1,
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "32px",
    alignItems: "start"
  },
  scheduleColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#1e293b",
    margin: 0,
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  viewAllLink: {
    color: "#2563eb",
    background: "none",
    border: "none",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    padding: 0,
    textDecoration: "none",
    ':hover': {
      textDecoration: "underline"
    }
  },
  scheduleCard: {
    backgroundColor: "white",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    border: "1px solid #f1f5f9"
  },
  appointmentsList: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  cardWrapper: {
    width: "100%"
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
    color: "#94a3b8",
    textAlign: "center"
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
    color: "#e2e8f0"
  },
  emptyText: {
    fontSize: "15px",
    fontWeight: "500",
    fontFamily: "'Inter', sans-serif"
  },
  calendarColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  calendarContainer: {
    width: "100%",
    marginBottom: "8px"
  },
  chartSection: {
     marginTop: "8px"
  }
};

export default DoctorDashboard;

