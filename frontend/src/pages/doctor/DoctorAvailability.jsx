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
  const [errorMessage, setErrorMessage] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

          const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
          const recurringArr = [...new Set(availData
            .filter(a => a.day_of_week && !a.specific_date)
            .map(a => daysOrder.indexOf(a.day_of_week)))];
          setRecurringDays(recurringArr);

          const specificAvail = {};
          const todayDate = new Date();
          todayDate.setHours(0,0,0,0);
          const todayStr = todayDate.toISOString().split('T')[0];

          availData.filter(a => a.specific_date && a.specific_date >= todayStr).forEach(a => {
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
      setErrorMessage("Failed to load availability data.");
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
      const isRecurring = recurringDays.includes(dayOfWeekIndex);
      const dayAvailability = availability[dateKey] || (isRecurring ? { status: 'available', startTime: 'Recurring' } : null);
      
      days.push({
        type: 'day',
        day,
        dateKey,
        dateObj,
        isPast: dateObj < today,
        availability: dayAvailability,
        isSelected: selectedDate === dateKey
      });
    }
    return days;
  }, [selectedMonth, selectedYear, recurringDays, availability, selectedDate, today]);

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

  const handleSetAvailability = async (status) => {
    if (!selectedDate) return;
    
    if (status === 'DELETED') {
      setIsDeleteModalOpen(true);
      return;
    }

    await proceedWithAvailability(status);
  };

  const proceedWithAvailability = async (status) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem('token');
      const availabilityPayload = [{
        specific_date: selectedDate,
        day_of_week: null,
        start_time: startTime,
        end_time: endTime,
        session_name: status === 'available' ? 'Available' : status === 'DELETED' ? 'DELETED' : 'Unavailable'
      }];

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/clinical/availability`,
        { availability: availabilityPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        if (status === 'DELETED') {
          const newAvail = { ...availability };
          delete newAvail[selectedDate];
          setAvailability(newAvail);
        } else {
          setAvailability(prev => ({
            ...prev,
            [selectedDate]: { status, startTime, endTime }
          }));
        }
        await fetchAvailability();
      }
    } catch (error) {
      setErrorMessage("Failed to update availability.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRecurringDay = (dayIndex) => {
    setRecurringDays(prev => 
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const handleApplyRecurring = async () => {
    if (recurringDays.length === 0) return;
    setIsLoading(true);
    const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const availabilityPayload = recurringDays.map(index => ({
      day_of_week: daysOrder[index],
      start_time: startTime,
      end_time: endTime,
      session_name: "Regular Session"
    }));

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/clinical/availability`,
        { availability: availabilityPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAvailability();
    } catch (error) {
      setErrorMessage("Failed to save recurring availability.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAllRecurring = async () => {
    if (!window.confirm('Cancel all recurring availability?')) return;
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/clinical/availability`,
        { availability: [], clear_all_recurring: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecurringDays([]);
      await fetchAvailability();
    } catch (error) {
      setErrorMessage("Failed to clear recurring availability.");
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

      <div className="main-wrapper" style={styles.mainWrapper}>
        <DoctorHeader doctorName={doctorName} />

        <main style={styles.contentPadding}>
          {/* Page Header */}
          <div style={styles.headerRow}>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 style={styles.pageTitle}>Schedule & Availability</h1>
              <p style={styles.pageSubtitle}>
                Manage your working hours and weekly routine
              </p>
            </motion.div>

            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={styles.errorBadge}
              >
                <FiAlertCircle />
                {errorMessage}
              </motion.div>
            )}
          </div>

          <div style={styles.gridContainer}>
            {/* Left Column: Calendar */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={styles.calendarCard}
            >
              {/* Calendar Header */}
              <div style={styles.calendarHeader}>
                <h2 style={styles.monthTitle}>
                  {monthNames[selectedMonth]} {selectedYear}
                </h2>
                <div style={styles.calendarNav}>
                  <button onClick={handlePrevMonth} style={styles.iconBtn}>
                    <FiChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedMonth(new Date().getMonth());
                      setSelectedYear(new Date().getFullYear());
                    }}
                    style={styles.todayBtn}
                  >
                    Today
                  </button>
                  <button onClick={handleNextMonth} style={styles.iconBtn}>
                    <FiChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div style={styles.legend}>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, background: '#3b82f6' }} />
                  <span>Available</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, background: '#e2e8f0' }} />
                  <span style={{ color: '#94a3b8' }}>Not Set</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendDot, background: '#f59e0b' }} />
                  <span>Recurring Only</span>
                </div>
              </div>

              {/* Calendar Grid */}
              <div style={styles.calendarGrid}>
                {daysOfWeek.map(day => (
                  <div key={day} style={styles.dayHeaderCell}>{day}</div>
                ))}
                {calendarDays.map((item, idx) => (
                  item.type === 'empty' ? (
                    <div key={item.id} style={styles.emptyCell} />
                  ) : (
                    <motion.button
                      key={item.dateKey}
                      whileHover={!item.isPast ? { y: -2, scale: 1.02 } : {}}
                      whileTap={!item.isPast ? { scale: 0.98 } : {}}
                      onClick={() => !item.isPast && setSelectedDate(item.dateKey)}
                      style={{
                        ...styles.dayCell,
                        ...(item.isPast ? styles.pastCell : {}),
                        ...(item.isSelected ? styles.selectedCell : {}),
                        ...(item.availability && !item.isSelected ? (
                          item.availability.startTime === 'Recurring' ? styles.recurringDay : styles.availableDay
                        ) : {})
                      }}
                    >
                      <span style={{ 
                        fontSize: '13px', 
                        fontWeight: '700',
                        color: item.isSelected ? '#1d4ed8' : (item.isPast ? '#94a3b8' : '#1e293b')
                      }}>
                        {item.day}
                      </span>
                      
                      {item.dateKey === new Date().toISOString().split('T')[0] && (
                        <div style={styles.todayIndicator} />
                      )}
                    </motion.button>
                  )
                ))}
              </div>

              {/* Selected Day Footer */}
              <AnimatePresence mode="wait">
                {selectedDate && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    style={styles.selectedFooter}
                  >
                    <div style={styles.footerLeft}>
                      <div style={styles.footerIconBox}>
                        <FiCalendar size={24} />
                      </div>
                      <div>
                        <p style={styles.footerLabel}>Selected Date</p>
                        <h3 style={styles.footerDate}>
                          {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h3>
                      </div>
                    </div>
                    <div style={styles.footerRight}>
                      <button 
                        onClick={() => handleSetAvailability('available')}
                        disabled={isLoading}
                        style={styles.markAvailableBtn}
                      >
                        <FiCheck strokeWidth={3} /> Mark Available
                      </button>
                      <button 
                        onClick={() => handleSetAvailability('DELETED')}
                        disabled={isLoading}
                        style={styles.deleteBtn}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Right Column: Settings */}
            <div style={styles.settingsColumn}>
              {/* Working Hours Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={styles.settingsCard}
              >
                <div style={styles.cardHeader}>
                  <div style={{ ...styles.cardIconBox, background: '#eff6ff', color: '#2563eb' }}>
                    <FiClock size={20} />
                  </div>
                  <h3 style={styles.cardTitle}>Working Hours</h3>
                </div>

                <div style={styles.inputStack}>
                  <div style={styles.inputGroup}>
                    <ClockTimePicker 
                      label="Start Time"
                      value={startTime}
                      onChange={setStartTime}
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <ClockTimePicker 
                      label="End Time"
                      value={endTime}
                      onChange={setEndTime}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Weekly Routine Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                style={styles.settingsCard}
              >
                <div style={styles.cardHeader}>
                  <div style={{ ...styles.cardIconBox, background: '#eef2ff', color: '#4f46e5' }}>
                    <FiCornerDownRight size={20} />
                  </div>
                  <h3 style={styles.cardTitle}>Weekly Routine</h3>
                </div>

                <p style={styles.cardSubtitle}>Apply hours for the next 3 months.</p>

                <div style={styles.daySelectionGrid}>
                  {daysOfWeek.map((day, idx) => (
                    <button
                      key={day}
                      onClick={() => handleToggleRecurringDay(idx)}
                      style={{
                        ...styles.dayChip,
                        ...(recurringDays.includes(idx) ? styles.dayChipActive : {})
                      }}
                    >
                      {day[0]}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    onClick={handleApplyRecurring}
                    disabled={isLoading || recurringDays.length === 0}
                    style={styles.saveRoutineBtn}
                  >
                    <FiPlus /> Save Routine
                  </button>
                  <button 
                    onClick={handleCancelAllRecurring}
                    disabled={isLoading}
                    style={styles.clearRoutineBtn}
                  >
                    Clear All Recurring
                  </button>
                </div>

                <div style={styles.infoBox}>
                  <FiInfo size={16} style={{ marginTop: '2px' }} />
                  <p>Specific date settings will override your weekly routine.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          setIsDeleteModalOpen(false);
          proceedWithAvailability('DELETED');
        }}
        title="Remove Availability"
        message={`Are you sure you want to remove the availability for ${selectedDate ? new Date(selectedDate).toLocaleDateString() : ''}? It will revert to your standard routine.`}
        confirmText="Remove Schedule"
        type="danger"
      />
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
    fontWeight: '500',
    fontFamily: "'Inter', sans-serif"
  },
  errorBadge: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '8px 16px',
    borderRadius: '12px',
    border: '1px solid #fee2e2',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: '2.2fr 1fr',
    gap: '32px'
  },
  calendarCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.04)',
    border: '1px solid #cbd5e1',
    overflow: 'hidden'
  },
  calendarHeader: {
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2563eb'
  },
  monthTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'white',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  calendarNav: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  iconBtn: {
    padding: '8px',
    borderRadius: '12px',
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  todayBtn: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  legend: {
    padding: '16px 24px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    borderBottom: '1px solid #f8fafc',
    fontSize: '14px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#64748b'
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%'
  },
  calendarGrid: {
    padding: "8px 12px 12px 12px",
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "4px" // Reduced gap
  },
  dayHeaderCell: {
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    padding: '8px 0'
  },
  dayCell: {
    aspectRatio: '1',
    borderRadius: '8px',
    border: '1px solid #000000', // Black outline for all dates
    backgroundColor: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    outline: 'none',
    boxShadow: 'none'
  },
  emptyCell: {
    aspectRatio: '1',
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
    borderRadius: '8px'
  },
  pastCell: {
    backgroundColor: '#f8fafc',
    borderColor: 'transparent',
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  selectedCell: {
    borderColor: '#2563eb',
    borderWidth: '2.5px', // Make selection more prominent
    backgroundColor: '#eff6ff',
    zIndex: 10,
    outline: 'none'
  },
  todayIndicator: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '5px',
    height: '5px',
    backgroundColor: '#2563eb',
    borderRadius: '50%'
  },
  availableDay: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  recurringDay: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  selectedFooter: {
    padding: '24px',
    backgroundColor: '#2563eb',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  footerIconBox: {
    width: '48px',
    height: '48px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)'
  },
  footerLabel: {
    fontSize: '12px',
    color: '#bfdbfe',
    fontWeight: '500'
  },
  footerDate: {
    fontSize: '18px',
    fontWeight: '700',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  footerRight: {
    display: 'flex',
    gap: '12px'
  },
  markAvailableBtn: {
    backgroundColor: '#22c55e',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '12px',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
    transition: 'all 0.2s'
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    color: 'white',
    padding: '10px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
    transition: 'all 0.2s'
  },
  settingsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  settingsCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '24px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px'
  },
  cardIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    fontFamily: "'Plus Jakarta Sans', sans-serif"
  },
  cardSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '20px'
  },
  inputStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  timeInput: {
    width: '100%',
    backgroundColor: '#f8fafc',
    border: '2px solid #f1f5f9',
    borderRadius: '16px',
    padding: '12px 16px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#334155',
    outline: 'none',
    transition: 'all 0.2s',
    fontFamily: "'Inter', sans-serif"
  },
  daySelectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
    marginBottom: '24px'
  },
  dayChip: {
    height: '48px',
    borderRadius: '16px',
    border: '2px solid #f1f5f9',
    backgroundColor: 'white',
    color: '#64748b',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  dayChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
    color: 'white',
    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)'
  },
  saveRoutineBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '16px',
    backgroundColor: '#0f172a',
    color: 'white',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  clearRoutineBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '16px',
    backgroundColor: 'transparent',
    color: '#ef4444',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  infoBox: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: '#fffbeb',
    borderRadius: '16px',
    border: '1px solid #fef3c7',
    display: 'flex',
    gap: '12px',
    fontSize: '13px',
    color: '#92400e',
    lineHeight: 1.5
  }
};

export default DoctorAvailability;
