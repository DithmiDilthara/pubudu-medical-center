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
import RevenueChart from '../../components/RevenueChart';

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

  const [revenueData, setRevenueData] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0,
    total: 0
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

          // Calculate Real Revenue
          const paidAppts = appts.filter(appt => appt.payment_status === 'PAID');
          
          const getPastDate = (days) => {
            const d = new Date();
            d.setDate(d.getDate() - days);
            return getLocalDateString(d);
          };

          const weekStart = getPastDate(7);
          const monthStart = getPastDate(30);

          const dailyRev = paidAppts
            .filter(a => a.appointment_date === todayDate)
            .reduce((sum, a) => sum + Number(a.doctor?.doctor_fee || 0), 0);

          const weeklyRev = paidAppts
            .filter(a => a.appointment_date >= weekStart && a.appointment_date <= todayDate)
            .reduce((sum, a) => sum + Number(a.doctor?.doctor_fee || 0), 0);

          const monthlyRev = paidAppts
            .filter(a => a.appointment_date >= monthStart && a.appointment_date <= todayDate)
            .reduce((sum, a) => sum + Number(a.doctor?.doctor_fee || 0), 0);

          const totalRev = paidAppts
            .reduce((sum, a) => sum + Number(a.doctor?.doctor_fee || 0), 0);

          setRevenueData({
            daily: dailyRev,
            weekly: weeklyRev,
            monthly: monthlyRev,
            total: totalRev
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

  const StatCard = ({ title, value, icon: Icon, iconBg, iconColor, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      style={styles.statCard}
    >
      <div style={{ ...styles.statIconWrapper, backgroundColor: iconBg }}>
        <Icon style={{ ...styles.statIcon, color: iconColor }} />
      </div>
      <div style={styles.statInfo}>
        <p style={styles.statLabel}>{title}</p>
        <h3 style={styles.statValue}>{value}</h3>
      </div>
    </motion.div>
  );

  return (
    <div style={styles.pageContainer}>
      <DoctorSidebar onLogout={handleLogout} />

      <div className="main-wrapper" style={styles.mainWrapper}>
        <DoctorHeader doctorName={doctorName} />

        <motion.main 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          style={styles.contentPadding}
        >
          {/* Welcome Header ... skipped ... */}
          <div style={styles.pageHeader}>
            <div style={styles.headerLeft}>
              <h1 style={styles.pageTitle}>Dashboard</h1>
              <p style={styles.pageSubtitle}>Precision Care & Management Dashboard</p>
            </div>
            <div style={styles.headerRight}>
               <div style={styles.dateBadge}>
                  <FiCalendar />
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
               </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div style={styles.statsGrid}>
            <StatCard 
              index={0}
              title="Today's Appointments" 
              value={stats.todayAppointments} 
              icon={FiCalendar} 
              iconBg="#eff6ff" 
              iconColor="#2563eb" 
            />
            <StatCard 
              index={1}
              title="Total Patients" 
              value={stats.totalPatients} 
              icon={FiUsers} 
              iconBg="#ecfdf5" 
              iconColor="#059669" 
            />
            <StatCard 
              index={2}
              title="Upcoming Appointments" 
              value={stats.upcomingAppointments} 
              icon={FiClock} 
              iconBg="#f5f3ff" 
              iconColor="#7c3aed" 
            />
            <StatCard 
              index={3}
              title="Completed Today" 
              value={stats.completedToday} 
              icon={FiCheckCircle} 
              iconBg="#fffbeb" 
              iconColor="#d97706" 
            />
          </div>

          <div style={styles.dashboardGrid}>
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

            {/* Right Column: Revenue Breakdown */}
            <div style={styles.calendarColumn}>
              <div style={styles.chartSection}>
                 <RevenueChart revenueData={revenueData} />
              </div>
            </div>
          </div>
        </motion.main>
      </div>
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
    marginBottom: "32px"
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.025em"
  },
  pageSubtitle: {
    fontSize: "15px",
    color: "#64748b",
    marginTop: "4px",
    fontWeight: "500"
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
    margin: 0
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#1e293b",
    margin: 0,
    lineHeight: 1
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
    margin: 0
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
    fontWeight: "500"
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

