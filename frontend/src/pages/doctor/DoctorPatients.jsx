import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DoctorHeader from '../../components/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';

function DoctorPatients() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch unique patients from backend
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/doctors/my-patients`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setPatients(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleViewDetails = (patientId) => {
    navigate('/doctor/patient-details', { state: { patientId } });
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !filterDate || patient.lastVisit === filterDate;
    return matchesSearch && matchesDate;
  });

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
              <h1 style={styles.pageTitle}>Patients</h1>
              <p style={styles.pageSubtitle}>Manage your patient records</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div style={styles.searchSection}>
            <input
              type="text"
              placeholder="Search patients by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <div style={styles.filterButtons}>
              <div style={styles.dateFilterContainer}>
                <span style={styles.dateFilterLabel}>Filter by Date:</span>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  style={styles.dateInput}
                />
                {filterDate && (
                  <button onClick={() => setFilterDate('')} style={styles.clearDateBtn}>✕</button>
                )}
              </div>
            </div>
          </div>

          {/* Patients Table */}
          <section style={styles.tableSection}>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Patient Name</th>
                    <th style={styles.th}>Primary Reason</th>
                    <th style={styles.th}>Contact</th>
                    <th style={styles.th}>Last Visit</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient)}
                      style={{
                        ...styles.tableRow,
                        ...(selectedPatient?.id === patient.id ? styles.tableRowSelected : {})
                      }}
                    >
                      <td style={styles.td}>
                        <div style={styles.patientCell}>
                          <div style={styles.patientName}>{patient.name}</div>
                          <div style={styles.patientId}>{patient.patientId}</div>
                        </div>
                      </td>
                      <td style={styles.td}>{patient.primaryReason}</td>
                      <td style={styles.td}>{patient.contact}</td>
                      <td style={styles.td}>{patient.lastVisit}</td>
                      <td style={styles.td}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(patient.patientId);
                          }}
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

          {/* Selected Patient Summary */}
          {selectedPatient && (
            <section style={styles.selectedSection}>
              <h2 style={styles.selectedTitle}>Selected Patient: {selectedPatient.name}</h2>
              <div style={styles.selectedContent}>
                <div style={styles.selectedGrid}>
                  <div style={styles.selectedItem}>
                    <span style={styles.selectedLabel}>Patient Name</span>
                    <span style={styles.selectedValue}>{selectedPatient.name}</span>
                  </div>
                  <div style={styles.selectedItem}>
                    <span style={styles.selectedLabel}>Primary Reason</span>
                    <span style={styles.selectedValue}>{selectedPatient.primaryReason}</span>
                  </div>
                  <div style={styles.selectedItem}>
                    <span style={styles.selectedLabel}>Contact</span>
                    <span style={styles.selectedValue}>{selectedPatient.contact}</span>
                  </div>
                  <div style={styles.selectedItem}>
                    <span style={styles.selectedLabel}>Medical History Summary</span>
                    <span style={styles.selectedValue}>No significant medical history. Regular checkups recommended.</span>
                  </div>
                </div>
                <div style={styles.actionButtons}>
                  <button onClick={() => handleViewDetails(selectedPatient.patientId)} style={styles.actionButton}>
                    View Full Medical Record
                  </button>
                  <button style={styles.actionButtonSecondary}>
                    Add New Consultation Note
                  </button>
                  <button style={styles.actionButtonSecondary}>
                    Prescribe Medication
                  </button>
                  <button style={styles.actionButtonSecondary}>
                    Schedule Follow-up
                  </button>
                </div>
              </div>
            </section>
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
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(135deg, #f0f8ff 0%, #e6f2ff 100%)"
  },
  mainContent: {
    flex: 1,
    padding: '32px',
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto'
  },
  header: {
    marginBottom: '24px'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  searchSection: {
    marginBottom: '24px',
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  },
  searchInput: {
    flex: 1,
    maxWidth: '500px',
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.3s',
    boxSizing: 'border-box'
  },
  filterButtons: {
    display: 'flex',
    gap: '12px'
  },
  filterButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  filterButtonActive: {
    background: '#0066CC',
    color: 'white',
    border: '2px solid #0066CC'
  },
  dateFilterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'white',
    padding: '8px 16px',
    borderRadius: '10px',
    border: '2px solid #e5e7eb'
  },
  dateFilterLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#4b5563',
    textTransform: 'uppercase'
  },
  dateInput: {
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer'
  },
  clearDateBtn: {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  tableSection: {
    marginBottom: '32px'
  },
  tableContainer: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 12px 30px rgba(0, 102, 204, 0.15)',
    border: '2px solid #0066CC',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    background: '#f9fafb',
    borderBottom: '2px solid #e5e7eb'
  },
  th: {
    padding: '20px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '800',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  tableRow: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'all 0.2s',
    cursor: 'pointer'
  },
  tableRowSelected: {
    background: '#e6f2ff'
  },
  td: {
    padding: '20px',
    fontSize: '15px',
    color: '#111827'
  },
  patientCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  patientName: {
    fontWeight: '700',
    color: '#111827',
    fontSize: '16px'
  },
  patientId: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#0066CC'
  },
  viewButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '700',
    color: 'white',
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 10px rgba(0, 102, 204, 0.2)'
  },
  selectedSection: {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 12px 30px rgba(0, 102, 204, 0.15)',
    border: '2px solid #0066CC',
    marginTop: '32px'
  },
  selectedTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#111827',
    marginBottom: '24px',
    marginTop: 0,
    letterSpacing: '-0.5px'
  },
  selectedContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  selectedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px'
  },
  selectedItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  selectedLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280'
  },
  selectedValue: {
    fontSize: '15px',
    color: '#1f2937'
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  actionButton: {
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '700',
    color: 'white',
    background: '#0066CC',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.4)',
    transition: 'all 0.3s',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  actionButtonSecondary: {
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#0066CC',
    background: 'white',
    border: '2px solid #0066CC',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

export default DoctorPatients;

