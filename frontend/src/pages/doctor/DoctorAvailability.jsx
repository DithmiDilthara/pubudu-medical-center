import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiCheck } from 'react-icons/fi';
import DoctorHeader from '../../components/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';

function DoctorAvailability() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('20:00');
  const [recurringDays, setRecurringDays] = useState([]);
  const [doctorName, setDoctorName] = useState('Doctor');

  const [availability, setAvailability] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchAvailability = async () => {
    try {
      const token = localStorage.getItem('token');

      const profileRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (profileRes.data.success) {
        setDoctorName(profileRes.data.data.profile.full_name);
        const doctorId = profileRes.data.data.profile.doctor_id;
        const availabilityRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/doctors/${doctorId}/availability`);

        if (availabilityRes.data.success) {
          const availData = availabilityRes.data.data;

          // Map recurring days
          const recurringArr = [...new Set(availData
            .filter(a => a.day_of_week && !a.specific_date)
            .map(a => {
              const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
              return days.indexOf(a.day_of_week);
            }))];
          setRecurringDays(recurringArr);

          // Map specific dates
          const specificAvail = {};
          availData.filter(a => a.specific_date).forEach(a => {
            specificAvail[a.specific_date] = {
              status: a.session_name === 'Available' ? 'available' : a.session_name === 'Half Day' ? 'half-day' : 'unavailable',
              startTime: a.start_time,
              endTime: a.end_time,
              reason: a.session_name
            };
          });
          setAvailability(specificAvail);
        }
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
    }
  };

  // Fetch availability on mount
  useEffect(() => {
    fetchAvailability();
  }, []);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust so Monday is 0
  };

  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={styles.calendarDayEmpty} />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(selectedYear, selectedMonth, day);
      const dayOfWeekIndex = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1;

      const isRecurring = recurringDays.includes(dayOfWeekIndex);
      const dayAvailability = availability[dateKey] || (isRecurring ? { status: 'available', startTime: 'Recurring' } : null);
      const isSelected = selectedDate === dateKey;
      const isPast = dateObj < today;

      days.push(
        <div
          key={day}
          onClick={() => !isPast && setSelectedDate(dateKey)}
          style={{
            ...styles.calendarDay,
            ...(isPast ? styles.calendarDayPast : {}),
            ...(!isPast && isSelected ? styles.calendarDaySelected : {}),
            ...(!isPast && dayAvailability?.status === 'available' ? styles.calendarDayAvailable : {}),
            ...(!isPast && dayAvailability?.status === 'unavailable' ? styles.calendarDayUnavailable : {})
          }}
        >
          <span style={{ ...styles.calendarDayNumber, ...(isPast ? styles.textPast : {}) }}>{day}</span>
          {!isPast && dayAvailability && dayAvailability.status === 'available' && (
            <span style={styles.calendarDayStatus}>
              <FiCheck />
            </span>
          )}
        </div>
      );
    }

    return days;
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleSetAvailability = async (status) => {
    if (!selectedDate) {
      alert('Please select a date first');
      return;
    }

    if (!startTime || !endTime) {
      alert('Please ensure start and end times are set');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Prevent past dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateObj = new Date(selectedDate);
      if (selectedDateObj < today) {
        alert('Cannot manage availability for past dates');
        setIsLoading(false);
        return;
      }

      const availabilityPayload = [{
        specific_date: selectedDate,
        day_of_week: null, // Specific date takes priority
        start_time: startTime,
        end_time: endTime,
        session_name: status === 'available' ? 'Available' : 'Unavailable'
      }];

      // If status is unavailable, maybe we just want to remove availability for that day
      // But the backend destroy logic I wrote will handle it if the payload is empty for that date?
      // No, my backend logic replaces specific dates with whatever is in the payload.

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/clinical/availability`,
        { availability: availabilityPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Local update
        const newAvailability = { ...availability };
        if (status === 'DELETED') {
          delete newAvailability[selectedDate];
        } else {
          newAvailability[selectedDate] = {
            status,
            startTime,
            endTime
          };
        }
        setAvailability(newAvailability);

        // Success/Cancellation messages - REPLACED with non-blocking feedback (or just visual change)
        // User requested no alerts and immediate green color.
        // We rely on the local state update above to show the green color immediately.

        // Refresh data in background to ensure sync, but UI should already be updated locally
        await fetchAvailability();
      }
    } catch (error) {
      console.error("Save single day availability error:", error);
      const outputMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      alert(`Failed to save availability: ${outputMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRecurringDay = (dayIndex) => {
    if (recurringDays.includes(dayIndex)) {
      setRecurringDays(recurringDays.filter(d => d !== dayIndex));
    } else {
      setRecurringDays([...recurringDays, dayIndex]);
    }
  };

  const handleApplyRecurring = async () => {
    if (recurringDays.length === 0) {
      alert('Please select at least one day');
      return;
    }

    setIsLoading(true);
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const availabilityPayload = recurringDays.map(index => ({
      day_of_week: days[index],
      start_time: startTime,
      end_time: endTime,
      session_name: "Regular Session"
    }));

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/clinical/availability`,
        { availability: availabilityPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Recurring availability saved to database!');
        fetchAvailability();
      }
    } catch (error) {
      console.error("Save availability error:", error);
      const outputMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      alert(`Failed to save availability: ${outputMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAllRecurring = async () => {
    if (!window.confirm('Are you sure you want to cancel all recurring availability?')) {
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/clinical/availability`,
        { availability: [], clear_all_recurring: true }, // Explicit flag
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Recurring availability cancelled successfully');
        setRecurringDays([]);
        fetchAvailability();
      }
    } catch (error) {
      console.error("Cancel recurring error:", error);
      const outputMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      alert(`Failed to cancel recurring availability: ${outputMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={styles.pageContainer}>
      <DoctorSidebar onLogout={handleLogout} />

      <div style={styles.mainContainer}>
        <DoctorHeader doctorName={doctorName} />

        <main style={styles.mainContent}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>Availability Management</h1>
              <p style={styles.pageSubtitle}>Set your working hours and manage your schedule</p>
            </div>
          </div>

          <div style={styles.content}>
            {/* Calendar Section */}
            <section style={styles.calendarSection}>
              <div style={styles.calendarHeader}>
                <button onClick={handlePrevMonth} style={styles.monthButton}>&lt;</button>
                <h2 style={styles.monthTitle}>{monthNames[selectedMonth]} {selectedYear}</h2>
                <button onClick={handleNextMonth} style={styles.monthButton}>&gt;</button>
              </div>

              <div style={styles.legend}>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendBox, background: '#10b981' }} />
                  <span style={styles.legendText}>Available</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendBox, background: '#f9fafb', border: '2px solid #e5e7eb' }} />
                  <span style={styles.legendText}>Unavailable / Not Set</span>
                </div>
              </div>

              <div style={styles.calendarGrid}>
                {daysOfWeek.map(day => (
                  <div key={day} style={styles.calendarDayHeader}>{day}</div>
                ))}
                {generateCalendar()}
              </div>

              {selectedDate && (
                <div style={styles.selectedDateInfo}>
                  Selected Date: <strong>{selectedDate}</strong>
                  {availability[selectedDate] && (
                    <span style={styles.currentStatus}>
                      Current: {availability[selectedDate].status}
                      {availability[selectedDate].startTime && ` (${availability[selectedDate].startTime} - ${availability[selectedDate].endTime})`}
                    </span>
                  )}
                </div>
              )}
            </section>

            {/* Settings Section */}
            <section style={styles.settingsSection}>
              {/* Time Slots */}
              <div style={styles.settingsCard}>
                <h3 style={styles.settingsTitle}>Time Slots</h3>
                <div style={styles.timeInputs}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      style={styles.timeInput}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      style={styles.timeInput}
                    />
                  </div>
                </div>
              </div>

              {/* Availability Actions */}
              <div style={styles.settingsCard}>
                <h3 style={styles.settingsTitle}>Set Availability</h3>
                <div style={styles.actionButtons}>
                  <button
                    onClick={() => handleSetAvailability('available')}
                    style={{ ...styles.actionButton, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  >
                    Mark as Available
                  </button>
                  <button
                    onClick={() => handleSetAvailability('unavailable')}
                    style={{ ...styles.actionButton, background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' }}
                  >
                    Cancel Session for this Date
                  </button>
                </div>
              </div>

              {/* Recurring Availability */}
              <div style={styles.settingsCard}>
                <h3 style={styles.settingsTitle}>Set Recurring Availability</h3>
                <p style={styles.recurringSubtitle}>Select days of the week for recurring availability</p>
                <div style={styles.dayButtons}>
                  {daysOfWeek.map((day, index) => (
                    <button
                      key={day}
                      onClick={() => handleToggleRecurringDay(index)}
                      style={{
                        ...styles.dayButton,
                        ...(recurringDays.includes(index) ? styles.dayButtonActive : {})
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <div style={styles.recurringActions}>
                  <button onClick={handleApplyRecurring} style={styles.applyRecurringButton}>
                    Apply for Next 3 Months
                  </button>
                  <button
                    onClick={handleCancelAllRecurring}
                    style={{ ...styles.applyRecurringButton, background: '#ef4444', marginTop: '12px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
                  >
                    Cancel All Recurring Availability
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div style={styles.footer}>
            <button
              onClick={() => navigate("/doctor/dashboard")}
              style={styles.backButton}
            >
              Back
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  mainContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },
  mainContent: {
    flex: 1,
    padding: '32px',
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto'
  },
  header: {
    marginBottom: '24px'
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 8px 0',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px'
  },
  calendarSection: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e5e7eb'
  },
  calendarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px'
  },
  monthButton: {
    padding: '8px 16px',
    fontSize: '18px',
    fontWeight: '700',
    color: '#0066CC',
    background: 'white',
    border: '2px solid #0066CC',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  monthTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0
  },
  legend: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    justifyContent: 'center'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  legendBox: {
    width: '20px',
    height: '20px',
    borderRadius: '4px'
  },
  legendText: {
    fontSize: '14px',
    color: '#6b7280'
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px'
  },
  calendarDayHeader: {
    padding: '12px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    background: 'rgba(0, 102, 204, 0.08)',
    borderRadius: '8px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  calendarDay: {
    aspectRatio: '1',
    padding: '4px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#e5e7eb',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    background: 'white',
    height: '60px' // Check if this fixes "big" issue
  },
  calendarDayPast: {
    background: '#f3f4f6',
    cursor: 'not-allowed',
    borderColor: '#e5e7eb',
    opacity: 0.7
  },
  textPast: {
    color: '#9ca3af'
  },
  calendarDayEmpty: {
    aspectRatio: '1'
  },
  calendarDayNumber: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937'
  },
  calendarDayStatus: {
    fontSize: '12px',
    marginTop: '4px'
  },
  calendarDayAvailable: {
    background: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10b981'
  },
  calendarDayUnavailable: {
    background: '#f9fafb',
    borderColor: '#e5e7eb'
  },
  calendarDaySelected: {
    borderColor: '#0066CC',
    borderWidth: '3px',
    boxShadow: '0 0 0 3px rgba(0, 102, 204, 0.2)'
  },
  selectedDateInfo: {
    marginTop: '20px',
    padding: '16px',
    background: 'rgba(0, 102, 204, 0.08)',
    borderRadius: '8px',
    fontSize: '15px',
    color: '#1f2937',
    textAlign: 'center',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  currentStatus: {
    marginLeft: '12px',
    color: '#0066CC',
    fontWeight: '600',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  settingsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  settingsCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 102, 204, 0.1)'
  },
  settingsTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 0,
    marginBottom: '16px'
  },
  timeInputs: {
    display: 'flex',
    gap: '12px'
  },
  inputGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  timeInput: {
    padding: '10px',
    fontSize: '15px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.3s'
  },
  textInput: {
    padding: '10px',
    fontSize: '15px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.3s',
    width: '100%',
    boxSizing: 'border-box'
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  actionButton: {
    padding: '12px',
    fontSize: '15px',
    fontWeight: '700',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  recurringSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: 0,
    marginBottom: '12px'
  },
  dayButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
    marginBottom: '16px'
  },
  dayButton: {
    padding: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    background: 'white',
    borderStyle: 'solid',
    borderWidth: '2px',
    borderColor: '#e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  dayButtonActive: {
    background: '#0066CC',
    color: 'white',
    borderColor: '#0066CC'
  },
  applyRecurringButton: {
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '700',
    color: 'white',
    background: '#0066CC',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 102, 204, 0.4)',
    transition: 'all 0.3s',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  footer: {
    marginTop: '32px',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingBottom: '20px'
  },
  backButton: {
    padding: '10px 24px',
    border: 'none',
    borderRadius: '6px',
    background: '#0066CC',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 102, 204, 0.2)',
    transition: 'all 0.2s',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

export default DoctorAvailability;

