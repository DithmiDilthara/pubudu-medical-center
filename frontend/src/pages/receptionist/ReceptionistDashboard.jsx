import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUserPlus, FiCalendar, FiClock } from "react-icons/fi";
import ReceptionistSidebar from "../../components/ReceptionistSidebar";
import ReceptionistHeader from "../../components/ReceptionistHeader";

// Sample data for pending appointments
const pendingAppointments = [
  {
    id: 1,
    name: "Kamal Perera",
    patientId: "PHE-2037",
    dateOfService: "2024-07-20",
    amountDue: "LKR 1500"
  },
  {
    id: 2,
    name: "Wanisha Ekanayake",
    patientId: "PHE-9148",
    dateOfService: "2024-07-15",
    amountDue: "LKR 2390"
  },
  {
    id: 3,
    name: "Jude Bevan",
    patientId: "PHE-6720",
    dateOfService: "2024-07-10",
    amountDue: "LKR 1200"
  }
];

// Sample data for upcoming appointments
const upcomingAppointments = [
  {
    id: 1,
    patientName: "Sunil Karunarathne",
    patientId: "PHE-3851",
    dateTime: "2024-08-05 10:00 AM",
    doctor: "Dr. Kavindi Fernando"
  },
  {
    id: 2,
    patientName: "Maheni de Silva",
    patientId: "PHE-7492",
    dateTime: "2024-08-05 11:30 AM",
    doctor: "Dr. Asanka Wijesinghe"
  },
  {
    id: 3,
    patientName: "Nalin Hewage",
    patientId: "PHE-5068",
    dateTime: "2024-08-06 09:00 AM",
    doctor: "Dr. Nimal De Silva"
  }
];

function ReceptionistDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Receptionist logged out");
    navigate("/");
  };

  const handleAddPatient = () => {
    navigate("/receptionist/patients");
  };

  const handleMakeBooking = () => {
    navigate("/receptionist/appointments/new");
  };

  const handlePendingBookings = () => {
    const section = document.getElementById('pending-appointments-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMarkAsPaid = (patient) => {
    navigate("/receptionist/payment/confirm", {
      state: {
        appointment: {
          patientName: patient.name,
          patientId: patient.patientId,
          dateOfService: patient.dateOfService,
          service: "Pending Consultation",
          amount: parseFloat(patient.amountDue.replace("LKR ", ""))
        }
      }
    });
  };

  const handleCancelAppointment = (appointmentId) => {
    console.log(`Cancelling appointment ${appointmentId}`);
    // Implementation for cancelling appointment
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <ReceptionistSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div style={styles.mainWrapper}>
        {/* Header */}
        <ReceptionistHeader receptionistName="Sarah Johnson" />

        {/* Dashboard Content */}
        <main style={styles.mainContent}>
          {/* Quick Actions */}
          <section style={styles.quickActionsSection}>
            <h3 style={styles.sectionLabel}>Quick Actions</h3>
            <div style={styles.quickActionsButtons}>
              <button onClick={handleAddPatient} style={styles.primaryButton}>
                <FiUserPlus style={styles.buttonIcon} />
                Admit New Patient
              </button>
              <button onClick={handleMakeBooking} style={styles.secondaryButton}>
                <FiCalendar style={styles.buttonIcon} />
                Make New Booking
              </button>
              <button onClick={handlePendingBookings} style={styles.tertiaryButton}>
                <FiClock style={styles.buttonIcon} />
                Pending Bookings
              </button>
            </div>
          </section>

          {/* Pending Appointments Table */}
          <section id="pending-appointments-section" style={styles.tableSection}>
            <h2 style={styles.tableTitle}>Pending Appointments</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableHeader}>Patient Name</th>
                    <th style={styles.tableHeader}>Date of Service</th>
                    <th style={styles.tableHeader}>Amount Due</th>
                    <th style={styles.tableHeader}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingAppointments.map((patient) => (
                    <tr key={patient.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <div>
                          <p style={styles.patientName}>{patient.name}</p>
                          <p style={styles.patientId}>({patient.patientId})</p>
                        </div>
                      </td>
                      <td style={styles.tableCell}>{patient.dateOfService}</td>
                      <td style={styles.tableCell}>
                        <span style={styles.amountBadge}>{patient.amountDue}</span>
                      </td>
                      <td style={styles.tableCell}>
                        <button
                          onClick={() => handleMarkAsPaid(patient)}
                          style={styles.payButton}
                        >
                          Pay
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Upcoming Appointments Table */}
          <section style={styles.tableSection}>
            <h2 style={styles.tableTitle}>Upcoming Appointments</h2>
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
                  {upcomingAppointments.map((appointment) => (
                    <tr key={appointment.id} style={styles.tableRow}>
                      <td style={styles.tableCell}>
                        <div>
                          <p style={styles.patientName}>{appointment.patientName}</p>
                          <p style={styles.patientId}>({appointment.patientId})</p>
                        </div>
                      </td>
                      <td style={styles.tableCell}>{appointment.dateTime}</td>
                      <td style={styles.tableCell}>
                        <span style={styles.doctorBadge}>{appointment.doctor}</span>
                      </td>
                      <td style={styles.tableCell}>
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          style={styles.cancelButton}
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={styles.viewAllContainer}>
              <button
                onClick={() => navigate("/receptionist/appointments")}
                style={styles.viewAllButton}
              >
                View All
              </button>
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
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  mainWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(135deg, #f5f5f5 0%, #f9fafb 100%)"
  },
  mainContent: {
    flex: 1,
    padding: "32px",
    overflow: "auto"
  },
  titleSection: {
    marginBottom: "32px"
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #0066CC 0%, #0052A3 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    letterSpacing: "0.3px"
  },
  pageSubtitle: {
    fontSize: "15px",
    color: "#666",
    margin: 0,
    marginTop: "8px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  quickActionsSection: {
    marginBottom: "32px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #0066CC 0%, #0052A3 100%)",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(0, 102, 204, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  },
  sectionLabel: {
    fontSize: "20px",
    fontWeight: "700",
    color: "white",
    marginBottom: "16px",
    marginTop: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  quickActionsButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px"
  },
  primaryButton: {
    borderRadius: "8px",
    backgroundColor: "white",
    padding: "14px 28px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#0066CC",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  secondaryButton: {
    borderRadius: "8px",
    backgroundColor: "white",
    padding: "14px 28px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#0066CC",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  tertiaryButton: {
    borderRadius: "8px",
    backgroundColor: "white",
    padding: "14px 28px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#0066CC",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  payButton: {
    fontSize: "13px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    border: "none",
    borderRadius: "6px",
    padding: "8px 20px",
    cursor: "pointer",
    transition: "all 0.3s",
    boxShadow: "0 4px 10px rgba(16, 185, 129, 0.3)",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  buttonIcon: {
    fontSize: "18px"
  },
  tableSection: {
    marginBottom: "32px",
    borderRadius: "12px",
    backgroundColor: "white",
    padding: "24px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
    border: "1px solid rgba(0, 102, 204, 0.1)"
  },
  tableTitle: {
    fontSize: "20px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #0066CC 0%, #0052A3 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
    marginBottom: "20px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  tableContainer: {
    overflowX: "auto"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  tableHeaderRow: {
    borderBottom: "2px solid #f0f0f0"
  },
  tableHeader: {
    textAlign: "left",
    padding: "16px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#0066CC",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  tableRow: {
    borderBottom: "1px solid #f5f5f5",
    transition: "all 0.2s"
  },
  tableCell: {
    padding: "16px",
    fontSize: "14px",
    color: "#555",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  patientName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#333",
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  patientId: {
    fontSize: "12px",
    color: "#888",
    margin: 0,
    marginTop: "2px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  amountBadge: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0052A3",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  doctorBadge: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0066CC",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  actionButton: {
    fontSize: "13px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #0066CC 0%, #0052A3 100%)",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    cursor: "pointer",
    transition: "all 0.3s",
    boxShadow: "0 4px 10px rgba(0, 102, 204, 0.3)",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  cancelButton: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#0066CC",
    backgroundColor: "transparent",
    border: "2px solid #0066CC",
    borderRadius: "6px",
    padding: "6px 16px",
    cursor: "pointer",
    transition: "all 0.3s",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  viewAllContainer: {
    marginTop: "20px",
    textAlign: "center"
  },
  viewAllButton: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0066CC",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

export default ReceptionistDashboard;
