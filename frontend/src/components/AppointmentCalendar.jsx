import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiClock, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AppointmentCalendar = ({ appointments = [], selectedDate, onDateSelect }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ date: '', appts: [] });

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();
  
  const getLocalDateString = (y, m, d) => {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  };

  const isToday = (day) => {
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    const dateStr = getLocalDateString(year, month, day);
    return dateStr === selectedDate;
  };

  const hasAppointment = (day) => {
    const dateStr = getLocalDateString(year, month, day);
    // Include mock data if needed or just filter appointments
    // Use actual appointments data

    return appointments.some(appt => appt.appointment_date === dateStr);
  };

  const handleDateClick = (day) => {
    const dateStr = getLocalDateString(year, month, day);
    const dayAppts = appointments.filter(appt => appt.appointment_date === dateStr);
    
    if (onDateSelect) {
      onDateSelect(dateStr);
    }

    if (dayAppts.length > 0) {
      setModalData({
        date: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        appts: dayAppts
      });
      setModalOpen(true);
    }
  };

  const renderDays = () => {
    const numDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const cells = [];

    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} style={styles.dayCell}></div>);
    }

    for (let day = 1; day <= numDays; day++) {
      const todayStatus = isToday(day);
      const activeStatus = isSelected(day);
      const apptStatus = hasAppointment(day);

      cells.push(
        <div 
          key={day} 
          onClick={() => handleDateClick(day)}
          style={{
            ...styles.dayCell,
            ...(activeStatus ? styles.selectedCell : todayStatus ? styles.todayCell : styles.regularDay),
            ...(apptStatus && !activeStatus && !todayStatus ? styles.apptHighlight : {}),
          }}
        >
          <span style={(activeStatus || todayStatus) ? styles.activeText : styles.dayText}>{day}</span>
          {apptStatus && !activeStatus && (
            <div style={styles.apptIndicator} />
          )}
        </div>
      );
    }

    return cells;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.monthYear}>
          {monthNames[month]} {year}
        </h3>
        <div style={styles.navGroup}>
          <button onClick={prevMonth} style={styles.navBtn}><FiChevronLeft /></button>
          <button onClick={nextMonth} style={styles.navBtn}><FiChevronRight /></button>
        </div>
      </div>

      <div style={styles.grid}>
        {daysOfWeek.map(d => (
          <div key={d} style={styles.dayOfWeek}>{d}</div>
        ))}
        {renderDays()}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              style={styles.modalOverlay}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={styles.modalContent}
            >
              <div style={styles.modalHeader}>
                <h4 style={styles.modalTitle}>Daily Appointments</h4>
                <button onClick={() => setModalOpen(false)} style={styles.closeBtn}><FiX /></button>
              </div>
              <div style={styles.modalSubHeader}>
                <span style={styles.modalDate}>{modalData.date}</span>
                <span style={styles.modalBadge}>{modalData.appts.length} total</span>
              </div>
              
              <div style={styles.apptDetailsList}>
                {modalData.appts.sort((a, b) => a.appointment_time?.localeCompare(b.appointment_time)).map((appt, idx) => (
                  <div key={idx} style={styles.apptDetailRow}>
                    <div style={styles.timeWrapper}>
                      <FiClock style={styles.clockIcon} />
                      <span style={styles.apptTime}>{appt.appointment_time || 'No time'}</span>
                    </div>
                    <div style={styles.patientInfo}>
                      <span style={styles.patientName}>{appt.patient_name || 'Anonymous Patient'}</span>
                      <span style={styles.apptStatusBadge(appt.status)}>{appt.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{...styles.dotPreview, backgroundColor: '#3b82f6'}}></div>
          <span>Has Appointments</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{...styles.dotPreview, backgroundColor: '#0f172a'}}></div>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '20px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '0 4px'
  },
  monthYear: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#1e293b',
    margin: 0
  },
  navGroup: {
    display: 'flex',
    gap: '4px'
  },
  navBtn: {
    padding: '6px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f1f5f9'
    }
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px',
    marginBottom: '16px'
  },
  dayOfWeek: {
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#94a3b8'
  },
  dayCell: {
    height: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '10px',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  regularDay: {
    color: '#334155',
  },
  todayCell: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.2)'
  },
  selectedCell: {
    border: '2px solid #0f172a',
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
    color: '#0f172a',
  },
  activeText: {
    color: 'inherit'
  },
  dayText: {
    color: 'inherit'
  },
  apptHighlight: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)'
  },
  apptIndicator: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    position: 'absolute',
    bottom: '6px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(4px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContent: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '24px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    zIndex: 1001,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '-0.025em'
  },
  closeBtn: {
    background: '#f1f5f9',
    border: 'none',
    padding: '8px',
    borderRadius: '12px',
    cursor: 'pointer',
    color: '#64748b',
    display: 'flex',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#e2e8f0',
      color: '#0f172a'
    }
  },
  modalSubHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px'
  },
  modalDate: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#64748b'
  },
  modalBadge: {
    backgroundColor: '#0f172a',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  apptDetailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '300px',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  apptDetailRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '12px',
    backgroundColor: 'white',
    border: '1px solid #f1f5f9',
    borderRadius: '14px',
    transition: 'all 0.2s',
    ':hover': {
      borderColor: '#3b82f6',
      backgroundColor: '#f0f9ff'
    }
  },
  timeWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#3b82f6'
  },
  clockIcon: {
    fontSize: '14px'
  },
  apptTime: {
    fontSize: '14px',
    fontWeight: '800',
  },
  patientInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  patientName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155'
  },
  apptStatusBadge: (status) => ({
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '6px',
    textTransform: 'uppercase',
    backgroundColor: status === 'CONFIRMED' ? '#dcfce7' : status === 'PENDING' ? '#fef9c3' : '#f1f5f9',
    color: status === 'CONFIRMED' ? '#15803d' : status === 'PENDING' ? '#854d0e' : '#64748b'
  }),
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #f8fafc'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '10px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.025em'
  },
  dotPreview: {
    width: '6px',
    height: '6px',
    borderRadius: '50%'
  }
};

export default AppointmentCalendar;
