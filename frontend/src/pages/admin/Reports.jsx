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
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      let url = `${baseUrl}/admin/reports/${selectedReportType}`;

      const response = await axios.get(url, {
        params: { startDate, endDate },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setReportData(response.data.data);
        alert(`Report data fetched successfully!`);
      }
    } catch (error) {
      console.error("Report error:", error);
      alert("Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!reportData) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    let filename = `${selectedReportType}_report_${startDate}_to_${endDate}.csv`;

    if (selectedReportType === 'revenue') {
      csvContent += "Appointment ID,Patient,Doctor,Date,Center Fee\n";
      reportData.appointments.forEach(a => {
        csvContent += `${a.appointment_id},${a.patient_name},${a.doctor_name},${a.date},${a.center_fee}\n`;
      });
      csvContent += `\nTotal Center Revenue,,Rs. ${reportData.totalRevenue}\n`;
    } else if (selectedReportType === 'patients') {
      csvContent += "Name,NIC,Source,Registration Date,Contact\n";
      reportData.patients.forEach(p => {
        csvContent += `${p.name},${p.nic},${p.source},${new Date(p.date).toLocaleDateString()},${p.contact}\n`;
      });
      csvContent += `\nTotal Registrations,${reportData.summary.total}\n`;
      csvContent += `Online,${reportData.summary.online}\n`;
      csvContent += `Receptionist,${reportData.summary.receptionist}\n`;
    } else if (selectedReportType === 'appointments') {
      csvContent += "ID,Patient,Doctor,Date,Status,Payment,Reason,Absent\n";
      reportData.appointments.forEach(a => {
        csvContent += `${a.id},${a.patient},${a.doctor},${a.date},${a.status},${a.payment},${a.reason || ''},${a.absent ? 'Yes' : 'No'}\n`;
      });
      csvContent += `\nTotal Appointments,${reportData.summary.total}\n`;
      csvContent += `Cancelled,${reportData.summary.cancelled}\n`;
      csvContent += `Unpaid Cancellations,${reportData.summary.cancelledUnpaid}\n`;
      csvContent += `Absent/No-show,${reportData.summary.absent}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportTypes = [
    { value: "appointments", label: "Appointments Report", icon: FiCalendar },
    { value: "patients", label: "Patient Registration Report", icon: FiFileText },
    { value: "revenue", label: "Revenue Report (Center Fees)", icon: FiFileText }
  ];

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <AdminSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="main-wrapper">
        {/* Header */}
        <AdminHeader adminName="Admin User" />

        {/* Dashboard Content */}
        <main className="content-padding">
          <h1 style={styles.pageTitle}>Generate Reports</h1>

          {/* Report Generation Form */}
          <div style={styles.reportCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ ...styles.cardTitle, margin: 0 }}>Report Configuration</h2>
              {reportData && (
                <button style={{ ...styles.generateButton, width: 'auto', marginTop: 0, backgroundColor: '#10b981' }} onClick={downloadCSV}>
                  <FiDownload style={styles.buttonIcon} />
                   Download CSV
                </button>
              )}
            </div>

            <div style={styles.formContainer}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Report Type</label>
                <select
                  value={selectedReportType}
                  onChange={(e) => {
                    setSelectedReportType(e.target.value);
                    setReportData(null);
                  }}
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

              <button style={styles.generateButton} onClick={handleGenerateReport} disabled={isLoading}>
                {isLoading ? "Generating..." : "Preview Report Data"}
              </button>
            </div>
          </div>

          {/* Report Statistics / Summary */}
          {reportData && selectedReportType === 'revenue' && (
            <div style={{ ...styles.reportCard, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              <div style={styles.statBox}>
                <h4 style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Total Center Revenue</h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#10b981' }}>
                  Rs. {reportData.totalRevenue?.toLocaleString()}
                </p>
              </div>
              <div style={styles.statBox}>
                <h4 style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Paid Appointments</h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#0066CC' }}>
                  {reportData.appointmentCount}
                </p>
              </div>
            </div>
          )}

          {reportData && selectedReportType === 'patients' && (
            <div style={{ ...styles.reportCard, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div style={styles.statBox}>
                <h4 style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Total Registrations</h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{reportData.summary.total}</p>
              </div>
              <div style={styles.statBox}>
                <h4 style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Online</h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#10b981' }}>{reportData.summary.online}</p>
              </div>
              <div style={styles.statBox}>
                <h4 style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Receptionist</h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#0066CC' }}>{reportData.summary.receptionist}</p>
              </div>
            </div>
          )}

          {reportData && selectedReportType === 'appointments' && (
            <div style={{ ...styles.reportCard, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              <div style={styles.statBox}>
                <h4 style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Total</h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{reportData.summary.total}</p>
              </div>
              <div style={styles.statBox}>
                <h4 style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Cancelled</h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#ef4444' }}>{reportData.summary.cancelled}</p>
              </div>
              <div style={styles.statBox}>
                <h4 style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Unpaid</h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f59e0b' }}>{reportData.summary.cancelledUnpaid}</p>
              </div>
              <div style={styles.statBox}>
                <h4 style={{ margin: '0 0 8px 0', color: '#6b7280' }}>Absent</h4>
                <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#6366f1' }}>{reportData.summary.absent}</p>
              </div>
            </div>
          )}

          {/* Available Reports */}
          <div style={styles.reportsListSection}>
            <h2 style={styles.sectionTitle}>Available Report Types</h2>
            <div style={styles.reportsGrid}>
              {reportTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                <div key={type.value} style={styles.reportTypeCard}>
                  <IconComponent style={styles.reportIcon} />
                  <h3 style={styles.reportTypeTitle}>{type.label}</h3>
                  <p style={styles.reportTypeDescription}>
                    {type.value === "appointments" && "View all appointments with details including patient info, doctor, date, and status"}
                    {type.value === "patients" && "Track new patient registrations over time with demographic information"}
                    {type.value === "revenue" && "Financial overview including payments, pending amounts, and revenue trends"}
                  </p>
                </div>
              )})}
            </div>
          </div>

          {/* Report Data Preview */}
          {reportData && (
            <div style={styles.recentReportsSection}>
              <h2 style={styles.sectionTitle}>Data Preview (Latest 20 entries)</h2>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    {selectedReportType === 'revenue' && (
                      <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Patient</th>
                        <th style={styles.th}>Doctor</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Center Fee</th>
                      </tr>
                    )}
                    {selectedReportType === 'patients' && (
                      <tr>
                        <th style={styles.th}>Name</th>
                        <th style={styles.th}>NIC</th>
                        <th style={styles.th}>Source</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Contact</th>
                      </tr>
                    )}
                    {selectedReportType === 'appointments' && (
                      <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Patient</th>
                        <th style={styles.th}>Doctor</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {selectedReportType === 'revenue' && reportData.appointments?.slice(0, 20).map((a, idx) => (
                      <tr key={idx} style={styles.tr}>
                        <td style={styles.td}>{a.appointment_id}</td>
                        <td style={styles.td}>{a.patient_name}</td>
                        <td style={styles.td}>{a.doctor_name}</td>
                        <td style={styles.td}>{a.date}</td>
                        <td style={styles.td}>Rs. {a.center_fee}</td>
                      </tr>
                    ))}
                    {selectedReportType === 'patients' && reportData.patients?.slice(0, 20).map((p, idx) => (
                      <tr key={idx} style={styles.tr}>
                        <td style={styles.td}>{p.name}</td>
                        <td style={styles.td}>{p.nic}</td>
                        <td style={styles.td}>{p.source}</td>
                        <td style={styles.td}>{new Date(p.date).toLocaleDateString()}</td>
                        <td style={styles.td}>{p.contact}</td>
                      </tr>
                    ))}
                    {selectedReportType === 'appointments' && reportData.appointments?.slice(0, 20).map((a, idx) => (
                      <tr key={idx} style={styles.tr}>
                        <td style={styles.td}>{a.id}</td>
                        <td style={styles.td}>{a.patient}</td>
                        <td style={styles.td}>{a.doctor}</td>
                        <td style={styles.td}>{a.date}</td>
                        <td style={styles.td}>{a.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
    // Handled by .main-wrapper
  },
  mainContent: {
    // Handled by .content-padding
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

