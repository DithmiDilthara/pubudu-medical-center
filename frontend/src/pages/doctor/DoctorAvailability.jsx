import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCheck, 
  FiClock, 
  FiCalendar, 
  FiChevronLeft, 
  FiChevronRight, 
  FiTrash2, 
  FiPlus, 
  FiAlertCircle,
  FiInfo,
  FiCornerDownRight
} from 'react-icons/fi';
import DoctorHeader from '../../components/DoctorHeader';
import DoctorSidebar from '../../components/DoctorSidebar';
import ClockTimePicker from '../../components/ClockTimePicker';
import ConfirmationModal from '../../components/ConfirmationModal';
import { toast } from 'react-hot-toast';

function DoctorAvailability() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // New Add Session State
  const [bookingType, setBookingType] = useState('ONE-TIME'); // 'ONE-TIME' or 'RECURRING'
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // For recurring
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [endDate, setEndDate] = useState(''); // For recurring end

  const [doctorName, setDoctorName] = useState('Doctor');
  const [rawAvailability, setRawAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

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
          setRawAvailability(availabilityRes.data.data);
        }
      }
    } catch (error) {
      console.error("Error fetching availability:", error);
      toast.error("Failed to load availability data.");
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Process raw availability for calendar view
  const availabilityMap = useMemo(() => {
    const map = {};
    const todayStr = today.toISOString().split('T')[0];
    
    rawAvailability.forEach(a => {
      if (a.schedule_date) {
        if (!map[a.schedule_date]) map[a.schedule_date] = [];
        map[a.schedule_date].push(a);
      } else if (a.day_of_week) {
        if (!map[a.day_of_week]) map[a.day_of_week] = [];
        map[a.day_of_week].push(a);
      }
    });
    return map;
  }, [rawAvailability, today]);

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push({ type: 'empty', id: `empty-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(selectedYear, selectedMonth, day);
      const dayOfWeekIndex = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1;
      const dayOfWeekName = fullDays[dayOfWeekIndex];
      
      const specific = availabilityMap[dateKey] || [];
      const recurring = availabilityMap[dayOfWeekName] || [];
      
      days.push({
        type: 'day',
        day,
        dateKey,
        dateObj,
        isPast: dateObj < today,
        sessions: [...recurring, ...specific],
        isSelected: selectedDate === dateKey
      });
    }
    return days;
  }, [selectedMonth, selectedYear, availabilityMap, selectedDate, today]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(v => v - 1);
    } else {
      setSelectedMonth(v => v - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(v => v + 1);
    } else {
      setSelectedMonth(v => v + 1);
    }
    setSelectedDate(null);
  };

  const handleAddSession = async () => {
    if (bookingType === 'ONE-TIME' && !selectedDate) {
      toast.error("Please select a date on the calendar first!");
      return;
    }

    if (startTime >= endTime) {
      toast.error("End time must be after start time.");
      return;
    }

    // ENFORCE OPERATING HOURS: 07:00 - 21:00
    if (startTime < '07:00' || endTime > '21:00') {
      toast.error("Sessions must be within operating hours (7:00 AM – 9:00 PM)");
      return;
    }

    // ENFORCE MINIMUM DURATION: 1 HOUR
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const durationMinutes = (end - start) / (1000 * 60);
    
    if (durationMinutes < 60) {
      toast.error("Session duration must be at least 1 hour");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        availability: [{
          schedule_date: bookingType === 'ONE-TIME' ? selectedDate : null,
          day_of_week: bookingType === 'RECURRING' ? fullDays[selectedDayIndex] : null,
          start_time: startTime,
          end_time: endTime,
          end_date: bookingType === 'RECURRING' ? endDate || null : null
        }]
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/clinical/availability`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Session added successfully");
        await fetchAvailability();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add session.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/clinical/availability/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Session deleted");
        await fetchAvailability();
      }
    } catch (error) {
      toast.error("Failed to delete session");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const currentDaySessions = useMemo(() => {
    if (!selectedDate) return [];
    const dateObj = new Date(selectedDate);
    const dayOfWeekIndex = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1;
    const dayOfWeekName = fullDays[dayOfWeekIndex];
    
    return [
      ...(availabilityMap[dayOfWeekName] || []),
      ...(availabilityMap[selectedDate] || [])
    ].sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [selectedDate, availabilityMap]);

  return (
    <div style={styles.pageContainer}>
      <DoctorSidebar onLogout={handleLogout} />

      <div className="main-wrapper" style={styles.mainWrapper}>
        <DoctorHeader doctorName={doctorName} />

        <main style={styles.contentPadding}>
          <div style={styles.headerRow}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 style={styles.pageTitle}>Schedule & Availability</h1>
              <p style={styles.pageSubtitle}>Precision management of multiple clinical sessions</p>
            </motion.div>
          </div>

          <div style={styles.gridContainer}>
            {/* Left: Calendar & Session List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={styles.calendarCard}>
                <div style={styles.calendarHeader}>
                  <h2 style={styles.monthTitle}>{monthNames[selectedMonth]} {selectedYear}</h2>
                  <div style={styles.calendarNav}>
                    <button onClick={handlePrevMonth} style={styles.iconBtn}><FiChevronLeft size={20} /></button>
                    <button onClick={() => { setSelectedMonth(new Date().getMonth()); setSelectedYear(new Date().getFullYear()); }} style={styles.todayBtn}>Today</button>
                    <button onClick={handleNextMonth} style={styles.iconBtn}><FiChevronRight size={20} /></button>
                  </div>
                </div>

                <div style={styles.calendarGrid}>
                  {daysOfWeek.map(day => <div key={day} style={styles.dayHeaderCell}>{day}</div>)}
                  {calendarDays.map((item, idx) => (
                    item.type === 'empty' ? <div key={item.id} style={styles.emptyCell} /> : (
                      <motion.button
                        key={item.dateKey}
                        onClick={() => !item.isPast && setSelectedDate(item.dateKey)}
                        style={{
                          ...styles.dayCell,
                          ...(item.isPast ? styles.pastCell : {}),
                          ...(item.isSelected ? styles.selectedCell : {}),
                          ...(item.sessions.length > 0 && !item.isSelected ? (
                            item.sessions.some(s => !s.schedule_date) ? styles.recurringDay : styles.availableDay
                          ) : {})
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: '700', color: item.isSelected ? '#1d4ed8' : (item.isPast ? '#94a3b8' : '#1e293b') }}>{item.day}</span>
                        {item.sessions.length > 0 && <div style={styles.sessionCount}>{item.sessions.length}</div>}
                      </motion.button>
                    )
                  ))}
                </div>
              </motion.div>

              {/* Session List for Selected Day */}
              <AnimatePresence mode="wait">
                {selectedDate && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={styles.sessionsCard}>
                    <div style={styles.sessionsHeader}>
                      <FiCalendar />
                      <span>Sessions for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                    
                    <div style={styles.sessionsList}>
                      {currentDaySessions.length > 0 ? currentDaySessions.map(session => (
                        <div key={session.schedule_id} style={styles.sessionItem}>
                          <div style={styles.sessionTime}>
                            <FiClock style={{ color: '#2563eb' }} />
                            <span>{session.start_time} - {session.end_time}</span>
                            {!session.schedule_date && <span style={styles.recurringBadge}>Recurring</span>}
                          </div>
                          <div style={styles.sessionInfo}>
                            <button onClick={() => handleDeleteSession(session.schedule_id)} style={styles.deleteIconButton} title="Delete Session">
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      )) : (
                        <div style={styles.noSessions}>No sessions scheduled for this date.</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Add Session Form */}
            <div style={styles.settingsColumn}>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={styles.settingsCard}>
                <div style={styles.cardHeader}>
                  <div style={{ ...styles.cardIconBox, background: '#eff6ff', color: '#2563eb' }}><FiPlus size={20} /></div>
                  <h3 style={styles.cardTitle}>Add New Session</h3>
                </div>

                <div style={styles.toggleGroup}>
                  <button 
                    onClick={() => setBookingType('ONE-TIME')} 
                    style={{...styles.toggleBtn, ...(bookingType === 'ONE-TIME' ? styles.toggleBtnActive : {})}}
                  >One-time</button>
                  <button 
                    onClick={() => setBookingType('RECURRING')} 
                    style={{...styles.toggleBtn, ...(bookingType === 'RECURRING' ? styles.toggleBtnActive : {})}}
                  >Recurring</button>
                </div>

                <div style={styles.formStack}>
                  {bookingType === 'RECURRING' ? (
                    <>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Day of Week</label>
                        <select 
                          style={styles.select} 
                          value={selectedDayIndex} 
                          onChange={(e) => setSelectedDayIndex(parseInt(e.target.value))}
                        >
                          {daysOfWeek.map((day, idx) => <option key={day} value={idx}>{fullDays[idx]}</option>)}
                        </select>
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>End Recurring Date (Optional)</label>
                        <input 
                          type="date" 
                          style={styles.input} 
                          value={endDate} 
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </div>
                    </>
                  ) : (
                    <div style={styles.infoBox}>
                      <FiInfo />
                      <span>{selectedDate ? `Selected: ${selectedDate}` : "Select a date on the calendar first"}</span>
                    </div>
                  )}

                  <div style={styles.timeGrid}>
                    <ClockTimePicker label="Start Time" value={startTime} onChange={setStartTime} />
                    <ClockTimePicker label="End Time" value={endTime} onChange={setEndTime} />
                  </div>



                  <button 
                    onClick={handleAddSession} 
                    disabled={isLoading || (bookingType === 'ONE-TIME' && !selectedDate)} 
                    style={styles.addBtn}
                  >
                    {isLoading ? 'Adding...' : <><FiPlus /> Add Session</>}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', sans-serif"
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0
  },
  contentPadding: {
    padding: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
    width: '100%'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '32px'
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.025em',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  pageSubtitle: {
    fontSize: '15px',
    color: '#64748b',
    marginTop: '4px',
    fontWeight: '500'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1fr',
    gap: '32px'
  },
  calendarCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  },
  calendarHeader: {
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    color: 'white'
  },
  monthTitle: {
    fontSize: '20px',
    fontWeight: '700',
    margin: 0
  },
  calendarNav: {
    display: 'flex',
    gap: '8px'
  },
  iconBtn: {
    padding: '8px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  todayBtn: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer'
  },
  calendarGrid: {
    padding: "16px",
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "8px"
  },
  dayHeaderCell: {
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    padding: '8px 0'
  },
  dayCell: {
    aspectRatio: '1',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative'
  },
  emptyCell: { aspectDay: '1', opacity: 0 },
  pastCell: { backgroundColor: '#f8fafc', cursor: 'not-allowed', opacity: 0.5 },
  selectedCell: { borderColor: '#2563eb', borderWidth: '2px', backgroundColor: '#eff6ff' },
  availableDay: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  recurringDay: { backgroundColor: '#fffbeb', borderColor: '#f59e0b' },
  sessionCount: {
    position: 'absolute',
    bottom: '4px',
    right: '4px',
    backgroundColor: '#3b82f6',
    color: 'white',
    fontSize: '10px',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800'
  },
  sessionsCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '24px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0'
  },
  sessionsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '20px'
  },
  sessionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  sessionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderRadius: '16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0'
  },
  sessionTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '700',
    color: '#334155'
  },
  sessionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  sessionType: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: '#eff6ff',
    padding: '4px 12px',
    borderRadius: '100px'
  },
  deleteIconButton: {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    borderRadius: '8px',
    transition: 'all 0.2s',
    ':hover': { backgroundColor: '#fef2f2' }
  },
  recurringBadge: {
    fontSize: '10px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '2px 8px',
    borderRadius: '8px',
    marginLeft: '8px',
    textTransform: 'uppercase'
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '28px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    position: 'sticky',
    top: '24px'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px'
  },
  cardIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTitle: { fontSize: '20px', fontWeight: '800', margin: 0 },
  toggleGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    padding: '6px',
    backgroundColor: '#f1f5f9',
    borderRadius: '16px',
    marginBottom: '24px'
  },
  toggleBtn: {
    padding: '10px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  toggleBtnActive: {
    backgroundColor: 'white',
    color: '#2563eb',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  formStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', fontWeight: '700', color: '#475569' },
  select: {
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    outline: 'none',
    fontSize: '14px'
  },
  input: {
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    outline: 'none',
    fontSize: '14px'
  },
  timeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    color: '#64748b'
  },
  addBtn: {
    marginTop: '12px',
    padding: '16px',
    borderRadius: '16px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: 'white',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    boxShadow: '0 8px 15px -3px rgba(37, 99, 235, 0.3)',
    transition: 'all 0.2s',
    ':hover': { transform: 'translateY(-2px)' }
  },
  noSessions: { textAlign: 'center', padding: '32px', color: '#94a3b8', fontStyle: 'italic' }
};

export default DoctorAvailability;
