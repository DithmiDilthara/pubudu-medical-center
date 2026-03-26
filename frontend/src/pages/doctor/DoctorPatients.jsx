import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiUser, 
  FiActivity, 
  FiSearch, 
  FiCalendar, 
  FiPhone, 
  FiMapPin, 
  FiChevronRight,
  FiFilter
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import DoctorHeader from '../../components/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';

function DoctorPatients() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorName, setDoctorName] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

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
        console.error("Profile fetch error:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const filteredPatients = patients.filter(patient => {
    const name = patient.name || "";
    const id = patient.patientId?.toString() || "";
    const search = searchTerm.toLowerCase();
    return name.toLowerCase().includes(search) || id.toLowerCase().includes(search);
  });

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Paginated patients
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <div style={styles.pageContainer}>
      <DoctorSidebar onLogout={handleLogout} />

      <div className="main-wrapper" style={styles.mainWrapper}>
        <DoctorHeader doctorName={doctorName} />

        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.contentPadding}
        >
          {/* Header Section */}
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <h1 style={styles.pageTitle}>Patient Directory</h1>
              <p style={styles.pageSubtitle}>
                Manage your {filteredPatients.length} registered patients
              </p>
            </div>

            <div style={styles.searchWrapper}>
              <FiSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search patient name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
          </div>

          {/* Patient Cards Grid */}
          <div style={styles.gridContainer}>
            <AnimatePresence mode='wait'>
              {filteredPatients.length > 0 ? (
                <div style={styles.patientGrid}>
                  {paginatedPatients.map((patient, index) => (
                    <motion.div
                      key={patient.patientId || index}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                      onClick={() => navigate('/doctor/patient-details', { state: { patientId: patient.patientId } })}
                      style={styles.patientCard}
                    >
                      <div className="avatar-group" style={styles.cardHeader}>
                        <div className="avatar-circle" style={styles.avatarCircle}>
                          {patient.name?.charAt(0)}
                        </div>
                        <div style={styles.headerText}>
                          <h3 style={styles.patientName}>{patient.name}</h3>
                          <p style={styles.patientMeta}>
                            {patient.dob ? `${new Date().getFullYear() - new Date(patient.dob).getFullYear()} yrs` : 'N/A'} • {patient.gender || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div style={styles.cardBadges}>
                        <div style={styles.badge}>
                          <FiActivity style={styles.badgeIcon} />
                          <span style={styles.badgeText}>No active conditions</span>
                        </div>
                        <div style={styles.badge}>
                          <FiUser style={styles.badgeIcon} />
                          <span style={styles.badgeText}>ID: {patient.patientId}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={styles.emptyState}
                >
                  <div style={styles.emptyIconWrapper}>
                    <FiUser style={styles.emptyIcon} />
                  </div>
                  <h3 style={styles.emptyTitle}>No patients found</h3>
                  <p style={styles.emptySubtitle}>Try adjusting your search query.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pagination Footer */}
          {!isLoading && filteredPatients.length > 0 && (
            <div style={styles.paginationFooter}>
              <div style={styles.paginationInfo}>
                Showing <span style={{fontWeight: '700'}}>{Math.min(filteredPatients.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span style={{fontWeight: '700'}}>{Math.min(filteredPatients.length, currentPage * itemsPerPage)}</span> of <span style={{fontWeight: '700'}}>{filteredPatients.length}</span> patients
              </div>
              <div style={styles.paginationControls}>
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  style={{...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'}}
                >
                  Previous
                </button>
                
                <div style={styles.pageNumbers}>
                    {[...Array(totalPages)].map((_, i) => (
                        <button 
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            style={{
                                ...styles.pageNumber,
                                backgroundColor: currentPage === i + 1 ? '#2563eb' : 'white',
                                color: currentPage === i + 1 ? 'white' : '#475569',
                                borderColor: currentPage === i + 1 ? '#2563eb' : '#e2e8f0'
                            }}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  style={{...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'}}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.main>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    fontFamily: "'Inter', sans-serif"
  },
  mainWrapper: {
    flex: 1,
    marginLeft: "280px",
    minHeight: "100vh"
  },
  contentPadding: {
    padding: "32px",
    flex: 1,
    maxWidth: "1400px",
    margin: "0 auto",
    width: "100%",
    display: "flex",
    flexDirection: "column"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px"
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.025em",
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  pageSubtitle: {
    fontSize: "15px",
    color: "#64748b",
    marginTop: "4px",
    fontWeight: "500",
    fontFamily: "'Inter', sans-serif"
  },
  searchWrapper: {
    position: "relative",
    width: "320px"
  },
  searchIcon: {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
    fontSize: "18px"
  },
  searchInput: {
    width: "100%",
    padding: "14px 16px 14px 48px",
    fontSize: "15px",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    outline: "none",
    transition: "all 0.2s",
    backgroundColor: "white",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    fontFamily: "'Inter', sans-serif",
    '&:focus': {
      borderColor: "#2563eb",
      boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.1)"
    }
  },
  gridContainer: {
    minHeight: "400px"
  },
  patientGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "24px"
  },
  patientCard: {
    backgroundColor: "white",
    borderRadius: "24px", // Matches image
    padding: "24px",
    border: "1px solid #f1f5f9", // Light border
    borderLeft: "6px solid #2563eb",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "flex",
    flexDirection: "column",
    gap: "20px" // More gap between sections
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  avatarCircle: {
    width: "64px",
    height: "64px",
    borderRadius: "50%", // Circular avatar as per image
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "800",
    transition: "all 0.3s ease",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.1)"
  },
  headerText: {
    display: "flex",
    flexDirection: "column",
    gap: "2px"
  },
  patientName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  patientMeta: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "500",
    margin: 0,
    fontFamily: "'Inter', sans-serif"
  },
  cardBadges: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  badge: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#f8fafc",
    padding: "10px 16px",
    borderRadius: "14px",
    border: "1px solid #f1f5f9",
    width: "fit-content" // Avoid stretching to full width
  },
  badgeIcon: {
    fontSize: "14px",
    color: "#64748b"
  },
  badgeText: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#475569",
    whiteSpace: "nowrap"
  },
  cardFooterSimple: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: "8px"
  },
  arrowIcon: {
    fontSize: "18px",
    color: "#cbd5e1"
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 40px",
    textAlign: "center",
    backgroundColor: "white",
    borderRadius: "24px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    margin: "20px 0",
    minHeight: "200px"
  },
  emptyIconWrapper: {
    width: "80px",
    height: "80px",
    borderRadius: "30px",
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px"
  },
  emptyIcon: {
    fontSize: "32px",
    color: "#94a3b8"
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 8px 0"
  },
  emptySubtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0
  },
  paginationFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "32px 0",
    marginTop: "16px",
    borderTop: "1px solid #e2e8f0"
  },
  paginationInfo: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "500"
  },
  paginationControls: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  pageNumbers: {
    display: "flex",
    gap: "6px"
  },
  pageBtn: {
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#2563eb",
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    transition: "all 0.2s"
  },
  pageNumber: {
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "600",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.2s"
  }
};

export default DoctorPatients;

