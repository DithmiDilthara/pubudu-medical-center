import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiAlertCircle } from "react-icons/fi";
import ReceptionistSidebar from "../../components/ReceptionistSidebar";
import ReceptionistHeader from "../../components/ReceptionistHeader";

function AppointmentsManagement() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("upcoming");

  // Sample appointments data
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patientName: "Nimal Perera",
      patientId: "PHE-4821",
      dateTime: "2024-08-05 10:00 AM",
      doctor: "Dr. Ajith Kariyawasam",
      status: "upcoming",
      isPaid: true
    },
    {
      id: 2,
      patientName: "Sunil Jayasinghe",
      patientId: "PHE-5057",
      dateTime: "2024-08-05 11:30 AM",
      doctor: "Dr. Roshan Abeysekara",
      status: "upcoming",
      isPaid: false
    },
    {
      id: 3,
      patientName: "Chaminda Fernando",
      patientId: "PHE-7135",
      dateTime: "2024-08-06 09:00 AM",
      doctor: "Dr. Anjali Samarasinghe",
      status: "pending",
      isPaid: false
    },
    {
      id: 4,
      patientName: "Kamal Silva",
      patientId: "PHE-3421",
      dateTime: "2024-07-30 02:00 PM",
      doctor: "Dr. Nimal De Silva",
      status: "cancelled",
      isPaid: false
    }
  ]);

  const handleLogout = () => {
    console.log("Receptionist logged out");
    navigate("/");
  };

  const handleAdmitNewPatient = () => {
    navigate("/receptionist/patients");
  };

  const handleMakeNewBooking = () => {
    navigate("/receptionist/appointments/new");
  };

  const handleCancelAppointment = (appointmentId) => {
    const confirmed = window.confirm("Are you sure you want to cancel this appointment?");
    if (confirmed) {
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: "cancelled" } : apt
        )
      );
      alert("Appointment cancelled successfully");
    }
  };

  const handlePayment = (appointment) => {
    navigate("/receptionist/payment", {
      state: {
        appointment: {
          patientName: appointment.patientName,
          patientId: appointment.patientId,
          dateOfService: appointment.dateTime,
          service: "General Checkup",
          amount: 1500.00
        }
      }
    });
  };

  // Filter appointments based on active filter
  const filteredAppointments = appointments.filter(apt => {
    if (activeFilter === "upcoming") return apt.status === "upcoming";
    if (activeFilter === "pending") return apt.status === "pending";
    if (activeFilter === "cancelled") return apt.status === "cancelled";
    return true;
  });

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <ReceptionistSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div style={styles.mainWrapper}>
        {/* Header */}
        <ReceptionistHeader receptionistName="Sarah Johnson" />

        {/* Page Content */}
        <main style={styles.mainContent}>
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

            {/* Appointment Actions */}
            <div style={styles.actionsSection}>
              <h2 style={styles.sectionTitle}>Appointment Actions</h2>
              <div style={styles.actionButtons}>
                <button onClick={handleAdmitNewPatient} style={styles.primaryButton}>
                  Admit New Patient
                </button>
                <button onClick={handleMakeNewBooking} style={styles.secondaryButton}>
                  Make New Booking
                </button>
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
                  Upcoming
                  <FiChevronDown style={styles.filterIcon} />
                </button>
                <button
                  onClick={() => setActiveFilter("pending")}
                  style={{
                    ...styles.filterTab,
                    ...(activeFilter === "pending" ? styles.filterTabActive : {})
                  }}
                >
                  Pending
                  <FiChevronDown style={styles.filterIcon} />
                </button>
                <button
                  onClick={() => setActiveFilter("cancelled")}
                  style={{
                    ...styles.filterTab,
                    ...(activeFilter === "cancelled" ? styles.filterTabActive : {})
                  }}
                >
                  Cancelled
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
                      <th style={styles.tableHeader}>Doctor</th>
                      <th style={styles.tableHeader}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((appointment) => (
                        <tr key={appointment.id} style={styles.tableRow}>
                          <td style={styles.tableCell}>
                            <div>
                              <p style={styles.patientName}>{appointment.patientName}</p>
                              <p style={styles.patientId}>({appointment.patientId})</p>
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <div style={styles.dateTimeCell}>
                              {appointment.dateTime}
                              {activeFilter === "pending" && !appointment.isPaid && (
                                <div style={styles.unpaidBadge}>
                                  <FiAlertCircle style={styles.unpaidIcon} />
                                  <span>Unpaid</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={styles.tableCell}>
                            <span style={styles.doctorName}>{appointment.doctor}</span>
                          </td>
                          <td style={styles.tableCell}>
                            {appointment.status !== "cancelled" && (
                              <div style={styles.actionButtonsContainer}>
                                {activeFilter === "pending" && !appointment.isPaid && (
                                  <button
                                    onClick={() => handlePayment(appointment)}
                                    style={styles.paidButton}
                                  >
                                    Pay
                                  </button>
                                )}
                                <button
                                  onClick={() => handleCancelAppointment(appointment.id)}
                                  style={styles.cancelButton}
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                            {appointment.status === "cancelled" && (
                              <span style={styles.cancelledText}>Cancelled</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" style={styles.noDataCell}>
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
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },
  mainContent: {
    flex: 1,
    padding: "32px",
    overflow: "auto"
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
  actionsSection: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1f2937",
    margin: 0,
    marginBottom: "16px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  actionButtons: {
    display: "flex",
    gap: "12px"
  },
  primaryButton: {
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #8b9dff 0%, #9b7bc8 100%)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    transition: "all 0.2s",
    boxShadow: "0 4px 12px rgba(139, 157, 255, 0.3)"
  },
  secondaryButton: {
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#374151",
    backgroundColor: "white",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    transition: "all 0.2s"
  },
  appointmentsSection: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
  },
  filterTabs: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px"
  },
  filterTab: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#6b7280",
    backgroundColor: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    cursor: "pointer",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  filterTabActive: {
    backgroundColor: "#f3f4f6",
    color: "#1f2937",
    fontWeight: "600",
    border: "1px solid #d1d5db"
  },
  filterIcon: {
    fontSize: "14px"
  },
  tableContainer: {
    overflowX: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: "8px"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  tableHeaderRow: {
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb"
  },
  tableHeader: {
    textAlign: "left",
    padding: "12px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#6b7280",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  tableRow: {
    borderBottom: "1px solid #f3f4f6",
    transition: "background-color 0.2s"
  },
  tableCell: {
    padding: "16px",
    fontSize: "14px",
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
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "#dc2626",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    transition: "all 0.2s"
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
