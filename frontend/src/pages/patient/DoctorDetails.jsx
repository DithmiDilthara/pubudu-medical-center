import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { 
  FiCalendar, FiClock, FiArrowLeft, FiChevronLeft, 
  FiChevronRight, FiInfo, FiCheckCircle, FiShield, FiUser
} from 'react-icons/fi';
import { motion, AnimatePresence } from "framer-motion";
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";

function DoctorDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const doctor = location.state?.doctor;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    if (doctor) {
      const fetchData = async () => {
        try {
          const doctorId = doctor.doctor_id || doctor.id;
          const authRes = await axios.get(`${API_URL}/doctors/${doctorId}/availability`);
          if (authRes.data.success) {
            setAvailabilities(authRes.data.data);
          }

          const token = localStorage.getItem('token');
          if (token) {
            const aptRes = await axios.get(`${API_URL}/appointments?doctor_id=${doctorId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (aptRes.data.success) {
              const relevant = aptRes.data.data.filter(a => a.doctor_id === parseInt(doctorId));
              setBookedSlots(relevant);
            }
          }
        } catch (error) {
          console.error("Error fetching doctor data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [doctor, API_URL]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!doctor) {
    navigate("/patient/find-doctor");
    return null;
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const dayNamesFull = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  const isDateAvailable = (day) => {
    if (!day) return false;
    const date = new Date(year, month, day);
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayName = dayNamesFull[date.getDay()].toUpperCase();

    // Check if there are ANY non-unavailable sessions (recurring or specific)
    return availabilities.some(a => {
      const isSpecific = a.schedule_date === formattedDate;
      const isRecurring = a.day_of_week?.toUpperCase() === dayName && !a.schedule_date && (!a.end_date || formattedDate <= a.end_date);
      return (isSpecific || isRecurring);
    });
  };

  const getTimeSlotsForDay = (day) => {
    if (!day) return [];
    const date = new Date(year, month, day);
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayName = dayNamesFull[date.getDay()].toUpperCase();

    // Combine and sort relevant sessions
    const dayAvails = availabilities.filter(a => {
      const isSpecific = a.schedule_date === formattedDate;
      const isRecurring = a.day_of_week?.toUpperCase() === dayName && !a.schedule_date && (!a.end_date || formattedDate <= a.end_date);
      return (isSpecific || isRecurring);
    }).sort((a, b) => a.start_time.localeCompare(b.start_time));

    // In whole-session booking, we just return the sessions themselves.
    // They are converted to a "slots" array with length 1 for UI compatibility,
    // or we can change the JSX to handle them directly.
    return dayAvails.map(session => ({
      id: session.schedule_id,
      startTime: session.start_time,
      endTime: session.end_time,
      timeRange: `${session.start_time} - ${session.end_time}`,
      isBooked: false 
    }));
  };

  const handleBookAppointment = () => {
    if (selectedDate && selectedSession) {
      const appointmentData = {
        doctor: doctor,
        date: new Date(year, month, selectedDate),
        time: selectedSession.timeRange,
        schedule_id: selectedSession.id
      };
      navigate("/patient/confirm-booking", { state: { appointmentData } });
    }
  };

  return (
    <div style={styles.container}>
      <PatientSidebar onLogout={handleLogout} />

      <div className="main-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <PatientHeader  />

        <main style={styles.mainContent}>
          {/* Top Bar with Back Link */}
          <div style={styles.topBar}>
            <button onClick={() => navigate(-1)} style={styles.backBtn}>
              <FiArrowLeft />
              Back to Specialists
            </button>
            <div style={styles.breadcrumb}>
              Find Doctor / <span style={{ color: "#2563eb", fontWeight: "700" }}>Specialist Details</span>
            </div>
          </div>

          {/* Doctor Hero Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.heroCard}
          >
            <div style={styles.heroLayout}>
              <div style={styles.doctorProfileBox}>
                <div style={styles.largeAvatar}>
                  {doctor.full_name?.charAt(0).toUpperCase()}
                </div>
                <div style={styles.heroMeta}>
                  <div style={styles.statusBadge}>
                    <FiShield style={{ marginRight: '6px' }} />
                    Board Certified specialist
                  </div>
                  <h1 style={styles.doctorName}>{doctor.full_name}</h1>
                  <p style={styles.specializationLabel}>{doctor.specialization}</p>
                </div>
              </div>
              <div style={styles.feeSummaryBox}>
                <p style={styles.feeTitle}>Channeling Fee</p>
                <h2 style={styles.feeAmount}>LKR {Number(doctor.doctor_fee).toLocaleString()}</h2>
                <div style={styles.feeNote}>Includes center taxes and processing fees</div>
              </div>
            </div>
          </motion.div>

          <div style={styles.bookingLayout}>
            {/* Left Column: Calendar Selection */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              style={styles.calendarSection}
            >
              <div style={styles.sectionHeader}>
                <FiCalendar style={styles.sectionIcon} />
                <h3 style={styles.sectionTitleText}>1. Appointment Date</h3>
              </div>
              
              <div style={styles.calendarBlock}>
                <div style={styles.calendarControls}>
                  <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} style={styles.navBtn}>
                    <FiChevronLeft />
                  </button>
                  <h4 style={styles.monthLabel}>{monthNames[month]} {year}</h4>
                  <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} style={styles.navBtn}>
                    <FiChevronRight />
                  </button>
                </div>

                <div style={styles.calendarGrid}>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                    <div key={d} style={styles.dayHeader}>{d}</div>
                  ))}
                  {cells.map((day, i) => {
                    const available = day && isDateAvailable(day);
                    const selected = selectedDate === day;
                    const past = day && new Date(year, month, day) < new Date().setHours(0,0,0,0);
                    
                    return (
                      <div
                        key={i}
                        onClick={() => day && available && !past && setSelectedDate(day)}
                        style={{
                          ...styles.dayCell,
                          ...(day ? styles.dayVisible : styles.dayEmpty),
                          ...(available && !past ? styles.dayAvailable : styles.dayDisabled),
                          ...(selected ? styles.daySelected : {})
                        }}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={styles.calendarLegend}>
                <div style={styles.legendItem}><div style={{...styles.legendDot, backgroundColor: '#eff6ff', border: '1px solid #2563eb'}}></div> Available</div>
                <div style={styles.legendItem}><div style={{...styles.legendDot, backgroundColor: '#2563eb'}}></div> Selected</div>
                <div style={styles.legendItem}><div style={{...styles.legendDot, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0'}}></div> Booked/Off</div>
              </div>
            </motion.div>

            {/* Right Column: Time Selection & Actions */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={styles.actionSection}
            >
              <div style={styles.sectionHeader}>
                <FiClock style={styles.sectionIcon} />
                <h3 style={styles.sectionTitleText}>2. Available Slots</h3>
              </div>

              <AnimatePresence mode="wait">
                {selectedDate ? (
                  <motion.div 
                    key={selectedDate}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={styles.slotsWrapper}
                  >
                    <div style={styles.dateBanner}>
                      Slots for <span style={{ fontWeight: 700 }}>{monthNames[month]} {selectedDate}</span>
                    </div>
                    
                    <div style={styles.sessionsContainer}>
                      {getTimeSlotsForDay(selectedDate).map((session, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => setSelectedSession(session)}
                          style={{
                            ...styles.sessionUnitCard,
                            ...(selectedSession?.id === session.id ? styles.sessionSelected : {})
                          }}
                        >
                          <div style={styles.sessionUnitHeader}>
                            <FiClock style={{ fontSize: '20px' }} />
                            <span style={styles.sessionUnitName}>Channeling Session</span>
                          </div>
                          <div style={styles.sessionUnitTime}>
                            {session.timeRange}
                          </div>
                          <div style={styles.sessionUnitAction}>
                            {selectedSession?.id === session.id ? "Selected for Booking" : "Click to Select Session"}
                          </div>
                        </button>
                      ))}
                    </div>

                    {selectedTime && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={styles.summaryBox}
                      >
                        <h4 style={styles.summaryTitle}>Booking Summary</h4>
                        <div style={styles.summaryRow}>
                          <span style={styles.summaryLabel}>Selected Time:</span>
                          <span style={styles.summaryValue}>{selectedTime}</span>
                        </div>
                        <div style={styles.summaryRow}>
                          <span style={styles.summaryLabel}>Specialist:</span>
                          <span style={styles.summaryValue}>{doctor.full_name}</span>
                        </div>
                        <button onClick={handleBookAppointment} style={styles.finalBookBtn}>
                          Confirm & Proceed
                          <FiChevronRight style={{ marginLeft: '8px' }} />
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}><FiCalendar /></div>
                    <p>Select a date from the calendar to view available channeling slots.</p>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', sans-serif",
  },
  mainContent: {
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    overflowY: "auto",
    flex: 1,
    maxWidth: "1250px",
    margin: "0 auto"
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px"
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "700",
    border: "none",
    background: "none",
    cursor: "pointer",
    transition: "color 0.2s"
  },
  breadcrumb: {
    fontSize: "13px",
    color: "#94a3b8",
    fontWeight: "500"
  },
  heroCard: {
    backgroundColor: "white",
    borderRadius: "28px",
    padding: "40px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)"
  },
  heroLayout: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "40px"
  },
  doctorProfileBox: {
    display: "flex",
    alignItems: "center",
    gap: "32px"
  },
  largeAvatar: {
    width: "100px",
    height: "100px",
    borderRadius: "32px",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "44px",
    fontWeight: "800",
    boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.15)"
  },
  heroMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: "700",
    color: "#10b981",
    backgroundColor: "#f0fdf4",
    padding: "6px 12px",
    borderRadius: "100px",
    width: "fit-content",
    marginBottom: "4px"
  },
  doctorName: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.5px"
  },
  specializationLabel: {
    fontSize: "16px",
    color: "#2563eb",
    fontWeight: "600",
    margin: 0
  },
  feeSummaryBox: {
    padding: "24px 32px",
    backgroundColor: "#f8fafc",
    borderRadius: "24px",
    textAlign: "right",
    minWidth: "260px"
  },
  feeTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "0 0 4px 0"
  },
  feeAmount: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 6px 0"
  },
  feeNote: {
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: "500"
  },
  bookingLayout: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    gap: "32px",
    alignItems: "flex-start"
  },
  calendarSection: {
    backgroundColor: "white",
    borderRadius: "28px",
    padding: "32px",
    border: "2px solid #2563eb", // Blue outline
    boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.1)"
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "28px",
    paddingBottom: "16px",
    borderBottom: "1px solid #f8fafc"
  },
  sectionIcon: {
    fontSize: "20px",
    color: "#2563eb"
  },
  sectionTitleText: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0
  },
  calendarBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  calendarControls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2563eb", // Blue header
    padding: "16px",
    borderRadius: "16px",
    marginBottom: "16px",
    border: "none"
  },
  navBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "18px",
    color: "#ffffff",
    transition: "all 0.2s"
  },
  monthLabel: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#ffffff",
    margin: 0
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "8px",
    textAlign: "center"
  },
  dayHeader: {
    fontSize: "11px",
    fontWeight: "800",
    color: "#cbd5e1",
    textTransform: "uppercase",
    paddingBottom: "8px"
  },
  dayCell: {
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  dayVisible: {
    backgroundColor: "#f8fafc",
    color: "#475569"
  },
  dayAvailable: {
    backgroundColor: "#eff6ff",
    color: "#2563eb"
  },
  daySelected: {
    backgroundColor: "#2563eb",
    color: "white",
    boxShadow: "0 8px 16px -4px rgba(37, 99, 235, 0.4)",
    transform: "scale(1.05)"
  },
  dayDisabled: {
    color: "#cbd5e1",
    cursor: "not-allowed",
    opacity: 0.5
  },
  dayEmpty: {
    visibility: "hidden"
  },
  calendarLegend: {
    marginTop: "24px",
    display: "flex",
    gap: "20px",
    justifyContent: "center"
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#94a3b8"
  },
  legendDot: {
    width: "12px",
    height: "12px",
    borderRadius: "4px"
  },
  actionSection: {
    backgroundColor: "white",
    borderRadius: "28px",
    padding: "32px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
    minHeight: "440px"
  },
  slotsWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  dateBanner: {
    padding: "14px 20px",
    backgroundColor: "#f8fafc",
    borderRadius: "14px",
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "16px"
  },
  sessionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },
  sessionUnitCard: {
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "20px",
    border: "2px solid #f1f5f9",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "100%",
    outline: "none"
  },
  sessionSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.1)"
  },
  sessionUnitHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#1e40af"
  },
  sessionUnitName: {
    fontSize: "16px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  sessionUnitTime: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#0f172a",
    marginLeft: "32px"
  },
  sessionUnitAction: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#2563eb",
    marginLeft: "32px",
    marginTop: "4px",
    padding: "6px 12px",
    backgroundColor: "#eff6ff",
    borderRadius: "8px",
    alignSelf: "flex-start"
  },
  slotsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px"
  },
  timeSlot: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    backgroundColor: "white",
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  slotSelected: {
    backgroundColor: "#eff6ff",
    borderColor: "#2563eb",
    color: "#2563eb",
    boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.05)"
  },
  slotBooked: {
    opacity: 0.4,
    cursor: "not-allowed",
    backgroundColor: "#f1f5f9"
  },
  summaryBox: {
    marginTop: "20px",
    padding: "32px",
    backgroundColor: "#eff6ff",
    borderRadius: "24px",
    border: "1px solid #dbeafe"
  },
  summaryTitle: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#1e3a8a",
    margin: "0 0 16px 0"
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px"
  },
  summaryLabel: {
    fontSize: "13px",
    color: "#3b82f6",
    fontWeight: "600"
  },
  summaryValue: {
    fontSize: "13px",
    color: "#1e40af",
    fontWeight: "700"
  },
  finalBookBtn: {
    width: "100%",
    padding: "18px",
    marginTop: "24px",
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
    boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.3)",
    transition: "all 0.3s"
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "60px 20px",
    color: "#94a3b8",
    gap: "16px"
  },
  emptyIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "20px",
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px"
  }
};

export default DoctorDetails;
