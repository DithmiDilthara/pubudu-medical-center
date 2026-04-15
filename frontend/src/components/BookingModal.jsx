import { useState, useEffect } from "react";
import axios from "axios";
import { FiX, FiCalendar, FiClock, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import ConfirmDialog from "./ConfirmDialog";

const BookingModal = ({ isOpen, onClose, appointment, onUpdate }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const [selectedTime, setSelectedTime] = useState("");
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [doctorAvailability, setDoctorAvailability] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Cross-Doctor additions
    const [isChangingDoctor, setIsChangingDoctor] = useState(false);
    const [altDoctors, setAltDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [transferAction, setTransferAction] = useState("PAY_LATER");
    const [paymentMethod, setPaymentMethod] = useState("CASH");

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        if (isOpen && appointment?.doctor) {
            setSelectedDoctor(appointment.doctor);
            setIsChangingDoctor(false);
            if (appointment.appointment_date) {
                const date = new Date(appointment.appointment_date + 'T00:00:00');
                setSelectedDate(date);
                setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
            }
            setSelectedTime(appointment.time_slot || "");
            if (appointment.schedule_id) {
                setSelectedSession({ id: appointment.schedule_id, timeRange: appointment.time_slot });
            }
        }
    }, [isOpen, appointment]);

    useEffect(() => {
        if (isChangingDoctor && appointment?.doctor?.specialization) {
            // When switching to transfer mode, clear the selected doctor so availability resets
            setSelectedDoctor(null);
            setDoctorAvailability([]);
            
            axios.get(`${API_URL}/doctors/specialization/${appointment.doctor.specialization}`)
                .then(res => setAltDoctors(res.data.data.filter(d => d.doctor_id !== appointment.doctor_id)))
                .catch(err => console.error(err));
        } else {
            setSelectedDoctor(appointment?.doctor);
        }
    }, [isChangingDoctor, appointment]);

    useEffect(() => {
        if (selectedDoctor?.doctor_id && isOpen) {
            console.log("Fetching availability for Doctor ID:", selectedDoctor.doctor_id);
            fetchAvailability(selectedDoctor.doctor_id);
            // Reset selection when changing doctor
            if (selectedDoctor.doctor_id !== appointment?.doctor_id) {
                setSelectedDate(null);
                setSelectedSession(null);
            }
        } else if (isOpen) {
            console.warn("Cannot fetch availability: selectedDoctor.doctor_id is missing", selectedDoctor);
            setDoctorAvailability([]);
        }
    }, [selectedDoctor?.doctor_id, isOpen]);

    useEffect(() => {
        if (selectedDate && selectedDoctor?.doctor_id) {
            fetchBookedSlots(selectedDoctor.doctor_id);
        }
    }, [selectedDate, selectedDoctor]);

    const fetchAvailability = async (docId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/doctors/${docId}/availability`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setDoctorAvailability(response.data.data);
            } else {
                setDoctorAvailability([]);
            }
        } catch (error) {
            console.error("Error fetching availability:", error);
            setDoctorAvailability([]);
        }
    };

    const fetchBookedSlots = async (docId) => {
        try {
            const bYear = selectedDate.getFullYear();
            const bMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const bDay = String(selectedDate.getDate()).padStart(2, '0');
            const formattedDate = `${bYear}-${bMonth}-${bDay}`;
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/appointments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                const relevant = response.data.data.filter(apt =>
                    apt.doctor_id === docId &&
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
        if (!selectedDate || !selectedSession || !selectedDoctor) {
            toast.error("Please select a doctor, date, and session");
            return;
        }
        setShowConfirm(true);
    };

    const confirmReschedule = async () => {
        setIsProcessing(true);
        const toastId = toast.loading("Rescheduling appointment...");
        try {
            const token = localStorage.getItem('token');
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            
            const payload = {
                appointment_date: formattedDate,
                time_slot: selectedSession.timeRange,
                schedule_id: selectedSession.id
            };

            if (isChangingDoctor) {
                payload.new_doctor_id = selectedDoctor.doctor_id;
                payload.transfer_action = transferAction;
                payload.payment_method = paymentMethod;
            }
            
            const response = await axios.put(`${API_URL}/appointments/${appointment.appointment_id}/reschedule`, payload, {
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

    const getFinancialSummary = () => {
        if (!appointment || !isChangingDoctor || !selectedDoctor) return null;
        
        // Show calculations based on original fee requirement vs new doctor requirement
        const oldFee = Number(appointment.doctor?.doctor_fee || 0) + Number(appointment.doctor?.center_fee || 600);
        const newFee = Number(selectedDoctor.doctor_fee || 0) + Number(selectedDoctor.center_fee || 600);
        
        // If already paid, we calculate balance/refund
        // if unpaid, we just show the new total
        const amountPaid = appointment.payment_status === 'PAID' ? oldFee : 0;
        const diff = newFee - amountPaid;

        return { oldFee, newFee, diff, amountPaid };
    };

    const finSummary = getFinancialSummary();

    // Calendar logic
    const daysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const days = new Date(year, month + 1, 0).getDate();
        return { firstDay, days };
    };

    const isDateAvailable = (dayDate) => {
        const dYear = dayDate.getFullYear();
        const dMonth = String(dayDate.getMonth() + 1).padStart(2, '0');
        const dDay = String(dayDate.getDate()).padStart(2, '0');
        const formattedDate = `${dYear}-${dMonth}-${dDay}`;
        
        const daysMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const dayName = daysMap[dayDate.getDay()];

        const specificActive = doctorAvailability.filter(a => a.schedule_date === formattedDate && a.status === 'ACTIVE' && !a.is_exclusion);
        const exclusions = doctorAvailability.filter(a => a.schedule_date === formattedDate && a.is_exclusion);

        if (specificActive.length > 0) return true;

        const recurring = doctorAvailability.filter(a => 
            a.day_of_week?.toUpperCase() === dayName && 
            !a.schedule_date && 
            a.status === 'ACTIVE' &&
            (!a.end_date || formattedDate <= a.end_date)
        );

        const activeRecurring = recurring.filter(r => 
            !exclusions.some(e => e.start_time === r.start_time && e.end_time === r.end_time)
        );

        return activeRecurring.length > 0;
    };

    const getTimeSlots = () => {
        if (!selectedDate) return [];
        const tYear = selectedDate.getFullYear();
        const tMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const tDay = String(selectedDate.getDate()).padStart(2, '0');
        const formattedDate = `${tYear}-${tMonth}-${tDay}`;
        const dayName = selectedDate.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();

        const specific = doctorAvailability.filter(a => a.schedule_date === formattedDate && a.status === 'ACTIVE' && !a.is_exclusion);
        const recurring = doctorAvailability.filter(a => 
            !a.schedule_date && 
            a.day_of_week === dayName && 
            a.status === 'ACTIVE' &&
            (!a.end_date || formattedDate <= a.end_date)
        );
        const exclusions = doctorAvailability.filter(a => a.schedule_date === formattedDate && a.is_exclusion);

        const daySessions = [...specific, ...recurring].filter(as => 
            !exclusions.some(e => e.start_time === as.start_time && e.end_time === as.end_time)
        );

        return daySessions.map(avail => ({
            id: avail.schedule_id,
            timeRange: `${avail.start_time} - ${avail.end_time}`
        }));
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

                <div style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "24px", maxHeight: "70vh", overflowY: "auto" }}>
                    {/* Step 1: Doctor Choice */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: !isChangingDoctor ? '700' : '500', color: !isChangingDoctor ? '#2563eb' : '#64748b' }}>
                                <input type="radio" checked={!isChangingDoctor} onChange={() => setIsChangingDoctor(false)} />
                                Keep Dr. {appointment?.doctor?.full_name}
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: isChangingDoctor ? '700' : '500', color: isChangingDoctor ? '#2563eb' : '#64748b' }}>
                                <input type="radio" checked={isChangingDoctor} onChange={() => setIsChangingDoctor(true)} />
                                Transfer to another Specialist
                            </label>
                        </div>
                        
                        {isChangingDoctor && (
                            <div>
                                {altDoctors.length > 0 ? (
                                    <select 
                                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px' }}
                                        onChange={(e) => setSelectedDoctor(altDoctors.find(d => d.doctor_id == e.target.value))}
                                        value={selectedDoctor?.doctor_id || ''}
                                    >
                                        <option value="" disabled>Select a new {appointment?.doctor?.specialization}</option>
                                        {altDoctors.map(d => (
                                            <option key={d.doctor_id} value={d.doctor_id}>Dr. {d.full_name} ({d.specialization}) - Fee: LKR {(Number(d.doctor_fee || 0) + Number(d.center_fee || 600)).toLocaleString()}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p style={{ color: '#ea580c', margin: 0, fontWeight: '600' }}>No other {appointment?.doctor?.specialization}s are currently available.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* NEW: Financial Summary (Moved up for visibility) */}
                    {finSummary && (
                        <div style={{ backgroundColor: finSummary.diff > 0 ? '#fffbeb' : finSummary.diff < 0 ? '#ecfdf5' : '#f8fafc', padding: '20px', borderRadius: '16px', border: `1px solid ${finSummary.diff > 0 ? '#fde68a' : finSummary.diff < 0 ? '#a7f3d0' : '#e2e8f0'}` }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>Financial Impact</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>
                                <span>{appointment.payment_status === 'PAID' ? 'Amount Already Paid:' : 'Original Total Fee:'}</span> <span>LKR {(finSummary.amountPaid > 0 ? finSummary.amountPaid : finSummary.oldFee).toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>
                                <span>New Doctor Total Fee:</span> <span>LKR {finSummary.newFee.toLocaleString()}</span>
                            </div>
                            
                            {finSummary.diff !== 0 && (
                                <div style={{ margin: '12px 0', borderTop: '1px dashed #cbd5e1' }}></div>
                            )}
                            
                            {finSummary.diff > 0 && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '16px', fontWeight: '800', color: '#b45309' }}>
                                        <span>{appointment.payment_status === 'PAID' ? 'Balance to Collect:' : 'Requirement Increase:'}</span> <span>LKR {finSummary.diff.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        <select value={transferAction} onChange={(e) => setTransferAction(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                                            <option value="PAY_LATER">Transfer & Pay Later</option>
                                            <option value="COLLECT_DIFFERENCE">Collect & Transfer Now</option>
                                        </select>
                                        {transferAction === 'COLLECT_DIFFERENCE' && (
                                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                                                <option value="CASH">Cash</option>
                                                <option value="CARD">Card</option>
                                            </select>
                                        )}
                                    </div>
                                </>
                            )}
                            {finSummary.diff < 0 && (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '16px', fontWeight: '800', color: '#059669' }}>
                                        <span>Refund to Patient:</span> <span>LKR {Math.abs(finSummary.diff).toLocaleString()}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#059669' }}>Please hand the cash difference to the patient at the desk.</div>
                                </>
                            )}
                            {finSummary.diff === 0 && appointment.payment_status === 'PAID' && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                                    <span>Fees are identical. No balance due.</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Calendar & Time */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "48px" }}>
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
                                    const isSelected = selectedDate && 
                                                      date.getDate() === selectedDate.getDate() && 
                                                      date.getMonth() === selectedDate.getMonth() && 
                                                      date.getFullYear() === selectedDate.getFullYear();
                                    const isPast = date < new Date().setHours(0,0,0,0);

                                    return (
                                        <button 
                                            key={i}
                                            disabled={!isAvailable || isPast}
                                            onClick={() => !isPast && isAvailable && setSelectedDate(date)}
                                            style={{
                                                ...styles.dayBtn,
                                                ...(isAvailable && !isPast ? styles.dayAvailable : {}),
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
                                {getTimeSlots().map(session => (
                                    <button
                                        key={session.id}
                                        onClick={() => setSelectedSession(session)}
                                        style={{
                                            ...styles.timeBtn,
                                            ...(selectedSession?.id === session.id ? styles.timeSelected : {}),
                                            gridColumn: 'span 2'
                                        }}
                                    >
                                        {session.timeRange}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Financial Summary removed from here and moved up */}
                </div>

                <div style={styles.footer}>
                    <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
                    <button 
                        onClick={handleReschedule} 
                        disabled={isProcessing || !selectedDate || !selectedSession}
                        style={{
                            ...styles.confirmBtn,
                            opacity: (isProcessing || !selectedDate || !selectedSession) ? 0.6 : 1
                        }}
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
                message={`Are you sure you want to reschedule ${appointment?.patient?.full_name}'s appointment to ${selectedDoctor?.full_name} on ${selectedDate?.toLocaleDateString()} at ${selectedSession?.timeRange}?`}
                confirmLabel="Confirm"
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
        maxWidth: "750px", 
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
    calHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        backgroundColor: "#2563eb",
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
        aspectRatio: "1.1", 
        border: "none",
        borderRadius: "10px",
        backgroundColor: "white",
        fontSize: "15px", 
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
        boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.4)",
        border: "none"
    },
    dayAvailable: {
        backgroundColor: "#eff6ff",
        color: "#2563eb",
        border: "1px solid #dbeafe",
        fontWeight: "700"
    },
    dayDisabled: {
        color: "#cbd5e1",
        backgroundColor: "transparent",
        cursor: "not-allowed",
        border: "none",
        opacity: 0.4
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
