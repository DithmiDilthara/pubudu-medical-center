import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiCalendar, FiUsers, FiClock, FiClipboard, FiFileText, FiBarChart2, FiPhone } from 'react-icons/fi';
import DoctorHeader from '../../components/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';

function DoctorDashboard() {
  const navigate = useNavigate();
  const [doctorName, setDoctorName] = useState('Doctor');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setDoctorName(response.data.data.profile.full_name);
        }
      } catch (error) {
        console.error("Error fetching dashboard profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    upcomingAppointments: 0
  });

  const getLocalDateString = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, -1);
    return localISOTime.split('T')[0];
  };

  // Fetch appointments and stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch specific doctor appointments
        const apptRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Fetch unique patients assigned to doctor
        const patientRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/doctors/my-patients`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (apptRes.data.success && patientRes.data.success) {
          const allAppointments = apptRes.data.data;
          const patientsList = patientRes.data.data;

          const todayDate = getLocalDateString(new Date());

          // Calculate stats
          const todayAppts = allAppointments.filter(apt => apt.appointment_date === todayDate);

          // Count upcoming as any appointment strictly starting from today or future
          // Alternatively, just count today + future
          const upcomingAppts = allAppointments.filter(apt => apt.appointment_date >= todayDate && apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED');

          setStats({
            todayAppointments: todayAppts.length,
            totalPatients: patientsList.length,
            upcomingAppointments: upcomingAppts.length
          });

          // Format today's appointments for rendering
          const formattedToday = todayAppts.map(apt => ({
            id: apt.appointment_id,
            patientId: apt.patient_id,
            time: apt.time_slot, 
            patientName: apt.patient?.full_name || 'Unknown Patient',
            phone: apt.patient?.user?.contact_number || apt.patient?.nic || 'N/A', 
            type: apt.status === 'COMPLETED' ? 'Follow-up' : 'Consultation',
            status: apt.status
          }));

          setAppointments(formattedToday);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={styles.pageContainer}>
      <DoctorSidebar onLogout={handleLogout} />

      <div className="main-wrapper">
        <DoctorHeader doctorName={doctorName} />

        {/* Main Content */}
        <main className="content-padding">
          <div style={styles.pageHeader}>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.pageSubtitle}>Welcome back, {doctorName}</p>
          </div>



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
                        onClick={() => navigate('/doctor/patient-details', { 
                          state: { 
                            patientId: appt.patientId,
                            appointment_id: appt.id 
                          } 
                        })}
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
    // Handled by .main-wrapper in CSS
    background: "linear-gradient(135deg, #f0f8ff 0%, #e6f2ff 100%)"
  },
  mainContent: {
    // Handled by .content-padding in CSS
    flex: 1,
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
    borderRadius: "16px",
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 10px 25px rgba(0, 102, 204, 0.1)",
    border: "1px solid #e6f2ff",
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
    borderRadius: "16px",
    padding: "32px",
    marginBottom: "32px",
    boxShadow: "0 12px 30px rgba(0, 102, 204, 0.15)",
    border: "2px solid #0066CC"
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

