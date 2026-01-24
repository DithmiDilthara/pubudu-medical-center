import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiMinus, FiX } from 'react-icons/fi';
import DoctorHeader from '../../components/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';

function DoctorAvailability() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('20:00');
  const [blockReason, setBlockReason] = useState('');
  const [recurringDays, setRecurringDays] = useState([]);

  // Sample availability data - In real app, this would come from database
  const [availability, setAvailability] = useState({
    '2024-01-15': { status: 'available', startTime: '18:00', endTime: '20:00' },
    '2024-01-17': { status: 'available', startTime: '18:00', endTime: '20:00' },
    '2024-01-22': { status: 'available', startTime: '18:00', endTime: '20:00' },
    '2024-01-24': { status: 'available', startTime: '18:00', endTime: '20:00' },
    '2024-01-29': { status: 'available', startTime: '18:00', endTime: '20:00' },
    '2024-01-31': { status: 'available', startTime: '18:00', endTime: '20:00' },
    '2024-01-10': { status: 'half-day', startTime: '18:00', endTime: '19:00', reason: 'Personal appointment' },
    '2024-01-18': { status: 'unavailable', reason: 'Medical Conference' }
  });

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

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={styles.calendarDayEmpty} />);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayAvailability = availability[dateKey];
      const isSelected = selectedDate === dateKey;

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(dateKey)}
          style={{
            ...styles.calendarDay,
            ...(isSelected ? styles.calendarDaySelected : {}),
            ...(dayAvailability?.status === 'available' ? styles.calendarDayAvailable : {}),
            ...(dayAvailability?.status === 'half-day' ? styles.calendarDayHalfDay : {}),
            ...(dayAvailability?.status === 'unavailable' ? styles.calendarDayUnavailable : {})
          }}
        >
          <span style={styles.calendarDayNumber}>{day}</span>
          {dayAvailability && (
            <span style={styles.calendarDayStatus}>
              {dayAvailability.status === 'available' && <FiCheck />}
              {dayAvailability.status === 'half-day' && <FiMinus />}
              {dayAvailability.status === 'unavailable' && <FiX />}
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

  const handleSetAvailability = (status) => {
    if (!selectedDate) {
      alert('Please select a date first');
      return;
    }

    const newAvailability = { ...availability };
    if (status === 'available') {
      newAvailability[selectedDate] = {
        status: 'available',
        startTime,
        endTime
      };
    } else if (status === 'half-day') {
      newAvailability[selectedDate] = {
        status: 'half-day',
        startTime,
        endTime,
        reason: blockReason || 'Partially available'
      };
    } else if (status === 'unavailable') {
      newAvailability[selectedDate] = {
        status: 'unavailable',
        reason: blockReason || 'Not available'
      };
    }

    setAvailability(newAvailability);
    alert(`Availability set for ${selectedDate}`);
  };

  const handleToggleRecurringDay = (dayIndex) => {
    if (recurringDays.includes(dayIndex)) {
      setRecurringDays(recurringDays.filter(d => d !== dayIndex));
    } else {
      setRecurringDays([...recurringDays, dayIndex]);
    }
  };

  const handleApplyRecurring = () => {
    if (recurringDays.length === 0) {
      alert('Please select at least one day');
      return;
    }

    const newAvailability = { ...availability };
    const today = new Date();
    const endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0); // Next 3 months

    for (let date = new Date(today); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust so Monday is 0

      if (recurringDays.includes(adjustedDay)) {
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        newAvailability[dateKey] = {
          status: 'available',
          startTime,
          endTime
        };
      }
    }

    setAvailability(newAvailability);
    alert(`Recurring availability set for the next 3 months on ${recurringDays.map(i => daysOfWeek[i]).join(', ')}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={styles.pageContainer}>
      <DoctorSidebar onLogout={handleLogout} />
      
      <div style={styles.mainContainer}>
        <DoctorHeader />

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
                <div style={{...styles.legendBox, background: '#10b981'}} />
                <span style={styles.legendText}>Available</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{...styles.legendBox, background: '#f59e0b'}} />
                <span style={styles.legendText}>Half Day</span>
              </div>
              <div style={styles.legendItem}>
                <div style={{...styles.legendBox, background: '#ef4444'}} />
                <span style={styles.legendText}>Unavailable</span>
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
                  style={{...styles.actionButton, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}}
                >
                  Mark as Available
                </button>
                <button
                  onClick={() => handleSetAvailability('half-day')}
                  style={{...styles.actionButton, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}
                >
                  Mark as Half Day
                </button>
                <button
                  onClick={() => handleSetAvailability('unavailable')}
                  style={{...styles.actionButton, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}}
                >
                  Mark as Unavailable
                </button>
              </div>
            </div>

            {/* Block Out Time */}
            <div style={styles.settingsCard}>
              <h3 style={styles.settingsTitle}>Block Out Time / Add Reason</h3>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Reason (Optional)</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g., Conference, Personal appointment"
                  style={styles.textInput}
                />
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
              <button onClick={handleApplyRecurring} style={styles.applyRecurringButton}>
                Apply for Next 3 Months
              </button>
            </div>
          </section>
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
    color: '#8b9dff',
    background: 'white',
    border: '2px solid #8b9dff',
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
    background: 'rgba(139, 157, 255, 0.08)',
    borderRadius: '8px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  calendarDay: {
    aspectRatio: '1',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    background: 'white'
  },
  calendarDayEmpty: {
    aspectRatio: '1'
  },
  calendarDayNumber: {
    fontSize: '16px',
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
  calendarDayHalfDay: {
    background: 'rgba(245, 158, 11, 0.1)',
    borderColor: '#f59e0b'
  },
  calendarDayUnavailable: {
    background: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#ef4444'
  },
  calendarDaySelected: {
    borderColor: '#8b9dff',
    borderWidth: '3px',
    boxShadow: '0 0 0 3px rgba(139, 157, 255, 0.2)'
  },
  selectedDateInfo: {
    marginTop: '20px',
    padding: '16px',
    background: 'rgba(139, 157, 255, 0.08)',
    borderRadius: '8px',
    fontSize: '15px',
    color: '#1f2937',
    textAlign: 'center',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  currentStatus: {
    marginLeft: '12px',
    color: '#8b9dff',
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
    border: '1px solid rgba(102, 126, 234, 0.1)'
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
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  dayButtonActive: {
    background: '#8b9dff',
    color: 'white',
    borderColor: '#8b9dff'
  },
  applyRecurringButton: {
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '700',
    color: 'white',
    background: '#8b9dff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(139, 157, 255, 0.4)',
    transition: 'all 0.3s',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

export default DoctorAvailability;
