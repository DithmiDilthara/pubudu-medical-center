import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DoctorHeader from '../../components/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';

function DoctorPatients() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Sample patients data
  const patients = [
    {
      id: 1,
      name: 'Malinda Jayasekara',
      patientId: 'PHE-1234',
      primaryReason: 'General Checkup',
      contact: '+94 777 345 878',
      lastVisit: '2023-11-15'
    },
    {
      id: 2,
      name: 'Ravi Abeykoon',
      patientId: 'PHE-1534',
      primaryReason: 'Follow-up',
      contact: '+94 787 543 565',
      lastVisit: '2023-11-20'
    },
    {
      id: 3,
      name: 'Sanjeewa Hettiarachchi',
      patientId: 'PHE-1354',
      primaryReason: 'Consultation',
      contact: '+94 708 456 123',
      lastVisit: '2023-11-22'
    },
    {
      id: 4,
      name: 'Piumi Fonseka',
      patientId: 'PHE-3344',
      primaryReason: 'Vaccination',
      contact: '+94 764 543 777',
      lastVisit: '2023-11-25'
    },
    {
      id: 5,
      name: 'Thisara Abeysinghe',
      patientId: 'PHE-2099',
      primaryReason: 'Physical Therapy',
      contact: '+94 757 323 509',
      lastVisit: '2023-11-28'
    }
  ];

  const handleViewDetails = (patientId) => {
    navigate('/doctor/patient-details', { state: { patientId } });
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <button
              onClick={() => setFilterStatus('All')}
              style={{
                ...styles.filterButton,
                ...(filterStatus === 'All' ? styles.filterButtonActive : {})
              }}
            >
              Filter by Status
            </button>
            <button
              style={styles.filterButton}
            >
              Filter by Date
            </button>
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
    flexDirection: "column"
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
    background: '#8b9dff',
    color: 'white',
    border: '2px solid #8b9dff'
  },
  tableSection: {
    marginBottom: '32px'
  },
  tableContainer: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    background: 'rgba(139, 157, 255, 0.08)',
    borderBottom: '2px solid rgba(139, 157, 255, 0.2)'
  },
  th: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  tableRow: {
    borderBottom: '1px solid #f3f4f6',
    transition: 'all 0.2s',
    cursor: 'pointer'
  },
  tableRowSelected: {
    background: 'rgba(139, 157, 255, 0.08)'
  },
  td: {
    padding: '16px',
    fontSize: '15px',
    color: '#1f2937'
  },
  patientCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  patientName: {
    fontWeight: '600',
    color: '#1f2937'
  },
  patientId: {
    fontSize: '13px',
    color: '#6b7280'
  },
  viewButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#8b9dff',
    background: 'white',
    border: '2px solid #8b9dff',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  selectedSection: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e5e7eb'
  },
  selectedTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '20px',
    marginTop: 0
  },
  selectedContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
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
    background: '#8b9dff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(139, 157, 255, 0.4)',
    transition: 'all 0.3s',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  actionButtonSecondary: {
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#8b9dff',
    background: 'white',
    border: '2px solid #8b9dff',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

export default DoctorPatients;
