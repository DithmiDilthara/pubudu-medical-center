import { useState, useEffect } from "react";
import axios from "axios";
import { FiX, FiCalendar, FiClock, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import ConfirmDialog from "./ConfirmDialog";

const BookingModal = ({ isOpen, onClose, appointment, onUpdate }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState("");
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [doctorAvailability, setDoctorAvailability] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        if (isOpen && appointment?.doctor_id) {
            fetchAvailability();
            if (appointment.appointment_date) {
                const date = new Date(appointment.appointment_date + 'T00:00:00');
                setSelectedDate(date);
                setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
            }
            setSelectedTime(appointment.time_slot || "");
        }
    }, [isOpen, appointment]);

    useEffect(() => {
        if (selectedDate && appointment?.doctor_id) {
            fetchBookedSlots();
        }
    }, [selectedDate]);

    const fetchAvailability = async () => {
        try {
            const response = await axios.get(`${API_URL}/doctors/${appointment.doctor_id}/availability`);
            if (response.data.success) {
                setDoctorAvailability(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching availability:", error);
        }
    };

    const fetchBookedSlots = async () => {
        try {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/appointments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                const relevant = response.data.data.filter(apt =>
                    apt.doctor_id === appointment.doctor_id &&
                    apt.appointment_date === formattedDate &&
                    ['PENDING', 'CONFIRMED'].includes(apt.status) &&
                    apt.appointment_id !== appointment.appointment_id
                );
                setBookedSlots(relevant.map(apt => apt.time_slot));
            }
        } catch (error) {
            console.error("Error fetching booked slots:", error);
        }
    };

    const [showConfirm, setShowConfirm] = useState(false);

    const handleReschedule = async () => {
        if (!selectedDate || !selectedTime) {
            toast.error("Please select a date and time");
            return;
        }
        setShowConfirm(true);
    };

    const confirmReschedule = async () => {
        setIsProcessing(true);
        const toastId = toast.loading("Rescheduling appointment...");
        try {
            const token = localStorage.getItem('token');
            const formattedDate = selectedDate.toISOString().split('T')[0];
            
            const response = await axios.put(`${API_URL}/appointments/${appointment.appointment_id}/reschedule`, {
                appointment_date: formattedDate,
                time_slot: selectedTime
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success("Appointment rescheduled successfully!", { id: toastId });
                onUpdate();
                setShowConfirm(false);
                onClose();
            }
        } catch (error) {
            console.error("Reschedule error:", error);
            toast.error(error.response?.data?.message || "Failed to reschedule", { id: toastId });
        } finally {
            setIsProcessing(false);
        }
    };

    // Calendar logic
    const daysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const days = new Date(year, month + 1, 0).getDate();
        return { firstDay, days };
    };

    const isDateAvailable = (dayDate) => {
        const formattedDate = dayDate.toISOString().split('T')[0];
        const dayName = dayDate.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();

        const specific = doctorAvailability.find(a => a.specific_date === formattedDate);
        if (specific) return specific.session_name !== 'Unavailable';

        return doctorAvailability.some(a => 
            a.day_of_week?.toUpperCase() === dayName && 
            !a.specific_date && 
            (!a.end_date || formattedDate <= a.end_date)
        );
    };

    const getTimeSlots = () => {
        if (!selectedDate) return [];
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const dayName = selectedDate.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();

        let avails = doctorAvailability.filter(a => a.specific_date === formattedDate);
        if (avails.length === 0) {
            avails = doctorAvailability.filter(a => a.day_of_week?.toUpperCase() === dayName && !a.specific_date);
        }

        const slots = [];
        avails.forEach(avail => {
            if (avail.start_time && avail.end_time) {
                // Return the full session range as a single slot
                const start = new Date(`2000-01-01 ${avail.start_time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                const end = new Date(`2000-01-01 ${avail.end_time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                slots.push(`${start} - ${end}`);
            }
        });
        return slots;
    };

    if (!isOpen) return null;

    const { firstDay, days } = daysInMonth(currentMonth);

    return (
        <div style={styles.overlay}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                style={styles.modal}
            >
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>Reschedule Appointment</h2>
                        <p style={styles.subtitle}>Patient: {appointment?.patient?.full_name}</p>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}><FiX size={20} /></button>
                </div>

                <div style={styles.body}>
                    <div style={styles.calendarSection}>
                        <div style={styles.calHeader}>
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} style={styles.navBtn}><FiChevronLeft /></button>
                            <span style={styles.monthLabel}>{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} style={styles.navBtn}><FiChevronRight /></button>
                        </div>
                        <div style={styles.grid}>
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} style={styles.dayHead}>{d}</div>)}
                            {[...Array(firstDay)].map((_, i) => <div key={`e-${i}`} />)}
                            {[...Array(days)].map((_, i) => {
                                const d = i + 1;
                                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
                                const isAvailable = isDateAvailable(date);
                                const isSelected = selectedDate?.getDate() === d && selectedDate?.getMonth() === currentMonth.getMonth();
                                const isPast = date < new Date().setHours(0,0,0,0);

                                return (
                                    <button 
                                        key={d}
                                        disabled={!isAvailable || isPast}
                                        onClick={() => setSelectedDate(date)}
                                        style={{
                                            ...styles.dayBtn,
                                            ...(isSelected ? styles.daySelected : {}),
                                            ...(!isAvailable || isPast ? styles.dayDisabled : {})
                                        }}
                                    >
                                        {d}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div style={styles.timeSection}>
                        <h3 style={styles.sectionTitle}><FiClock style={{marginRight: '8px'}} /> Select Time</h3>
                        <div style={styles.timeGrid}>
                            {getTimeSlots().map(time => {
                                return (
                                    <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        style={{
                                            ...styles.timeBtn,
                                            ...(selectedTime === time ? styles.timeSelected : {}),
                                            gridColumn: 'span 2' // Make it wider for range text
                                        }}
                                    >
                                        {time}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div style={styles.footer}>
                    <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
                    <button 
                        onClick={handleReschedule} 
                        disabled={isProcessing || !selectedDate || !selectedTime}
                        style={styles.confirmBtn}
                    >
                        {isProcessing ? "Processing..." : "Confirm Reschedule"}
                    </button>
                </div>
            </motion.div>
            
            <ConfirmDialog 
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={confirmReschedule}
                title="Confirm Reschedule"
                message={`Are you sure you want to reschedule ${appointment?.patient?.full_name}'s appointment to ${selectedDate?.toLocaleDateString()} at ${selectedTime}?`}
                confirmLabel="Confirm Reschedule"
                cancelLabel="Go Back"
                type="warning"
            />
        </div>
    );
};

const styles = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px"
    },
    modal: {
        backgroundColor: "white",
        borderRadius: "28px",
        width: "100%",
        maxWidth: "850px",
        boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.15)",
        overflow: "hidden",
        border: "1px solid #e2e8f0"
    },
    header: {
        padding: "32px 40px",
        borderBottom: "1px solid #f1f5f9",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "linear-gradient(to right, #ffffff, #f8fafc)"
    },
    title: {
        fontSize: "22px",
        fontWeight: "800",
        color: "#0f172a",
        margin: 0,
        letterSpacing: "-0.02em"
    },
    subtitle: {
        fontSize: "14px",
        color: "#64748b",
        margin: "4px 0 0 0",
        fontWeight: "500"
    },
    closeBtn: {
        width: "40px",
        height: "40px",
        borderRadius: "12px",
        border: "none",
        backgroundColor: "#f1f5f9",
        color: "#64748b",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s"
    },
    body: {
        padding: "40px",
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr",
        gap: "48px"
    },
    calHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        backgroundColor: "#0f172a",
        padding: "16px",
        borderRadius: "16px"
    },
    monthLabel: {
        fontSize: "16px",
        fontWeight: "700",
        color: "white"
    },
    navBtn: {
        width: "32px",
        height: "32px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "rgba(255,255,255,0.1)",
        color: "white",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "8px"
    },
    dayHead: {
        textAlign: "center",
        fontSize: "12px",
        fontWeight: "800",
        color: "#94a3b8",
        padding: "8px 0",
        textTransform: "uppercase"
    },
    dayBtn: {
        aspectRatio: "1",
        border: "none",
        borderRadius: "10px",
        backgroundColor: "white",
        fontSize: "14px",
        fontWeight: "600",
        color: "#475569",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    daySelected: {
        backgroundColor: "#2563eb",
        color: "white",
        fontWeight: "700",
        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)"
    },
    dayDisabled: {
        color: "#e2e8f0",
        cursor: "not-allowed",
        backgroundColor: "transparent"
    },
    sectionTitle: {
        fontSize: "16px",
        fontWeight: "700",
        color: "#0f172a",
        margin: "0 0 20px 0",
        display: "flex",
        alignItems: "center"
    },
    timeGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "12px"
    },
    timeBtn: {
        padding: "12px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        backgroundColor: "white",
        fontSize: "13px",
        fontWeight: "600",
        color: "#475569",
        cursor: "pointer",
        transition: "all 0.2s"
    },
    timeSelected: {
        borderColor: "#2563eb",
        backgroundColor: "#2563eb",
        color: "white",
        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)"
    },
    timeBooked: {
        backgroundColor: "#f8fafc",
        color: "#cbd5e1",
        cursor: "not-allowed",
        borderStyle: "dashed",
        borderColor: "#e2e8f0"
    },
    footer: {
        padding: "24px 40px",
        backgroundColor: "#f8fafc",
        borderTop: "1px solid #f1f5f9",
        display: "flex",
        justifyContent: "flex-end",
        gap: "16px"
    },
    cancelBtn: {
        padding: "12px 24px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        backgroundColor: "white",
        color: "#64748b",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s"
    },
    confirmBtn: {
        padding: "12px 32px",
        borderRadius: "12px",
        border: "none",
        backgroundColor: "#2563eb",
        color: "white",
        fontSize: "14px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: "0 8px 16px -4px rgba(37, 99, 235, 0.25)",
        transition: "all 0.3s"
    }
};

export default BookingModal;
