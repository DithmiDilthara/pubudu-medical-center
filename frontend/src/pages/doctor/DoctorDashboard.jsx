import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiUsers, FiClock, FiClipboard, FiFileText, FiBarChart2, FiPhone } from 'react-icons/fi';
import DoctorHeader from '../../components/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';

function DoctorDashboard() {
  const navigate = useNavigate();

  // Sample data for today's appointments
  const [appointments] = useState([
    {
      id: 1,
      time: '9:00 AM',
      patientName: 'Pradeep Senanayake',
      phone: '0771234567',
      type: 'General Checkup',
      status: 'Scheduled'
    },
    {
      id: 2,
      time: '10:30 AM',
      patientName: 'Oshadi Karunarathna',
      phone: '0772345678',
      type: 'Follow-up',
      status: 'Scheduled'
    },
    {
      id: 3,
      time: '11:45 AM',
      patientName: 'Shalini Rathnayake',
      phone: '0773456789',
      type: 'Consultation',
      status: 'Scheduled'
    }
  ]);

  // Dashboard statistics
  const stats = {
    todayAppointments: 12,
    totalPatients: 156,
    upcomingAppointments: 28
  };

  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={styles.pageContainer}>
      <DoctorSidebar onLogout={handleLogout} />

      <div style={styles.mainContainer}>
        <DoctorHeader />

        {/* Main Content */}
        <main style={styles.mainContent}>
          <div style={styles.pageHeader}>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.pageSubtitle}>Welcome back, Dr. Kanya Ekanalyake</p>
          </div>

          {/* Quick Actions Section */}
          <section style={styles.quickActionsSection}>
            <h2 style={styles.sectionTitle}>Quick Actions</h2>
            <div style={styles.actionsGrid}>
              <button
                style={styles.actionButton}
                onClick={() => setShowAvailabilityModal(true)}
              >
                <FiClipboard style={styles.actionIcon} />
                Update Availability
              </button>
              <button
                style={styles.actionButton}
                onClick={() => navigate('/doctor/appointments')}
              >
                <FiCalendar style={styles.actionIcon} />
                Upcoming Appointments
              </button>
            </div>
          </section>

          {/* Statistics Cards */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <FiCalendar style={styles.statIconSvg} />
              </div>
              <div style={styles.statInfo}>
                <div style={styles.statValue}>{stats.todayAppointments}</div>
                <div style={styles.statLabel}>Today's Appointments</div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <FiUsers style={styles.statIconSvg} />
              </div>
              <div style={styles.statInfo}>
                <div style={styles.statValue}>{stats.totalPatients}</div>
                <div style={styles.statLabel}>Total Patients</div>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={styles.statIcon}>
                <FiClock style={styles.statIconSvg} />
              </div>
              <div style={styles.statInfo}>
                <div style={styles.statValue}>{stats.upcomingAppointments}</div>
                <div style={styles.statLabel}>Upcoming Appointments</div>
              </div>
            </div>
          </div>

          {/* Today's Appointments Section */}
          <section style={styles.appointmentsSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Today's Appointments</h2>
              <span style={styles.appointmentCount}>{appointments.length}</span>
            </div>

            <div style={styles.appointmentsList}>
              {appointments.length > 0 ? (
                appointments.map(appt => (
                  <div key={appt.id} style={styles.appointmentItem}>
                    <div style={styles.appointmentTime}>
                      <span style={styles.time}>{appt.time}</span>
                    </div>

                    <div style={styles.appointmentDetails}>
                      <h4 style={styles.patientName}>{appt.patientName}</h4>
                      <p style={styles.appointmentType}>{appt.type}</p>
                      <p style={styles.contactInfo}>
                        <FiPhone style={styles.phoneIcon} /> {appt.phone}
                      </p>
                    </div>

                    <div style={styles.appointmentStatus}>
                      <span style={styles.statusBadge}>{appt.status}</span>
                    </div>

                    <div style={styles.appointmentActions}>
                      <button
                        style={styles.viewBtn}
                        onClick={() => navigate('/doctor/patient-details', { state: { patientName: appt.patientName } })}
                      >
                        View Details
                      </button>
                      <button style={styles.completeBtn}>Mark Complete</button>
                    </div>
                  </div>
                ))
              ) : (
                <p style={styles.noAppointments}>No appointments scheduled for today</p>
              )}
            </div>
          </section>
        </main>

        {/* Update Availability Modal */}
        {showAvailabilityModal && (
          <div style={styles.modalOverlay} onClick={() => setShowAvailabilityModal(false)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Update Availability</h3>
                <button
                  style={styles.closeBtn}
                  onClick={() => setShowAvailabilityModal(false)}
                >
                  ✕
                </button>
              </div>

              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Select Day</label>
                  <select style={styles.select}>
                    <option>Monday</option>
                    <option>Tuesday</option>
                    <option>Wednesday</option>
                    <option>Thursday</option>
                    <option>Friday</option>
                    <option>Saturday</option>
                  </select>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Start Time</label>
                    <input type="time" style={styles.input} defaultValue="09:00" />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>End Time</label>
                    <input type="time" style={styles.input} defaultValue="17:00" />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.checkboxLabel}>
                    <input type="checkbox" style={styles.checkbox} defaultChecked />
                    Available
                  </label>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button
                  style={styles.cancelBtn}
                  onClick={() => setShowAvailabilityModal(false)}
                >
                  Cancel
                </button>
                <button
                  style={styles.submitBtn}
                  onClick={() => setShowAvailabilityModal(false)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  mainContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },
  mainContent: {
    flex: 1,
    padding: "32px",
    overflowY: "auto"
  },
  pageHeader: {
    marginBottom: "32px"
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "8px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "32px"
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
    transition: "all 0.3s ease"
  },
  statIcon: {
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 102, 204, 0.1)",
    borderRadius: "10px"
  },
  statIconSvg: {
    fontSize: "28px",
    color: "#0066CC"
  },
  statInfo: {
    flex: 1
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#0066CC",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  statLabel: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "4px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  appointmentsSection: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "32px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb"
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "2px solid #e5e7eb"
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  appointmentCount: {
    backgroundColor: "#0066CC",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  appointmentsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  appointmentItem: {
    display: "grid",
    gridTemplateColumns: "100px 1fr 120px 200px",
    gap: "16px",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#f9fafb",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    transition: "all 0.2s ease"
  },
  appointmentTime: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  time: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#0066CC",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  appointmentDetails: {
    display: "flex",
    flexDirection: "column"
  },
  patientName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  appointmentType: {
    fontSize: "12px",
    color: "#6b7280",
    margin: "4px 0 0 0",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  contactInfo: {
    fontSize: "12px",
    color: "#4b5563",
    margin: "2px 0 0 0",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    display: "flex",
    alignItems: "center",
    gap: "4px"
  },
  phoneIcon: {
    fontSize: "12px"
  },
  appointmentStatus: {
    textAlign: "center"
  },
  statusBadge: {
    backgroundColor: "#d1e7dd",
    color: "#0f5132",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  appointmentActions: {
    display: "flex",
    gap: "8px"
  },
  viewBtn: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    backgroundColor: "#fff",
    color: "#0066CC",
    fontWeight: "600",
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  completeBtn: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#0066CC",
    color: "#fff",
    fontWeight: "600",
    fontSize: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  noAppointments: {
    textAlign: "center",
    color: "#6b7280",
    padding: "32px 16px",
    fontSize: "14px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  quickActionsSection: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb"
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginTop: "16px"
  },
  actionButton: {
    padding: "16px 20px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#0066CC",
    color: "#fff",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(0, 102, 204, 0.25)",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px"
  },
  actionIcon: {
    fontSize: "18px"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    maxWidth: "500px",
    width: "90%"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb"
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1f2937",
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "24px",
    color: "#6b7280",
    cursor: "pointer",
    padding: 0
  },
  modalBody: {
    padding: "24px"
  },
  formGroup: {
    marginBottom: "20px"
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "8px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxSizing: "border-box",
    transition: "all 0.2s ease"
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    boxSizing: "border-box",
    cursor: "pointer"
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px"
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#1f2937",
    cursor: "pointer",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer"
  },
  modalFooter: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    padding: "20px 24px",
    borderTop: "1px solid #e5e7eb"
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    backgroundColor: "#fff",
    color: "#4b5563",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  submitBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#0066CC",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

export default DoctorDashboard;

