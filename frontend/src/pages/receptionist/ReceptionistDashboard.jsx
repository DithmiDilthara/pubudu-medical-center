import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUserPlus, FiCalendar, FiClock } from "react-icons/fi";
import ReceptionistSidebar from "../../components/ReceptionistSidebar";
import ReceptionistHeader from "../../components/ReceptionistHeader";
import CancellationModal from "../../components/CancellationModal";

function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [receptionistName, setReceptionistName] = useState('Receptionist');
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellationMessages, setCancellationMessages] = useState([]);

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

    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`${API_URL}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          const allApts = response.data.data;
          setAppointments(allApts);

          // Check for recent cancellations to notify receptionist
          const cancelledApts = allApts.filter(apt => apt.status === 'CANCELLED');
          if (cancelledApts.length > 0) {
            const notifiedCancellations = JSON.parse(sessionStorage.getItem('receptionistNotifiedCancellations') || '[]');
            const newCancellations = cancelledApts.filter(apt => !notifiedCancellations.includes(apt.appointment_id));

            if (newCancellations.length > 0) {
              const messages = newCancellations.map(apt =>
                `The ${apt.appointment_date} session with ${apt.doctor?.full_name || 'the doctor'} has been cancelled.`
              );

              setCancellationMessages(messages);

              // Mark as notified for this session
              const updatedNotified = [...notifiedCancellations, ...newCancellations.map(a => a.appointment_id)];
              sessionStorage.setItem('receptionistNotifiedCancellations', JSON.stringify(updatedNotified));
            }
          }
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

  // Today's date for filtering
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Upcoming = all non-cancelled, non-completed appointments where date >= today
  const upcomingAppointments = appointments.filter(
    apt => apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && apt.appointment_date >= todayStr
  ).sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));

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
      <div style={styles.mainWrapper}>
        {/* Header */}
        <ReceptionistHeader receptionistName={receptionistName} />

        {/* Cancellation Notice Modal */}
        <CancellationModal
          messages={cancellationMessages}
          onClose={() => setCancellationMessages([])}
        />

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
            </div>
          </section>

          {/* Upcoming Appointments Table */}
          <section style={styles.tableSection}>
            <h2 style={styles.tableTitle}>Upcoming Appointments ({upcomingAppointments.length})</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableHeader}>Patient Name</th>
                    <th style={styles.tableHeader}>Date & Time</th>
                    <th style={styles.tableHeader}>Doctor</th>
                    <th style={styles.tableHeader}>Payment</th>
                    <th style={styles.tableHeader}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Loading...</td></tr>
                  ) : upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map((apt) => (
                      <tr key={apt.appointment_id} style={styles.tableRow}>
                        <td style={styles.tableCell}>
                          <div>
                            <p style={styles.patientName}>{apt.patient?.full_name || 'Unknown'}</p>
                            <p style={styles.patientId}>(PHE-{apt.patient_id})</p>
                          </div>
                        </td>
                        <td style={styles.tableCell}>{formatDate(apt.appointment_date)} {apt.time_slot}</td>
                        <td style={styles.tableCell}>
                          <span style={styles.doctorBadge}>{apt.doctor?.full_name || `Doctor #${apt.doctor_id}`}</span>
                        </td>
                        <td style={styles.tableCell}>
                          {apt.payment_status === 'PAID' ? (
                            <span style={{ color: '#059669', fontWeight: '600', fontSize: '13px' }}>✓ Paid</span>
                          ) : (
                            <span style={{ color: '#dc2626', fontWeight: '600', fontSize: '13px' }}>Unpaid</span>
                          )}
                        </td>
                        <td style={styles.tableCell}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {apt.payment_status === 'UNPAID' && (
                              <button
                                onClick={() => handleMarkAsPaid(apt)}
                                style={styles.payButton}
                              >
                                Pay
                              </button>
                            )}
                            <button
                              onClick={() => handleCancelAppointment(apt.appointment_id)}
                              style={styles.cancelButton}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>No upcoming appointments</td></tr>
                  )}
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
