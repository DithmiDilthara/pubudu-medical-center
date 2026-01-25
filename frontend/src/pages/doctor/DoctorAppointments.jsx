import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorHeader from '../../components/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';

function DoctorAppointments() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Sample appointments data
  const todayAppointments = [
    {
      id: 1,
      time: '9:00 AM',
      patientName: 'Milan Abeywardena',
      patientId: 'PHE-3456',
      type: 'General Checkup',
      status: 'Scheduled'
    },
    {
      id: 2,
      time: '10:30 AM',
      patientName: 'Romesh Wickrama',
      patientId: 'PHE-9321',
      type: 'Follow-up',
      status: 'Scheduled'
    },
    {
      id: 3,
      time: '11:45 AM',
      patientName: 'Shalini Rathnayake',
      patientId: 'PHE-5532',
      type: 'Consultation',
      status: 'Scheduled'
    }
  ];

  const tomorrowAppointments = [
    {
      id: 4,
      time: '10:00 AM',
      patientName: 'Sajith Gunasekara',
      patientId: 'PHE-7465',
      type: 'General Checkup',
      status: 'Scheduled'
    },
    {
      id: 5,
      time: '11:30 AM',
      patientName: 'Tharuka Abeywardena',
      patientId: 'PHE-1987',
      type: 'Consultation',
      status: 'Scheduled'
    }
  ];

  const handleViewDetails = (patientId) => {
    navigate('/doctor/patient-details', { state: { patientId } });
  };

  const filterAppointments = (appointments) => {
    return appointments.filter(apt => 
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={styles.pageContainer}>
      <DoctorSidebar onLogout={handleLogout} />
      
      <div style={styles.mainContainer}>
        <DoctorHeader />

        <main style={styles.mainContent}>
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
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterAppointments(todayAppointments).map((apt) => (
                    <tr key={apt.id} style={styles.tableRow}>
                      <td style={styles.td}>{apt.time}</td>
                      <td style={styles.td}>
                        <div style={styles.patientCell}>
                          <div style={styles.patientName}>{apt.patientName}</div>
                          <div style={styles.patientId}>{apt.patientId}</div>
                        </div>
                      </td>
                      <td style={styles.td}>{apt.type}</td>
                      <td style={styles.td}>
                        <span style={styles.statusBadge}>{apt.status}</span>
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleViewDetails(apt.patientId)}
                          style={styles.viewButton}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Tomorrow's Appointments */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Tomorrow's Appointments</h2>
            
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Time</th>
                    <th style={styles.th}>Patient</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterAppointments(tomorrowAppointments).map((apt) => (
                    <tr key={apt.id} style={styles.tableRow}>
                      <td style={styles.td}>{apt.time}</td>
                      <td style={styles.td}>
                        <div style={styles.patientCell}>
                          <div style={styles.patientName}>{apt.patientName}</div>
                          <div style={styles.patientId}>{apt.patientId}</div>
                        </div>
                      </td>
                      <td style={styles.td}>{apt.type}</td>
                      <td style={styles.td}>
                        <span style={styles.statusBadge}>{apt.status}</span>
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleViewDetails(apt.patientId)}
                          style={styles.viewButton}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
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

