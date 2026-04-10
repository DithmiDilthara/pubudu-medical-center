import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FiSearch, 
  FiActivity, 
  FiCalendar, 
  FiFilter, 
  FiChevronRight,
   FiUser,
   FiClock,
   FiX,
   FiInfo
 } from 'react-icons/fi';
import { LuStethoscope } from 'react-icons/lu';
import { motion, AnimatePresence } from "framer-motion";
import ReceptionistSidebar from "../../components/ReceptionistSidebar";
import ReceptionistHeader from "../../components/ReceptionistHeader";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const formatTime12h = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${minutes} ${ampm}`;
};

const formatDayName = (day) => {
    if (!day) return '';
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
};

const UpcomingSessionsModal = ({ show, onClose, doctor, sessions, loading }) => {
    if (!show) return null;

    return (
        <AnimatePresence>
            <div style={modalStyles.overlay} onClick={onClose}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    style={modalStyles.modal}
                    onClick={e => e.stopPropagation()}
                >
                    <div style={modalStyles.header}>
                        <div>
                            <h2 style={modalStyles.title}>One-Month Projection</h2>
                            <p style={modalStyles.subtitle}>Next available numbers for {doctor?.full_name}</p>
                        </div>
                        <button onClick={onClose} style={modalStyles.closeBtn}>
                            <FiX size={20} />
                        </button>
                    </div>

                    <div style={modalStyles.content}>
                        {loading ? (
                            <div style={modalStyles.loadingContainer}>
                                <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                                <p>Calculating queue intelligence...</p>
                            </div>
                        ) : sessions.length > 0 ? (
                            <div style={modalStyles.tableWrapper}>
                                <table style={modalStyles.table}>
                                    <thead>
                                        <tr>
                                            <th style={modalStyles.th}>Date & Day</th>
                                            <th style={modalStyles.th}>Session Time</th>
                                            <th style={modalStyles.th}>Next Available</th>
                                            <th style={modalStyles.th}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sessions.map((session, idx) => {
                                            const isFull = (session.next_number - 1) >= session.max_patients;
                                            return (
                                                <tr key={idx} style={modalStyles.tr}>
                                                    <td style={modalStyles.td}>
                                                        <div style={{ fontWeight: '600', color: '#0f172a' }}>
                                                            {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#64748b' }}>{formatDayName(session.day)}</div>
                                                    </td>
                                                    <td style={modalStyles.td}>
                                                        <div style={modalStyles.timeSlot}>
                                                            <FiClock size={12} />
                                                            {formatTime12h(session.start_time)} - {formatTime12h(session.end_time)}
                                                        </div>
                                                    </td>
                                                    <td style={modalStyles.td}>
                                                        <div style={{ 
                                                            ...modalStyles.nextNumber,
                                                            backgroundColor: isFull ? '#fee2e2' : '#dcfce7',
                                                            color: isFull ? '#991b1b' : '#166534'
                                                        }}>
                                                            #{String(session.next_number).padStart(2, '0')}
                                                        </div>
                                                    </td>
                                                    <td style={modalStyles.td}>
                                                        <span style={{ 
                                                            fontSize: '12px', 
                                                            fontWeight: '600',
                                                            color: isFull ? '#ef4444' : '#10b981'
                                                        }}>
                                                            {isFull ? 'Session Full' : `${session.max_patients - (session.next_number - 1)} slots left`}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={modalStyles.emptyState}>
                                <FiInfo size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
                                <p>No sessions scheduled for the next 30 days.</p>
                            </div>
                        )}
                    </div>

                    <div style={modalStyles.footer}>
                        <p style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiInfo size={14} />
                            Provide these available numbers to the patient over the phone.
                        </p>
                        <button onClick={onClose} style={modalStyles.doneBtn}>Close View</button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const modalStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
    },
    modal: {
        backgroundColor: 'white',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '650px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
    },
    header: {
        padding: '24px 32px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to right, #ffffff, #f8fafc)'
    },
    title: {
        fontSize: '20px',
        fontWeight: '800',
        color: '#0f172a',
        letterSpacing: '-0.5px'
    },
    subtitle: {
        fontSize: '14px',
        color: '#64748b',
        marginTop: '2px'
    },
    closeBtn: {
        backgroundColor: '#f1f5f9',
        border: 'none',
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#64748b',
        transition: 'all 0.2s'
    },
    content: {
        padding: '0',
        overflowY: 'auto',
        flex: 1
    },
    loadingContainer: {
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        color: '#64748b'
    },
    tableWrapper: {
        width: '100%'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left'
    },
    th: {
        padding: '12px 32px',
        backgroundColor: '#f8fafc',
        fontSize: '11px',
        fontWeight: '700',
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        position: 'sticky',
        top: 0
    },
    tr: {
        borderBottom: '1px solid #f1f5f9',
        transition: 'background-color 0.2s'
    },
    td: {
        padding: '16px 32px',
        verticalAlign: 'middle'
    },
    timeSlot: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        color: '#334155',
        fontWeight: '500'
    },
    nextNumber: {
        padding: '4px 10px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '700',
        display: 'inline-block'
    },
    emptyState: {
        padding: '80px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: '#64748b',
        textAlign: 'center'
    },
    footer: {
        padding: '20px 32px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8fafc'
    },
    doneBtn: {
        backgroundColor: '#0f172a',
        color: 'white',
        border: 'none',
        padding: '10px 24px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer'
    }
};

const Doctors = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSpecialization, setSelectedSpecialization] = useState("All");
    const [specializations, setSpecializations] = useState(["All"]);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
    const [receptionistName, setReceptionistName] = useState("Receptionist");

    // Upcoming Modal State
    const [selectedDoctorForUpcoming, setSelectedDoctorForUpcoming] = useState(null);
    const [showUpcomingModal, setShowUpcomingModal] = useState(false);
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [loadingUpcoming, setLoadingUpcoming] = useState(false);

    useEffect(() => {
        fetchProfile();
        fetchDoctors();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setReceptionistName(response.data.data.profile.full_name);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/doctors`);
            if (response.data.success) {
                const doctorsData = response.data.data;
                setDoctors(doctorsData);
                
                const specs = ["All", ...new Set(doctorsData.map(d => d.specialization).filter(Boolean))];
                setSpecializations(specs);
            }
        } catch (error) {
            console.error("Error fetching doctors:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUpcomingSessions = async (doctorId) => {
        try {
            setLoadingUpcoming(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/doctors/${doctorId}/upcoming`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setUpcomingSessions(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching upcoming sessions:", error);
            toast.error("Failed to load upcoming sessions");
        } finally {
            setLoadingUpcoming(false);
        }
    };

    const handleOpenUpcoming = (doctor) => {
        setSelectedDoctorForUpcoming(doctor);
        setShowUpcomingModal(true);
        fetchUpcomingSessions(doctor.doctor_id);
    };

    const filteredDoctors = doctors.filter(doctor => {
        const name = doctor.full_name || "";
        const specialty = doctor.specialization || "";
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            specialty.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpec = selectedSpecialization === "All" || specialty === selectedSpecialization;
        return matchesSearch && matchesSpec;
    });

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedSpecialization]);

    // Paginated doctors
    const paginatedDoctors = filteredDoctors.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { type: "spring", stiffness: 300, damping: 24 }
        }
    };


    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <div style={styles.pageContainer}>
            <ReceptionistSidebar onLogout={handleLogout} />
            
                <motion.div 
                    className="main-wrapper"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <ReceptionistHeader receptionistName={receptionistName} />
                    <main style={styles.mainContent}>
                        {/* Page Header */}
                        <motion.header variants={itemVariants} style={styles.pageHeader}>
                            <h1 style={styles.welcomeTitle}>Medical Staff Directory</h1>
                            <p style={styles.welcomeSubtitle}>View and manage availability of all clinic doctors.</p>
                        </motion.header>

                    {/* Filter Bar */}
                    <motion.div 
                        variants={itemVariants}
                        style={styles.filterBar}
                    >
                        <div style={styles.searchWrapper}>
                            <FiSearch style={styles.searchIcon} />
                            <input 
                                type="text" 
                                placeholder="Search doctors..."
                                style={styles.searchInput}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div style={styles.selectWrapper}>
                            <FiFilter style={styles.filterIcon} />
                            <select 
                                style={styles.select}
                                value={selectedSpecialization}
                                onChange={(e) => setSelectedSpecialization(e.target.value)}
                            >
                                {specializations.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                        </div>
                    </motion.div>

                    {/* Card Grid */}
                    {loading ? (
                        <div style={styles.loadingState}>
                            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                            <p style={{ color: 'var(--slate-500)', fontWeight: '500' }}>Loading medical staff...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {filteredDoctors.length > 0 ? (
                                <motion.div 
                                    key="grid"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    style={styles.doctorGrid}
                                >
                                    {paginatedDoctors.map((doctor) => {
                                        return (
                                            <motion.div
                                                key={doctor.doctor_id}
                                                variants={itemVariants}
                                                style={styles.doctorCard}
                                                whileHover="hover"
                                            >
                                                {/* Color Bar */}
                                                <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--primary-blue)' }}></div>
                                                
                                                <div style={{ padding: '24px' }}>
                                                    {/* Top Section */}
                                                    <div style={styles.cardHeader}>
                                                        <motion.div 
                                                            variants={{ hover: { scale: 1.05 } }}
                                                            style={styles.avatarPlaceholder}
                                                        >
                                                            <LuStethoscope style={{ fontSize: '28px' }} />
                                                        </motion.div>
                                                        <div>
                                                            <h3 style={styles.doctorName}>{doctor.full_name}</h3>
                                                            <p style={{ ...styles.doctorSpecialty, color: '#0f172a' }}>{doctor.specialization}</p>
                                                        </div>
                                                    </div>

                                                    {/* Available Times & Next No */}
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                                                        <div>
                                                            <div style={styles.sectionLabelWrapper}>
                                                                <FiClock style={{ color: '#0f172a', opacity: 0.8, fontSize: '14px' }} />
                                                                <span style={{ ...styles.sectionLabel, color: '#0f172a' }}>Available Times</span>
                                                            </div>
                                                            <div style={styles.daysWrapper}>
                                                                {doctor.availability && doctor.availability.length > 0 ? (
                                                                    doctor.availability.slice(0, 2).map((av, idx) => (
                                                                        <span key={idx} style={{ ...styles.dayChip, backgroundColor: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0' }}>
                                                                            {formatDayName(av.day_of_week)}: {formatTime12h(av.start_time)} - {formatTime12h(av.end_time)}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span style={{ fontSize: '12px', color: 'var(--slate-400)' }}>Not set</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                                                            <button 
                                                                onClick={() => handleOpenUpcoming(doctor)}
                                                                style={styles.viewQueueBtn}
                                                                title="View one-month session projection"
                                                            >
                                                                <FiActivity size={14} style={{ marginRight: '6px' }} />
                                                                View Queue Info
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Fee Section */}
                                                <div style={styles.cardFooter}>
                                                    <div>
                                                        <p style={{ ...styles.feeLabel, color: '#0f172a', opacity: 0.8 }}>Consultation Fee</p>
                                                        <p style={{ ...styles.feeValue, color: '#0f172a' }}>
                                                            LKR {(Number(doctor.doctor_fee) + Number(doctor.center_fee || 0)).toLocaleString()}
                                                        </p>
                                                    </div>
                                                     <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button 
                                                            onClick={() => navigate(`/receptionist/doctors/${doctor.doctor_id}/schedule`)}
                                                            style={{ ...styles.manageBtn, background: 'white', color: '#2563eb', border: '1px solid #2563eb' }}
                                                        >
                                                            Manage Schedule
                                                        </button>
                                                        <button 
                                                            onClick={() => navigate(`/receptionist/appointments/new?doctor=${doctor.doctor_id}`)}
                                                            style={{ ...styles.bookBtn, background: '#2563eb' }}
                                                        >
                                                            Book Now
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    style={styles.emptyState}
                                >
                                    <div style={styles.emptyIconWrapper}>
                                        <LuStethoscope style={{ fontSize: '32px' }} />
                                    </div>
                                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--slate-800)' }}>No doctors found</h3>
                                    <p style={{ color: 'var(--slate-400)', marginTop: '4px', maxWidth: '320px' }}>Try adjusting your search criteria or specialization filter.</p>
                                    <button 
                                        onClick={() => { setSearchTerm(""); setSelectedSpecialization("All"); }}
                                        style={styles.clearBtn}
                                    >
                                        Clear all filters
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}

                    {/* Pagination Footer */}
                    {!loading && filteredDoctors.length > 0 && (
                        <div style={styles.paginationFooter}>
                            <div style={styles.paginationInfo}>
                                Showing <span style={{fontWeight: '700'}}>{Math.min(filteredDoctors.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span style={{fontWeight: '700'}}>{Math.min(filteredDoctors.length, currentPage * itemsPerPage)}</span> of <span style={{fontWeight: '700'}}>{filteredDoctors.length}</span> doctors
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
                </main>
                <UpcomingSessionsModal 
                    show={showUpcomingModal}
                    onClose={() => setShowUpcomingModal(false)}
                    doctor={selectedDoctorForUpcoming}
                    sessions={upcomingSessions}
                    loading={loadingUpcoming}
                />
            </motion.div>
        </div>
    );
};

const styles = {
    pageContainer: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--slate-50)',
    },
    mainContent: {
        padding: '40px 32px',
        flex: 1,
        maxWidth: "1400px",
        margin: "0 auto",
        width: "100%"
    },
    pageHeader: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        marginBottom: "32px"
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
    title: {
        fontSize: '32px',
        fontWeight: '800',
        color: 'var(--slate-900)',
        letterSpacing: '-0.02em',
    },
    subtitle: {
        fontSize: '16px',
        color: 'var(--slate-500)',
        marginTop: '4px',
        fontWeight: '500',
    },
    filterBar: {
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '16px',
        border: '1px solid var(--slate-200)',
        boxShadow: 'var(--shadow-soft)',
        marginBottom: '32px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '16px',
    },
    searchWrapper: {
        position: 'relative',
        width: '384px', // w-96
    },
    searchIcon: {
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--slate-400)',
        fontSize: '18px',
    },
    searchInput: {
        width: '100%',
        padding: '12px 16px 12px 44px',
        backgroundColor: 'var(--slate-50)',
        border: '1px solid var(--slate-200)',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        outline: 'none',
        transition: 'all 0.2s ease',
    },
    selectWrapper: {
        position: 'relative',
        width: '192px', // w-48
    },
    filterIcon: {
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: 'var(--slate-400)',
        fontSize: '18px',
        pointerEvents: 'none',
    },
    select: {
        width: '100%',
        padding: '12px 16px 12px 44px',
        backgroundColor: 'var(--slate-50)',
        border: '1px solid var(--slate-200)',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        outline: 'none',
        appearance: 'none',
        cursor: 'pointer',
    },
    loadingState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '96px 0',
        gap: '16px',
    },
    doctorGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px',
    },
    doctorCard: {
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid var(--slate-200)',
        boxShadow: 'var(--shadow-soft)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'default',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
    },
    avatarPlaceholder: {
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        backgroundColor: 'var(--primary-blue-light)',
        border: '1px solid #dbeafe', // blue-100
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary-blue)',
    },
    doctorName: {
        fontSize: '18px',
        fontWeight: '700',
        color: 'var(--slate-800)',
        lineHeight: '1.2',
    },
    doctorSpecialty: {
        color: 'var(--primary-blue)',
        fontWeight: '600',
        fontSize: '14px',
        marginTop: '2px',
    },
    sectionLabelWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
    },
    sectionLabel: {
        fontSize: '10px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--slate-500)',
    },
    daysWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
    },
    dayChip: {
        padding: '4px 8px',
        backgroundColor: 'var(--slate-100)',
        color: 'var(--slate-600)',
        borderRadius: '6px',
        fontSize: '10px',
        fontWeight: '600',
    },
    cardFooter: {
        marginTop: 'auto',
        padding: '16px 24px',
        backgroundColor: '#fbfcfd',
        borderTop: '1px solid var(--slate-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    feeLabel: {
        fontSize: '10px',
        fontWeight: '700',
        color: 'var(--slate-400)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
    },
    feeValue: {
        fontSize: '18px',
        fontWeight: '700',
        color: 'var(--slate-800)',
    },
    bookBtn: {
        padding: '10px 20px',
        color: 'white',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: '700',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
    },
    manageBtn: {
        padding: '10px 16px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    arrowIcon: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: 'white',
        border: '1px solid var(--slate-100)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--slate-400)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        transition: 'all 0.3s ease',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '128px 32px',
        backgroundColor: 'white',
        borderRadius: '24px',
        border: '2px dashed var(--slate-200)',
        textAlign: 'center',
    },
    emptyIconWrapper: {
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        backgroundColor: 'var(--slate-50)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--slate-400)',
        marginBottom: '16px',
        boxShadow: 'var(--shadow-soft)',
    },
    clearBtn: {
        marginTop: '24px',
        padding: '8px 24px',
        backgroundColor: 'var(--slate-900)',
        color: 'white',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.2s',
        border: 'none',
    },
    paginationFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "32px 0",
        marginTop: "16px",
        borderTop: "1px solid var(--slate-200)"
    },
    paginationInfo: {
        fontSize: "14px",
        color: "var(--slate-500)",
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
    },
    viewQueueBtn: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#f1f5f9',
        color: '#475569',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.025em',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        marginBottom: '4px'
    }
};

export default Doctors;
