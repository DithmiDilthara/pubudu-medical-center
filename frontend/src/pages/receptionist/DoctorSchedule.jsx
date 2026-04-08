import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  FiArrowLeft
} from 'react-icons/fi';
import { LuStethoscope } from 'react-icons/lu';
import ReceptionistHeader from '../../components/ReceptionistHeader';
import ReceptionistSidebar from '../../components/ReceptionistSidebar';
import ClockTimePicker from '../../components/ClockTimePicker';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function DoctorSchedule() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [bookingType, setBookingType] = useState('ONE-TIME');
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [endDate, setEndDate] = useState('');
  const [maxPatients, setMaxPatients] = useState(20);

  const [doctorInfo, setDoctorInfo] = useState(null);
  const [rawAvailability, setRawAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [receptionistName, setReceptionistName] = useState("Receptionist");
  
  // NEW: Session Exclusion Modal State
  const [showExclusionModal, setShowExclusionModal] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editMaxPatients, setEditMaxPatients] = useState(20);
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  const fetchDoctorData = async () => {
    if (!doctorId) {
      toast.error("Invalid Doctor ID");
      navigate('/receptionist/doctors');
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch Profile for Header
      const profilePromise = axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch Doctor Details
      const doctorPromise = axios.get(`${API_URL}/doctors/${doctorId}`);
      
      // Fetch Availability
      const availabilityPromise = axios.get(`${API_URL}/clinical/availability/${doctorId}`);

      const [profileRes, doctorRes, availabilityRes] = await Promise.all([
        profilePromise,
        doctorPromise,
        availabilityPromise
      ]);

      if (profileRes.data.success) {
        setReceptionistName(profileRes.data.data.profile.full_name);
      }

      if (doctorRes.data.success) {
        setDoctorInfo(doctorRes.data.data);
      }

      if (availabilityRes.data.success) {
        setRawAvailability(availabilityRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching doctor data:", error);
      toast.error(error.response?.data?.message || "Failed to load doctor information.");
      if (error.response?.status === 404) {
        navigate('/receptionist/doctors');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, [doctorId]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const availabilityMap = useMemo(() => {
    const map = {};
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
  }, [rawAvailability]);

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDay = (new Date(selectedYear, selectedMonth, 1).getDay() + 6) % 7;
    const days = [];

    for (let i = 0; i < firstDay; i++) days.push({ type: 'empty', id: `empty-${i}` });

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dateObj = new Date(selectedYear, selectedMonth, day);
      const dayOfWeekName = fullDays[(dateObj.getDay() + 6) % 7];
      
      const specific = availabilityMap[dateKey] || [];
      const recurring = availabilityMap[dayOfWeekName] || [];
      const sessions = [...recurring, ...specific];
      
      days.push({
        type: 'day',
        day,
        dateKey,
        isPast: dateObj < today,
        sessions,
        status: sessions.some(s => s.status === 'CANCELLED') ? 'CANCELLED' : (sessions.length > 0 ? 'ACTIVE' : 'NONE'),
        isSelected: selectedDate === dateKey
      });
    }
    return days;
  }, [selectedMonth, selectedYear, availabilityMap, selectedDate, today]);

  const handleAddSession = async () => {
    if (bookingType === 'ONE-TIME' && !selectedDate) {
      toast.error("Please select a date on the calendar!");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        doctor_id: doctorId,
        availability: [{
          schedule_date: bookingType === 'ONE-TIME' ? selectedDate : null,
          day_of_week: bookingType === 'RECURRING' ? fullDays[selectedDayIndex] : null,
          start_time: startTime,
          end_time: endTime,
          end_date: bookingType === 'RECURRING' ? endDate || null : null,
          max_patients: maxPatients
        }]
      };

      const response = await axios.post(`${API_URL}/clinical/availability`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success("Session added successfully");
        fetchDoctorData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add session.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm("Permanent Action: This will stop this clinic rule entirely. Affected appointments will be flagged. Proceed?")) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/clinical/availability/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Clinic series stopping. Affected appointments flagged.");
      fetchDoctorData();
    } catch (error) {
      toast.error("Failed to cancel session.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelInstance = async () => {
    if (!activeSession || !selectedDate) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        doctor_id: doctorId,
        schedule_date: selectedDate,
        start_time: activeSession.start_time,
        end_time: activeSession.end_time
      };

      const response = await axios.post(`${API_URL}/clinical/availability/cancel-instance`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success(`Session for ${selectedDate} cancelled.`);
        setShowExclusionModal(false);
        fetchDoctorData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel instance.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSession = async () => {
    if (!activeSession) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        max_patients: editMaxPatients,
        start_time: editStartTime,
        end_time: editEndTime
      };

      const response = await axios.put(`${API_URL}/clinical/availability/${activeSession.schedule_id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success("Session updated successfully");
        setShowEditModal(false);
        fetchDoctorData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update session.");
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (session) => {
    setActiveSession(session);
    setEditMaxPatients(session.max_patients || 20);
    setEditStartTime(session.start_time);
    setEditEndTime(session.end_time);
    setShowEditModal(true);
  };

  const currentDaySessions = useMemo(() => {
    if (!selectedDate) return [];
    const dateObj = new Date(selectedDate);
    const dayOfWeekName = fullDays[(dateObj.getDay() + 6) % 7];
    return [
      ...(availabilityMap[dayOfWeekName] || []),
      ...(availabilityMap[selectedDate] || [])
    ].sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [selectedDate, availabilityMap]);

  return (
    <div style={styles.pageContainer}>
      <ReceptionistSidebar onLogout={() => navigate('/')} />
      <div className="main-wrapper" style={styles.mainWrapper}>
        <ReceptionistHeader receptionistName={receptionistName} />
        <main style={styles.contentPadding}>
          
          <div style={styles.headerRow}>
            <button onClick={() => navigate('/receptionist/doctors')} style={styles.backBtn}>
              <FiArrowLeft /> Back to Directory
            </button>
            <div style={{ textAlign: 'right' }}>
              <h1 style={styles.pageTitle}>Manage Schedule</h1>
              <p style={styles.pageSubtitle}>Dr. {doctorInfo?.full_name} | {doctorInfo?.specialization}</p>
            </div>
          </div>

          <div style={styles.gridContainer}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Calendar */}
              <div style={styles.calendarCard}>
                <div style={styles.calendarHeader}>
                  <h2 style={styles.monthTitle}>{monthNames[selectedMonth]} {selectedYear}</h2>
                  <div style={styles.calendarNav}>
                    <button onClick={() => setSelectedMonth(prev => prev === 0 ? 11 : prev - 1)} style={styles.iconBtn}><FiChevronLeft /></button>
                    <button onClick={() => setSelectedMonth(new Date().getMonth())} style={styles.todayBtn}>Today</button>
                    <button onClick={() => setSelectedMonth(prev => prev === 11 ? 0 : prev + 1)} style={styles.iconBtn}><FiChevronRight /></button>
                  </div>
                </div>
                <div style={styles.calendarGrid}>
                  {daysOfWeek.map(day => <div key={day} style={styles.dayHeaderCell}>{day}</div>)}
                  {calendarDays.map((item, idx) => (
                    item.type === 'empty' ? <div key={item.id} /> : (
                      <button
                        key={item.dateKey}
                        onClick={() => setSelectedDate(item.dateKey)}
                        style={{
                          ...styles.dayCell,
                          ...(item.isSelected ? styles.selectedCell : {}),
                          ...(item.status === 'CANCELLED' ? styles.cancelledDay : (item.status === 'ACTIVE' ? styles.activeDay : {}))
                        }}
                      >
                        <span style={{ fontWeight: '700' }}>{item.day}</span>
                        {item.sessions.length > 0 && <div style={styles.sessionCount}>{item.sessions.length}</div>}
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* Day Details */}
              {selectedDate && (
                <div style={styles.sessionsCard}>
                  <h3 style={styles.cardSectionTitle}>Sessions for {selectedDate}</h3>
                  <div style={styles.sessionsList}>
                    {currentDaySessions.length > 0 ? currentDaySessions.map(session => (
                      <div key={session.schedule_id} style={{ ...styles.sessionItem, opacity: session.status === 'CANCELLED' ? 0.6 : 1 }}>
                        <div style={styles.sessionTime}>
                          <FiClock color="#2563eb" />
                          <span>{session.start_time} - {session.end_time}</span>
                          {session.is_exclusion && <span style={{ ...styles.cancelledBadge, background: '#64748b' }}>BLACKOUT</span>}
                          {session.status === 'CANCELLED' && !session.is_exclusion && <span style={styles.cancelledBadge}>CANCELLED</span>}
                          {session.day_of_week && <span style={styles.recurringLabel}>Recurring</span>}
                          <span style={{...styles.recurringLabel, background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0'}}>
                            Cap: {session.max_patients || 20}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => openEditModal(session)}
                            style={{...styles.deleteBtn, color: '#2563eb'}}
                          >
                            Edit
                          </button>
                          {session.status === 'ACTIVE' && (
                          <button 
                            onClick={() => {
                              if (session.day_of_week) {
                                setActiveSession(session);
                                setShowExclusionModal(true);
                              } else {
                                handleDeleteSession(session.schedule_id);
                              }
                            }} 
                            style={styles.deleteBtn}
                          >
                            <FiTrash2 /> {session.day_of_week ? 'Cancel for today' : 'Cancel'}
                          </button>
                        )}
                        </div>
                      </div>
                    )) : <p style={styles.emptyText}>No sessions scheduled.</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Exclusion Modal */}
            <AnimatePresence>
              {showExclusionModal && (
                <div style={styles.modalOverlay}>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={styles.modalContent}
                  >
                    <div style={styles.modalHeader}>
                      <FiAlertCircle size={24} color="#ef4444" />
                      <h3 style={styles.modalTitle}>Cancel Session Instance</h3>
                    </div>
                    <p style={styles.modalText}>
                      You are about to cancel this specific session on <strong>{selectedDate}</strong>. 
                      Future occurrences of this weekly clinic will remain active.
                    </p>
                    <div style={styles.modalInfo}>
                      <p><strong>Doctor:</strong> Dr. {doctorInfo?.full_name}</p>
                      <p><strong>Time:</strong> {activeSession?.start_time} - {activeSession?.end_time}</p>
                    </div>
                    <div style={styles.modalActions}>
                      <button onClick={() => setShowExclusionModal(false)} style={styles.cancelBtn}>Close</button>
                      <button onClick={handleCancelInstance} disabled={isLoading} style={styles.confirmExclusionBtn}>
                        {isLoading ? "Processing..." : "Cancel This Day Only"}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
              {showEditModal && (
                <div style={styles.modalOverlay}>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={styles.modalContent}
                  >
                    <div style={styles.modalHeader}>
                      <LuStethoscope size={24} color="#2563eb" />
                      <h3 style={styles.modalTitle}>Edit Session Properties</h3>
                    </div>
                    <div style={styles.modalBody}>
                      <div style={styles.fieldGroup}>
                        <label style={styles.label}>Max Patients (Min 20)</label>
                        <input 
                          type="number" 
                          min="20"
                          value={editMaxPatients} 
                          onChange={e => setEditMaxPatients(parseInt(e.target.value))}
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.timeGrid}>
                        <ClockTimePicker label="Start Time" value={editStartTime} onChange={setEditStartTime} />
                        <ClockTimePicker label="End Time" value={editEndTime} onChange={setEditEndTime} />
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
                        <FiInfo inline style={{ marginRight: '4px' }} />
                        Note: Start/End time cannot be changed if bookings already exist for this session.
                      </p>
                    </div>
                    <div style={styles.modalActions}>
                      <button onClick={() => setShowEditModal(false)} style={styles.cancelBtn}>Cancel</button>
                      <button onClick={handleUpdateSession} disabled={isLoading} style={{...styles.submitBtn, padding: '10px 20px', fontSize: '14px'}}>
                        {isLoading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Form */}
            <div style={styles.formCard}>
              <div style={styles.formSectionHeader}>
                <FiPlus />
                <h3>Add New Session</h3>
              </div>
              
              <div style={styles.toggleGroup}>
                <button onClick={() => setBookingType('ONE-TIME')} style={{...styles.toggleBtn, ...(bookingType === 'ONE-TIME' ? styles.activeToggle : {})}}>One-time</button>
                <button onClick={() => setBookingType('RECURRING')} style={{...styles.toggleBtn, ...(bookingType === 'RECURRING' ? styles.activeToggle : {})}}>Recurring</button>
              </div>

              <div style={styles.formFields}>
                {bookingType === 'RECURRING' ? (
                  <div style={styles.fieldGroup}>
                    <label>Day of Week</label>
                    <select value={selectedDayIndex} onChange={e => setSelectedDayIndex(e.target.value)} style={styles.input}>
                      {fullDays.map((day, i) => <option key={i} value={i}>{day}</option>)}
                    </select>
                  </div>
                ) : (
                  <div style={styles.infoBox}><FiInfo /> {selectedDate || "Select date on calendar"}</div>
                )}
                
                <div style={styles.timeGrid}>
                  <ClockTimePicker label="Start Time" value={startTime} onChange={setStartTime} />
                  <ClockTimePicker label="End Time" value={endTime} onChange={setEndTime} />
                </div>

                <div style={styles.fieldGroup}>
                  <label>Max Patients (Capacity)</label>
                  <input 
                    type="number" 
                    min="20"
                    value={maxPatients} 
                    onChange={e => setMaxPatients(parseInt(e.target.value))}
                    placeholder="Minimum 20"
                    style={styles.input}
                  />
                </div>

                <button onClick={handleAddSession} disabled={isLoading} style={styles.submitBtn}>
                  {isLoading ? "Saving..." : "Create Clinical Session"}
                </button>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' },
  mainWrapper: { flex: 1, display: 'flex', flexDirection: 'column' },
  contentPadding: { padding: '32px', maxWidth: '1400px', margin: '0 auto', width: '100%' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '600' },
  pageTitle: { fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: 0 },
  pageSubtitle: { color: '#2563eb', fontWeight: '600', margin: '4px 0 0 0' },
  gridContainer: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' },
  calendarCard: { background: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
  calendarHeader: { background: '#2563eb', padding: '20px 24px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  monthTitle: { fontSize: '20px', fontWeight: '700', margin: 0 },
  calendarNav: { display: 'flex', gap: '8px' },
  iconBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px', cursor: 'pointer', borderRadius: '10px' },
  todayBtn: { background: 'white', color: '#2563eb', border: 'none', padding: '8px 16px', fontWeight: '600', borderRadius: '10px', cursor: 'pointer' },
  calendarGrid: { padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px' },
  dayHeaderCell: { textAlign: 'center', fontSize: '12px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
  dayCell: { aspectRatio: '1', borderRadius: '14px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  selectedCell: { borderColor: '#2563eb', background: '#eff6ff', borderWidth: '2px' },
  activeDay: { background: '#eff6ff', borderColor: '#bfdbfe' },
  cancelledDay: { background: '#fef2f2', borderColor: '#fecaca' },
  sessionCount: { position: 'absolute', bottom: '6px', right: '6px', background: '#2563eb', color: 'white', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' },
  sessionsCard: { background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' },
  cardSectionTitle: { fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '20px' },
  sessionsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  sessionItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' },
  sessionTime: { display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700', fontSize: '15px' },
  cancelledBadge: { fontSize: '10px', background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '6px', fontWeight: '800' },
  deleteBtn: { display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' },
  formCard: { background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0', height: 'fit-content', position: 'sticky', top: '32px' },
  formSectionHeader: { display: 'flex', alignItems: 'center', gap: '12px', color: '#2563eb', marginBottom: '24px' },
  toggleGroup: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f1f5f9', padding: '6px', borderRadius: '14px', marginBottom: '24px' },
  toggleBtn: { border: 'none', background: 'none', padding: '10px', fontWeight: '700', color: '#64748b', cursor: 'pointer', borderRadius: '10px' },
  activeToggle: { background: 'white', color: '#2563eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  formFields: { display: 'flex', flexDirection: 'column', gap: '24px' },
  infoBox: { padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' },
  submitBtn: { padding: '16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' },
  input: { padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' },
  timeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  
  // Modal Styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modalContent: { background: 'white', padding: '32px', borderRadius: '24px', maxWidth: '500px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  modalHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  modalTitle: { fontSize: '20px', fontWeight: '800', color: '#1e293b', margin: 0 },
  modalText: { color: '#64748b', lineHeight: '1.6', marginBottom: '20px' },
  modalInfo: { background: '#f8fafc', padding: '16px', borderRadius: '16px', marginBottom: '24px', fontSize: '14px', color: '#1e293b' },
  modalActions: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
  cancelBtn: { padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', cursor: 'pointer' },
  confirmExclusionBtn: { padding: '10px 20px', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontWeight: '600', cursor: 'pointer' },
  recurringLabel: { fontSize: '10px', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '6px', fontWeight: '800', border: '1px solid #bfdbfe' }
};

export default DoctorSchedule;
