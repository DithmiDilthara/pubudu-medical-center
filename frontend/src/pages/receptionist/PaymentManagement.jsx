import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiCreditCard, FiAlertCircle, FiUser, FiCalendar, FiSearch, FiCheckCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import ReceptionistSidebar from "../../components/ReceptionistSidebar";
import ReceptionistHeader from "../../components/ReceptionistHeader";
import StatsCard from "../../components/StatsCard";

function PaymentManagement() {
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [receptionistName, setReceptionistName] = useState("Receptionist");
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch Profile
                const profileRes = await axios.get(`${API_URL}/auth/profile`, { headers });
                if (profileRes.data.success) {
                    setReceptionistName(profileRes.data.data.profile.full_name);
                }

                // Fetch Appointments
                const aptRes = await axios.get(`${API_URL}/appointments`, { headers });
                if (aptRes.data.success) {
                    // Filter: Unpaid or Partial + non-Cancelled, sorted by date ascending
                    const filtered = aptRes.data.data
                        .filter(apt => (apt.payment_status === 'UNPAID' || apt.payment_status === 'PARTIAL') && ['PENDING', 'CONFIRMED'].includes(apt.status))
                        .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
                    setAppointments(filtered);
                }
            } catch (error) {
                console.error("Error fetching payment data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredAppointments = useMemo(() => {
        return appointments.filter(apt => {
            const search = searchQuery.toLowerCase();
            const name = (apt.patient?.full_name || "").toLowerCase();
            const id = (apt.appointment_id || "").toString().toLowerCase();
            return name.includes(search) || id.includes(search);
        });
    }, [appointments, searchQuery]);

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Paginated appointments
    const paginatedAppointments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAppointments.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAppointments, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

    const stats = useMemo(() => {
        const pendingCount = appointments.length;
        const totalAmount = appointments.reduce((sum, apt) => {
            const totalFee = Number(apt.doctor?.doctor_fee || 0) + Number(apt.doctor?.center_fee || 600);
            const paidAmount = (apt.payments || []).reduce((pSum, p) => pSum + parseFloat(p.amount), 0);
            return sum + (totalFee - paidAmount);
        }, 0);
        return { pendingCount, totalAmount };
    }, [appointments]);

    const handleProcessPayment = (appointment) => {
        navigate("/receptionist/payment/confirm", { 
            state: { appointment } 
        });
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div style={styles.container}>
            <ReceptionistSidebar onLogout={handleLogout} />

            <motion.div 
                className="main-wrapper"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <ReceptionistHeader receptionistName={receptionistName} />

                <main className="content-padding">
                    {/* Header */}
                    <motion.header variants={itemVariants} style={styles.headerSection}>
                        <div style={styles.headerTitleSection}>
                            <h1 style={styles.welcomeTitle}>Payment Processing</h1>
                            <p style={styles.welcomeSubtitle}>Manage and process pending consultation fees securely.</p>
                        </div>
                    </motion.header>

                    {/* Summary Cards Row */}
                    <motion.div variants={itemVariants} style={styles.statsGrid}>
                        <StatsCard 
                            title="Pending Payments"
                            value={stats.pendingCount}
                            icon={<FiAlertCircle style={{ fontSize: '20px' }} />}
                            gradient="linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)"
                            shadow="rgba(244, 63, 94, 0.2)"
                            delay={0.1}
                        />

                        <StatsCard 
                            title="Outstanding Amount"
                            value={`LKR ${stats.totalAmount.toLocaleString()}`}
                            icon={<FiCreditCard style={{ fontSize: '20px' }} />}
                            gradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                            shadow="rgba(59, 130, 246, 0.2)"
                            delay={0.2}
                        />
                    </motion.div>

                    {/* Table Section */}
                    <motion.section variants={itemVariants} style={styles.tableCard}>
                        <div style={styles.tableHeaderSection}>
                            <div>
                                <h2 style={styles.tableTitle}>Unpaid Appointments List</h2>
                            </div>
                            <div style={styles.searchBox}>
                                <FiSearch style={styles.searchIcon} />
                                <input 
                                    type="text" 
                                    placeholder="Search by patient or ID..." 
                                    style={styles.searchInput}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={(e) => e.target.parentElement.style.borderColor = "#3b82f6"}
                                    onBlur={(e) => e.target.parentElement.style.borderColor = "#e2e8f0"}
                                />
                            </div>
                        </div>

                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.tableHeaderRow}>
                                        <th style={styles.tableHeader}>Appt ID</th>
                                        <th style={styles.tableHeader}>Patient</th>
                                        <th style={styles.tableHeader}>Doctor</th>
                                        <th style={styles.tableHeader}>Date</th>
                                        <th style={styles.tableHeader}>Amount (LKR)</th>
                                        <th style={styles.tableHeader}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan="6" style={styles.tablePlaceholder}>Loading appointments...</td>
                                            </tr>
                                        ) : filteredAppointments.length > 0 ? (
                                            paginatedAppointments.map((apt) => (
                                                <motion.tr 
                                                    key={apt.appointment_id}
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    style={styles.tableRow}
                                                    className="payment-row"
                                                >
                                                    <td style={styles.tableCell}>#{apt.appointment_id}</td>
                                                    <td style={styles.tableCell}>
                                                        <div style={styles.patientCell}>
                                                            <FiUser style={styles.userIcon} />
                                                            {apt.patient?.full_name || "Unknown"}
                                                        </div>
                                                    </td>
                                                    <td style={styles.tableCell}>{apt.doctor?.full_name || "N/A"}</td>
                                                    <td style={styles.tableCell}>
                                                        <div style={styles.dateCell}>
                                                            <FiCalendar style={styles.calIcon} />
                                                            {apt.appointment_date}
                                                        </div>
                                                    </td>
                                                    <td style={{ ...styles.tableCell, fontWeight: "700" }}>
                                                        {(() => {
                                                            const totalFee = Number(apt.doctor?.doctor_fee || 0) + Number(apt.doctor?.center_fee || 600);
                                                            const paidAmount = (apt.payments || []).reduce((pSum, p) => pSum + parseFloat(p.amount), 0);
                                                            const balance = totalFee - paidAmount;
                                                            return (
                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    <span>LKR {balance.toLocaleString()}</span>
                                                                    {apt.payment_status === 'PARTIAL' && (
                                                                        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '500' }}>
                                                                            (Partial Balance)
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td style={styles.tableCell}>
                                                        <button
                                                            onClick={() => handleProcessPayment(apt)}
                                                            style={styles.processBtn}
                                                        >
                                                            Process Payment
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" style={styles.emptyContainer}>
                                                    <div style={styles.emptyState}>
                                                        <FiCheckCircle size={48} color="#34d399" />
                                                        <h3 style={styles.emptyTitle}>All caught up!</h3>
                                                        <p style={styles.emptyText}>There are no unpaid appointments at the moment.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        {!isLoading && filteredAppointments.length > 0 && (
                            <div style={styles.paginationFooter}>
                                <div style={styles.paginationInfo}>
                                    Showing <span style={{fontWeight: '700'}}>{Math.min(filteredAppointments.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span style={{fontWeight: '700'}}>{Math.min(filteredAppointments.length, currentPage * itemsPerPage)}</span> of <span style={{fontWeight: '700'}}>{filteredAppointments.length}</span> payments
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
                    </motion.section>
                </main>
            </motion.div>

            <style>
                {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    .animate-spin {
                        animation: spin 1s linear infinite;
                    }
                    .payment-row:hover {
                        background-color: rgba(239, 246, 255, 0.5) !important;
                    }
                `}
            </style>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily: "'Inter', sans-serif"
    },
    headerSection: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "32px"
    },
    headerTitleSection: {
        display: "flex",
        flexDirection: "column",
        gap: "4px"
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
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "24px",
        marginBottom: "40px"
    },
    statsInfo: {
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },
    statsLabel: {
        fontSize: "13px",
        fontWeight: "600",
        margin: 0,
        textTransform: "uppercase",
        letterSpacing: "0.025em"
    },
    statsValue: {
        fontSize: "32px",
        fontWeight: "800",
        margin: 0
    },
    statsIconBox: {
        width: "56px",
        height: "56px",
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px"
    },
    tableCard: {
        backgroundColor: "white",
        borderRadius: "24px",
        padding: "0",
        border: "2px solid #3b82f6",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
        overflow: "hidden"
    },
    tableHeaderSection: {
        padding: "24px",
        borderBottom: "1px solid #f1f5f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
    },
    tableTitle: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#0f172a",
        margin: 0
    },
    searchBox: {
        position: "relative",
        width: "288px",
        borderRadius: "12px",
        border: "2px solid #e2e8f0",
        backgroundColor: "#f8fafc",
        transition: "all 0.2s",
        overflow: "hidden"
    },
    searchIcon: {
        position: "absolute",
        left: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#94a3b8",
        zIndex: 1
    },
    searchInput: {
        width: "100%",
        padding: "10px 12px 10px 40px",
        border: "none",
        backgroundColor: "transparent",
        fontSize: "14px",
        outline: "none",
        color: "#1e293b"
    },
    tableContainer: {
        overflowX: "auto"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse"
    },
    tableHeaderRow: {
        background: "linear-gradient(to right, #2563eb, #4f46e5)",
    },
    tableHeader: {
        textAlign: "left",
        padding: "14px 20px",
        fontSize: "13px",
        fontWeight: "600",
        color: "white",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    },
    tableRow: {
        borderBottom: "1px solid #f1f5f9",
        transition: "background-color 0.2s"
    },
    tableCell: {
        padding: "18px 20px",
        fontSize: "14px",
        color: "#334155"
    },
    patientCell: {
        display: "flex",
        alignItems: "center",
        gap: "8px"
    },
    userIcon: {
        color: "#94a3b8"
    },
    dateCell: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: "#64748b"
    },
    calIcon: {
        fontSize: "14px"
    },
    processBtn: {
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        color: "white",
        border: "none",
        borderRadius: "12px",
        padding: "10px 20px",
        fontSize: "14px",
        fontWeight: "700",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.25)",
        transition: "all 0.3s ease",
        cursor: "pointer"
    },
    tablePlaceholder: {
        padding: "40px",
        textAlign: "center",
        color: "#94a3b8"
    },
    emptyContainer: {
        padding: "80px 20px"
    },
    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        textAlign: "center"
    },
    emptyTitle: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#0f172a",
        margin: "8px 0 0 0"
    },
    emptyText: {
        fontSize: "15px",
        color: "#64748b",
        margin: 0
    },
    paginationFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 24px",
        backgroundColor: "#f8fafc",
        borderTop: "1px solid #e2e8f0"
    },
    paginationInfo: {
        fontSize: "14px",
        color: "#64748b"
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

export default PaymentManagement;
