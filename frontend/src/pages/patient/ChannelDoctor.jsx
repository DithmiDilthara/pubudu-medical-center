import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
    FiCalendar, FiClock, FiCheck, FiArrowRight, FiArrowLeft, 
    FiCheckCircle, FiCreditCard, FiHome, FiInfo, FiUser,
    FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
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
    const [bookedSlots, setBookedSlots] = useState([]);

    // Step 3: Review State
    const [policyAgreed, setPolicyAgreed] = useState(false);

    // Step 4: Confirmation State
    const [confirmedAppointment, setConfirmedAppointment] = useState(null);

    useEffect(() => {
        if (!doctor) {
            navigate('/patient/find-doctor');
            return;
        }

        const fetchAvailability = async () => {
            try {
                const response = await axios.get(`${API_URL}/doctors/${doctor.doctor_id}/availability`);
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
        
        // Simplified check: check if day name exists in availability
        return availabilities.some(a => a.day_of_week === dayName || a.specific_date === formattedDate);
    };

    const handleDateClick = (day) => {
        if (day && isDateAvailable(day)) {
            setSelectedDate(day);
        }
    };

    // --- Time Slot Logic ---
    const getTimeSlots = () => {
        if (!selectedDate) return [];
        
        const dateObj = new Date(year, month, selectedDate);
        const dayName = dayNames[dateObj.getDay()];
        const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;

        // Find applicable availability records
        const relevantAvails = availabilities.filter(a => 
            a.specific_date === formattedDate || 
            (a.day_of_week === dayName && !a.specific_date)
        );

        if (relevantAvails.length === 0) return [];

        const slots = [];
        relevantAvails.forEach(avail => {
            if (!avail.start_time || !avail.end_time) return;

            // Convert "HH:MM:SS" to fractional hours
            const startParts = avail.start_time.split(':');
            const endParts = avail.end_time.split(':');
            
            const startT = parseInt(startParts[0]) + (parseInt(startParts[1]) / 60);
            const endT = parseInt(endParts[0]) + (parseInt(endParts[1]) / 60);

            for (let t = startT; t < endT; t += 0.5) {
                const hour = Math.floor(t);
                const minutes = (t % 1 === 0.5) ? '30' : '00';
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
                slots.push(`${hour12}:${minutes} ${ampm}`);
            }
        });

        // Unique slots (in case of overlaps)
        const uniqueSlots = [...new Set(slots)];

        // Check booked status from real appointment data
        const bookedForDay = bookedSlots
            .filter(apt => apt.appointment_date === formattedDate && apt.status !== 'CANCELLED')
            .map(apt => apt.time_slot);

        return uniqueSlots.map(s => ({
            time: s,
            isBooked: bookedForDay.includes(s)
        }));
    };

    // --- Action Handlers ---
    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleConfirmBooking = async () => {
        setIsLoading(true);
        const toastId = toast.loading("Confirming your appointment...");
        try {
            const token = localStorage.getItem('token');
            const appointmentDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
            
            const response = await axios.post(`${API_URL}/appointments`, {
                doctor_id: doctor.doctor_id,
                appointment_date: appointmentDate,
                time_slot: selectedTime,
                notes: ""
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setConfirmedAppointment(response.data.data);
                toast.success("Appointment Confirmed!", { id: toastId });
                setStep(4);
            }
        } catch (error) {
            toast.error("Failed to book appointment", { id: toastId });
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
                    totalFee: Number(doctor.doctor_fee) + 200
                }
            }
        });
    };

    // --- Rendering Helpers ---
    const renderProgressBar = () => (
        <div style={styles.progressSection}>
            <div style={styles.progressBar}>
                {[1, 2, 3, 4].map(s => (
                    <div key={s} style={styles.stepIndicatorWrapper}>
                        <div style={{
                            ...styles.stepCircle,
                            backgroundColor: step === s ? '#0066CC' : (step > s ? '#22C55E' : '#E5E7EB'),
                            color: step >= s ? 'white' : '#9CA3AF'
                        }}>
                            {step > s ? <FiCheck /> : s}
                        </div>
                        <span style={{
                            ...styles.stepLabel,
                            color: step === s ? '#0066CC' : '#6B7280'
                        }}>
                            {s === 1 ? 'Select Date' : s === 2 ? 'Select Time' : s === 3 ? 'Review' : 'Confirmation'}
                        </span>
                        {s < 4 && <div style={{
                            ...styles.stepLine,
                            backgroundColor: step > s ? '#22C55E' : '#E5E7EB'
                        }} />}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStep1 = () => (
        <div style={styles.wizardCard}>
            {/* Doctor Summary */}
            <div style={styles.doctorSummary}>
                <div style={styles.avatarMini}>
                    <FiUser />
                </div>
                <div>
                    <h3 style={styles.summaryName}>{doctor.full_name}</h3>
                    <p style={styles.summarySpec}>{doctor.specialization}</p>
                </div>
            </div>

            <div style={styles.divider} />

            {/* Calendar */}
            <div style={styles.calendarContainer}>
                <div style={styles.calHeader}>
                    <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} style={styles.calNav}>
                        <FiChevronLeft />
                    </button>
                    <h4 style={styles.calTitle}>{monthNames[month]} {year}</h4>
                    <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} style={styles.calNav}>
                        <FiChevronRight />
                    </button>
                </div>

                <div style={styles.calGrid}>
                    {dayNames.map(d => <div key={d} style={styles.calDayLabel}>{d}</div>)}
                    {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                        const available = isDateAvailable(d);
                        const selected = selectedDate === d;
                        return (
                            <div
                                key={d}
                                onClick={() => handleDateClick(d)}
                                style={{
                                    ...styles.calDay,
                                    backgroundColor: selected ? '#0066CC' : (available ? '#EBF5FF' : 'transparent'),
                                    color: selected ? 'white' : (available ? '#0066CC' : '#D1D5DB'),
                                    cursor: available ? 'pointer' : 'default',
                                    border: available && !selected ? '1px solid #0066CC' : '1px solid transparent',
                                    fontWeight: available ? '700' : '600',
                                }}
                            >
                                {d}
                            </div>
                        );
                    })}
                </div>

                {/* Calendar Legend */}
                <div style={styles.calLegend}>
                    <div style={styles.legendItem}>
                        <div style={{...styles.legendBox, backgroundColor: '#0066CC'}} />
                        <span>Selected</span>
                    </div>
                    <div style={styles.legendItem}>
                        <div style={{...styles.legendBox, backgroundColor: '#EBF5FF', border: '1px solid #0066CC'}} />
                        <span>Available</span>
                    </div>
                    <div style={styles.legendItem}>
                        <div style={{...styles.legendBox, backgroundColor: 'transparent', border: '1px solid #E5E7EB'}} />
                        <span>Unavailable</span>
                    </div>
                </div>
            </div>

            <div style={styles.wizardActions}>
                <button onClick={() => navigate(-1)} style={styles.btnBack}>Back</button>
                <button 
                    onClick={handleNext} 
                    disabled={!selectedDate} 
                    style={{...styles.btnContinue, opacity: selectedDate ? 1 : 0.5}}
                >
                    Continue
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div style={styles.wizardCard}>
            <div style={styles.stepHeader}>
                <h3 style={styles.stepTitle}>Select Time Slot</h3>
                <p style={styles.stepSubtitle}>Showing slots for {monthNames[month]} {selectedDate}, {year}</p>
            </div>

            <div style={styles.timeGrid}>
                {getTimeSlots().map((slot, i) => (
                    <button
                        key={i}
                        disabled={slot.isBooked}
                        onClick={() => setSelectedTime(slot.time)}
                        style={{
                            ...styles.timeSlot,
                            backgroundColor: selectedTime === slot.time ? '#0066CC' : (slot.isBooked ? '#F3F4F6' : 'white'),
                            color: selectedTime === slot.time ? 'white' : (slot.isBooked ? '#9CA3AF' : '#111827'),
                            borderColor: selectedTime === slot.time ? '#0066CC' : '#E5E7EB',
                            textDecoration: slot.isBooked ? 'line-through' : 'none',
                        }}
                    >
                        {slot.time}
                    </button>
                ))}
            </div>

            <div style={styles.wizardActions}>
                <button onClick={handleBack} style={styles.btnBack}>Back</button>
                <button 
                    onClick={handleNext} 
                    disabled={!selectedTime} 
                    style={{...styles.btnContinue, opacity: selectedTime ? 1 : 0.5}}
                >
                    Continue
                </button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div style={styles.wizardCard}>
            <div style={styles.stepHeader}>
                <h3 style={styles.stepTitle}>Review Summary</h3>
            </div>

            <div style={styles.reviewBox}>
                <div style={styles.reviewMain}>
                    <div style={styles.avatarLarge}>
                        {doctor.full_name?.charAt(0)}
                    </div>
                    <div style={styles.reviewMeta}>
                        <h4 style={styles.reviewName}>{doctor.full_name}</h4>
                        <p style={styles.reviewSpec}>{doctor.specialization}</p>
                    </div>
                </div>

                <div style={styles.reviewGrid}>
                    <div style={styles.reviewItem}>
                        <FiCalendar style={styles.reviewIcon} />
                        <div>
                            <p style={styles.reviewLabel}>Date</p>
                            <p style={styles.reviewValue}>{monthNames[month]} {selectedDate}, {year}</p>
                        </div>
                    </div>
                    <div style={styles.reviewItem}>
                        <FiClock style={styles.reviewIcon} />
                        <div>
                            <p style={styles.reviewLabel}>Time</p>
                            <p style={styles.reviewValue}>{selectedTime}</p>
                        </div>
                    </div>
                </div>

                <div style={styles.feeBreakdown}>
                    <div style={styles.feeRow}>
                        <span>Consultation Fee</span>
                        <span>LKR {Number(doctor.doctor_fee).toLocaleString()}</span>
                    </div>
                    <div style={styles.feeRow}>
                        <span>Service Charge</span>
                        <span>LKR 200.00</span>
                    </div>
                    <div style={{...styles.feeRow, fontWeight: '800', color: '#111827', fontSize: '18px', marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #E5E7EB'}}>
                        <span>Total Amount</span>
                        <span>LKR {(Number(doctor.doctor_fee) + 200).toLocaleString()}</span>
                    </div>
                </div>

                <label style={styles.policyLabel}>
                    <input 
                        type="checkbox" 
                        checked={policyAgreed} 
                        onChange={(e) => setPolicyAgreed(e.target.checked)}
                        style={styles.checkbox}
                    />
                    <span>I agree to the cancellation policy and terms of service.</span>
                </label>
            </div>

            <div style={styles.wizardActions}>
                <button onClick={handleBack} style={styles.btnBack}>Back</button>
                <button 
                    onClick={handleConfirmBooking} 
                    disabled={!policyAgreed || isLoading} 
                    style={{...styles.btnContinue, opacity: policyAgreed ? 1 : 0.5}}
                >
                    {isLoading ? 'Confirming...' : 'Confirm Appointment'}
                </button>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div style={styles.wizardCard}>
            <div style={styles.successHeader}>
                <div style={styles.successIconBox}>
                    <FiCheckCircle size={48} />
                </div>
                <h2 style={styles.successTitle}>Appointment Confirmed!</h2>
                <p style={styles.successSubtitle}>Your booking has been successfully processed.</p>
            </div>

            <div style={styles.detailsCard}>
                <div style={styles.refInfo}>
                    <p style={styles.refLabel}>Appointment ID</p>
                    <p style={styles.refValue}>#APT-{confirmedAppointment?.appointment_id || '2026-0342'}</p>
                </div>
                <div style={styles.tokenBox}>
                    <p style={styles.tokenLabel}>Token No.</p>
                    <p style={styles.tokenValue}>{confirmedAppointment?.token_number || '15'}</p>
                </div>
            </div>

            <div style={styles.paymentSelection}>
                <p style={styles.payTitle}>How would you like to pay?</p>
                <div style={styles.payGrid}>
                    <button onClick={handlePayNow} style={styles.payOptionBlue}>
                        <FiCreditCard size={20} />
                        <span>Pay Online Now</span>
                    </button>
                    <button onClick={() => navigate('/patient/appointments')} style={styles.payOptionWhite}>
                        <FiHome size={20} />
                        <span>Pay at Center</span>
                    </button>
                </div>
            </div>

            <div style={styles.finalLinks}>
                <button onClick={() => navigate('/patient/appointments')} style={styles.linkBtn}>Go to My Appointments</button>
                <button onClick={() => navigate('/patient/dashboard')} style={styles.linkText}>Back to Dashboard</button>
            </div>
        </div>
    );

    return (
        <div style={styles.container}>
            <PatientSidebar onLogout={() => { localStorage.clear(); navigate('/'); }} />
            <div className="main-wrapper">
                <PatientHeader />
                <main className="content-padding">
                    {renderProgressBar()}
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                </main>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--slate-50)',
        fontFamily: "'Inter', sans-serif",
    },
    mainWrapper: {
        // Handled by .main-wrapper
    },
    mainContent: {
        // Handled by .content-padding
    },
    progressSection: {
        marginBottom: '40px',
    },
    progressBar: {
        display: 'flex',
        justifyContent: 'space-between',
        position: 'relative',
    },
    stepIndicatorWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        position: 'relative',
    },
    stepCircle: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        fontSize: '14px',
        zIndex: 2,
        transition: 'all 0.3s ease',
    },
    stepLabel: {
        marginTop: '8px',
        fontSize: 'var(--text-xs)',
        fontWeight: '600',
    },
    stepLine: {
        position: 'absolute',
        top: '16px',
        left: '50%',
        width: '100%',
        height: '2px',
        zIndex: 1,
    },
    wizardCard: {
        backgroundColor: 'white',
        borderRadius: 'var(--radius-2xl)',
        border: '1px solid var(--slate-100)',
        padding: '32px',
        boxShadow: 'var(--shadow-soft)',
    },
    doctorSummary: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
    },
    avatarMini: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        backgroundColor: '#E6F2FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#0066CC',
        fontSize: '20px',
    },
    summaryName: {
        fontSize: 'var(--text-lg)',
        fontWeight: '700',
        color: 'var(--slate-900)',
        margin: 0,
    },
    summarySpec: {
        fontSize: 'var(--text-sm)',
        color: 'var(--primary-blue)',
        fontWeight: '600',
        margin: 0,
    },
    divider: {
        height: '1px',
        backgroundColor: '#F3F4F6',
        margin: '24px 0',
    },
    calendarContainer: {
        marginBottom: '32px',
    },
    calHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
    },
    calNav: {
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        border: '1px solid #E5E7EB',
        background: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    calTitle: {
        fontSize: 'var(--text-base)',
        fontWeight: '700',
        color: 'var(--slate-900)',
        margin: 0,
    },
    calGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
    },
    calDayLabel: {
        fontSize: '11px',
        fontWeight: '700',
        color: '#9CA3AF',
        textAlign: 'center',
        padding: '8px 0',
    },
    calDay: {
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'var(--text-sm)',
        fontWeight: '600',
        borderRadius: '12px',
        position: 'relative',
        transition: 'all 0.2s ease',
    },
    availDot: {
        position: 'absolute',
        bottom: '6px',
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        backgroundColor: '#0066CC',
    },
    calLegend: {
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        marginTop: '24px',
        padding: '12px',
        backgroundColor: '#F9FAFB',
        borderRadius: '12px',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: 'var(--text-xs)',
        fontWeight: '600',
        color: 'var(--slate-500)',
    },
    legendBox: {
        width: '16px',
        height: '16px',
        borderRadius: '4px',
    },
    wizardActions: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '40px',
        gap: '16px',
    },
    btnBack: {
        padding: '12px 32px',
        borderRadius: '12px',
        border: '1px solid var(--slate-200)',
        backgroundColor: 'white',
        color: 'var(--slate-700)',
        fontSize: 'var(--text-base)',
        fontWeight: '600',
        cursor: 'pointer',
    },
    btnContinue: {
        flex: 1,
        padding: '12px 32px',
        borderRadius: '12px',
        border: 'none',
        backgroundColor: 'var(--primary-blue)',
        color: 'white',
        fontSize: 'var(--text-base)',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
    },
    stepHeader: {
        marginBottom: '32px',
    },
    stepTitle: {
        fontSize: '20px',
        fontWeight: '800',
        color: '#111827',
        margin: '0 0 4px 0',
    },
    stepSubtitle: {
        fontSize: '14px',
        color: '#6B7280',
        margin: 0,
    },
    timeGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '12px',
    },
    timeSlot: {
        padding: '14px',
        borderRadius: '12px',
        border: '1px solid #E5E7EB',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    reviewBox: {
        backgroundColor: '#F9FAFB',
        borderRadius: '20px',
        padding: '24px',
    },
    reviewMain: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '24px',
    },
    avatarLarge: {
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        backgroundColor: '#0066CC',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        fontWeight: '800',
    },
    reviewMeta: {
        display: 'flex',
        flexDirection: 'column',
    },
    reviewName: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#111827',
        margin: 0,
    },
    reviewSpec: {
        fontSize: '14px',
        color: '#6B7280',
        fontWeight: '600',
        margin: 0,
    },
    reviewGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '24px',
    },
    reviewItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    reviewIcon: {
        color: '#0066CC',
        fontSize: '20px',
    },
    reviewLabel: {
        fontSize: '12px',
        color: '#9CA3AF',
        fontWeight: '600',
        textTransform: 'uppercase',
        margin: 0,
    },
    reviewValue: {
        fontSize: '15px',
        color: '#111827',
        fontWeight: '700',
        margin: 0,
    },
    feeBreakdown: {
        marginTop: '24px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '16px',
    },
    feeRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px',
        color: '#6B7280',
        fontWeight: '600',
        marginBottom: '8px',
    },
    policyLabel: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        marginTop: '24px',
        fontSize: '13px',
        color: '#6B7280',
        cursor: 'pointer',
    },
    checkbox: {
        marginTop: '2px',
    },
    successHeader: {
        textAlign: 'center',
        marginBottom: '40px',
    },
    successIconBox: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#DCFCE7',
        color: '#22C55E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px auto',
    },
    successTitle: {
        fontSize: '24px',
        fontWeight: '800',
        color: '#111827',
        margin: '0 0 8px 0',
    },
    successSubtitle: {
        fontSize: '16px',
        color: '#6B7280',
        margin: 0,
    },
    detailsCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
    },
    refInfo: {},
    refLabel: {
        fontSize: '12px',
        color: '#9CA3AF',
        fontWeight: '600',
        textTransform: 'uppercase',
        margin: 0,
    },
    refValue: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#111827',
        margin: 0,
    },
    tokenBox: {
        textAlign: 'right',
    },
    tokenLabel: {
        fontSize: '12px',
        color: '#9CA3AF',
        fontWeight: '600',
        textTransform: 'uppercase',
        margin: 0,
    },
    tokenValue: {
        fontSize: '32px',
        fontWeight: '900',
        color: '#0066CC',
        margin: 0,
    },
    paymentSelection: {
        marginBottom: '40px',
    },
    payTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '20px',
    },
    payGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
    },
    payOptionBlue: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '16px',
        borderRadius: '16px',
        border: 'none',
        backgroundColor: '#0066CC',
        color: 'white',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 102, 204, 0.2)',
    },
    payOptionWhite: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '16px',
        borderRadius: '16px',
        border: '1px solid #E5E7EB',
        backgroundColor: 'white',
        color: '#374151',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
    },
    finalLinks: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
    },
    linkBtn: {
        width: '100%',
        padding: '14px',
        borderRadius: '12px',
        border: '1px solid #0066CC',
        backgroundColor: 'transparent',
        color: '#0066CC',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
    },
    linkText: {
        border: 'none',
        backgroundColor: 'transparent',
        color: '#6B7280',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        textDecoration: 'underline',
    }
};

export default ChannelDoctor;
