import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DoctorHeader from '../../components/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';

function DoctorAppointments() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [recordForm, setRecordForm] = useState({
    diagnosis: '',
    notes: '',
    prescription: '',
    follow_up_date: ''
  });
  const [showRecordModal, setShowRecordModal] = useState(false);
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
        console.error("Error fetching appointments profile:", error);
      }
    };
    fetchProfile();
  }, []);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setAppointments(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, []);

  const handleOpenRecord = (apt) => {
    setSelectedAppointment(apt);
    setShowRecordModal(true);
  };

  const handleAddRecord = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/clinical/record`, {
        appointment_id: selectedAppointment.appointment_id,
        patient_id: selectedAppointment.patient_id,
        ...recordForm
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('Medical Record added and appointment completed');
        setShowRecordModal(false);
        // Refresh appointments
        const refreshResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(refreshResponse.data.data);
      }
    } catch (error) {
      console.error("Add record error:", error);
      alert('Failed to add medical record');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = (apts) => {
    return apts.filter(apt =>
      apt.patient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patient?.nic?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getLocalDateString = (date) => {
    // Adjust logic to get YYYY-MM-DD in local time instead of UTC to fix off-by-one errors
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, -1);
    return localISOTime.split('T')[0];
  };

  const todayDate = getLocalDateString(new Date());
  const todayAppointments = appointments.filter(apt => apt.appointment_date === todayDate);
  const upcomingAppointments = appointments.filter(apt => apt.appointment_date > todayDate && apt.status !== 'CANCELLED');

  return (
    <div style={styles.pageContainer}>
      <DoctorSidebar onLogout={handleLogout} />

      <div className="main-wrapper">
        <DoctorHeader doctorName={doctorName} />

        <main className="content-padding">
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>Appointments</h1>
              <p style={styles.pageSubtitle}>Manage your patient appointments</p>
            </div>
          </div>

          {/* Search Bar */}
          <div style={styles.searchSection}>
            <input
              type="text"
              placeholder="Search by patient name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* Today's Appointments */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Today's Appointments</h2>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Time</th>
                    <th style={styles.th}>Patient</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterAppointments(todayAppointments)
                    .map((apt) => (
                      <tr key={apt.appointment_id} style={styles.tableRow}>
                        <td style={styles.td}>{apt.time_slot}</td>
                        <td style={styles.td}>
                          <div style={styles.patientCell}>
                            <div style={styles.patientName}>{apt.patient?.full_name}</div>
                            <div style={styles.patientId}>PHE-{apt.patient_id}</div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.statusBadge,
                            background: apt.status === 'COMPLETED' ? '#dcfce7' : '#fef9c3',
                            color: apt.status === 'COMPLETED' ? '#166534' : '#854d0e'
                          }}>{apt.status}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => navigate('/doctor/patient-details', { state: { patient: apt.patient } })}
                              style={styles.viewButton}
                            >
                              History
                            </button>
                            {apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleOpenRecord(apt)}
                                style={{ ...styles.viewButton, background: '#0066CC', color: 'white', border: 'none' }}
                              >
                                Precribe Record
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Upcoming Appointments */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Upcoming Appointments</h2>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Time</th>
                    <th style={styles.th}>Patient</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterAppointments(upcomingAppointments).map((apt) => (
                    <tr key={apt.appointment_id} style={styles.tableRow}>
                      <td style={styles.td}>{apt.time_slot}</td>
                      <td style={styles.td}>
                        <div style={styles.patientCell}>
                          <div style={styles.patientName}>{apt.patient?.full_name}</div>
                          <div style={styles.patientId}>PHE-{apt.patient_id}</div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: apt.status === 'COMPLETED' ? '#dcfce7' : '#fef9c3',
                          color: apt.status === 'COMPLETED' ? '#166534' : '#854d0e'
                        }}>{apt.status}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          {/* Upcoming appointments usually only allow viewing history, no prescription yet */}
                          <div style={{ color: '#6b7280', fontSize: '13px' }}>Scheduled</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Medical Record Modal */}
          {showRecordModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
            }}>
              <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                <h2 style={{ marginBottom: '24px' }}>Add Medical Record</h2>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Diagnosis</label>
                  <input
                    type="text"
                    value={recordForm.diagnosis}
                    onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                    style={styles.searchInput}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Clinical Notes</label>
                  <textarea
                    value={recordForm.notes}
                    onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                    style={{ ...styles.searchInput, height: '100px', resize: 'none' }}
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Prescription</label>
                  <textarea
                    value={recordForm.prescription}
                    onChange={(e) => setRecordForm({ ...recordForm, prescription: e.target.value })}
                    style={{ ...styles.searchInput, height: '80px', resize: 'none' }}
                    placeholder="Amoxicillin 500mg - 3 times a day"
                  />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Follow-up Date (Optional)</label>
                  <input
                    type="date"
                    value={recordForm.follow_up_date}
                    onChange={(e) => setRecordForm({ ...recordForm, follow_up_date: e.target.value })}
                    style={styles.searchInput}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowRecordModal(false)} style={styles.viewButton}>Cancel</button>
                  <button
                    onClick={handleAddRecord}
                    disabled={isLoading}
                    style={{ ...styles.viewButton, background: '#0066CC', color: 'white', border: 'none' }}
                  >
                    {isLoading ? 'Saving...' : 'Save Record'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
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
    // Handled by .main-wrapper
  },
  mainContent: {
    // Handled by .content-padding
  },
  header: {
    marginBottom: "24px"
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 8px 0",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  searchSection: {
    marginBottom: "32px"
  },
  searchInput: {
    width: "100%",
    maxWidth: "500px",
    padding: "12px 16px",
    fontSize: "15px",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.3s",
    boxSizing: "border-box",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  section: {
    marginBottom: "32px"
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "16px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  tableContainer: {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid #e5e7eb",
    overflow: "hidden"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  tableHeader: {
    background: "rgba(0, 102, 204, 0.08)",
    borderBottom: "2px solid rgba(0, 102, 204, 0.2)"
  },
  th: {
    padding: "16px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  tableRow: {
    borderBottom: "1px solid #f3f4f6",
    transition: "background-color 0.2s"
  },
  td: {
    padding: "16px",
    fontSize: "15px",
    color: "#1f2937",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  patientCell: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  patientName: {
    fontWeight: "600",
    color: "#1f2937",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  patientId: {
    fontSize: "13px",
    color: "#6b7280",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  statusBadge: {
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#047857",
    background: "#d1fae5",
    borderRadius: "6px",
    display: "inline-block",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  viewButton: {
    padding: "8px 16px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#0066CC",
    background: "white",
    border: "2px solid #0066CC",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

export default DoctorAppointments;

