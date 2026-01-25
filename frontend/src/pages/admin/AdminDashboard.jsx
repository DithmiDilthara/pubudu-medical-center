import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUserPlus, FiFileText, FiUserCheck } from "react-icons/fi";
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Admin logged out");
    navigate("/");
  };

  const handleAddDoctor = () => {
    navigate("/admin/doctors");
  };

  const handleManageReceptionist = () => {
    navigate("/admin/receptionist");
  };

  const handleGenerateReport = () => {
    navigate("/admin/reports");
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <AdminSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div style={styles.mainWrapper}>
        {/* Header */}
        <AdminHeader adminName="Admin User" />

        {/* Dashboard Content */}
        <main style={styles.mainContent}>
          {/* Page Title */}
          <h1 style={styles.pageTitle}>Admin Dashboard</h1>

          {/* Quick Actions */}
          <section style={styles.quickActionsSection}>
            <h2 style={styles.sectionTitle}>Quick Actions</h2>
            <div style={styles.quickActionsGrid}>
              <button style={styles.actionButton} onClick={handleAddDoctor}>
                <FiUserPlus style={styles.actionIcon} />
                Add Doctor
              </button>
              <button style={styles.actionButtonSecondary} onClick={handleGenerateReport}>
                <FiFileText style={styles.actionIcon} />
                Generate Report
              </button>
              <button style={styles.actionButton} onClick={handleManageReceptionist}>
                <FiUserCheck style={styles.actionIcon} />
                Manage Receptionist
              </button>
            </div>
          </section>

          {/* System Overview */}
          <section style={styles.overviewSection}>
            <h2 style={styles.sectionTitle}>System Overview</h2>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <p style={styles.statLabel}>Total Doctors</p>
                <p style={styles.statValue}>25</p>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statLabel}>Total Patients</p>
                <p style={styles.statValue}>150</p>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statLabel}>Total Appointments</p>
                <p style={styles.statValue}>300</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f3f4f6"
  },
  mainWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },
  mainContent: {
    padding: "32px",
    flex: 1
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: "32px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  quickActionsSection: {
    marginBottom: "32px"
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "20px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  quickActionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    maxWidth: "800px"
  },
  actionButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "14px 24px",
    backgroundColor: "#0066CC",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  actionButtonSecondary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "14px 24px",
    backgroundColor: "white",
    color: "#4b5563",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  actionIcon: {
    fontSize: "18px"
  },
  overviewSection: {
    marginBottom: "32px"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    maxWidth: "1000px"
  },
  statCard: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e5e7eb"
  },
  statLabel: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "8px",
    fontWeight: "500",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  statValue: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#1f2937",
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

export default AdminDashboard;

