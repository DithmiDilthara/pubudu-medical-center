import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiFileText, FiUserCheck, FiActivity, FiUsers } from "react-icons/fi";
import { FaStethoscope } from "react-icons/fa";
import { motion } from "framer-motion";
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";
import StatCard from "../../components/StatCard";
import WeeklyAppointmentsChart from "../../components/WeeklyAppointmentsChart";
import RevenueDonutChart from "../../components/RevenueDonutChart";

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
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5, 
        staggerChildren: 0.1 
      }
    }
  };

  return (
    <div className="page-container">
      <AdminSidebar />
      <div className="main-wrapper">
        <AdminHeader adminName={adminName} />
        
        <motion.main 
          className="content-padding"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={styles.mainContent}
        >
          {/* Header Title - Personalized Welcome */}
          <div style={styles.headerTitleSection}>
            <h1 style={styles.pageTitle}>Welcome back, {adminName}!</h1>
            <p style={styles.pageSubtitle}>Monitor and manage medical center operations efficiently.</p>
          </div>

          {/* Section 1: Quick Actions Bar - Blue Styling */}
          <section style={styles.dashboardSection}>
            <h2 style={styles.sectionHeading}>Quick Actions</h2>
            <div style={styles.quickActionsBar}>
              <button style={styles.quickActionButton} onClick={() => navigate("/admin/doctors")}>
                <div style={styles.quickActionIconWrapper}>
                  <FaStethoscope />
                </div>
                <span>Add Doctor</span>
              </button>
              <button style={styles.quickActionButton} onClick={() => navigate("/admin/receptionist")}>
                <div style={styles.quickActionIconWrapper}>
                  <FiUserCheck />
                </div>
                <span>Add Receptionist</span>
              </button>
              <button style={styles.quickActionButton} onClick={() => navigate("/admin/reports")}>
                <div style={styles.quickActionIconWrapper}>
                  <FiFileText />
                </div>
                <span>Generate Reports</span>
              </button>
            </div>
          </section>

          {/* Section 2: stat cards */}
          <section style={styles.dashboardSection}>
            <h2 style={styles.sectionHeading}>System Statistics</h2>
            <div style={styles.statsGrid}>
              <StatCard 
                icon={FaStethoscope} 
                label="Total Doctors" 
                value={isLoading ? "..." : stats.doctors} 
                color="#2563eb"
                delay={0.1}
              />
              <StatCard 
                icon={FiUserCheck} 
                label="Total Receptionists" 
                value={isLoading ? "..." : stats.receptionists || 0} 
                color="#10b981"
                delay={0.2}
              />
              <StatCard 
                icon={FiUsers} 
                label="Total Patients" 
                value={isLoading ? "..." : stats.patients}
                color="#f59e0b"
                delay={0.3}
              />
            </div>
          </section>

          {/* Section 3: Two-column chart layout */}
          <section style={styles.dashboardSection}>
            <div className="dashboard-charts-grid">
              <div className="chart-span-2">
                <WeeklyAppointmentsChart />
              </div>
              <div className="chart-span-1">
                <RevenueDonutChart />
              </div>
            </div>
          </section>
        </motion.main>
      </div>
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
  }
};

export default AdminDashboard;

