import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
    FiCalendar, FiClock, FiCheck, FiArrowRight, FiArrowLeft, 
    FiCheckCircle, FiCreditCard, FiHome, FiInfo, FiUser,
    FiChevronLeft, FiChevronRight, FiActivity, FiShield
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PatientSidebar from '../../components/PatientSidebar';
import PatientHeader from '../../components/PatientHeader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const ChannelDoctor = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const doctor = location.state?.doctor;

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    
    // Step 1: Date Selection State
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [availabilities, setAvailabilities] = useState([]);

    // Step 2: Time Slot State
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedScheduleId, setSelectedScheduleId] = useState(null);
    const [bookedSlots, setBookedSlots] = useState([]);

    // Step 3: Review State
    const [policyAgreed, setPolicyAgreed] = useState(false);

    // Step 4: Confirmation State
    const [confirmedAppointment, setConfirmedAppointment] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null); // 'online' or 'clinic'

    useEffect(() => {
        if (!doctor) {
            navigate('/patient/find-doctor');
            return;
        }

        const fetchAvailability = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
                const response = await axios.get(`${API_URL}/doctors/${doctor.doctor_id}/availability`, { headers });
                if (response.data.success) {
                    setAvailabilities(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching availability:", error);
            }
        };

        const fetchBookedSlots = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/appointments?doctor_id=${doctor.doctor_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setBookedSlots(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching booked slots:", error);
            }
        };

        fetchAvailability();
        fetchBookedSlots();
    }, [doctor, navigate]);

    // --- Calendar Logic ---
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

    const isDateAvailable = (day) => {
        if (!day) return false;
        const dateObj = new Date(year, month, day);
        const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayName = dayNames[dateObj.getDay()];

        // Defensive: if a blackout exclusion exists for this date, block it
        const isBlackedOut = availabilities.some(a =>
            a.is_exclusion === true &&
            a.schedule_date === formattedDate &&
            a.status === 'CANCELLED'
        );
        if (isBlackedOut) return false;

        // Only show dates with an ACTIVE, non-exclusion session
        return availabilities.some(a =>
            a.status === 'ACTIVE' &&
            !a.is_exclusion &&
            (a.day_of_week === dayName || a.schedule_date === formattedDate)
        );
    };

    const handleDateClick = (day) => {
        if (!day) return;
        const isPast = new Date(year, month, day) < new Date().setHours(0,0,0,0);
        if (isDateAvailable(day) && !isPast) {
            setSelectedDate(day);
        }
    };

    // --- Time Slot Logic ---
    const getTimeSlots = () => {
        if (!selectedDate) return [];

        const dateObj = new Date(year, month, selectedDate);
        const dayName = dayNames[dateObj.getDay()];
        const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;

        // Only ACTIVE, non-exclusion sessions
        const relevantAvails = availabilities.filter(a =>
            a.status === 'ACTIVE' &&
            !a.is_exclusion &&
            (a.schedule_date === formattedDate ||
            (a.day_of_week === dayName && !a.schedule_date))
        );

        if (relevantAvails.length === 0) return [];

        const now = new Date();

        // Build slot objects that carry schedule_id — required for backend safety check
        return relevantAvails.map(avail => {
            if (avail.start_time && avail.end_time) {
                // Safety: Check if this session is starting in < 30 mins
                const sessionStartTime = new Date(`${formattedDate} ${avail.start_time}`);
                const thirtyMinsBefore = new Date(sessionStartTime.getTime() - 30 * 60000);
                
                if (now > thirtyMinsBefore) return null; // Too late to book online

                const start = new Date(`2000-01-01 ${avail.start_time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                const end = new Date(`2000-01-01 ${avail.end_time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                return {
                    time: `${start} - ${end}`,
                    schedule_id: avail.schedule_id,
                    isBooked: false
                };
            }
            return null;
        }).filter(Boolean);
    };

    // --- Action Handlers ---
    const handleConfirmBooking = async (payNow = false) => {
        setIsLoading(true);
        const toastId = toast.loading("Confirming your appointment...");
        try {
            const token = localStorage.getItem('token');
            const appointmentDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
            
            const response = await axios.post(`${API_URL}/appointments`, {
                doctor_id: doctor.doctor_id,
                appointment_date: appointmentDate,
                time_slot: selectedTime,
                schedule_id: selectedScheduleId,
                notes: "",
                skipNotification: payNow
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const newApt = response.data.data;
                setConfirmedAppointment(newApt);
                setPaymentMethod(payNow ? 'online' : 'clinic');
                toast.success("Appointment Confirmed!", { id: toastId });
                
                if (payNow) {
                    navigate('/patient/payment', {
                        state: {
                            paymentData: {
                                appointmentId: newApt.appointment_id,
                                doctor: doctor,
                                date: new Date(year, month, selectedDate),
                                time: selectedTime,
                                totalFee: Number(doctor.doctor_fee) + Number(doctor.center_fee || 600)
                            }
                        }
                    });
                } else {
                    setStep(4);
                }
            }
        } catch (error) {
            console.error("Booking error:", error);
            const errMsg = error.response?.data?.message || "Failed to book appointment";
            toast.error(errMsg, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayNow = () => {
        navigate('/patient/payment', {
            state: {
                paymentData: {
                    appointmentId: confirmedAppointment.appointment_id,
                    doctor: doctor,
                    date: new Date(year, month, selectedDate),
                    time: selectedTime,
                    totalFee: Number(doctor.doctor_fee) + Number(doctor.center_fee || 600)
                }
            }
        });
    };

    const steps = [
        { id: 1, label: "Select Date", icon: FiCalendar },
        { id: 2, label: "Select Time", icon: FiClock },
        { id: 3, label: "Review", icon: FiActivity },
        { id: 4, label: "Finished", icon: FiCheckCircle }
    ];

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    const renderProgressBar = () => (
        <div style={styles.progressContainer}>
            {steps.map((s, idx) => (
                <div key={s.id} style={styles.stepWrapper}>
                    <div style={{
                        ...styles.stepCircle,
                        backgroundColor: step === s.id ? '#2563eb' : (step > s.id ? '#10b981' : '#f1f5f9'),
                        color: step >= s.id ? 'white' : '#94a3b8',
                        boxShadow: step === s.id ? '0 0 0 4px rgba(37, 99, 235, 0.15)' : 'none'
                    }}>
                        {step > s.id ? <FiCheck /> : <s.icon />}
                    </div>
                    <div style={styles.stepTextWrapper}>
                        <span style={{
                            ...styles.stepLabel,
                            color: step === s.id ? '#0f172a' : '#94a3b8'
                        }}>Step {s.id}</span>
                        <span style={{
                            ...styles.stepTitle,
                            color: step === s.id ? '#2563eb' : '#64748b'
                        }}>{s.label}</span>
                    </div>
                    {idx < steps.length - 1 && (
                        <div style={{
                            ...styles.stepConnector,
                            background: step > s.id ? '#10b981' : '#e2e8f0'
                        }} />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div style={styles.container}>
            <PatientSidebar onLogout={() => { localStorage.clear(); navigate('/'); }} />
            <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <PatientHeader />
                <main style={styles.mainContent}>
                    <div style={styles.wizardShell}>
                        {renderProgressBar()}

                        <div style={styles.cardContainer}>
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div 
                                        key="step1"
                                        initial="enter" animate="center" exit="exit" variants={slideVariants}
                                        style={styles.stepCard}
                                    >
                                        <div style={styles.cardHeader}>
                                            <h2 style={styles.cardTitle}>When would you like to visit?</h2>
                                            <p style={styles.cardSubtitle}>Select an available date for {doctor.full_name}</p>
                                        </div>

                                        <div style={styles.calendarLayer}>
                                            <div style={styles.calControls}>
                                                <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} style={styles.calNav}>
                                                    <FiChevronLeft />
                                                </button>
                                                <h4 style={styles.currentMonthText}>{monthNames[month]} {year}</h4>
                                                <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} style={styles.calNav}>
                                                    <FiChevronRight />
                                                </button>
                                            </div>

                                            <div style={styles.calGrid}>
                                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                                                    <div key={d} style={styles.calDayLabel}>{d}</div>
                                                ))}
                                                {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
                                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                                                    const available = isDateAvailable(d);
                                                    const isPast = new Date(year, month, d) < new Date().setHours(0,0,0,0);
                                                    const selected = selectedDate === d;
                                                    const canSelect = available && !isPast;

                                                    return (
                                                        <div
                                                            key={d}
                                                            onClick={() => canSelect && handleDateClick(d)}
                                                            style={{
                                                                ...styles.calDay,
                                                                backgroundColor: selected ? '#2563eb' : (canSelect ? '#eff6ff' : 'transparent'),
                                                                color: selected ? 'white' : (canSelect ? '#2563eb' : '#cbd5e1'),
                                                                cursor: canSelect ? 'pointer' : 'default',
                                                                border: selected ? 'none' : (canSelect ? '1px solid #dbeafe' : 'none'),
                                                                fontWeight: canSelect ? '700' : '500',
                                                                opacity: isPast ? 0.4 : 1
                                                            }}
                                                        >
                                                            {d}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div style={styles.cardFooter}>
                                            <span style={styles.selectionInfo}>
                                                {selectedDate ? `Selected: ${monthNames[month]} ${selectedDate}` : "Please select a date"}
                                            </span>
                                            <button 
                                                onClick={() => setStep(2)} 
                                                disabled={!selectedDate} 
                                                style={{...styles.primaryBtn, filter: !selectedDate ? 'grayscale(1)' : 'none'}}
                                            >
                                                Next Step
                                                <FiArrowRight style={{ marginLeft: '8px' }} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div 
                                        key="step2"
                                        initial="enter" animate="center" exit="exit" variants={slideVariants}
                                        style={styles.stepCard}
                                    >
                                        <div style={styles.cardHeader}>
                                            <h2 style={styles.cardTitle}>Pick a time slot</h2>
                                            <p style={styles.cardSubtitle}>Available appointments for {monthNames[month]} {selectedDate}</p>
                                        </div>

                                         <div style={styles.slotsGrid}>
                                            {getTimeSlots().map((slot, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        setSelectedTime(slot.time);
                                                        setSelectedScheduleId(slot.schedule_id);
                                                    }}
                                                    style={{
                                                        ...styles.slotBtn,
                                                        backgroundColor: selectedTime === slot.time ? '#2563eb' : 'white',
                                                        color: selectedTime === slot.time ? 'white' : '#1e293b',
                                                        borderColor: selectedTime === slot.time ? '#2563eb' : '#e2e8f0',
                                                        gridColumn: 'span 2' // Make it wider for range text
                                                    }}
                                                >
                                                    <FiClock style={{ marginRight: '8px', opacity: 0.5 }} />
                                                    {slot.time}
                                                </button>
                                            ))}
                                        </div>

                                        <div style={styles.cardFooter}>
                                            <button onClick={() => setStep(1)} style={styles.secondaryBtn}>Back</button>
                                            <button 
                                                onClick={() => setStep(3)} 
                                                disabled={!selectedTime} 
                                                style={{...styles.primaryBtn, filter: !selectedTime ? 'grayscale(1)' : 'none'}}
                                            >
                                                Review Details
                                                <FiArrowRight style={{ marginLeft: '8px' }} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div 
                                        key="step3"
                                        initial="enter" animate="center" exit="exit" variants={slideVariants}
                                        style={styles.stepCard}
                                    >
                                        <div style={styles.cardHeader}>
                                            <h2 style={styles.cardTitle}>Final Review</h2>
                                            <p style={styles.cardSubtitle}>Please confirm your appointment details</p>
                                        </div>

                                        <div style={styles.reviewLayout}>
                                            <div style={styles.reviewMain}>
                                                <div style={styles.doctorBadge}>
                                                    <div style={styles.badgeAvatar}>{doctor.full_name?.charAt(0)}</div>
                                                    <div>
                                                        <h4 style={styles.badgeName}>{doctor.full_name}</h4>
                                                        <p style={styles.badgeSpec}>{doctor.specialization}</p>
                                                    </div>
                                                </div>
                                                <div style={styles.detailsList}>
                                                    <div style={styles.detailItem}>
                                                        <FiCalendar />
                                                        <span>{monthNames[month]} {selectedDate}, {year}</span>
                                                    </div>
                                                    <div style={styles.detailItem}>
                                                        <FiClock />
                                                        <span>{selectedTime}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={styles.billingCard}>
                                                <h5 style={styles.billingTitle}>Billing Summary</h5>
                                                <div style={styles.billingRow}>
                                                    <span>Doctor Fee</span>
                                                    <span>LKR {Number(doctor.doctor_fee).toLocaleString()}</span>
                                                </div>
                                                <div style={styles.billingRow}>
                                                    <span>Service Charge</span>
                                                    <span>LKR {Number(doctor.center_fee || 600).toLocaleString()}</span>
                                                </div>
                                                <div style={styles.billingTotal}>
                                                    <span>Total Payable</span>
                                                    <span>LKR {(Number(doctor.doctor_fee) + Number(doctor.center_fee || 600)).toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <label style={styles.policyCheck}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={policyAgreed} 
                                                    onChange={(e) => setPolicyAgreed(e.target.checked)}
                                                    style={styles.realCheckbox}
                                                />
                                                <span>I agree to the center's booking policies and terms.</span>
                                            </label>
                                        </div>

                                        <div style={styles.cardFooter}>
                                            <button onClick={() => setStep(2)} style={styles.secondaryBtn}>Back</button>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button 
                                                    onClick={() => handleConfirmBooking(true)} 
                                                    disabled={!policyAgreed || isLoading} 
                                                    style={{...styles.primaryBtn, filter: !policyAgreed ? 'grayscale(1)' : 'none'}}
                                                >
                                                    <FiCreditCard style={{ marginRight: '8px' }} />
                                                    {isLoading ? 'Processing...' : 'Pay Online Now'}
                                                </button>
                                                <button 
                                                    onClick={() => handleConfirmBooking(false)} 
                                                    disabled={!policyAgreed || isLoading} 
                                                    style={{...styles.secondaryBtn, border: '1px solid #2563eb', color: '#2563eb', filter: !policyAgreed ? 'grayscale(1)' : 'none'}}
                                                >
                                                    {isLoading ? 'Processing...' : 'Pay Later at Clinic'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div 
                                        key="step4"
                                        initial="enter" animate="center" exit="exit" variants={slideVariants}
                                        style={styles.stepCard}
                                    >
                                        <div style={styles.successBox}>
                                            <div style={styles.successLottie}>
                                                <FiCheckCircle />
                                            </div>
                                            <h2 style={styles.successHeading}>Successfully Booked!</h2>
                                            <p style={styles.successInfo}>
                                                {paymentMethod === 'clinic' 
                                                    ? "Your appointment is confirmed. Please pay the fee at the clinic reception." 
                                                    : "Your appointment is confirmed. We've sent a confirmation email to your inbox."}
                                            </p>
                                        </div>

                                        <div style={styles.ticketCard}>
                                            <div style={styles.ticketHeader}>
                                                <div>
                                                    <p style={styles.ticketLabel}>Appointment ID</p>
                                                    <h4 style={styles.ticketVal}>#APT-{confirmedAppointment?.appointment_id}</h4>
                                                </div>
                                                <div style={styles.tokenCircle}>
                                                    <p style={styles.tokenLabel}>Token</p>
                                                    <h3 style={styles.tokenNum}>{confirmedAppointment?.appointment_number}</h3>
                                                </div>
                                            </div>
                                            <div style={styles.ticketBody}>
                                                <div style={styles.ticketRow}>
                                                    <FiUser /> <span>{doctor.full_name}</span>
                                                </div>
                                                <div style={styles.ticketRow}>
                                                    <FiCalendar /> <span>{monthNames[month]} {selectedDate}</span>
                                                </div>
                                                <div style={styles.ticketRow}>
                                                    <FiClock /> <span>{selectedTime}</span>
                                                </div>
                                                <div style={styles.ticketRow}>
                                                    <FiCreditCard /> <span>Status: {paymentMethod === 'clinic' ? 'Pay at Clinic' : 'Online Payment'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={styles.paymentActions}>
                                            {paymentMethod === 'online' && (
                                                <button 
                                                    onClick={() => navigate('/patient/payment', {
                                                        state: {
                                                            paymentData: {
                                                                appointmentId: confirmedAppointment.appointment_id,
                                                                doctor: doctor,
                                                                date: new Date(year, month, selectedDate),
                                                                time: selectedTime,
                                                                totalFee: Number(doctor.doctor_fee) + Number(doctor.center_fee || 600)
                                                            }
                                                        }
                                                    })} 
                                                    style={styles.payNowBtn}
                                                >
                                                    <FiCreditCard />
                                                    Pay Online Now
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => navigate('/patient/dashboard')} 
                                                style={paymentMethod === 'online' ? styles.payLaterBtn : styles.primaryBtn}
                                            >
                                                <FiHome />
                                                Return to Dashboard
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
    },
    mainContent: {
        padding: "40px 32px",
        flex: 1,
        maxWidth: "1000px",
        margin: "0 auto",
        width: "100%"
    },
    wizardShell: {
        display: "flex",
        flexDirection: "column",
        gap: "40px"
    },
    progressContainer: {
        display: "flex",
        justifyContent: "space-between",
        padding: "0 20px"
    },
    stepWrapper: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flex: 1,
        position: "relative"
    },
    stepCircle: {
        width: "40px",
        height: "40px",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        zIndex: 2,
        transition: "all 0.4s ease"
    },
    stepTextWrapper: {
        display: "flex",
        flexDirection: "column",
        gap: "2px"
    },
    stepLabel: {
        fontSize: "11px",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    },
    stepTitle: {
        fontSize: "14px",
        fontWeight: "700"
    },
    stepConnector: {
        height: "2px",
        flex: 1,
        margin: "0 10px",
        borderRadius: "2px"
    },
    cardContainer: {
        position: "relative",
        minHeight: "500px"
    },
    stepCard: {
        backgroundColor: "white",
        borderRadius: "28px",
        padding: "40px",
        border: "2px solid #2563eb", // Blue outline
        boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "32px"
    },
    cardHeader: {
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    },
    cardTitle: {
        fontSize: "24px",
        fontWeight: "800",
        color: "#0f172a",
        margin: 0
    },
    cardSubtitle: {
        fontSize: "15px",
        color: "#64748b",
        margin: 0
    },
    calendarLayer: {
        display: "flex",
        flexDirection: "column",
        gap: "24px"
    },
    calControls: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#2563eb", // Blue header
        padding: "16px",
        borderRadius: "16px",
        marginBottom: "16px"
    },
    calNav: {
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        border: "none",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "white"
    },
    currentMonthText: {
        fontSize: "16px",
        fontWeight: "700",
        margin: 0,
        color: "white"
    },
    calGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "8px",
        textAlign: "center"
    },
    calDayLabel: {
        fontSize: "11px",
        fontWeight: "800",
        color: "#cbd5e1",
        textTransform: "uppercase",
        paddingBottom: "10px"
    },
    calDay: {
        height: "44px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        fontWeight: "600",
        transition: "all 0.2s"
    },
    cardFooter: {
        marginTop: "auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: "32px",
        borderTop: "1px solid #f1f5f9"
    },
    selectionInfo: {
        fontSize: "14px",
        color: "#94a3b8",
        fontWeight: "600"
    },
    primaryBtn: {
        padding: "14px 28px",
        backgroundColor: "#2563eb",
        color: "white",
        borderRadius: "14px",
        border: "none",
        fontSize: "15px",
        fontWeight: "700",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        boxShadow: "0 10px 15px -3px rgba(37, 99, 235, 0.2)"
    },
    secondaryBtn: {
        padding: "14px 28px",
        backgroundColor: "white",
        color: "#64748b",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        fontSize: "15px",
        fontWeight: "700",
        cursor: "pointer"
    },
    slotsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
        gap: "12px"
    },
    slotBtn: {
        padding: "16px",
        borderRadius: "16px",
        border: "1px solid",
        fontSize: "14px",
        fontWeight: "700",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s"
    },
    reviewLayout: {
        display: "flex",
        flexDirection: "column",
        gap: "24px"
    },
    reviewMain: {
        backgroundColor: "#f8fafc",
        padding: "24px",
        borderRadius: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    doctorBadge: {
        display: "flex",
        alignItems: "center",
        gap: "16px"
    },
    badgeAvatar: {
        width: "48px",
        height: "48px",
        borderRadius: "14px",
        backgroundColor: "#2563eb",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
        fontWeight: "800"
    },
    badgeName: {
        fontSize: "16px",
        fontWeight: "700",
        color: "#0f172a",
        margin: 0
    },
    badgeSpec: {
        fontSize: "13px",
        color: "#2563eb",
        fontWeight: "600",
        margin: 0
    },
    detailsList: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "6px"
    },
    detailItem: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "14px",
        color: "#64748b",
        fontWeight: "600"
    },
    billingCard: {
        border: "2px dashed #f1f5f9",
        padding: "24px",
        borderRadius: "20px"
    },
    billingTitle: {
        fontSize: "14px",
        fontWeight: "800",
        color: "#0f172a",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        marginBottom: "16px"
    },
    billingRow: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "14px",
        color: "#64748b",
        marginBottom: "8px"
    },
    billingTotal: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "16px",
        paddingTop: "16px",
        borderTop: "1px solid #f1f5f9",
        fontSize: "18px",
        fontWeight: "800",
        color: "#0f172a"
    },
    policyCheck: {
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        fontSize: "13px",
        color: "#64748b",
        cursor: "pointer"
    },
    realCheckbox: {
        marginTop: "3px"
    },
    successBox: {
        textAlign: "center",
        padding: "20px 0"
    },
    successLottie: {
        fontSize: "64px",
        color: "#10b981",
        marginBottom: "16px"
    },
    successHeading: {
        fontSize: "28px",
        fontWeight: "800",
        color: "#0f172a",
        marginBottom: "8px"
    },
    successInfo: {
        fontSize: "16px",
        color: "#64748b",
        maxWidth: "400px",
        margin: "0 auto"
    },
    ticketCard: {
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        borderRadius: "24px",
        padding: "32px",
        color: "white",
        boxShadow: "0 20px 30px -10px rgba(15, 23, 42, 0.2)"
    },
    ticketHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        paddingBottom: "24px",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
    },
    ticketLabel: {
        fontSize: "11px",
        fontWeight: "700",
        color: "#94a3b8",
        textTransform: "uppercase",
        margin: 0
    },
    ticketVal: {
        fontSize: "18px",
        fontWeight: "700",
        margin: 0
    },
    tokenCircle: {
        width: "64px",
        height: "64px",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: "50%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(255,255,255,0.1)"
    },
    tokenLabel: {
        fontSize: "9px",
        fontWeight: "800",
        margin: 0,
        opacity: 0.6
    },
    tokenNum: {
        fontSize: "24px",
        fontWeight: "800",
        margin: 0
    },
    ticketBody: {
        display: "flex",
        justifyContent: "space-between",
        gap: "20px"
    },
    ticketRow: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "14px",
        fontWeight: "600",
        color: "#cbd5e1"
    },
    paymentActions: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginTop: "12px"
    },
    payNowBtn: {
        width: "100%",
        padding: "18px",
        borderRadius: "16px",
        backgroundColor: "#2563eb",
        color: "white",
        border: "none",
        fontSize: "15px",
        fontWeight: "700",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px"
    },
    payLaterBtn: {
        width: "100%",
        padding: "18px",
        borderRadius: "16px",
        backgroundColor: "#f8fafc",
        color: "#64748b",
        border: "1px solid #e2e8f0",
        fontSize: "15px",
        fontWeight: "700",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px"
    }
};

export default ChannelDoctor;
