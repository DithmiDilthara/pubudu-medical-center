import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FiCalendar, 
  FiClock, 
  FiSearch, 
  FiUser, 
  FiActivity, 
  FiCheckCircle, 
  FiXCircle, 
  FiChevronRight,
  FiArrowLeft
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import DoctorHeader from '../../components/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';
import AppointmentCard from '../../components/AppointmentCard';

function DoctorAppointments() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Today');
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const getLocalDateString = (date) => {
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, -1);
    return localISOTime.split('T')[0];
  };

  const todayDate = getLocalDateString(new Date());

  const handleUpdateStatus = async (apptId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/appointments/${apptId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Update local state
        setAppointments(prev => prev.map(a => a.appointment_id === apptId ? { ...a, status: newStatus } : a));
        if (selectedAppointment?.appointment_id === apptId) {
          setSelectedAppointment(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED': return { backgroundColor: '#f0fdf4', color: '#10b981', border: '1px solid #dcfce7' };
      case 'PENDING': return { backgroundColor: '#fffbeb', color: '#f59e0b', border: '1px solid #fef3c7' };
      case 'RESCHEDULED': return { backgroundColor: '#fff7ed', color: '#f97316', border: '1px solid #ffedd5' };
      case 'CANCELLED': return { backgroundColor: '#fff1f2', color: '#e11d48', border: '1px solid #ffe4e6' };
      case 'COMPLETED': return { backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' };
      default: return { backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #f1f5f9' };
    }
  };

  const getFilteredAppointments = () => {
    let filtered = appointments.filter(apt => {
        // Exclude Cancelled appointments entirely for the doctor
        if (apt.status === 'CANCELLED') return false;

        const nameMatch = apt.patient?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const idMatch = apt.patient_id?.toString().includes(searchTerm);
        return nameMatch || idMatch;
    });

    if (activeTab === 'Today') {
        return filtered.filter(apt => apt.appointment_date === todayDate && apt.status !== 'COMPLETED');
    } else if (activeTab === 'Upcoming') {
        return filtered.filter(apt => apt.appointment_date > todayDate && apt.status !== 'COMPLETED');
    } else if (activeTab === 'Past') {
        return filtered.filter(apt => apt.appointment_date < todayDate || apt.status === 'COMPLETED');
    }
    return filtered;
  };

  const filteredList = getFilteredAppointments();

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  // Paginated list
  const paginatedList = filteredList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);

  return (
    <div style={styles.pageContainer}>
      <DoctorSidebar onLogout={handleLogout} />

      <div className="main-wrapper" style={styles.mainWrapper}>
        <DoctorHeader doctorName={doctorName} />

        <motion.main 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          style={styles.contentPadding}
        >
          {/* Header & Search */}
          <div style={styles.topSection}>
            <div style={styles.headerTitle}>
              <h1 style={styles.pageTitle}>Appointments</h1>
              <p style={styles.pageSubtitle}>Precision Scheduling & Patient Flow</p>
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

          <div style={styles.fullLayout}>
            {/* Full-width Appointment List */}
            <div style={styles.listPanel}>
              <div style={styles.tabsContainer}>
                {['Today', 'Upcoming', 'Past'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      ...styles.tabBtn,
                      color: activeTab === tab ? '#2563eb' : '#64748b'
                    }}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div 
                        layoutId="apt-tab"
                        style={styles.tabUnderline}
                      />
                    )}
                  </button>
                ))}
              </div>

              <div style={styles.scrollArea}>
                <AnimatePresence mode='wait'>
                    {filteredList.length > 0 ? (
                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={styles.aptList}
                        >
                            {paginatedList.map((apt) => (
                                <div 
                                    key={apt.appointment_id} 
                                    onClick={() => setSelectedAppointment(apt)}
                                    style={styles.listItemWrapper}
                                >
                                    <AppointmentCard 
                                        appt={apt} 
                                        variant="grid" 
                                        role="doctor"
                                        onViewDetails={(a) => setSelectedAppointment(a)}
                                    />
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <div style={styles.emptyState}>
                            <FiCalendar style={styles.emptyIcon} />
                            <p style={styles.emptyText}>No appointments found for this period.</p>
                        </div>
                    )}
                </AnimatePresence>

                {/* Pagination Controls */}
                {!isLoading && filteredList.length > 0 && (
                  <div style={styles.paginationPanel}>
                    <div style={styles.paginationInfo}>
                      Showing <span style={{fontWeight: '700'}}>{Math.min(filteredList.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span style={{fontWeight: '700'}}>{Math.min(filteredList.length, currentPage * itemsPerPage)}</span>
                    </div>
                    <div style={styles.paginationControls}>
                      <button 
                        disabled={currentPage === 1}
                        onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(1, prev - 1)); }}
                        style={{...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'}}
                      >
                        Previous
                      </button>
                      
                      <div style={styles.pageNumbers}>
                          {[...Array(totalPages)].map((_, i) => (
                              <button 
                                  key={i + 1}
                                  onClick={(e) => { e.stopPropagation(); setCurrentPage(i + 1); }}
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
                        onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.min(totalPages, prev + 1)); }}
                        style={{...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'}}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.main>
      </div>

      {/* ── Appointment Detail Popup Modal ── */}
      <AnimatePresence>
        {selectedAppointment && (
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={styles.modalBackdrop}
            onClick={() => setSelectedAppointment(null)}
          >
            <motion.div
              key="modal-box"
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              style={styles.modalBox}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedAppointment(null)}
                style={styles.modalCloseBtn}
              >
                ✕
              </button>

              {/* Patient Hero */}
              <motion.div
                style={styles.patientHero}
                whileHover={{ backgroundColor: '#f8fafc' }}
                onClick={() => navigate('/doctor/patient-details', {
                  state: {
                    patientId: selectedAppointment.patient_id,
                    patient: selectedAppointment.patient,
                    appointment_id: selectedAppointment.appointment_id
                  }
                })}
              >
                <div style={styles.patientAvatar}>
                  {selectedAppointment.patient?.full_name?.charAt(0)}
                </div>
                <div style={styles.heroText}>
                  <h2 style={styles.detailName}>{selectedAppointment.patient?.full_name}</h2>
                  <p style={styles.detailId}>PHE-{selectedAppointment.patient_id}</p>
                  <span style={{ ...styles.statusBadge, ...getStatusStyle(selectedAppointment.status) }}>
                    {selectedAppointment.status}
                  </span>
                </div>
              </motion.div>

              {/* Date & Time cards */}
              <div style={styles.infoGrid}>
                <div style={styles.infoCard}>
                  <FiCalendar style={styles.cardIcon} />
                  <div>
                    <p style={styles.cardLabel}>Date</p>
                    <p style={styles.cardValue}>
                      {new Date(selectedAppointment.appointment_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div style={styles.infoCard}>
                  <FiClock style={styles.cardIcon} />
                  <div>
                    <p style={styles.cardLabel}>Time Slot</p>
                    <p style={styles.cardValue}>{selectedAppointment.time_slot}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={styles.detailSection}>
                <h4 style={styles.sectionHeading}>Actions & Care</h4>
                <div style={styles.actionStack}>
                  <button
                    onClick={() => navigate('/doctor/patient-details', {
                      state: {
                        patientId: selectedAppointment.patient_id,
                        patient: selectedAppointment.patient,
                        appointment_id: selectedAppointment.appointment_id
                      }
                    })}
                    style={styles.primaryAction}
                  >
                    <FiActivity />
                    Start Consultation / View Records
                    <FiChevronRight />
                  </button>

                  <div style={styles.secondaryActions}>
                    <button
                      onClick={() => handleUpdateStatus(selectedAppointment.appointment_id, 'COMPLETED')}
                      disabled={selectedAppointment.status === 'COMPLETED' || selectedAppointment.appointment_date !== todayDate}
                      style={{
                        ...styles.outlineBtn,
                        borderColor: '#10b981',
                        color: '#10b981',
                        opacity: (selectedAppointment.status === 'COMPLETED' || selectedAppointment.appointment_date !== todayDate) ? 0.5 : 1,
                        cursor: (selectedAppointment.status === 'COMPLETED' || selectedAppointment.appointment_date !== todayDate) ? 'not-allowed' : 'pointer',
                        width: '100%' // Make it full width since the other button is gone
                      }}
                    >
                      <FiCheckCircle />
                      {selectedAppointment.appointment_date !== todayDate ? 'Completed (Today Only)' : 'Mark Completed'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column"
  },
  contentPadding: {
    padding: "32px",
    flex: 1,
    maxWidth: "1400px",
    margin: "0 0",
    width: "100%",
    display: "flex",
    flexDirection: "column"
  },
  topSection: {
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
    width: "400px"
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
    borderRadius: "20px",
    outline: "none",
    transition: "all 0.2s",
    backgroundColor: "white",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    ':focus': {
        borderColor: "#2563eb",
        boxShadow: "0 0 0 3px rgba(37, 99, 235, 0.1)"
    },
    fontFamily: "'Inter', sans-serif"
  },
  fullLayout: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    flex: 1,
    minHeight: 0
  },
  listPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    overflow: "hidden"
  },
  tabsContainer: {
    display: "flex",
    gap: "32px",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: "2px"
  },
  tabBtn: {
    background: "none",
    border: "none",
    padding: "12px 4px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    position: "relative",
    transition: "color 0.2s",
    outline: "none"
  },
  tabUnderline: {
    position: "absolute",
    bottom: "-1px",
    left: 0,
    right: 0,
    height: "2px",
    backgroundColor: "#2563eb",
    borderRadius: "2px"
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    paddingRight: "8px"
  },
  aptList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px"
  },
  listItemWrapper: {
    borderRadius: "24px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "all 0.2s",
    border: "1px solid transparent",
    ':hover': {
        borderColor: "#e2e8f0",
        boxShadow: "0 4px 6px rgba(0,0,0,0.02)"
    }
  },
  detailPanel: {
    backgroundColor: "white",
    borderRadius: "32px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column"
  },
  detailContent: {
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "40px"
  },
  patientHero: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    cursor: "pointer",
    padding: "12px",
    borderRadius: "20px",
    transition: "all 0.2s",
    ':hover': {
        backgroundColor: "#f8fafc"
    }
  },
  patientAvatar: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "800"
  },
  heroText: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  detailName: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.025em",
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  detailId: {
    fontSize: "16px",
    color: "#64748b",
    fontWeight: "600",
    margin: 0
  },
  statusBadge: {
    display: "inline-flex",
    padding: "6px 16px",
    borderRadius: "100px",
    fontSize: "13px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginTop: "8px",
    width: "fit-content"
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px"
  },
  infoCard: {
    backgroundColor: "#f8fafc",
    padding: "24px",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    border: "1px solid #f1f5f9"
  },
  cardIcon: {
    fontSize: "24px",
    color: "#94a3b8"
  },
  cardLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    margin: 0
  },
  cardValue: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "2px 0 0 0",
    fontFamily: "'Inter', sans-serif"
  },
  detailSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  sectionHeading: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  actionStack: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  primaryAction: {
    width: "100%",
    padding: "18px",
    borderRadius: "20px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    transition: "all 0.2s",
    boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.2)",
    ':hover': {
        backgroundColor: "#1d4ed8",
        transform: "translateY(-1px)"
    }
  },
  secondaryActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px"
  },
  outlineBtn: {
    padding: "14px",
    borderRadius: "16px",
    border: "2px solid",
    backgroundColor: "transparent",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "all 0.2s",
    ':hover': {
        backgroundColor: "#f8fafc"
    }
  },
  detailPlaceholder: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px",
    textAlign: "center"
  },
  placeholderIcon: {
    fontSize: "80px",
    color: "#f1f5f9",
    marginBottom: "24px"
  },
  placeholderText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#94a3b8",
    maxWidth: "240px"
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
  emptyIcon: {
    fontSize: "64px",
    color: "#f1f5f9",
    marginBottom: "20px"
  },
  emptyText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#94a3b8"
  },
  paginationPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "24px",
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "20px",
    border: "1px solid #e2e8f0"
  },
  paginationInfo: {
    fontSize: "13px",
    color: "#64748b",
    textAlign: "center"
  },
  paginationControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px"
  },
  pageNumbers: {
    display: "flex",
    gap: "4px"
  },
  pageBtn: {
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#2563eb",
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    transition: "all 0.2s"
  },
  pageNumber: {
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "600",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    backdropFilter: "blur(4px)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px"
  },
  modalBox: {
    backgroundColor: "white",
    borderRadius: "32px",
    padding: "40px",
    width: "100%",
    maxWidth: "560px",
    maxHeight: "88vh",
    overflowY: "auto",
    position: "relative",
    boxShadow: "0 30px 80px -10px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    gap: "32px"
  },
  modalCloseBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#f1f5f9",
    color: "#64748b",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s",
    lineHeight: 1
  }
};

export default DoctorAppointments;

