import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUserPlus, FiCalendar, FiClock, FiPlus, FiUsers, FiCreditCard, FiTrendingUp } from "react-icons/fi";
import { motion } from "framer-motion";
import ReceptionistSidebar from "../../components/ReceptionistSidebar";
import ReceptionistHeader from "../../components/ReceptionistHeader";

function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [receptionistName, setReceptionistName] = useState('Receptionist');
  const [doctors, setDoctors] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchSpec, setSearchSpec] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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

    fetchProfile();
    fetchDoctorsAndCancellations();
    fetchStats();
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

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <ReceptionistSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="main-wrapper">
        {/* Header */}
        <ReceptionistHeader receptionistName={receptionistName} />

        {/* Dashboard Content */}
        <main className="content-padding">
          {/* Section 1: Page Header */}
          <header style={styles.headerSection}>
            <div style={styles.headerLeft}>
              <h1 style={styles.welcomeTitle}>Welcome back, {receptionistName}!</h1>
              <p style={styles.welcomeSubtitle}>Check your health status and upcoming appointments.</p>
            </div>
            <div style={styles.headerRight}>
              <button 
                style={styles.btnPrimary}
                onClick={handleAddPatient}
              >
                <FiUserPlus style={styles.btnIcon} />
                Register Patient
              </button>
              <button 
                style={styles.btnPrimary}
                onClick={handleMakeBooking}
              >
                <FiPlus style={styles.btnIcon} />
                New Booking
              </button>
            </div>
          </header>

          {/* Section 2: Cards Row */}
          <div style={styles.statsGrid}>
            {[
              { title: "Today's Appointments", value: stats.todayAppointments || 0, icon: <FiCalendar />, bg: "#eff6ff", border: "#dbeafe", color: "#2563eb", valueColor: "#1e3a8a", delay: 0.1 },
              { title: "Pending Payments", value: stats.unpaidAppointments || 0, icon: <FiCreditCard />, bg: "#fef2f2", border: "#fee2e2", color: "#dc2626", valueColor: "#7f1d1d", delay: 0.2 },
              { title: "Total Patients", value: stats.totalPatients || 0, icon: <FiUsers />, bg: "#f0fdf4", border: "#dcfce7", color: "#10b981", valueColor: "#064e3b", delay: 0.3 },
            ].map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: card.delay }}
                style={{ ...styles.statsCard, backgroundColor: card.bg, border: `1px solid ${card.border}` }}
                whileHover={{ y: -5, boxShadow: `0 10px 20px -5px ${card.color}20` }}
              >
                <div style={styles.statsInfo}>
                  <p style={{ ...styles.statsLabel, color: card.color }}>{card.title}</p>
                  <h3 style={{ ...styles.statsValue, color: card.valueColor }}>{card.value}</h3>
                </div>
                <div style={{ ...styles.statsIconBox, backgroundColor: card.border, color: card.color }}>
                  {card.icon}
                </div>
              </motion.div>
            ))}
          </div>

          <style>
            {`
              .hover-table-row {
                transition: all 0.2s ease !important;
              }
              .hover-table-row:hover {
                background-color: #f8fafc !important;
              }
            `}
          </style>

          {/* Search Bar Section */}
          <section style={styles.searchSection}>
            <div style={styles.searchContainer}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Doctor name</label>
                <div style={styles.inputWrapper}>
                  <input
                    type="text"
                    placeholder="Search Doctor Name"
                    style={styles.searchInput}
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onFocus={(e) => e.target.parentElement.style.borderColor = "#2563eb"}
                    onBlur={(e) => e.target.parentElement.style.borderColor = "#e2e8f0"}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Specialization</label>
                <div style={styles.inputWrapper}>
                  <select
                    style={styles.searchInput}
                    value={searchSpec}
                    onChange={(e) => setSearchSpec(e.target.value)}
                    onFocus={(e) => e.target.parentElement.style.borderColor = "#2563eb"}
                    onBlur={(e) => e.target.parentElement.style.borderColor = "#e2e8f0"}
                  >
                    <option value="">Select Specialization</option>
                    {uniqueSpecializations.map((spec, idx) => (
                      <option key={idx} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.searchBtnContainer}>
                <button style={styles.searchActionBtn}>
                  <FiClock style={{ fontSize: '18px' }} />
                  Search Availability
                </button>
              </div>
            </div>
          </section>

          {/* Doctors List Table */}
          <section style={styles.tableSection}>
            <h2 style={styles.tableTitle}>Our Doctors & Availabilities</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableHeader}>Doctor Name</th>
                    <th style={styles.tableHeader}>Specialization</th>
                    <th style={styles.tableHeader}>Available Times</th>
                    <th style={styles.tableHeader}>Total Fee</th>
                    <th style={styles.tableHeader}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Loading...</td></tr>
                  ) : filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doc) => (
                      <tr key={doc.doctor_id} className="hover-table-row" style={styles.tableRow}>
                        <td style={styles.tableCell}>
                          <div>
                            <p style={styles.patientName}>{doc.full_name}</p>
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={styles.doctorBadge}>{doc.specialization}</span>
                        </td>
                        <td style={styles.tableCell}>
                          {doc.availability && doc.availability.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {doc.availability.map((av, idx) => (
                                <div key={idx} style={{ fontSize: '12px', color: '#475569', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                  <strong style={{color: '#0f172a'}}>{av.day_of_week}:</strong> {av.start_time.substring(0, 5)} - {av.end_time.substring(0, 5)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: '#999', fontSize: '13px', fontStyle: 'italic' }}>Not scheduled</span>
                          )}
                        </td>
                        <td style={styles.tableCell}>
                          <span style={styles.amountBadge}>LKR {Number(doc.doctor_fee) + Number(doc.center_fee)}</span>
                        </td>
                        <td style={styles.tableCell}>
                          <button
                            onClick={() => navigate("/receptionist/appointments/new")}
                            style={styles.actionButton}
                          >
                            Book Appointment
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No doctors found</td></tr>
                  )}
                </tbody>
              </table>
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
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#f8fafc"
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
    marginBottom: "40px"
  },
  statsCard: {
    borderRadius: "24px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
    transition: "all 0.3s ease"
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
  tableContainer: {
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
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
