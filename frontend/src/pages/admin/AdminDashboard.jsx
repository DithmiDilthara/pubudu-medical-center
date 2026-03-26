import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiFileText, FiUserCheck, FiActivity, FiUsers } from "react-icons/fi";
import { FaStethoscope } from "react-icons/fa";
import { motion } from "framer-motion";
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";
import StatsCard from "../../components/StatsCard";
import WeeklyAppointmentsChart from "../../components/WeeklyAppointmentsChart";
import PatientRegistrationModal from "../../components/PatientRegistrationModal";
import RevenueBreakdownModal from "../../components/RevenueBreakdownModal";
import RevenueTrendChart from "../../components/RevenueTrendChart";
import { FiDollarSign } from "react-icons/fi";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0,
    receptionists: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [adminName, setAdminName] = useState('Admin');
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

        // Fetch Stats
        const statsRes = await axios.get(`${apiUrl}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }

        // Fetch Profile
        const profileRes = await axios.get(`${apiUrl}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (profileRes.data.success) {
          setAdminName(profileRes.data.data.username || 'Admin');
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="page-container">
      <AdminSidebar />
      <motion.div 
        className="main-wrapper"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <AdminHeader adminName={adminName} />
        
        <main 
          className="content-padding"
          style={styles.mainContent}
        >
          {/* Header Title - Personalized Welcome */}
          <motion.div variants={itemVariants} style={styles.headerTitleSection}>
            <h1 style={styles.pageTitle}>Welcome back, {adminName}!</h1>
            <p style={styles.pageSubtitle}>Monitor and manage medical center operations efficiently.</p>
          </motion.div>

          {/* Section 1: stat cards (Moved Up) */}
          <motion.section variants={itemVariants} style={styles.dashboardSection}>
            <div style={styles.statsGrid}>
              <StatsCard 
                icon={<FaStethoscope style={{ fontSize: '20px' }} />} 
                title="Total Doctors" 
                value={isLoading ? "..." : stats.doctors} 
                gradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                shadow="rgba(59, 130, 246, 0.25)"
                delay={0.4}
              />
              <StatsCard 
                icon={<FiUserCheck style={{ fontSize: '20px' }} />} 
                title="Total Receptionists" 
                value={isLoading ? "..." : stats.receptionists || 0} 
                gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                shadow="rgba(16, 185, 129, 0.25)"
                delay={0.5}
              />
              <StatsCard 
                icon={<FiUsers style={{ fontSize: '20px' }} />} 
                title="Total Patients" 
                value={isLoading ? "..." : stats.patients}
                gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                shadow="rgba(245, 158, 11, 0.25)"
                delay={0.6}
                onClick={() => setIsPatientModalOpen(true)}
              />
              <StatsCard 
                icon={<FiDollarSign style={{ fontSize: '20px' }} />} 
                title="Total Revenue" 
                value={isLoading ? "..." : `LKR ${parseFloat(stats.totalRevenue || 0).toLocaleString()}`}
                gradient="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                shadow="rgba(99, 102, 241, 0.25)"
                delay={0.7}
                onClick={() => setIsRevenueModalOpen(true)}
              />
            </div>
          </motion.section>

          {/* Section 2: Quick Actions Card (Moved Down) */}
          <motion.section variants={itemVariants} style={styles.quickActionsCard}>
            <div style={styles.quickActionsHeader}>
              <div style={styles.quickActionIconTile}>
                <FiActivity style={{ fontSize: '24px' }} />
              </div>
              <div>
                <h2 style={styles.quickActionsTitle}>Quick Management</h2>
                <p style={styles.quickActionsSubtitle}>Common administrative tasks at your fingertips</p>
              </div>
            </div>

            <div style={styles.quickActionsGrid}>
              {[
                { label: "Add Doctor", icon: <FaStethoscope />, gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", shadow: "rgba(99, 102, 241, 0.2)", onClick: () => navigate("/admin/doctors") },
                { label: "Add Receptionist", icon: <FiUserCheck />, gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", shadow: "rgba(99, 102, 241, 0.2)", onClick: () => navigate("/admin/receptionist") },
                { label: "Generate Reports", icon: <FiFileText />, gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", shadow: "rgba(99, 102, 241, 0.2)", onClick: () => navigate("/admin/reports") }
              ].map((action, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ 
                    y: -6, 
                    scale: 1.02, 
                    boxShadow: `0 12px 24px -8px ${action.shadow}`,
                    background: action.gradient,
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.onClick}
                  className="premium-action-btn-hover"
                  style={{
                    ...styles.premiumActionBtn,
                    border: `1px solid ${action.shadow.replace('0.2', '0.1')}`,
                    boxShadow: `0 4px 6px -1px ${action.shadow.replace('0.2', '0.05')}`
                  }}
                >
                  <div className="action-icon-wrapper" style={{ ...styles.actionIconSquare, background: action.gradient }}>
                    {action.icon}
                  </div>
                  <span className="action-label" style={styles.actionLabelText}>{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.section>

          <motion.section variants={itemVariants} style={styles.dashboardSection}>
            <div className="dashboard-charts-grid">
              <div className="chart-span-3">
                <WeeklyAppointmentsChart />
              </div>
            </div>
          </motion.section>

          <motion.section variants={itemVariants} style={styles.dashboardSection}>
            <RevenueTrendChart />
          </motion.section>
        </main>
      </motion.div>

      <PatientRegistrationModal 
        isOpen={isPatientModalOpen} 
        onClose={() => setIsPatientModalOpen(false)} 
      />

      <RevenueBreakdownModal
        isOpen={isRevenueModalOpen}
        onClose={() => setIsRevenueModalOpen(false)}
      />

      <style>
        {`
          .premium-action-btn-hover {
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          .premium-action-btn-hover:hover .action-label {
            color: white !important;
          }
          .premium-action-btn-hover:hover .action-icon-wrapper {
            background: rgba(255, 255, 255, 0.2) !important;
            backdrop-filter: blur(8px);
            border: 1px solid rgba(255, 255, 255, 0.3);
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  mainContent: {
    flex: 1,
    overflowY: "auto",
  },
  headerTitleSection: {
    marginBottom: "40px",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 4px 0",
    letterSpacing: "-0.5px",
    fontFamily: "var(--font-accent)",
  },
  pageSubtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500",
    fontFamily: "var(--font-main)",
  },
  dashboardSection: {
    marginBottom: "48px",
  },
  sectionHeading: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "20px",
    fontFamily: "var(--font-accent)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  quickActionsBar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
  },
  quickActionButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 20px",
    backgroundColor: "#2563eb",
    border: "none",
    borderRadius: "14px",
    color: "white",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
    ":hover": {
      backgroundColor: "#1d4ed8",
      transform: "translateY(-2px)",
      boxShadow: "0 6px 16px rgba(37, 99, 235, 0.3)",
    }
  },
  quickActionIconWrapper: {
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    marginBottom: "40px"
  },
  quickActionsCard: {
    backgroundColor: "white",
    borderRadius: "24px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    overflow: "hidden",
    marginBottom: "40px"
  },
  quickActionsHeader: {
    background: "linear-gradient(to right, #f8fafc, #f1f5f9)",
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  quickActionIconTile: {
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.2)"
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
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    padding: "24px"
  },
  premiumActionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    backgroundColor: "white",
    border: "1px solid #f1f5f9",
    borderRadius: "20px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
  },
  actionIconSquare: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "20px",
    flexShrink: 0
  },
  actionLabelText: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#334155"
  }
};

export default AdminDashboard;

