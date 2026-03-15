import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { 
  FiCalendar, FiSearch, FiClipboard, FiCheckSquare, 
  FiClock, FiPlus, FiArrowRight, FiActivity, FiUser,
  FiCreditCard
} from 'react-icons/fi';
import { motion, AnimatePresence } from "framer-motion";
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";
import HeroCarousel from "../../components/HeroCarousel";
import AppointmentCarousel from "../../components/AppointmentCarousel";

function MiniCalendar({ highlightedDates, onDateClick }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const highlightSet = new Set(
    highlightedDates
      .filter((d) => {
        const date = new Date(d + 'T00:00:00');
        return date.getMonth() === month && date.getFullYear() === year;
      })
      .map((d) => new Date(d + 'T00:00:00').getDate())
  );

  const todayDate = today.getDate();

  return (
    <div style={styles.calendarContainer}>
      <div style={styles.calendarHeader}>
        <div>
          <h3 style={styles.calendarMonth}>
            {today.toLocaleString("default", { month: "long" })} {year}
          </h3>
          <p style={styles.calendarSubText}>{highlightSet.size} appointments this month</p>
        </div>
      </div>
      <div style={styles.calendarGrid}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} style={styles.dayLabel}>
            {d}
          </div>
        ))}
        {cells.map((day, i) => (
          <div
            key={i}
            onClick={() => day && highlightSet.has(day) && onDateClick && onDateClick(day)}
            style={{
              ...styles.dayCell,
              ...(day && highlightSet.has(day) ? styles.highlightedDay : {}),
              ...(day === todayDate ? styles.todayDay : {}),
              ...(!day ? styles.emptyDay : {}),
            }}
          >
            {day ?? ""}
            {day && highlightSet.has(day) && <div style={styles.dotIndicator} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function PatientDashboard() {
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const patientName = storedUser.full_name?.split(' ')[0] || storedUser.username || 'Patient';

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          const allApts = response.data.data;

          const todayStr = new Date().toISOString().split('T')[0];

          const upcoming = allApts
            .filter(apt => ['PENDING', 'CONFIRMED'].includes(apt.status) && apt.appointment_date >= todayStr)
            .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
          setUpcomingAppointments(upcoming);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [API_URL]);

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
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div style={styles.container}>
      <PatientSidebar onLogout={handleLogout} />

      <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <PatientHeader patientName={patientName} />

        <main style={styles.mainContent}>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={styles.dashboardContent}
          >
            {/* Integrated Header Section */}
            <motion.div variants={itemVariants} style={styles.headerSection}>
              <h1 style={styles.welcomeTitle}>Welcome back, {patientName}! 👋</h1>
              <p style={styles.welcomeSubtitle}>Check your health status and upcoming appointments.</p>
            </motion.div>

            {/* Hero Carousel Section */}
            <motion.section variants={itemVariants} style={styles.heroSection}>
              <HeroCarousel />
            </motion.section>

            {/* Summary Row */}
            <motion.div variants={itemVariants} style={styles.statsGrid}>
              <Link to="/patient/appointments" style={{ ...styles.statsCard, backgroundColor: "#eff6ff", border: "1px solid #dbeafe", textDecoration: 'none' }}>
                <div style={styles.statsInfo}>
                  <p style={{ ...styles.statsLabel, color: "#2563eb" }}>Upcoming Appointments</p>
                  <h3 style={{ ...styles.statsValue, color: "#1e3a8a" }}>{upcomingAppointments.length}</h3>
                </div>
                <div style={{ ...styles.statsIconBox, backgroundColor: "#dbeafe", color: "#2563eb" }}>
                  <FiCalendar />
                </div>
              </Link>

              <Link to="/patient/medical-history" style={{ ...styles.statsCard, backgroundColor: "#f0fdf4", border: "1px solid #dcfce7", textDecoration: 'none' }}>
                <div style={styles.statsInfo}>
                  <p style={{ ...styles.statsLabel, color: "#10b981" }}>Medical History</p>
                  <h3 style={{ ...styles.statsValue, color: "#064e3b" }}>0</h3>
                </div>
                <div style={{ ...styles.statsIconBox, backgroundColor: "#dcfce7", color: "#10b981" }}>
                  <FiClipboard />
                </div>
              </Link>

              <Link to="/patient/payments" style={{ ...styles.statsCard, backgroundColor: "#fdf2f8", border: "1px solid #fce7f3", textDecoration: 'none' }}>
                <div style={styles.statsInfo}>
                  <p style={{ ...styles.statsLabel, color: "#db2777" }}>Pending Payments</p>
                  <h3 style={{ ...styles.statsValue, color: "#831843" }}>0</h3>
                </div>
                <div style={{ ...styles.statsIconBox, backgroundColor: "#fce7f3", color: "#db2777" }}>
                  <FiCreditCard />
                </div>
              </Link>
            </motion.div>

            <div style={styles.layoutGrid}>
              {/* Left Column: Quick Actions + Appointments */}
              <div style={styles.leftColumn}>
                <motion.div variants={itemVariants} style={styles.quickActions}>
                  <Link to="/patient/find-doctor" style={styles.actionCard}>
                    <div style={{ ...styles.actionIcon, backgroundColor: "#eff6ff", color: "#2563eb" }}>
                      <FiSearch />
                    </div>
                    <div>
                      <h4 style={styles.actionTitle}>Find Doctor</h4>
                      <p style={styles.actionSubtitle}>Search by specialization</p>
                    </div>
                    <FiArrowRight style={styles.actionArrow} />
                  </Link>

                  <Link to="/patient/appointments" style={styles.actionCard}>
                    <div style={{ ...styles.actionIcon, backgroundColor: "#f0fdf4", color: "#10b981" }}>
                      <FiActivity />
                    </div>
                    <div>
                      <h4 style={styles.actionTitle}>My History</h4>
                      <p style={styles.actionSubtitle}>View past medical visits</p>
                    </div>
                    <FiArrowRight style={styles.actionArrow} />
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants} style={styles.appointmentSection}>
                  <AppointmentCarousel 
                    appointments={upcomingAppointments} 
                    onManageClick={() => navigate('/patient/appointments')}
                  />
                </motion.div>
              </div>

              {/* Right Column: Calendar & Support */}
              <div style={styles.rightColumn}>
                <motion.div variants={itemVariants}>
                  <MiniCalendar 
                    highlightedDates={upcomingAppointments.map((a) => a.appointment_date)}
                    onDateClick={() => navigate('/patient/appointments')}
                  />
                </motion.div>

                <motion.div variants={itemVariants} style={styles.supportBanner}>
                  <div style={styles.supportHeader}>
                    <FiClock style={styles.supportIcon} />
                    <h4 style={styles.supportTitle}>Need Help?</h4>
                  </div>
                  <p style={styles.supportText}>Our digital support team is available 24/7 for any technical or medical inquiries.</p>
                  <button style={styles.supportBtn}>Contact Support</button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', sans-serif"
  },
  mainContent: {
    padding: "40px 32px",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    maxWidth: "1600px",
    margin: "0 auto",
    width: "100%"
  },
  headerSection: {
    marginBottom: "8px",
  },
  welcomeTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px 0",
    letterSpacing: "-1px",
  },
  welcomeSubtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500"
  },
  dashboardContent: {
    maxWidth: "1200px",
    width: "100%",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "32px"
  },
  heroSection: {
    borderRadius: "28px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px"
  },
  statsCard: {
    borderRadius: "24px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
  },
  statsInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  statsLabel: {
    fontSize: "13px",
    fontWeight: "600",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.025em"
  },
  statsValue: {
    fontSize: "32px",
    fontWeight: "800",
    margin: 0
  },
  statsIconBox: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px"
  },
  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 360px",
    gap: "32px"
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "32px"
  },
  quickActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px"
  },
  actionCard: {
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    textDecoration: "none",
    border: "1px solid #f1f5f9",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden"
  },
  actionIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0
  },
  actionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0
  },
  actionSubtitle: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0
  },
  actionArrow: {
    marginLeft: "auto",
    color: "#cbd5e1",
    fontSize: "18px"
  },
  appointmentSection: {
    borderRadius: "28px",
    overflow: "hidden"
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "32px"
  },
  calendarContainer: {
    backgroundColor: "white",
    borderRadius: "28px",
    padding: "28px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)"
  },
  calendarHeader: {
    marginBottom: "24px"
  },
  calendarMonth: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0
  },
  calendarSubText: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "4px"
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "6px"
  },
  dayLabel: {
    textAlign: "center",
    padding: "8px 0",
    fontSize: "11px",
    fontWeight: "700",
    color: "#cbd5e1",
    textTransform: "uppercase"
  },
  dayCell: {
    aspectRatio: "1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "600",
    borderRadius: "12px",
    cursor: "pointer",
    position: "relative",
    color: "#475569"
  },
  highlightedDay: {
    backgroundColor: "#eff6ff",
    color: "#2563eb"
  },
  todayDay: {
    border: "2px solid #2563eb",
    color: "#2563eb"
  },
  dotIndicator: {
    position: 'absolute',
    bottom: '6px',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#2563eb'
  },
  supportBanner: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    borderRadius: "28px",
    padding: "32px",
    color: "white",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
  },
  supportHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px"
  },
  supportIcon: {
    fontSize: "20px",
    color: "#38bdf8"
  },
  supportTitle: {
    fontSize: "18px",
    fontWeight: "700",
    margin: 0
  },
  supportText: {
    fontSize: "14px",
    opacity: 0.7,
    lineHeight: 1.6,
    marginBottom: "24px"
  },
  supportBtn: {
    width: "100%",
    padding: "14px",
    borderRadius: "14px",
    backgroundColor: "white",
    color: "#0f172a",
    border: "none",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s"
  }
};

export default PatientDashboard;
