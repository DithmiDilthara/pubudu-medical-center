import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiChevronDown, FiAlertCircle } from "react-icons/fi";
import ReceptionistSidebar from "../../components/ReceptionistSidebar";
import ReceptionistHeader from "../../components/ReceptionistHeader";

function AppointmentsManagement() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("upcoming");
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [receptionistName, setReceptionistName] = useState('Receptionist');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
        console.error("Error fetching profile:", error);
      }
    };

    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${API_URL}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setAppointments(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    fetchAppointments();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleCancelAppointment = async (appointmentId) => {
    const confirmed = window.confirm("Are you sure you want to cancel this appointment?");
    if (confirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/appointments/${appointmentId}/status`,
          { status: 'CANCELLED' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAppointments(prev =>
          prev.map(apt =>
            apt.appointment_id === appointmentId ? { ...apt, status: 'CANCELLED' } : apt
          )
        );
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        alert("Failed to cancel appointment");
      }
    }
  };

  const handlePayment = (appointment) => {
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Today's date for filtering
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Categorize appointments
  const upcomingList = appointments.filter(
    apt => apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && apt.appointment_date >= todayStr
  ).sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));

  const cancelledList = appointments.filter(
    apt => apt.status === 'CANCELLED'
  );

  const pastList = appointments.filter(
    apt => apt.status !== 'CANCELLED' && apt.appointment_date < todayStr
  ).sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));

  // Get current filtered list
  const filteredAppointments =
    activeFilter === "upcoming" ? upcomingList :
      activeFilter === "past" ? pastList :
        cancelledList;

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <ReceptionistSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="main-wrapper">
        {/* Header */}
        <ReceptionistHeader receptionistName={receptionistName} />

        {/* Page Content */}
        <main className="content-padding">
          <div style={styles.contentContainer}>
            {/* Page Header */}
            <div style={styles.pageHeader}>
              <div>
                <h1 style={styles.pageTitle}>Appointments</h1>
                <p style={styles.pageSubtitle}>
                  Manage patient appointments, reminders, and scheduling.
                </p>
              </div>
            </div>

            {/* All Appointments Section */}
            <div style={styles.appointmentsSection}>
              <h2 style={styles.sectionTitle}>All Appointments</h2>

              {/* Filter Tabs */}
              <div style={styles.filterTabs}>
                <button
                  onClick={() => setActiveFilter("upcoming")}
                  style={{
                    ...styles.filterTab,
                    ...(activeFilter === "upcoming" ? styles.filterTabActive : {})
                  }}
                >
                  Upcoming ({upcomingList.length})
                  <FiChevronDown style={styles.filterIcon} />
                </button>
                <button
                  onClick={() => setActiveFilter("past")}
                  style={{
                    ...styles.filterTab,
                    ...(activeFilter === "past" ? styles.filterTabActive : {})
                  }}
                >
                  Past ({pastList.length})
                  <FiChevronDown style={styles.filterIcon} />
                </button>
                <button
                  onClick={() => setActiveFilter("cancelled")}
                  style={{
                    ...styles.filterTab,
                    ...(activeFilter === "cancelled" ? styles.filterTabActive : {})
                  }}
                >
                  Cancelled ({cancelledList.length})
                  <FiChevronDown style={styles.filterIcon} />
                </button>
              </div>

              {/* Appointments Table */}
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.tableHeader}>Patient Name</th>
                      <th style={styles.tableHeader}>Date & Time</th>
                      <th style={styles.tableHeader}>Queue No.</th>
                      <th style={styles.tableHeader}>Doctor</th>
                      <th style={styles.tableHeader}>Payment</th>
                      <th style={styles.tableHeader}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="5" style={styles.noDataCell}>
                          Loading appointments...
                        </td>
                      </tr>
                    ) : filteredAppointments.length > 0 ? (
                      filteredAppointments.map((appointment) => (
                        <tr key={appointment.appointment_id} style={styles.tableRow}>
                          <td style={styles.tableCell}>
                            <div>
                              <p style={styles.patientName}>{appointment.patient?.full_name || 'Unknown'}</p>
                              <p style={styles.patientId}>(PHE-{appointment.patient_id})</p>
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.dateTimeCell}>
                              {formatDate(appointment.appointment_date)} {appointment.time_slot}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={{ 
                                background: '#f0fdf4', 
                                color: '#16a34a', 
                                border: '1px solid #16a34a',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                display: 'inline-block',
                                fontWeight: 'bold'
                            }}>
                              #{appointment.appointment_number || '--'}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.doctorName}>{appointment.doctor?.full_name || `Doctor #${appointment.doctor_id}`}</span>
                          </td>
                          <td style={styles.tableCell}>
                            {appointment.payment_status === 'PAID' ? (
                              <span style={{ color: '#059669', fontWeight: '600', fontSize: '13px' }}>✓ Paid</span>
                            ) : (
                              <span style={{ color: '#dc2626', fontWeight: '600', fontSize: '13px' }}>Unpaid</span>
                            )}
                          </td>
                          <td style={styles.tableCell}>
                            {appointment.status !== "CANCELLED" ? (
                              <div style={styles.actionButtonsContainer}>
                                {appointment.payment_status === 'UNPAID' && activeFilter === "upcoming" && (
                                  <button
                                    onClick={() => handlePayment(appointment)}
                                    style={styles.paidButton}
                                  >
                                    Pay
                                  </button>
                                )}
                                <button
                                  onClick={() => handleCancelAppointment(appointment.appointment_id)}
                                  style={styles.cancelButton}
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <span style={styles.cancelledText}>Cancelled</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={styles.noDataCell}>
                          No {activeFilter} appointments found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    backgroundColor: "#f9fafb"
  },
  mainWrapper: {
    // Handled by .main-wrapper
  },
  mainContent: {
    // Handled by .content-padding
  },
  contentContainer: {
    maxWidth: "1200px",
    margin: "0 auto"
  },
  pageHeader: {
    marginBottom: "32px"
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
    marginBottom: "8px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  pageSubtitle: {
    fontSize: "15px",
    color: "#6b7280",
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  appointmentsSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "40px",
    boxShadow: "0 12px 30px rgba(0, 102, 204, 0.15)",
    border: "2px solid #0066CC"
  },
  filterTabs: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px"
  },
  filterTab: {
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#6b7280",
    backgroundColor: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  filterTabActive: {
    background: "linear-gradient(135deg, #0066CC 0%, #0052A3 100%)",
    color: "white",
    boxShadow: "0 4px 12px rgba(0, 102, 204, 0.3)"
  },
  filterIcon: {
    fontSize: "16px"
  },
  tableContainer: {
    overflowX: "auto",
    border: "2px solid #e0f2fe",
    borderRadius: "12px",
    backgroundColor: "white"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  tableHeaderRow: {
    backgroundColor: "#f0f8ff",
    borderBottom: "2px solid #e0f2fe"
  },
  tableHeader: {
    textAlign: "left",
    padding: "16px 20px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#0066CC",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    letterSpacing: "0.5px"
  },
  tableRow: {
    borderBottom: "1px solid #f3f4f6",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: "#f8fafc"
    }
  },
  tableCell: {
    padding: "16px 20px",
    fontSize: "15px",
    color: "#374151",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  patientName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1f2937",
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  patientId: {
    fontSize: "13px",
    color: "#6b7280",
    margin: 0,
    marginTop: "2px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  dateTimeCell: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  unpaidBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 8px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#dc2626",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  unpaidIcon: {
    fontSize: "14px"
  },
  doctorName: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#374151",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  actionButtonsContainer: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  paidButton: {
    padding: "8px 20px",
    fontSize: "13px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    transition: "all 0.2s",
    boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)"
  },
  cancelButton: {
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#dc2626",
    backgroundColor: "white",
    border: "1px solid #dc2626",
    borderRadius: "6px",
    cursor: "pointer",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    transition: "all 0.2s"
  },
  cancelledText: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#6b7280",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  noDataCell: {
    padding: "32px",
    textAlign: "center",
    fontSize: "14px",
    color: "#9ca3af",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

export default AppointmentsManagement;
