import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiDownload, FiCalendar, FiFileText } from "react-icons/fi";
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";

function Reports() {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState("revenue");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/admin/reports/financial`;

      const response = await axios.get(url, {
        params: { startDate, endDate },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setReportData(response.data.data);
        alert(`Report generated successfully!`);
      }
    } catch (error) {
      console.error("Report error:", error);
      alert("Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  const reportTypes = [
    { value: "appointments", label: "Appointments Report", icon: FiCalendar },
    { value: "patients", label: "Patient Registration Report", icon: FiFileText },
    { value: "revenue", label: "Revenue Report", icon: FiFileText }
  ];

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
          <h1 style={styles.pageTitle}>Generate Reports</h1>

          {/* Report Generation Form */}
          <div style={styles.reportCard}>
            <h2 style={styles.cardTitle}>Report Configuration</h2>

            <div style={styles.formContainer}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Report Type</label>
                <select
                  value={selectedReportType}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                  style={styles.select}
                >
                  {reportTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.dateGroup}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <button style={styles.generateButton} onClick={handleGenerateReport}>
                <FiDownload style={styles.buttonIcon} />
                Generate & Download Report
              </button>
            </div>
          </div>

          {/* Report Statistics / Summary */}
          {reportData && (
            <div style={{ ...styles.reportCard, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div style={styles.statBox}>
                <h4 style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Total Revenue</h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#10b981' }}>
                  Rs. {reportData.totalRevenue?.toLocaleString()}
                </p>
              </div>
              <div style={styles.statBox}>
                <h4 style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Total Paid</h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#0066CC' }}>
                  Rs. {reportData.totalPaid?.toLocaleString()}
                </p>
              </div>
              <div style={styles.statBox}>
                <h4 style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Total Pending</h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#ef4444' }}>
                  Rs. {reportData.totalPending?.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Available Reports */}
          <div style={styles.reportsListSection}>
            <h2 style={styles.sectionTitle}>Available Report Types</h2>
            <div style={styles.reportsGrid}>
              {reportTypes.map((type) => (
                <div key={type.value} style={styles.reportTypeCard}>
                  <type.icon style={styles.reportIcon} />
                  <h3 style={styles.reportTypeTitle}>{type.label}</h3>
                  <p style={styles.reportTypeDescription}>
                    {type.value === "appointments" && "View all appointments with details including patient info, doctor, date, and status"}
                    {type.value === "patients" && "Track new patient registrations over time with demographic information"}
                    {type.value === "revenue" && "Financial overview including payments, pending amounts, and revenue trends"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reports */}
          <div style={styles.recentReportsSection}>
            <h2 style={styles.sectionTitle}>Recent Reports</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Report Type</th>
                    <th style={styles.th}>Date Range</th>
                    <th style={styles.th}>Generated On</th>
                    <th style={styles.th}>Generated By</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={styles.tr}>
                    <td style={styles.td}>Appointments Report</td>
                    <td style={styles.td}>2024-01-01 to 2024-01-15</td>
                    <td style={styles.td}>2024-01-15 10:00 AM</td>
                    <td style={styles.td}>Admin User</td>
                    <td style={styles.td}>
                      <button style={styles.downloadButton}>
                        <FiDownload />
                      </button>
                    </td>
                  </tr>
                  <tr style={styles.tr}>
                    <td style={styles.td}>Revenue Report</td>
                    <td style={styles.td}>2024-01-01 to 2024-01-13</td>
                    <td style={styles.td}>2024-01-13 05:45 PM</td>
                    <td style={styles.td}>Admin User</td>
                    <td style={styles.td}>
                      <button style={styles.downloadButton}>
                        <FiDownload />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={styles.footer}>
            <button
              onClick={() => navigate("/admin/dashboard")}
              style={styles.backButton}
            >
              Back
            </button>
          </div>
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
  reportCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "32px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    marginBottom: "32px"
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "24px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  formContainer: {
    maxWidth: "600px"
  },
  formGroup: {
    marginBottom: "20px"
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "8px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  select: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    backgroundColor: "white",
    cursor: "pointer"
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxSizing: "border-box"
  },
  dateGroup: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px"
  },
  generateButton: {
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
    marginTop: "8px",
    width: "100%",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  buttonIcon: {
    fontSize: "18px"
  },
  reportsListSection: {
    marginBottom: "32px"
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "20px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  reportsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px"
  },
  reportTypeCard: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e5e7eb"
  },
  reportIcon: {
    fontSize: "32px",
    color: "#0066CC",
    marginBottom: "12px"
  },
  reportTypeTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "8px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  reportTypeDescription: {
    fontSize: "13px",
    color: "#6b7280",
    lineHeight: "1.6",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  recentReportsSection: {
    marginBottom: "32px"
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    overflow: "hidden"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  th: {
    backgroundColor: "#f9fafb",
    padding: "16px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "700",
    color: "#374151",
    borderBottom: "2px solid #e5e7eb",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  tr: {
    borderBottom: "1px solid #e5e7eb"
  },
  td: {
    padding: "16px",
    fontSize: "14px",
    color: "#4b5563",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  downloadButton: {
    padding: "8px 16px",
    backgroundColor: "#0066CC",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s"
  },
  footer: {
    marginTop: '32px',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingBottom: '20px'
  },
  backButton: {
    padding: '10px 24px',
    border: 'none',
    borderRadius: '6px',
    background: '#0066CC',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 102, 204, 0.2)',
    transition: 'all 0.2s',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

export default Reports;

