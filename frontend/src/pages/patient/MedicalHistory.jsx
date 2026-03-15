import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiSearch, 
    FiFilter, 
    FiCalendar,
    FiAlertCircle,
    FiFileText
} from 'react-icons/fi';
import axios from 'axios';
import PatientSidebar from '../../components/PatientSidebar';
import PatientHeader from '../../components/PatientHeader';

const MedicalHistory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [patientInfo, setPatientInfo] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('token');
                
                // First get user profile to get patient_id
                const profileRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (profileRes.data.success) {
                    const patient = profileRes.data.data.profile;
                    setPatientInfo(patient);
                    
                    // Then get history
                    const historyRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/clinical/history/${patient.patient_id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (historyRes.data.success) {
                        setHistory(historyRes.data.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching medical history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const filteredHistory = history.filter(record => 
        record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        record.doctor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div style={styles.container}>
            <PatientSidebar />
            
            <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <PatientHeader 
                    userName={patientInfo?.full_name || 'Patient'} 
                    userImage={patientInfo?.profile_image}
                />
                
                <main style={styles.mainContent}>
                    <div style={styles.contentWrapper}>
                    <div style={styles.pageHeader}>
                        <div>
                            <motion.h1 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={styles.pageTitle}
                            >
                                Medical History
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                style={styles.pageSubtitle}
                            >
                                View your past consultations, diagnoses, and prescriptions
                            </motion.p>
                        </div>
                    </div>

                    <div style={styles.contentArea}>
                        <div style={styles.searchFilterBar}>
                            <div style={styles.searchWrapper}>
                                <FiSearch style={styles.searchIcon} />
                                <input 
                                    type="text" 
                                    placeholder="Search by diagnosis or doctor name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={styles.searchInput}
                                />
                            </div>
                            <button style={styles.filterBtn}>
                                <FiFilter /> Filter
                            </button>
                        </div>

                        {isLoading ? (
                            <div style={styles.loadingState}>
                                <div style={styles.spinner}></div>
                                <p>Loading medical history...</p>
                            </div>
                        ) : (
                            <motion.div 
                                style={styles.recordsGrid}
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <AnimatePresence>
                                    {filteredHistory.length > 0 ? (
                                        filteredHistory.map((record) => (
                                            <motion.div 
                                                key={record.record_id}
                                                variants={itemVariants}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="premium-record-card"
                                            >
                                                <div className="record-card-header">
                                                    <div className="record-date">
                                                        <FiCalendar className="icon" />
                                                        <span>{new Date(record.record_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                    <span className="record-status completed">Consultation Added</span>
                                                </div>

                                                <div className="record-card-body">
                                                    <div className="record-doctor-info">
                                                        <div className="doctor-avatar">
                                                            {record.doctor?.full_name?.charAt(0) || 'D'}
                                                        </div>
                                                        <div>
                                                            <h3 className="doctor-name">Dr. {record.doctor?.full_name}</h3>
                                                            <p className="doctor-specialty">{record.doctor?.specialization}</p>
                                                        </div>
                                                    </div>

                                                    <div className="record-details">
                                                        {record.diagnosis && (
                                                            <div className="detail-section">
                                                                <h4>Diagnosis</h4>
                                                                <p>{record.diagnosis}</p>
                                                            </div>
                                                        )}
                                                        
                                                        {record.prescription && (
                                                            <div className="detail-section">
                                                                <h4>Prescription</h4>
                                                                <div className="prescription-box">
                                                                    <p>{record.prescription}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {record.notes && (
                                                            <div className="detail-section">
                                                                <h4>Clinical Notes</h4>
                                                                <p className="clinical-notes">{record.notes}</p>
                                                            </div>
                                                        )}
                                                        
                                                        {record.follow_up_date && (
                                                            <div className="detail-section follow-up">
                                                                <FiAlertCircle className="icon text-amber" />
                                                                <span>Follow-up Recommended: <strong>{new Date(record.follow_up_date).toLocaleDateString()}</strong></span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="record-card-footer">
                                                    <button style={styles.downloadBtn}>
                                                        <FiFileText className="icon" style={{marginRight: '8px'}} /> Download PDF
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div style={styles.emptyState}>
                                            <FiFileText style={styles.emptyIcon} />
                                            <h3 style={styles.emptyTitle}>No medical records found</h3>
                                            <p style={styles.emptyText}>Your consultation history and records will appear here.</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

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
    pageHeader: {
        marginBottom: "4px"
    },
    pageTitle: {
        fontSize: "32px",
        fontWeight: "800",
        color: "#0f172a",
        margin: "0 0 8px 0",
        letterSpacing: "-1px"
    },
    pageSubtitle: {
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
    contentArea: {
        display: "flex",
        flexDirection: "column",
        gap: "24px"
    },
    searchFilterBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        marginBottom: "16px",
        flexWrap: "wrap"
    },
    searchWrapper: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: "14px",
        padding: "12px 16px",
        flex: 1,
        maxWidth: "400px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
    },
    searchIcon: {
        color: "#94a3b8",
        fontSize: "18px",
        marginRight: "12px"
    },
    searchInput: {
        border: "none",
        outline: "none",
        width: "100%",
        fontSize: "14px",
        color: "#334155",
        background: "transparent"
    },
    filterBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 20px",
        backgroundColor: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        fontSize: "14px",
        fontWeight: "600",
        color: "#475569",
        cursor: "pointer",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
        transition: "all 0.2s"
    },
    recordsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
        gap: "24px"
    },
    loadingState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px",
        color: "#64748b"
    },
    spinner: {
        width: "40px",
        height: "40px",
        border: "3px solid #f1f5f9",
        borderTop: "3px solid #2563eb",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "16px"
    },
    emptyState: {
        gridColumn: "1 / -1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 40px",
        backgroundColor: "white",
        borderRadius: "24px",
        border: "1px solid #e2e8f0",
        textAlign: "center"
    },
    emptyIcon: {
        fontSize: "48px",
        color: "#cbd5e1",
        marginBottom: "16px"
    },
    emptyTitle: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#1e293b",
        margin: "0 0 8px 0"
    },
    emptyText: {
        fontSize: "14px",
        color: "#64748b",
        margin: 0
    },
    downloadBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 18px",
        borderRadius: "12px",
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        color: "#475569",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease"
    }
};

export default MedicalHistory;
