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
  const [doctors, setDoctors] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchSpec, setSearchSpec] = useState('');
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

    const fetchDoctorsAndCancellations = async () => {
      try {
        // Fetch Doctors
        const docRes = await axios.get(`${API_URL}/doctors`);
        if (docRes.data.success) {
          setDoctors(docRes.data.data);
        }

        // Fetch Appointments just for cancellations notification check
        const aptRes = await axios.get(`${API_URL}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (aptRes.data.success) {
          const allApts = aptRes.data.data;
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
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    fetchDoctorsAndCancellations();
  }, []);



  // Filtered doctors
  const filteredDoctors = doctors.filter(doc => {
    const matchesName = doc.full_name.toLowerCase().includes(searchName.toLowerCase());
    const matchesSpec = searchSpec ? doc.specialization === searchSpec : true;
    return matchesName && matchesSpec;
  });

  const uniqueSpecializations = [...new Set(doctors.map(d => d.specialization))];

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
          <style>
            {`
              .hover-blue-card {
                transition: all 0.3s ease !important;
              }
              .hover-blue-card:hover {
                background-color: #0066CC !important;
                transform: translateY(-4px) !important;
                box-shadow: 0 10px 20px rgba(0, 102, 204, 0.2) !important;
              }
              .hover-blue-card:hover * {
                color: white !important;
                border-color: rgba(255, 255, 255, 0.5) !important;
              }
              .hover-table-row {
                transition: all 0.2s ease !important;
              }
              .hover-table-row:hover {
                background-color: #f8fafc !important;
                box-shadow: inset 4px 0 0 0 #0066CC !important;
              }
            `}
          </style>

          {/* Quick Access */}
          <section style={styles.quickAccessSection}>
            <h3 style={styles.quickAccessLabel}>Quick Access</h3>
            <div style={styles.quickAccessGrid}>

              <div className="hover-blue-card" style={styles.quickAccessCard} onClick={handleAddPatient}>
                <div style={styles.cardHeader}>
                  <div style={styles.infoIconWrapper}>i</div>
                </div>
                <div style={styles.cardBody}>
                  <FiUserPlus style={styles.cardCenterIcon} />
                  <p style={styles.cardText}>Admit New Patient</p>
                </div>
              </div>

              <div className="hover-blue-card" style={styles.quickAccessCard} onClick={handleMakeBooking}>
                <div style={styles.cardHeader}>
                  <div style={styles.infoIconWrapper}>i</div>
                </div>
                <div style={styles.cardBody}>
                  <FiCalendar style={styles.cardCenterIcon} />
                  <p style={styles.cardText}>Make New Booking</p>
                </div>
              </div>

              <div className="hover-blue-card" style={styles.quickAccessCard} onClick={() => navigate("/receptionist/appointments")}>
                <div style={styles.cardHeader}>
                  <div style={styles.infoIconWrapper}>i</div>
                </div>
                <div style={styles.cardBody}>
                  <FiClock style={styles.cardCenterIcon} />
                  <p style={styles.cardText}>Upcoming Appointments</p>
                </div>
              </div>

            </div>
          </section>

          {/* Search Bar Section */}
          <section style={styles.searchSection}>
            <div style={styles.searchContainer}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Doctor name</label>
                <input
                  type="text"
                  placeholder="Search Doctor Name"
                  style={styles.searchInput}
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Specialization</label>
                <select
                  style={styles.searchInput}
                  value={searchSpec}
                  onChange={(e) => setSearchSpec(e.target.value)}
                >
                  <option value="">Select Specialization</option>
                  {uniqueSpecializations.map((spec, idx) => (
                    <option key={idx} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div style={styles.searchBtnContainer}>
                <button style={styles.searchActionBtn}>Search</button>
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
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  mainWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(135deg, #f0f8ff 0%, #e6f2ff 100%)"
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
  searchSection: {
    marginBottom: "32px",
  },
  searchContainer: {
    background: "linear-gradient(135deg, #0066CC 0%, #004080 100%)",
    borderRadius: "16px",
    padding: "24px 32px",
    display: "flex",
    gap: "24px",
    alignItems: "flex-end",
    boxShadow: "0 10px 25px rgba(0, 102, 204, 0.25)",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    gap: "8px"
  },
  inputLabel: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "13px",
    fontWeight: "600",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  searchInput: {
    padding: "14px 16px",
    borderRadius: "8px",
    border: "none",
    fontSize: "14px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    width: "100%",
    outline: "none",
    boxSizing: "border-box"
  },
  searchBtnContainer: {
    marginBottom: "2px"
  },
  searchActionBtn: {
    background: "#10b981", // green background
    color: "white",
    border: "none",
    borderRadius: "8px",
    padding: "14px 32px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  dividerContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "24px",
    gap: "16px"
  },
  dividerLine: {
    height: "1px",
    flex: 1,
    background: "#d1d5db"
  },
  dividerText: {
    color: "#4b5563",
    fontSize: "14px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    cursor: "pointer"
  },
  quickAccessSection: {
    marginBottom: "24px" // Reduced from 40px to remove excess whitespace
  },
  quickAccessLabel: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "20px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  quickAccessGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", // Changed auto-fill to auto-fit and reduced min-width for better fitting of 3 cards
    gap: "24px"
  },
  quickAccessCard: {
    background: "white",
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 8px 20px rgba(0, 102, 204, 0.12)",
    cursor: "pointer",
    transition: "transform 0.2s, boxShadow 0.2s",
    border: "2px solid #0066CC",
    display: "flex",
    flexDirection: "column",
    minHeight: "120px" // Reduced from 160px to make cards less tall
  },
  cardHeader: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  newBadge: {
    background: "#10b981",
    color: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "bold",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  infoIconWrapper: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    border: "1px solid #3b82f6",
    color: "#3b82f6",
    backgroundColor: "#eff6ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontFamily: "serif",
    fontStyle: "italic"
  },
  cardBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px" // Reduced gap between icon and text
  },
  cardCenterIcon: {
    fontSize: "36px", // Reduced from 48px to make icons fit the smaller cards
    color: "#3b82f6" // fallback color if not using images
  },
  cardText: {
    fontSize: "15px",
    fontWeight: "500",
    color: "#4b5563",
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  tableSection: {
    marginBottom: "32px",
    borderRadius: "12px",
    backgroundColor: "white",
    padding: "24px",
    boxShadow: "0 12px 30px rgba(0, 102, 204, 0.15)",
    border: "2px solid #0066CC"
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
    backgroundColor: "#f0f7ff",
    borderBottom: "2px solid #cce4ff"
  },
  tableHeader: {
    textAlign: "left",
    padding: "16px",
    fontSize: "13px",
    fontWeight: "700",
    color: "#0052A3",
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
    fontWeight: "700",
    color: "#1e293b",
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
    fontSize: "14px",
    fontWeight: "700",
    color: "#059669",
    backgroundColor: "#ecfdf5",
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid #a7f3d0",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    display: "inline-block"
  },
  doctorBadge: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#0369a1",
    backgroundColor: "#e0f2fe",
    padding: "6px 12px",
    borderRadius: "20px",
    border: "1px solid #bae6fd",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    display: "inline-block"
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
