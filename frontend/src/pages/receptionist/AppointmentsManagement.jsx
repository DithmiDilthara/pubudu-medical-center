import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
    FiChevronDown, FiSearch, FiPlus, FiCalendar, 
    FiClock, FiFilter, FiUser, FiMoreVertical,
    FiX, FiAlertCircle 
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import ReceptionistSidebar from "../../components/ReceptionistSidebar";
import ReceptionistHeader from "../../components/ReceptionistHeader";
import BookingModal from "../../components/BookingModal";
import ConfirmDialog from "../../components/ConfirmDialog";

function AppointmentsManagement() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [receptionistName, setReceptionistName] = useState('Receptionist');
    
    // Filters & Search
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    
    // Modals
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedAptForReschedule, setSelectedAptForReschedule] = useState(null);
    const [isSessionCancelOpen, setIsSessionCancelOpen] = useState(false);
    const [sessionCancelData, setSessionCancelData] = useState({ doctorId: "", date: "" });
    
    // Cancellation Confirmation
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [aptToCancel, setAptToCancel] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchData = async () => {
            try {
                const [profileRes, aptRes, docRes] = await Promise.all([
                    axios.get(`${API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/appointments`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/doctors`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                if (profileRes.data.success) setReceptionistName(profileRes.data.data.profile.full_name);
                if (aptRes.data.success) setAppointments(aptRes.data.data);
                if (docRes.data.success) setDoctors(docRes.data.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredAppointments = useMemo(() => {
        return appointments.filter(apt => {
            const matchesSearch = 
                (apt.patient?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (apt.doctor?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (apt.appointment_id || "").toString().includes(searchQuery);
            
            const matchesStatus = statusFilter === "ALL" || apt.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        }).sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
    }, [appointments, searchQuery, statusFilter]);

    const handleCancelAppointment = (apt) => {
        setAptToCancel(apt);
        setIsCancelDialogOpen(true);
    };

    const confirmCancelAppointment = async () => {
        if (!aptToCancel) return;
        
        const appointmentId = aptToCancel.appointment_id;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/appointments/${appointmentId}/cancel`,
                { cancellation_reason: "Cancelled by Receptionist" },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAppointments(prev => prev.map(apt => 
                apt.appointment_id === appointmentId ? { ...apt, status: 'CANCELLED' } : apt
            ));
            toast.success("Appointment cancelled");
        } catch (error) {
            toast.error("Failed to cancel appointment");
        } finally {
            setIsCancelDialogOpen(false);
            setAptToCancel(null);
        }
    };

    const handleCancelSession = async () => {
        if (!sessionCancelData.doctorId || !sessionCancelData.date) {
            toast.error("Please select a doctor and date");
            return;
        }

        if (!window.confirm("This will cancel ALL appointments for this doctor on the selected date. Proceed?")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/appointments/cancel-session`, sessionCancelData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Refresh local state
            setAppointments(prev => prev.map(apt => {
                if (apt.doctor_id == sessionCancelData.doctorId && apt.appointment_date === sessionCancelData.date) {
                    return { ...apt, status: 'CANCELLED' };
                }
                return apt;
            }));

            toast.success("Session cancelled successfully");
            setIsSessionCancelOpen(false);
        } catch (error) {
            toast.error("Failed to cancel session");
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            CONFIRMED: { bg: "#e0f2fe", text: "#0369a1" },
            PENDING: { bg: "#fef3c7", text: "#92400e" },
            COMPLETED: { bg: "#dcfce7", text: "#166534" },
            CANCELLED: { bg: "#fee2e2", text: "#991b1b" }
        };
        const config = styles[status] || styles.PENDING;
        return (
            <span style={{
                backgroundColor: config.bg,
                color: config.text,
                padding: "4px 10px",
                borderRadius: "9999px",
                fontSize: "12px",
                fontWeight: "600"
            }}>
                {status}
            </span>
        );
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div style={ui.container}>
            <ReceptionistSidebar />
            <div className="main-wrapper">
                <ReceptionistHeader receptionistName={receptionistName} />
                
                <main className="content-padding">
                    {/* Page Header */}
                    <header style={ui.headerSection}>
                        <div style={ui.headerTitleSection}>
                            <h1 style={ui.welcomeTitle}>Appointment Management</h1>
                            <p style={ui.welcomeSubtitle}>Manage all patient bookings and schedules efficiently.</p>
                        </div>
                        <div style={ui.headerRight}>
                            <button 
                                onClick={() => setIsSessionCancelOpen(true)}
                                style={ui.btnOutline}
                            >
                                <FiAlertCircle style={{marginRight: '8px'}} />
                                Cancel Doctor Session
                            </button>
                            <button 
                                onClick={() => navigate("/receptionist/appointments/new")}
                                style={ui.btnPrimary}
                            >
                                <FiPlus style={{marginRight: '8px'}} />
                                New Booking
                            </button>
                        </div>
                    </header>

                    {/* Filter Bar */}
                    <div style={ui.filterBar}>
                        <div style={ui.searchWrapper}>
                            <FiSearch style={ui.searchIcon} />
                            <input 
                                type="text" 
                                placeholder="Search by patient, doctor or ID..." 
                                style={ui.searchInput}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={(e) => e.target.parentElement.style.borderColor = "#2563eb"}
                                onBlur={(e) => e.target.parentElement.style.borderColor = "#e2e8f0"}
                            />
                        </div>
                        <div style={ui.filterSelectWrapper}>
                            <FiFilter style={ui.filterIcon} />
                            <select 
                                style={ui.filterSelect}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">All Statuses</option>
                                <option value="CONFIRMED">Confirmed</option>
                                <option value="PENDING">Pending</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Table Card */}
                    <div style={ui.card}>
                        <div style={ui.tableWrapper}>
                            <table style={ui.table}>
                                <thead>
                                    <tr>
                                        <th style={ui.th}>ID</th>
                                        <th style={ui.th}>Patient</th>
                                        <th style={ui.th}>Doctor</th>
                                        <th style={ui.th}>Date & Time</th>
                                        <th style={ui.th}>Fee (LKR)</th>
                                        <th style={ui.th}>Status</th>
                                        <th style={{ ...ui.th, textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {isLoading ? (
                                            <tr><td colSpan="7" style={ui.emptyRow}>Loading...</td></tr>
                                        ) : filteredAppointments.length > 0 ? (
                                            filteredAppointments.map((apt) => (
                                                <motion.tr 
                                                    key={apt.appointment_id}
                                                    layout
                                                    style={ui.tr}
                                                    className="apt-row"
                                                >
                                                    <td style={ui.td}>
                                                        <span style={ui.idBadge}>#a{apt.appointment_id}</span>
                                                    </td>
                                                    <td style={ui.td}>
                                                        <div style={ui.patientInfo}>
                                                            <div style={ui.avatar}><FiUser /></div>
                                                            {apt.patient?.full_name || "Unknown"}
                                                        </div>
                                                    </td>
                                                    <td style={ui.td}>
                                                        {apt.doctor?.full_name || "N/A"}
                                                    </td>
                                                    <td style={ui.td}>
                                                        <div>
                                                            <div style={ui.dateText}>{formatDate(apt.appointment_date)}</div>
                                                            <div style={ui.timeText}>{apt.time_slot}</div>
                                                        </div>
                                                    </td>
                                                    <td style={{ ...ui.td, fontWeight: "600" }}>
                                                        {(Number(apt.doctor?.doctor_fee || 0) + Number(apt.doctor?.center_fee || 600)).toLocaleString()}
                                                    </td>
                                                    <td style={ui.td}>
                                                        {getStatusBadge(apt.status)}
                                                    </td>
                                                    <td style={ui.td}>
                                                        <div style={ui.actionWrapper} className="action-btns">
                                                            {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                                                                <>
                                                                    <button 
                                                                        onClick={() => {
                                                                            setSelectedAptForReschedule(apt);
                                                                            setIsBookingModalOpen(true);
                                                                        }}
                                                                        style={ui.rescheduleBtn}
                                                                    >
                                                                        Reschedule
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleCancelAppointment(apt)}
                                                                        style={ui.cancelBtn}
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" style={ui.emptyContainer}>
                                                    <div style={ui.emptyState}>
                                                        <FiCalendar size={48} color="#cbd5e1" />
                                                        <h3 style={ui.emptyTitle}>No appointments found</h3>
                                                        <p style={ui.emptyText}>Try adjusting your search or filters.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* Reschedule Modal */}
            <BookingModal 
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                appointment={selectedAptForReschedule}
                onUpdate={() => {
                    // Simple refresh
                    const token = localStorage.getItem('token');
                    axios.get(`${API_URL}/appointments`, { headers: { Authorization: `Bearer ${token}` } })
                        .then(res => setAppointments(res.data.data));
                }}
            />

            {/* Bulk Session Cancel Modal */}
            <AnimatePresence>
                {isSessionCancelOpen && (
                    <div style={ui.modalOverlay}>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            style={ui.modal}
                        >
                            <div style={ui.modalHeader}>
                                <h3 style={ui.modalTitle}>Cancel Doctor Session</h3>
                                <button onClick={() => setIsSessionCancelOpen(false)} style={ui.closeBtn}><FiX /></button>
                            </div>
                            <div style={ui.modalBody}>
                                <div style={ui.formGroup}>
                                    <label style={ui.label}>Doctor</label>
                                    <select 
                                        style={ui.select}
                                        value={sessionCancelData.doctorId}
                                        onChange={(e) => setSessionCancelData(prev => ({ ...prev, doctorId: e.target.value }))}
                                    >
                                        <option value="">Select Doctor</option>
                                        {doctors.map(d => <option key={d.doctor_id} value={d.doctor_id}>{d.full_name}</option>)}
                                    </select>
                                </div>
                                <div style={ui.formGroup}>
                                    <label style={ui.label}>Date</label>
                                    <input 
                                        type="date" 
                                        style={ui.input}
                                        value={sessionCancelData.date}
                                        onChange={(e) => setSessionCancelData(prev => ({ ...prev, date: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div style={ui.modalFooter}>
                                <button onClick={() => setIsSessionCancelOpen(false)} style={ui.btnCancel}>Discard</button>
                                <button onClick={handleCancelSession} style={ui.btnConfirmRed}>Cancel Session</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
            <ConfirmDialog 
                isOpen={isCancelDialogOpen}
                onClose={() => setIsCancelDialogOpen(false)}
                onConfirm={confirmCancelAppointment}
                title="Cancel Appointment"
                message={`Are you sure you want to cancel the appointment for ${aptToCancel?.patient?.full_name}? This action will notify the patient.`}
                confirmLabel="Yes, Cancel"
                cancelLabel="Keep Appointment"
                type="danger"
            />

            <style>
                {`
                    .apt-row .action-btns {
                        transition: opacity 0.2s;
                    }
                    .apt-row:hover {
                        background-color: #f8fafc;
                    }
                `}
            </style>
        </div>
    );
}

const ui = {
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
    headerRight: {
        display: "flex",
        gap: "12px"
    },
    btnPrimary: {
        background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
        color: "white",
        border: "none",
        borderRadius: "14px",
        padding: "14px 28px",
        fontSize: "15px",
        fontWeight: "700",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
        display: "flex",
        alignItems: "center"
    },
    btnOutline: {
        padding: "10px 20px",
        borderRadius: "12px",
        backgroundColor: "white",
        color: "#dc2626",
        border: "1px solid #fecaca",
        fontWeight: "600",
        fontSize: "14px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center"
    },
    filterBar: {
        backgroundColor: "#eff6ff",
        borderRadius: "28px 28px 0 0",
        border: "2px solid #3b82f6",
        borderBottom: "none",
        padding: "24px 32px",
        display: "flex",
        gap: "24px",
        alignItems: "center",
        boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.05)"
    },
    searchWrapper: {
        position: "relative",
        width: "384px",
        borderRadius: "14px",
        border: "2px solid #e2e8f0",
        backgroundColor: "white",
        transition: "all 0.2s",
        overflow: "hidden"
    },
    searchIcon: {
        position: "absolute",
        left: "14px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#94a3b8",
        zIndex: 1
    },
    searchInput: {
        width: "100%",
        padding: "12px 14px 12px 42px",
        border: "none",
        backgroundColor: "transparent",
        fontSize: "14px",
        outline: "none",
        color: "#1e293b"
    },
    filterSelectWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "8px"
    },
    filterIcon: {
        color: "#64748b"
    },
    filterSelect: {
        border: "none",
        backgroundColor: "transparent",
        fontSize: "14px",
        fontWeight: "500",
        color: "#475569",
        cursor: "pointer",
        outline: "none"
    },
    card: {
        backgroundColor: "white",
        borderRadius: "0 0 28px 28px",
        border: "2px solid #3b82f6",
        borderTop: "none",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)"
    },
    tableWrapper: {
        overflowX: "auto"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse"
    },
    th: {
        textAlign: "left",
        padding: "16px 24px",
        fontSize: "13px",
        fontWeight: "600",
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        backgroundColor: "#f8fafc/50"
    },
    tr: {
        borderBottom: "1px solid #f1f5f9"
    },
    td: {
        padding: "18px 24px",
        fontSize: "14px",
        color: "#334155"
    },
    idBadge: {
        fontWeight: "500",
        color: "#2563eb",
        backgroundColor: "#eff6ff",
        padding: "4px 8px",
        borderRadius: "6px",
        fontSize: "13px"
    },
    patientInfo: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontWeight: "500"
    },
    avatar: {
        width: "32px",
        height: "32px",
        borderRadius: "8px",
        backgroundColor: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#94a3b8"
    },
    dateText: {
        fontWeight: "500",
        color: "#1e293b"
    },
    timeText: {
        fontSize: "12px",
        color: "#64748b",
        marginTop: "2px"
    },
    actionWrapper: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px"
    },
    rescheduleBtn: {
        padding: "6px 12px",
        fontSize: "12px",
        fontWeight: "600",
        color: "#2563eb",
        backgroundColor: "#eff6ff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer"
    },
    cancelBtn: {
        padding: "6px 12px",
        fontSize: "12px",
        fontWeight: "600",
        color: "#dc2626",
        backgroundColor: "#fef2f2",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer"
    },
    emptyContainer: {
        padding: "80px 24px"
    },
    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center"
    },
    emptyTitle: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#1e293b",
        margin: "16px 0 8px 0"
    },
    emptyText: {
        fontSize: "14px",
        color: "#64748b",
        margin: 0
    },
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100
    },
    modal: {
        backgroundColor: "white",
        borderRadius: "20px",
        width: "400px",
        padding: "0",
        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)"
    },
    modalHeader: {
        padding: "20px 24px",
        borderBottom: "1px solid #f1f5f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    modalTitle: {
        fontSize: "18px",
        fontWeight: "700",
        margin: 0
    },
    modalBody: {
        padding: "24px"
    },
    formGroup: {
        marginBottom: "20px"
    },
    label: {
        display: "block",
        fontSize: "14px",
        fontWeight: "600",
        marginBottom: "8px"
    },
    select: {
        width: "100%",
        padding: "10px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0"
    },
    input: {
        width: "100%",
        padding: "10px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0"
    },
    modalFooter: {
        padding: "16px 24px",
        borderTop: "1px solid #f1f5f9",
        display: "flex",
        justifyContent: "flex-end",
        gap: "12px"
    },
    btnCancel: {
        padding: "8px 16px",
        border: "none",
        backgroundColor: "transparent",
        color: "#64748b",
        fontWeight: "600"
    },
    btnConfirmRed: {
        padding: "8px 20px",
        borderRadius: "10px",
        backgroundColor: "#dc2626",
        color: "white",
        border: "none",
        fontWeight: "600"
    },
    closeBtn: {
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        color: "#94a3b8"
    }
};

export default AppointmentsManagement;
