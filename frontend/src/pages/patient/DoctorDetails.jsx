import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { FiCalendar, FiClock, FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";

// Doctor availability data
const doctorAvailability = {
  1: { days: ["Monday", "Thursday"], times: ["6:00 PM", "7:00 PM", "8:00 PM"] },
  2: { days: ["Tuesday", "Friday"], times: ["5:30 PM", "6:30 PM", "7:30 PM"] },
  3: { days: ["Wednesday", "Saturday"], times: ["6:00 PM", "7:00 PM", "8:00 PM"] },
  4: { days: ["Monday", "Wednesday"], times: ["5:00 PM", "6:00 PM", "7:00 PM"] },
  5: { days: ["Tuesday", "Thursday"], times: ["6:00 PM", "7:00 PM", "8:00 PM"] },
  6: { days: ["Wednesday", "Friday"], times: ["5:30 PM", "6:30 PM", "7:30 PM"] },
  7: { days: ["Monday", "Saturday"], times: ["6:00 PM", "7:00 PM", "8:00 PM"] },
  8: { days: ["Thursday", "Saturday"], times: ["5:00 PM", "6:00 PM", "7:00 PM"] },
  9: { days: ["Tuesday", "Friday"], times: ["6:00 PM", "7:00 PM", "8:00 PM"] },
  10: { days: ["Wednesday", "Thursday"], times: ["5:30 PM", "6:30 PM", "7:30 PM"] }
};

function DoctorDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const doctor = location.state?.doctor;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const handleLogout = () => {
    console.log("User logged out");
    navigate("/");
  };

  if (!doctor) {
    navigate("/patient/find-doctor");
    return null;
  }

  const availability = doctorAvailability[doctor.id];

  // Calendar logic
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Check if a date is available
  const isDateAvailable = (day) => {
    if (!day) return false;
    const date = new Date(year, month, day);
    const dayName = dayNames[date.getDay()];
    return availability.days.some(availDay => availDay.startsWith(dayName));
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleDateClick = (day) => {
    if (isDateAvailable(day)) {
      setSelectedDate(day);
      setSelectedTime(null);
    }
  };

  const handleBookAppointment = () => {
    if (selectedDate && selectedTime) {
      const appointmentData = {
        doctor: doctor,
        date: new Date(year, month, selectedDate),
        time: selectedTime
      };
      navigate("/patient/confirm-booking", { state: { appointmentData } });
    } else {
      alert("Please select a date and time slot");
    }
  };

  const handleBack = () => {
    navigate("/patient/find-doctor");
  };

  return (
    <div style={styles.container}>
      <PatientSidebar onLogout={handleLogout} />

      <div style={styles.mainWrapper}>
        <PatientHeader patientName="Dithmi" />

        <main style={styles.mainContent}>
          {/* Back Button */}
          <button onClick={handleBack} style={styles.backButton}>
            <FiArrowLeft style={{ marginRight: '8px' }} />
            Back to Doctors
          </button>

          {/* Doctor Header */}
          <div style={styles.doctorHeader}>
            <div style={styles.doctorAvatar}>
              {doctor.name.charAt(3)}
            </div>
            <div>
              <h1 style={styles.doctorName}>{doctor.name}</h1>
              <p style={styles.doctorSpecialty}>{doctor.specialty}</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div style={styles.contentGrid}>
            {/* Availability Section */}
            <section style={styles.availabilitySection}>
              <h2 style={styles.sectionTitle}>
                <FiCalendar style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Select Date
              </h2>
              
              {/* Calendar */}
              <div style={styles.calendarContainer}>
                <div style={styles.calendarHeader}>
                  <button onClick={handlePrevMonth} style={styles.navButton}>
                    <FiChevronLeft size={24} />
                  </button>
                  <h3 style={styles.calendarMonth}>{monthNames[month]} {year}</h3>
                  <button onClick={handleNextMonth} style={styles.navButton}>
                    <FiChevronRight size={24} />
                  </button>
                </div>

                <div style={styles.calendarGrid}>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
                    <div key={i} style={styles.dayLabel}>{d}</div>
                  ))}
                  {cells.map((day, i) => {
                    const isAvailable = day && isDateAvailable(day);
                    const isSelected = selectedDate === day;
                    const isPast = day && new Date(year, month, day) < new Date().setHours(0, 0, 0, 0);
                    
                    return (
                      <div
                        key={i}
                        onClick={() => !isPast && handleDateClick(day)}
                        style={{
                          ...styles.dayCell,
                          ...(day ? styles.dayCellVisible : styles.emptyDay),
                          ...(isAvailable && !isPast ? styles.availableDay : {}),
                          ...(day && !isAvailable || isPast ? styles.unavailableDay : {}),
                          ...(isSelected ? styles.selectedDay : {})
                        }}
                      >
                        {day ?? ""}
                      </div>
                    );
                  })}
                </div>

                <div style={styles.calendarLegend}>
                  <div style={styles.legendItem}>
                    <div style={{...styles.legendBox, background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)'}}></div>
                    <span>Selected</span>
                  </div>
                  <div style={styles.legendItem}>
                    <div style={{...styles.legendBox, background: '#e0f2fe', border: '2px solid #0ea5e9'}}></div>
                    <span>Available</span>
                  </div>
                  <div style={styles.legendItem}>
                    <div style={{...styles.legendBox, background: '#f9fafb', border: '1px solid #e5e7eb'}}></div>
                    <span>Unavailable</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Time Slots Section */}
            <section style={styles.timeSlotsSection}>
              <h2 style={styles.sectionTitle}>
                <FiClock style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Select Time
              </h2>
              {selectedDate ? (
                <>
                  <p style={styles.selectedDateInfo}>
                    {monthNames[month]} {selectedDate}, {year}
                  </p>
                  <div style={styles.timeSlots}>
                    {availability.times.map((time, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedTime(time)}
                        style={{
                          ...styles.timeSlot,
                          ...(selectedTime === time ? styles.timeSlotSelected : {})
                        }}
                      >
                        <FiClock style={{ marginRight: '8px' }} />
                        <span>{time}</span>
                      </button>
                    ))}
                  </div>
                  
                  {selectedTime && (
                    <div style={styles.summaryCard}>
                      <h3 style={styles.summaryTitle}>Appointment Summary</h3>
                      <div style={styles.summaryItem}>
                        <span style={styles.summaryLabel}>Doctor:</span>
                        <span style={styles.summaryValue}>{doctor.name}</span>
                      </div>
                      <div style={styles.summaryItem}>
                        <span style={styles.summaryLabel}>Specialty:</span>
                        <span style={styles.summaryValue}>{doctor.specialty}</span>
                      </div>
                      <div style={styles.summaryItem}>
                        <span style={styles.summaryLabel}>Date:</span>
                        <span style={styles.summaryValue}>{monthNames[month]} {selectedDate}, {year}</span>
                      </div>
                      <div style={styles.summaryItem}>
                        <span style={styles.summaryLabel}>Time:</span>
                        <span style={styles.summaryValue}>{selectedTime}</span>
                      </div>
                      <button onClick={handleBookAppointment} style={styles.bookButton}>
                        Confirm Appointment
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div style={styles.emptyState}>
                  <FiCalendar size={64} style={styles.emptyStateIcon} />
                  <p style={styles.emptyStateText}>Please select a date from the calendar</p>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  mainContent: {
    flex: 1,
    padding: '32px',
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto'
  },
  backButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#0066CC',
    background: 'white',
    border: '2px solid #0066CC',
    borderRadius: '10px',
    cursor: 'pointer',
    marginBottom: '24px',
    transition: 'all 0.3s',
    boxShadow: '0 2px 8px rgba(0, 102, 204, 0.15)',
    display: 'flex',
    alignItems: 'center',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  doctorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    background: 'white',
    padding: '24px',
    borderRadius: '16px',
    marginBottom: '32px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 102, 204, 0.1)'
  },
  doctorAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: 'bold',
    color: 'white',
    boxShadow: '0 8px 24px rgba(0, 102, 204, 0.3)',
    flexShrink: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  doctorName: {
    fontSize: '28px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '0 0 4px 0',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  doctorSpecialty: {
    fontSize: '16px',
    color: '#0066CC',
    fontWeight: '600',
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '32px'
  },
  availabilitySection: {
    background: 'white',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 102, 204, 0.1)'
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 24px 0',
    display: 'flex',
    alignItems: 'center',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  calendarContainer: {
    width: '100%'
  },
  calendarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    padding: '0 8px'
  },
  navButton: {
    width: '44px',
    height: '44px',
    fontSize: '24px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.3)',
    transition: 'all 0.3s'
  },
  calendarMonth: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '10px',
    textAlign: 'center',
    marginBottom: '20px'
  },
  dayLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#6b7280',
    padding: '12px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  dayCell: {
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: '600',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    position: 'relative',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  dayCellVisible: {
    border: '2px solid #e5e7eb',
    background: '#f9fafb'
  },
  availableDay: {
    background: '#e0f2fe',
    border: '2px solid #0ea5e9',
    color: '#0369a1',
    fontWeight: '700'
  },
  unavailableDay: {
    color: '#d1d5db',
    cursor: 'not-allowed',
    background: '#f9fafb',
    border: '1px solid #f3f4f6'
  },
  selectedDay: {
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    color: 'white',
    border: '2px solid #0066CC',
    fontWeight: 'bold',
    boxShadow: '0 8px 20px rgba(0, 102, 204, 0.4)',
    transform: 'scale(1.05)'
  },
  emptyDay: {
    visibility: 'hidden'
  },
  calendarLegend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginTop: '24px',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '10px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  legendBox: {
    width: '20px',
    height: '20px',
    borderRadius: '6px'
  },
  timeSlotsSection: {
    background: 'white',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 102, 204, 0.1)',
    display: 'flex',
    flexDirection: 'column'
  },
  selectedDateInfo: {
    fontSize: '16px',
    color: '#0066CC',
    fontWeight: '600',
    marginBottom: '20px',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.08) 0%, rgba(0, 82, 163, 0.08) 100%)',
    borderRadius: '10px',
    border: '1px solid rgba(0, 102, 204, 0.2)',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  timeSlots: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '24px'
  },
  timeSlot: {
    padding: '16px',
    fontSize: '15px',
    fontWeight: '600',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    background: '#f9fafb',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  timeSlotSelected: {
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    color: 'white',
    border: '2px solid #0066CC',
    boxShadow: '0 8px 20px rgba(0, 102, 204, 0.4)',
    transform: 'scale(1.02)'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    flex: 1
  },
  emptyStateIcon: {
    color: '#9ca3af',
    marginBottom: '16px',
    opacity: 0.5
  },
  emptyStateText: {
    fontSize: '15px',
    color: '#9ca3af',
    textAlign: 'center',
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  summaryCard: {
    background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.05) 0%, rgba(0, 82, 163, 0.05) 100%)',
    padding: '24px',
    borderRadius: '12px',
    border: '2px solid rgba(0, 102, 204, 0.2)'
  },
  summaryTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 16px 0',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid rgba(0, 102, 204, 0.1)'
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#6b7280',
    fontWeight: '500',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  summaryValue: {
    fontSize: '14px',
    color: '#1f2937',
    fontWeight: '600',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  bookButton: {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '700',
    color: 'white',
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    marginTop: '20px',
    boxShadow: '0 8px 24px rgba(0, 102, 204, 0.4)',
    transition: 'all 0.3s',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

export default DoctorDetails;

