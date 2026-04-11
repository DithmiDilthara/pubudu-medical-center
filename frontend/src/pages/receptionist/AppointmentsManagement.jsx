import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
    FiSearch, FiPlus, FiCalendar, 
    FiFilter, FiUser, FiAlertTriangle, FiPhone, FiMail, FiX, FiArrowLeft
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
    const [isLoading, setIsLoading] = useState(true);
    const [receptionistName, setReceptionistName] = useState('Receptionist');
    
    // Filters & Search
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [dateFilter, setDateFilter] = useState("");
    const [viewMode, setViewMode] = useState("ALL"); // "ALL" or "REFUNDS"
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    
    // Modals
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedAptForReschedule, setSelectedAptForReschedule] = useState(null);
    
    // Patient Contact Popup
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isPatientPopupOpen, setIsPatientPopupOpen] = useState(false);
    
    // Cancellation Confirmation
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [aptToCancel, setAptToCancel] = useState(null);
    const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
    const [aptToRefund, setAptToRefund] = useState(null);
    const [isDismissDialogOpen, setIsDismissDialogOpen] = useState(false);
    const [aptToDismiss, setAptToDismiss] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        const token = localStorage.getItem('token');
        const fetchData = async () => {
            try {
                const [profileRes, aptRes] = await Promise.all([
                    axios.get(`${API_URL}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/appointments`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                if (profileRes.data.success) setReceptionistName(profileRes.data.data.profile.full_name);
                if (aptRes.data.success) setAppointments(aptRes.data.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const checkRefundEligibility = (apt) => {
        if (apt.payment_status !== 'PAID' || apt.status !== 'CANCELLED' || !apt.cancelled_at || !apt.availability) {
            return false;
        }
        
        const sessionEndDateStr = `${apt.appointment_date} ${apt.availability.end_time}`;
        const sessionEndTime = new Date(sessionEndDateStr);
        const cancelledAt = new Date(apt.cancelled_at);
        
        return cancelledAt <= sessionEndTime;
    };

    const refundableAppointments = useMemo(() => {
        return appointments.filter(apt => checkRefundEligibility(apt));
    }, [appointments]);

    const filteredAppointments = useMemo(() => {
        const sourceList = viewMode === "REFUNDS" ? refundableAppointments : appointments;
        
        return sourceList.filter(apt => {
            const matchesSearch = 
                (apt.patient?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (apt.doctor?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (apt.appointment_id || "").toString().includes(searchQuery);
            
            const matchesStatus = viewMode === "REFUNDS" ? true : (statusFilter === "ALL" || apt.status === statusFilter);
            const matchesDate = !dateFilter || apt.appointment_date === dateFilter;
            
            return matchesSearch && matchesStatus && matchesDate;
        }).sort((a, b) => b.appointment_id - a.appointment_id);
    }, [appointments, refundableAppointments, searchQuery, statusFilter, dateFilter, viewMode]);

    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, dateFilter]);

    // Paginated appointments
    const paginatedAppointments = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAppointments.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAppointments, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

    const handleCancelAppointment = (apt) => {
        setAptToCancel(apt);
        setIsCancelDialogOpen(true);
    };

    const handleProcessRefund = (apt) => {
        setAptToRefund(apt);
        setIsRefundDialogOpen(true);
    };

    const confirmRefund = async () => {
        if (!aptToRefund) return;
        
        const apt = aptToRefund;
        const toastId = toast.loading("Processing refund...");
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/appointments/${apt.appointment_id}/refund`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                toast.success(res.data.message, { id: toastId });
                // Refresh list
                const aptRes = await axios.get(`${API_URL}/appointments`, { headers: { Authorization: `Bearer ${token}` } });
                if (aptRes.data.success) setAppointments(aptRes.data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Refund failed", { id: toastId });
        } finally {
            setIsRefundDialogOpen(false);
            setAptToRefund(null);
        }
    };

    const handleDismissRefund = (apt) => {
        setAptToDismiss(apt);
        setIsDismissDialogOpen(true);
    };

    const confirmDismissRefund = async () => {
        if (!aptToDismiss) return;
        
        const apt = aptToDismiss;
        const toastId = toast.loading("Dismissing refund...");
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/appointments/${apt.appointment_id}/dismiss-refund`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                toast.success(res.data.message, { id: toastId });
                // Refresh list
                const aptRes = await axios.get(`${API_URL}/appointments`, { headers: { Authorization: `Bearer ${token}` } });
                if (aptRes.data.success) setAppointments(aptRes.data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Dismissal failed", { id: toastId });
        } finally {
            setIsDismissDialogOpen(false);
            setAptToDismiss(null);
        }
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



    const getStatusBadge = (apt) => {
        const status = apt.status;
        const paymentStatus = apt.payment_status;

        let statusElement = null;
        if (status === 'RESCHEDULE_REQUIRED') {
            statusElement = (
                <span className="reschedule-badge" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    backgroundColor: '#fff7ed',
                    color: '#ea580c',
                    border: '1px solid #fed7aa',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: '700'
                }}>
                    <FiAlertTriangle size={11} />
                    Needs Reschedule
                </span>
            );
        } else {
            const styleMap = {
                CONFIRMED: { bg: "#e0f2fe", text: "#0369a1" },
                PENDING: { bg: "#fef3c7", text: "#92400e" },
                COMPLETED: { bg: "#dcfce7", text: "#166534" },
                CANCELLED: { bg: "#fee2e2", text: "#991b1b" },
                NO_SHOW: { bg: "#f1f5f9", text: "#475569" }
            };
            const config = styleMap[status] || styleMap.PENDING;
            statusElement = (
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
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                {statusElement}
                {(paymentStatus === 'PARTIAL' || paymentStatus === 'UNPAID') && status !== 'CANCELLED' && status !== 'COMPLETED' && status !== 'NO_SHOW' && (
                    <span style={{
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        Balance Due
                    </span>
                )}
            </div>
        );
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
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
        <div style={ui.container}>
            <ReceptionistSidebar />
            <motion.div 
                className="main-wrapper"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <ReceptionistHeader receptionistName={receptionistName} />
                
                <main className="content-padding">
                    {/* Page Header */}
                    <motion.header variants={itemVariants} style={ui.headerSection}>
                        <div style={ui.headerTitleSection}>
                            <h1 style={ui.welcomeTitle}>
                                {viewMode === 'REFUNDS' ? 'Refund Processing Queue' : 'Appointment Management'}
                            </h1>
                            <p style={ui.welcomeSubtitle}>
                                {viewMode === 'REFUNDS' 
                                    ? `Review and process ${refundableAppointments.length} pending refund requests.` 
                                    : 'Manage all patient bookings and schedules efficiently.'}
                            </p>
                        </div>
                        <div style={ui.headerRight}>
                            <motion.button 
                                whileHover={{ y: -4 }}
                                onClick={() => setViewMode(viewMode === 'REFUNDS' ? 'ALL' : 'REFUNDS')}
                                style={{
                                    ...ui.btnHeaderSecondary,
                                    backgroundColor: viewMode === 'REFUNDS' ? '#f1f5f9' : '#fff7ed',
                                    color: viewMode === 'REFUNDS' ? '#64748b' : '#f97316',
                                    border: `1px solid ${viewMode === 'REFUNDS' ? '#e2e8f0' : '#fed7aa'}`,
                                    position: 'relative'
                                }}
                            >
                                {viewMode === 'REFUNDS' ? <FiArrowLeft style={{marginRight: '8px'}} /> : <FiAlertTriangle style={{marginRight: '8px'}} />}
                                {viewMode === 'REFUNDS' ? 'Back to All Appts' : 'Refund Requests'}
                                
                                {viewMode !== 'REFUNDS' && refundableAppointments.length > 0 && (
                                    <span style={ui.badgeCount}>{refundableAppointments.length}</span>
                                )}
                            </motion.button>

                            <motion.button 
                                whileHover={{ y: -4 }}
                                onClick={() => navigate("/receptionist/appointments/new")}
                                style={ui.btnPrimary}
                            >
                                <FiPlus style={{marginRight: '8px'}} />
                                New Booking
                            </motion.button>
                        </div>
                    </motion.header>

                    {/* Filter Bar */}
                    <motion.div variants={itemVariants} style={ui.filterBar}>
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
                        {viewMode !== 'REFUNDS' && (
                            <div style={ui.filterSelectWrapper}>
                                <FiFilter style={ui.filterIcon} />
                                <select 
                                    style={ui.filterSelect}
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="RESCHEDULE_REQUIRED">⚠️ Needs Reschedule</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                    <option value="NO_SHOW">No Show / Absent</option>
                                </select>
                            </div>
                        )}

                        {/* Date Filter */}
                        <div style={ui.dateFilterWrapper}>
                            <FiCalendar style={ui.filterIcon} />
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                style={ui.dateInput}
                                title="Filter by specific date"
                                onFocus={(e) => e.target.parentElement.style.borderColor = "#2563eb"}
                                onBlur={(e) => e.target.parentElement.style.borderColor = "#e2e8f0"}
                            />
                            {dateFilter && (
                                <button
                                    onClick={() => setDateFilter("")}
                                    style={ui.clearDateBtn}
                                    title="Clear date filter"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </motion.div>

                    {/* Table Card */}
                    <motion.div variants={itemVariants} style={ui.card}>
                        <div style={ui.tableWrapper}>
                            <table style={ui.table}>
                                <thead>
                                    <tr style={ui.tableHeaderRow}>
                                        <th style={ui.th}>ID</th>
                                        <th style={ui.th}>Patient</th>
                                        <th style={ui.th}>Doctor</th>
                                        <th style={ui.th}>
                                            {viewMode === 'REFUNDS' ? 'Cancellation' : 'Date & Time'}
                                        </th>
                                        <th style={ui.th}>{viewMode === 'REFUNDS' ? 'Refundable' : 'Fee (LKR)'}</th>
                                        <th style={ui.th}>Status</th>
                                        <th style={{ ...ui.th, textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {isLoading ? (
                                            <tr><td colSpan="7" style={ui.emptyRow}>Loading...</td></tr>
                                        ) : paginatedAppointments.length > 0 ? (
                                            paginatedAppointments.map((apt) => (
                                                <motion.tr 
                                                    key={apt.appointment_id}
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    style={ui.tr}
                                                    className="apt-row"
                                                >
                                                    <td style={ui.td}>
                                                        <span style={ui.idBadge}>#a{apt.appointment_id}</span>
                                                    </td>
                                                    <td style={ui.td}>
                                                        <div style={ui.patientInfo}>
                                                            <div style={ui.avatar}><FiUser /></div>
                                                            <span
                                                                onClick={apt.status === 'RESCHEDULE_REQUIRED' ? () => { setSelectedPatient(apt); setIsPatientPopupOpen(true); } : undefined}
                                                                style={{
                                                                    cursor: apt.status === 'RESCHEDULE_REQUIRED' ? 'pointer' : 'default',
                                                                    color: apt.status === 'RESCHEDULE_REQUIRED' ? '#2563eb' : 'inherit',
                                                                    textDecoration: apt.status === 'RESCHEDULE_REQUIRED' ? 'underline' : 'none',
                                                                    fontWeight: '600'
                                                                }}
                                                            >
                                                                {apt.patient?.full_name || "Unknown"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={ui.td}>
                                                        {apt.doctor?.full_name || "N/A"}
                                                    </td>
                                                    <td style={ui.td}>
                                                        {viewMode === 'REFUNDS' ? (
                                                            <div>
                                                                <div style={ui.dateText}>{formatDate(apt.cancelled_at)}</div>
                                                                <div style={ui.timeText}>{new Date(apt.cancelled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <div style={ui.dateText}>{formatDate(apt.appointment_date)}</div>
                                                                <div style={ui.timeText}>{apt.time_slot}</div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ ...ui.td, fontWeight: "600", color: viewMode === 'REFUNDS' ? '#16a34a' : 'inherit' }}>
                                                        {viewMode === 'REFUNDS' 
                                                            ? Number(apt.doctor?.doctor_fee || 0).toLocaleString()
                                                            : (Number(apt.doctor?.doctor_fee || 0) + Number(apt.doctor?.center_fee || 600)).toLocaleString()
                                                        }
                                                    </td>
                                                    <td style={ui.td}>
                                                        {getStatusBadge(apt)}
                                                    </td>
                                                    <td style={ui.td}>
                                                        <div style={ui.actionWrapper} className="action-btns">
                                                            {viewMode === 'REFUNDS' ? (
                                                                <>
                                                                    <motion.button 
                                                                        whileHover={{ y: -2 }}
                                                                        onClick={() => handleProcessRefund(apt)}
                                                                        style={ui.refundBtn}
                                                                    >
                                                                        Process Refund
                                                                    </motion.button>
                                                                    <motion.button 
                                                                        whileHover={{ y: -2 }}
                                                                        onClick={() => handleDismissRefund(apt)}
                                                                        style={ui.dismissBtn}
                                                                    >
                                                                        Dismiss
                                                                    </motion.button>
                                                                </>
                                                            ) : (
                                                                apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && apt.status !== 'NO_SHOW' && (
                                                                    <>
                                                                        <motion.button 
                                                                            whileHover={{ y: -2 }}
                                                                            onClick={() => {
                                                                                setSelectedAptForReschedule(apt);
                                                                                setIsBookingModalOpen(true);
                                                                            }}
                                                                            style={ui.rescheduleBtn}
                                                                        >
                                                                            Reschedule
                                                                        </motion.button>
                                                                        <motion.button 
                                                                            whileHover={{ y: -2 }}
                                                                            onClick={() => handleCancelAppointment(apt)}
                                                                            style={ui.cancelBtn}
                                                                        >
                                                                            Cancel
                                                                        </motion.button>
                                                                    </>
                                                                )
                                                            )}
                                                            {apt.payment_status === 'REFUNDED' && (
                                                                <span style={ui.refundedLabel}>Refunded</span>
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
                        
                        {/* Pagination Footer */}
                        {!isLoading && filteredAppointments.length > 0 && (
                            <div style={ui.paginationFooter}>
                                <div style={ui.paginationInfo}>
                                    Showing <span style={{fontWeight: '700'}}>{Math.min(filteredAppointments.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span style={{fontWeight: '700'}}>{Math.min(filteredAppointments.length, currentPage * itemsPerPage)}</span> of <span style={{fontWeight: '700'}}>{filteredAppointments.length}</span> appointments
                                </div>
                                <div style={ui.paginationControls}>
                                    <button 
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        style={{...ui.pageBtn, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'}}
                                    >
                                        Previous
                                    </button>
                                    
                                    <div style={ui.pageNumbers}>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button 
                                                key={i + 1}
                                                onClick={() => setCurrentPage(i + 1)}
                                                style={{
                                                    ...ui.pageNumber,
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
                                        style={{...ui.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'}}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </main>
            </motion.div>

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

            <ConfirmDialog 
                isOpen={isRefundDialogOpen}
                onClose={() => setIsRefundDialogOpen(false)}
                onConfirm={confirmRefund}
                title="Confirm Policy-Driven Refund"
                message={`Process refund for ${aptToRefund?.patient?.full_name}? \n\nLKR ${Number(aptToRefund?.doctor?.doctor_fee || 0).toLocaleString()} (Doctor Fee) will be refunded. \n\nLKR ${Number(aptToRefund?.doctor?.center_fee || 600).toLocaleString()} (Hospital Fee) is non-refundable.`}
                confirmLabel="Confirm Refund"
                cancelLabel="Cancel"
                type="warning"
            />

            <ConfirmDialog 
                isOpen={isDismissDialogOpen}
                onClose={() => setIsDismissDialogOpen(false)}
                onConfirm={confirmDismissRefund}
                title="Dismiss Refund Request"
                message={`Are you sure you want to dismiss the refund for ${aptToDismiss?.patient?.full_name}? \n\nThis will permanently remove the request from the queue and the Center will keep the Doctor Fee.`}
                confirmLabel="Yes, Dismiss"
                cancelLabel="No, Keep Request"
                type="danger"
            />

            {/* Patient Contact Popup — RESCHEDULE_REQUIRED only */}
            <AnimatePresence>
                {isPatientPopupOpen && selectedPatient && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.4)',
                        backdropFilter: 'blur(6px)',
                        zIndex: 2000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '20px'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '24px',
                                width: '100%',
                                maxWidth: '440px',
                                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
                                overflow: 'hidden',
                                border: '1px solid #f1f5f9'
                            }}
                        >
                            {/* Header */}
                            <div style={{
                                padding: '24px 28px',
                                borderBottom: '1px solid #f1f5f9',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'linear-gradient(to right, #fff7ed, #ffedd5)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '14px',
                                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontSize: '18px', fontWeight: '800'
                                    }}>
                                        {selectedPatient.patient?.full_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                                            {selectedPatient.patient?.full_name}
                                        </h3>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            backgroundColor: '#fff7ed', color: '#ea580c',
                                            border: '1px solid #fed7aa', padding: '2px 8px',
                                            borderRadius: '9999px', fontSize: '11px', fontWeight: '700', marginTop: '4px'
                                        }}>
                                            <FiAlertTriangle size={10} /> Needs Reschedule
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setIsPatientPopupOpen(false); setSelectedPatient(null); }}
                                    style={{
                                        width: '36px', height: '36px', borderRadius: '10px',
                                        border: 'none', backgroundColor: '#f1f5f9',
                                        color: '#64748b', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <FiX size={16} />
                                </button>
                            </div>

                            {/* Body */}
                            <div style={{ padding: '24px 28px' }}>
                                <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px 0' }}>Contact Information</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                                        <FiPhone style={{ color: '#f97316', fontSize: '16px', flexShrink: 0 }} />
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                            {selectedPatient.patient?.user?.contact_number || 'Not available'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                                        <FiMail style={{ color: '#f97316', fontSize: '16px', flexShrink: 0 }} />
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                            {selectedPatient.patient?.user?.email || 'Not available'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                                        <FiUser style={{ color: '#f97316', fontSize: '16px', flexShrink: 0 }} />
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                            NIC: {selectedPatient.patient?.nic || 'Not available'}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '0 0 16px 0' }} />

                                <p style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px 0' }}>Original Appointment</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span style={{ color: '#64748b', fontWeight: '500' }}>Doctor</span>
                                        <span style={{ color: '#1e293b', fontWeight: '700' }}>{selectedPatient.doctor?.full_name}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span style={{ color: '#64748b', fontWeight: '500' }}>Date</span>
                                        <span style={{ color: '#1e293b', fontWeight: '700' }}>{formatDate(selectedPatient.appointment_date)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                        <span style={{ color: '#64748b', fontWeight: '500' }}>Time</span>
                                        <span style={{ color: '#1e293b', fontWeight: '700' }}>{selectedPatient.time_slot}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{
                                padding: '16px 28px',
                                backgroundColor: '#f8fafc',
                                borderTop: '1px solid #f1f5f9',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px'
                            }}>
                                <button
                                    onClick={() => { setIsPatientPopupOpen(false); setSelectedPatient(null); }}
                                    style={{
                                        padding: '10px 20px', borderRadius: '10px',
                                        border: '1px solid #e2e8f0', backgroundColor: 'white',
                                        color: '#64748b', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
                                    }}
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setIsPatientPopupOpen(false);
                                        setSelectedAptForReschedule(selectedPatient);
                                        setIsBookingModalOpen(true);
                                        setSelectedPatient(null);
                                    }}
                                    style={{
                                        padding: '10px 20px', borderRadius: '10px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                        color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)'
                                    }}
                                >
                                    Reschedule →
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>
                {`
                    .apt-row .action-btns {
                        transition: opacity 0.2s;
                    }
                    .apt-row:hover {
                        background-color: rgba(239, 246, 255, 0.5) !important;
                    }
                    @keyframes reschedule-badge-glow {
                        0%   { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.5); }
                        50%  { box-shadow: 0 0 0 6px rgba(249, 115, 22, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
                    }
                    .reschedule-badge {
                        animation: reschedule-badge-glow 2s ease-in-out infinite;
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
        gap: "12px",
        alignItems: "center"
    },
    btnHeaderSecondary: {
        padding: "12px 20px",
        borderRadius: "14px",
        fontSize: "14px",
        fontWeight: "700",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        transition: "all 0.2s"
    },
    badgeCount: {
        position: "absolute",
        top: "-8px",
        right: "-8px",
        backgroundColor: "#ef4444",
        color: "white",
        fontSize: "11px",
        fontWeight: "700",
        minWidth: "20px",
        height: "20px",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 4px",
        border: "2px solid white",
        boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)"
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
    dateFilterWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: "white",
        padding: "6px 12px",
        borderRadius: "12px",
        border: "2px solid #e2e8f0",
        transition: "all 0.2s"
    },
    dateInput: {
        border: "none",
        outline: "none",
        fontSize: "13px",
        fontWeight: "600",
        color: "#475569",
        backgroundColor: "transparent",
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif"
    },
    clearDateBtn: {
        background: "none",
        border: "none",
        color: "#94a3b8",
        fontSize: "14px",
        cursor: "pointer",
        padding: "0 4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color 0.2s"
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
    tableHeaderRow: {
        background: "linear-gradient(to right, #2563eb, #4f46e5)",
    },
    th: {
        textAlign: "left",
        padding: "16px 24px",
        fontSize: "13px",
        fontWeight: "600",
        color: "white",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
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
    refundBtn: {
        padding: "6px 14px",
        fontSize: "12px",
        fontWeight: "700",
        color: "#16a34a",
        backgroundColor: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "8px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center"
    },
    refundedLabel: {
        padding: "4px 10px",
        backgroundColor: "#f8fafc",
        color: "#64748b",
        borderRadius: "9999px",
        fontSize: "11px",
        fontWeight: "700",
        border: "1px dashed #cbd5e1"
    },
    dismissBtn: {
        padding: "6px 14px",
        fontSize: "12px",
        fontWeight: "600",
        color: "#64748b",
        backgroundColor: "#f1f5f9",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center"
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
    },
    paginationFooter: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 32px",
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
        color: "#4f46e5",
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

export default AppointmentsManagement;
