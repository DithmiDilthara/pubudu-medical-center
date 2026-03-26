import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiCalendar, FiPlus, FiSearch, FiInbox } from 'react-icons/fi';
import { motion, AnimatePresence } from "framer-motion";
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";
import AppointmentCard from "../../components/AppointmentCard";
import CancelAppointmentModal from "../../components/CancelAppointmentModal";
import axios from 'axios';
import toast from 'react-hot-toast';

function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Cancellation Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [apptToCancel, setApptToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setAppointments(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [API_URL]);

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleCancelClick = (appointmentId) => {
    setApptToCancel(appointmentId);
    setIsCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!apptToCancel) return;
    setIsCancelling(true);
    const toastId = toast.loading("Processing cancellation...");
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/appointments/${apptToCancel}/status`,
        { status: 'CANCELLED' },
        { headers: { Authorization: `Bearer ${token}` } });

      setAppointments(prev => prev.map(a => a.appointment_id === apptToCancel ? { ...a, status: 'CANCELLED' } : a));
      toast.success("Appointment cancelled", { id: toastId });
    } catch (error) {
      toast.error("Cancellation failed", { id: toastId });
    } finally {
      setIsCancelling(false);
      setIsCancelModalOpen(false);
      setApptToCancel(null);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const getFilteredAppointments = () => {
    switch (activeTab) {
      case 'Upcoming':
        return appointments.filter(apt => ['PENDING', 'CONFIRMED', 'RESCHEDULED'].includes(apt.status) && apt.appointment_date >= todayStr);
      case 'Completed':
        return appointments.filter(apt => apt.status === 'COMPLETED' || (apt.status === 'CONFIRMED' && apt.appointment_date < todayStr));
      case 'Cancelled':
        return appointments.filter(apt => apt.status === 'CANCELLED');
      default:
        return appointments;
    }
  };

  const filteredAppointments = getFilteredAppointments();

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedAppointments = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div style={styles.container}>
      <PatientSidebar onLogout={handleLogout} />

      <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <PatientHeader />

        <main style={styles.mainContent}>
          <div style={styles.contentWrapper}>
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.headerSection}
          >
            <h1 style={styles.welcomeTitle}>My Appointments</h1>
            <p style={styles.welcomeSubtitle}>Manage your upcoming and past medical visits.</p>
          </motion.div>

          <div style={styles.headerRow}>
            <div style={styles.tabPill}>
              {['Upcoming', 'Completed', 'Cancelled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    ...styles.pillBtn,
                    backgroundColor: activeTab === tab ? 'white' : 'transparent',
                    color: activeTab === tab ? '#2563eb' : '#64748b',
                    boxShadow: activeTab === tab ? '0 4px 12px rgba(0, 0, 0, 0.05)' : 'none',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <button onClick={() => navigate("/patient/find-doctor")} style={styles.bookActionBtn}>
              <FiPlus />
              New Appointment
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={styles.gridContainer}
            >
              {loading ? (
                <div style={styles.loadingBox}>
                     <div style={styles.spinner} />
                     <p>Retrieving your medical schedule...</p>
                </div>
              ) : filteredAppointments.length > 0 ? (
                <div style={styles.appointmentGrid}>
                  {paginatedAppointments.map((apt) => (
                    <motion.div key={apt.appointment_id} variants={cardVariants}>
                        <AppointmentCard 
                            appt={apt} 
                            variant="grid"
                            onCancel={handleCancelClick}
                            onReschedule={() => navigate('/patient/find-doctor')}
                            onViewDetails={(a) => {
                                if (a.status === 'COMPLETED') {
                                    navigate('/patient/medical-history');
                                } else if (a.payment_status !== 'PAID') {
                                    navigate('/patient/payments');
                                }
                            }}
                        />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.emptyState}>
                  <div style={styles.emptyIconBox}><FiInbox /></div>
                  <h3 style={styles.emptyTitle}>No {activeTab.toLowerCase()} records</h3>
                  <p style={styles.emptyText}>You don't have any appointments in this category right now.</p>
                  <button onClick={() => navigate("/patient/find-doctor")} style={styles.emptyActionBtn}>
                    Book Your First Appointment
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Pagination Controls */}
          {filteredAppointments.length > itemsPerPage && (
            <div style={styles.paginationPanel}>
              <div style={styles.paginationInfo}>
                Showing <span style={{fontWeight: '700'}}>{indexOfFirstItem + 1}</span> to <span style={{fontWeight: '700'}}>{Math.min(indexOfLastItem, filteredAppointments.length)}</span> of <span style={{fontWeight: '700'}}>{filteredAppointments.length}</span> {activeTab.toLowerCase()} appointments
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
          </div>
        </main>
      </div>

      <CancelAppointmentModal 
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={confirmCancel}
        appointmentId={apptToCancel}
        isLoading={isCancelling}
      />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', sans-serif"
  },
  mainContent: {
    padding: "40px 32px",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    maxWidth: "1600px",
    margin: "0 auto",
    width: "100%"
  },
  headerSection: {
    marginBottom: "4px",
  },
  welcomeTitle: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px 0",
    letterSpacing: "-1px",
  },
  welcomeSubtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500"
  },
  contentWrapper: {
    maxWidth: "1200px",
    width: "100%",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "32px"
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    flexWrap: 'wrap'
  },
  tabPill: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#f1f5f9',
    padding: '6px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0'
  },
  pillBtn: {
    padding: '10px 24px',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  bookActionBtn: {
    padding: '12px 24px',
    borderRadius: '14px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)',
    transition: 'all 0.2s ease',
  },
  gridContainer: {
    minHeight: '400px'
  },
  appointmentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '28px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px 40px',
    textAlign: 'center',
    backgroundColor: 'white',
    borderRadius: '32px',
    border: '1px solid #f1f5f9'
  },
  emptyIconBox: {
    width: '80px',
    height: '80px',
    borderRadius: '24px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    color: '#cbd5e1',
    marginBottom: '24px'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 8px 0'
  },
  emptyText: {
    fontSize: '15px',
    color: '#64748b',
    marginBottom: '32px',
    maxWidth: '300px'
  },
  emptyActionBtn: {
    padding: '14px 28px',
    fontSize: '14px',
    fontWeight: '700',
    color: 'white',
    background: '#2563eb',
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(37, 99, 235, 0.2)',
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px',
    color: '#64748b',
    gap: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  paginationPanel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "32px 0",
    marginTop: "20px",
    borderTop: "1px solid #f1f5f9"
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
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#2563eb",
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    transition: "all 0.2s"
  },
  pageNumber: {
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "600",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.2s"
  }
};

export default Appointments;
