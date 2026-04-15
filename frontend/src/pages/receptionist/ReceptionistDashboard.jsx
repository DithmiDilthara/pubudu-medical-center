import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUserPlus, FiCalendar, FiClock, FiPlus, FiUsers, FiCreditCard, FiTrendingUp, FiZap, FiActivity, FiDollarSign, FiFileText, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import { motion } from "framer-motion";
import ReceptionistSidebar from "../../components/ReceptionistSidebar";
import ReceptionistHeader from "../../components/ReceptionistHeader";
import StatsCard from "../../components/StatsCard";

function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [receptionistName, setReceptionistName] = useState('Receptionist');
  const [doctors, setDoctors] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchSpec, setSearchSpec] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [needsRescheduleCount, setNeedsRescheduleCount] = useState(0);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    unpaidAppointments: 0,
    todayRevenue: 0
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Fetch profile and appointments on mount
  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setReceptionistName(response.data.data.profile.full_name);
        }
      } catch (error) {
        console.error("Error fetching receptionist profile:", error);
      }
    };

    const fetchDoctorsAndCancellations = async () => {
      try {
        // Fetch Doctors
        const docRes = await axios.get(`${API_URL}/doctors`);
        if (docRes.data.success) {
          setDoctors(docRes.data.data);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/receptionist/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${API_URL}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          const allApts = response.data.data;
          const today = new Date().toISOString().split('T')[0];
          const todayApts = allApts.filter(apt => apt.appointment_date === today);
          setAppointments(todayApts);
          // Count all future RESCHEDULE_REQUIRED appointments
          const rescheduleCount = allApts.filter(apt => apt.status === 'RESCHEDULE_REQUIRED' && apt.appointment_date >= today).length;
          setNeedsRescheduleCount(rescheduleCount);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchProfile();
    fetchDoctorsAndCancellations();
    fetchStats();
    fetchAppointments();
  }, []);



  // Filtered doctors
  const filteredDoctors = doctors.filter(doc => {
    const name = doc.full_name || "";
    const matchesName = name.toLowerCase().includes(searchName.toLowerCase());
    const matchesSpec = searchSpec ? doc.specialization === searchSpec : true;
    return matchesName && matchesSpec;
  });

  const uniqueSpecializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleAddPatient = () => {
    navigate("/receptionist/patients");
  };

  const handleMakeBooking = () => {
    navigate("/receptionist/appointments/new");
  };

  const handleMarkAsPaid = (appointment) => {
    navigate("/receptionist/payment/confirm", {
      state: {
        appointment: {
          patientName: appointment.patient?.full_name || 'Unknown',
          patientId: appointment.patient_id,
          dateOfService: appointment.appointment_date,
          service: appointment.doctor?.specialization || "Consultation",
          amount: 1500.00,
          appointment_id: appointment.appointment_id
        }
      }
    });
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/appointments/${appointmentId}/status`,
          { status: 'CANCELLED' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAppointments(prev =>
          prev.map(a => a.appointment_id === appointmentId ? { ...a, status: 'CANCELLED' } : a)
        );
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        alert("Failed to cancel appointment");
      }
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getBadgeStyle = (status) => {
    const base = {
      padding: '4px 12px',
      borderRadius: '9999px',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      border: '1px solid'
    };

    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return { ...base, backgroundColor: '#dcfce7', color: '#047857', borderColor: '#bbf7d0' };
      case 'PENDING':
        return { ...base, backgroundColor: '#fef3c7', color: '#b45309', borderColor: '#fde68a' };
      case 'CANCELLED':
        return { ...base, backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fecaca' };
      case 'COMPLETED':
        return { ...base, backgroundColor: '#dcfce7', color: '#166534', borderColor: '#bbf7d0' };
      case 'NO_SHOW':
        return { ...base, backgroundColor: '#f1f5f9', color: '#475569', borderColor: '#e2e8f0' };
      case 'RESCHEDULE_REQUIRED':
        return { ...base, backgroundColor: '#fff7ed', color: '#ea580c', borderColor: '#fed7aa' };
      default:
        return base;
    }
  };

  const getPaymentBadgeStyle = (status) => {
    const base = {
      padding: '4px 10px',
      borderRadius: '8px',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase'
    };

    if (status?.toUpperCase() === 'PAID') {
      return { ...base, backgroundColor: '#dcfce7', color: '#047857' };
    }
    return { ...base, backgroundColor: '#fee2e2', color: '#b91c1c' };
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
    <div style={styles.container}>
      {/* Sidebar */}
      <ReceptionistSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <motion.div 
        className="main-wrapper"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <ReceptionistHeader receptionistName={receptionistName} />

        {/* Dashboard Content */}
        <main className="content-padding">
          {/* Section 1: Page Header */}
          <motion.header variants={itemVariants} style={styles.headerSection}>
            <div style={styles.headerLeft}>
              <h1 style={styles.welcomeTitle}>Welcome back, {receptionistName}!</h1>
              <p style={styles.welcomeSubtitle}>Check your health status and upcoming appointments.</p>
            </div>
          </motion.header>

          {/* Section 2: Cards Row */}
          <motion.div variants={itemVariants} style={styles.statsGrid} className="stats-grid-responsive">
            {[
              { 
                title: "Today's Appointments", 
                value: stats.todayAppointments || 0, 
                icon: <FiCalendar style={{ fontSize: '20px' }} />, 
                gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)", 
                shadow: "rgba(59, 130, 246, 0.25)",
                delay: 0.1,
                onClick: () => navigate("/receptionist/appointments")
              },
              { 
                title: "Total Patients", 
                value: stats.totalPatients || 0, 
                icon: <FiUsers style={{ fontSize: '20px' }} />, 
                gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", 
                shadow: "rgba(139, 92, 246, 0.25)",
                delay: 0.2,
                onClick: () => navigate("/receptionist/patients")
              },
              { 
                title: "Unpaid Appointments", 
                value: stats.unpaidAppointments || 0, 
                icon: <FiCreditCard style={{ fontSize: '20px' }} />, 
                gradient: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)", 
                shadow: "rgba(244, 63, 94, 0.25)",
                delay: 0.3,
                onClick: () => navigate("/receptionist/payment")
              },
            ].map((card, index) => (
              <StatsCard
                key={index}
                title={card.title}
                value={card.value}
                icon={card.icon}
                gradient={card.gradient}
                shadow={card.shadow}
                delay={card.delay}
                onClick={card.onClick}
              />
            ))}

            {/* Needs Reschedule — StatsCard + Double Animation */}
            <div style={{ position: 'relative' }} className={needsRescheduleCount > 0 ? 'reschedule-pulse-card' : ''}>
              {needsRescheduleCount > 0 && (
                <span className="reschedule-dot" style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#f97316',
                  border: '2px solid white',
                  zIndex: 10
                }} />
              )}
              <StatsCard
                title="Needs Reschedule"
                value={needsRescheduleCount}
                icon={<FiAlertTriangle style={{ fontSize: '20px' }} />}
                gradient="linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
                shadow="rgba(249, 115, 22, 0.25)"
                delay={0.4}
                onClick={() => navigate("/receptionist/appointments", { state: { filterStatus: 'RESCHEDULE_REQUIRED' } })}
              />
            </div>
          </motion.div>

          {/* Section 3: Quick Actions Grid */}
          <motion.section 
            variants={itemVariants}
            style={styles.quickActionsCard}
          >
            {/* Card Header */}
            <div style={styles.quickActionsHeader}>
              <div style={styles.zapIconWrapper}>
                <FiZap style={styles.zapIcon} />
              </div>
              <div>
                <h2 style={styles.quickActionsTitle}>Quick Actions</h2>
                <p style={styles.quickActionsSubtitle}>Frequently used tasks at your fingertips</p>
              </div>
            </div>

            {/* Grid */}
            <div style={styles.quickActionsGrid}>
              {[
                { label: "Book Appointment", icon: <FiPlus />, gradient: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)", primary: false, onClick: handleMakeBooking },
                { label: "Register Patient", icon: <FiUserPlus />, gradient: "linear-gradient(135deg, #8b5cf6 0%, #9333ea 100%)", primary: false, onClick: handleAddPatient },
                { label: "View Doctors", icon: <FiActivity />, gradient: "linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)", primary: false, onClick: () => navigate("/receptionist/doctors") },
                { label: "Process Payments", icon: <FiCreditCard />, gradient: "linear-gradient(135deg, #10b981 0%, #0d9488 100%)", primary: false, onClick: () => navigate("/receptionist/payment") },
                { label: "All Appointments", icon: <FiCheckCircle />, gradient: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)", primary: false, onClick: () => navigate("/receptionist/appointments") }
              ].map((action, idx) => (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    delay: 0.5 + idx * 0.05 
                  }}
                  whileHover={{ 
                    scale: 1.02, 
                    y: -6,
                    boxShadow: '0 12px 24px -8px rgba(0,0,0,0.12)'
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.onClick}
                  style={{
                    ...styles.actionBtnSecondary,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ 
                    ...styles.actionIconSquare, 
                    background: action.gradient,
                    color: 'white'
                  }}>
                    {action.icon}
                  </div>
                  <span style={styles.actionLabelSecondary}>
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.section>

          {/* Section 4: Today's Schedule Table */}
          <motion.section
            variants={itemVariants}
            style={styles.scheduleCard}
          >
            <div style={styles.scheduleHeader}>
              <div style={styles.headerLeftInfo}>
                <div style={styles.clockIconWrapper}>
                  <FiClock style={{ fontSize: '20px' }} />
                </div>
                <div>
                  <h2 style={styles.scheduleTitle}>Today's Schedule</h2>
                  <p style={styles.scheduleSubtitle}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <button 
                onClick={() => navigate("/receptionist/appointments")}
                style={styles.viewAllBtn}
              >
                View All →
              </button>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.scheduleTableHeader}>
                    <th style={styles.schedTh}>Time</th>
                    <th style={styles.schedTh}>Patient</th>
                    <th style={styles.schedTh}>Doctor</th>
                    <th style={styles.schedTh}>Status</th>
                    <th style={styles.schedTh}>Payment</th>
                  </tr>
                </thead>
                <tbody style={{ divideY: '1px solid #eff6ff' }}>
                  {appointments.length > 0 ? (
                    appointments.map((apt) => (
                      <tr key={apt.appointment_id} className="hover-schedule-row" style={styles.schedTr}>
                        <td style={styles.schedTd}>
                          <div style={styles.timeWrapper}>
                            <FiClock style={styles.timeIcon} />
                            {apt.time_slot.split(' - ')[0]}
                          </div>
                        </td>
                        <td style={styles.schedTd}>
                          <span style={styles.patientNameText}>{apt.patient?.full_name}</span>
                        </td>
                        <td style={styles.schedTd}>
                          <span style={styles.doctorNameText}>Dr. {apt.doctor?.full_name.split(' ').pop()}</span>
                        </td>
                        <td style={styles.schedTd}>
                          <span style={getBadgeStyle(apt.status)}>
                            {apt.status}
                          </span>
                        </td>
                        <td style={styles.schedTd}>
                          <span style={getPaymentBadgeStyle(apt.payment_status)}>
                            {apt.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={styles.emptyState}>
                        No appointments scheduled for today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.section>

          <style>
            {`
              .hover-schedule-row {
                transition: all 0.2s ease;
                border-bottom: 1px solid #eff6ff;
              }
              .hover-schedule-row:hover {
                background-color: rgba(59, 130, 246, 0.08) !important;
              }
              .stats-grid-responsive {
                display: grid !important;
                gap: 20px !important;
              }
              @media (max-width: 1024px) {
                .stats-grid-responsive {
                  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) !important;
                }
              }
              @media (max-width: 640px) {
                .stats-grid-responsive {
                  grid-template-columns: 1fr !important;
                }
              }
              @keyframes reschedule-glow {
                0%   { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
                50%  { box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); }
                100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
              }
              .reschedule-pulse-card {
                animation: reschedule-glow 2s ease-in-out infinite;
                border-radius: 24px;
              }
              @keyframes dot-blink {
                0%, 100% { opacity: 1; }
                50%       { opacity: 0; }
              }
              .reschedule-dot {
                animation: dot-blink 1s ease-in-out infinite;
              }
            `}
          </style>

        </main>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#f1f5f9"
  },
  quickActionsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
    marginBottom: "40px"
  },
  quickActionsHeader: {
    background: "linear-gradient(to right, rgba(239, 246, 255, 0.8), rgba(224, 231, 255, 0.8))",
    padding: "20px 24px",
    borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  zapIconWrapper: {
    background: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)",
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
    color: "white"
  },
  zapIcon: {
    fontSize: "24px"
  },
  quickActionsTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0
  },
  quickActionsSubtitle: {
    fontSize: "12px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500"
  },
  quickActionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    padding: "24px"
  },
  actionBtnPrimary: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    borderRadius: "20px",
    border: "none",
    color: "white",
    cursor: "pointer",
    boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
    transition: "all 0.3s ease"
  },
  actionBtnSecondary: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    borderRadius: "20px",
    backgroundColor: "white",
    border: "1px solid #eff6ff",
    color: "#1e293b",
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s ease"
  },
  actionIconSquare: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    marginBottom: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  },
  actionLabelPrimary: {
    fontSize: "15px",
    fontWeight: "700",
    color: "white"
  },
  actionLabelSecondary: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1e293b"
  },
  scheduleCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
    marginBottom: "40px"
  },
  scheduleHeader: {
    background: "linear-gradient(to right, rgba(248, 250, 252, 0.8), rgba(239, 246, 255, 0.8))",
    padding: "20px 24px",
    borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  headerLeftInfo: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  clockIconWrapper: {
    background: "linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)",
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    boxShadow: "0 4px 10px rgba(6, 182, 212, 0.2)"
  },
  scheduleTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0
  },
  scheduleSubtitle: {
    fontSize: "11px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  viewAllBtn: {
    padding: "8px 16px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    border: "none",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  tableContainer: {
    width: "100%",
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  scheduleTableHeader: {
    background: "linear-gradient(to right, #2563eb 0%, #4f46e5 100%)",
    borderBottom: "none"
  },
  schedTh: {
    textAlign: "left",
    padding: "16px 24px",
    fontSize: "12px",
    fontWeight: "600",
    color: "white",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  schedTr: {
    borderBottom: "1px solid #eff6ff"
  },
  schedTd: {
    padding: "16px 24px",
    fontSize: "14px",
    color: "#475569"
  },
  timeWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "600",
    color: "#1e293b"
  },
  timeIcon: {
    color: "#3b82f6",
    fontSize: "14px"
  },
  patientNameText: {
    fontWeight: "600",
    color: "#1e293b"
  },
  doctorNameText: {
    fontWeight: "500",
    color: "#64748b"
  },
  emptyState: {
    padding: "40px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px",
    fontStyle: "italic"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "40px"
  },
  headerSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px"
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
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
  headerRight: {
    display: "flex",
    gap: "12px"
  },
  btnPrimary: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#2563eb",
    color: "white",
    padding: "10px 18px",
    borderRadius: "12px",
    border: "none",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.2)",
    transition: "all 0.2s"
  },
  btnSecondary: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "white",
    color: "#334155",
    padding: "10px 18px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  btnIcon: {
    fontSize: "18px"
  },
  searchSection: {
    marginBottom: "40px"
  },
  searchContainer: {
    backgroundColor: "#eff6ff",
    borderRadius: "28px",
    padding: "32px",
    display: "flex",
    gap: "24px",
    alignItems: "flex-end",
    boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.1)",
    border: "2px solid #3b82f6",
    marginBottom: "40px"
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    borderRadius: "14px",
    border: "2px solid #e2e8f0",
    backgroundColor: "white",
    transition: "all 0.2s",
    overflow: "hidden"
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    gap: "8px"
  },
  inputLabel: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "700",
    marginLeft: "4px"
  },
  searchInput: {
    padding: "14px 16px",
    border: "none",
    backgroundColor: "transparent",
    fontSize: "14px",
    color: "#0f172a",
    width: "100%",
    outline: "none",
  },
  searchBtnContainer: {
    marginBottom: "2px"
  },
  searchActionBtn: {
    background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    padding: "14px 32px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  tableSection: {
    backgroundColor: "white",
    borderRadius: "24px",
    padding: "32px",
    border: "2px solid #3b82f6",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)"
  },
  tableTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 24px 0"
  },
  tableHeaderRow: {
    borderBottom: "1px solid #f1f5f9"
  },
  tableHeader: {
    textAlign: "left",
    padding: "12px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  tableRow: {
    borderBottom: "1px solid #f8fafc"
  },
  tableCell: {
    padding: "16px",
    fontSize: "14px"
  },
  patientName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#0f172a",
    margin: 0
  },
  doctorBadge: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#7c3aed",
    backgroundColor: "#f5f3ff",
    padding: "6px 12px",
    borderRadius: "9999px",
    border: "1px solid rgba(124, 58, 237, 0.1)"
  },
  amountBadge: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#059669",
    backgroundColor: "#ecfdf5",
    padding: "6px 12px",
    borderRadius: "8px"
  },
  actionButton: {
    background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "10px 20px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 10px rgba(37, 99, 235, 0.2)"
  }
};

export default ReceptionistDashboard;
