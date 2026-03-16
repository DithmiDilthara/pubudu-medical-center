import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const AppointmentCalendar = ({ appointments = [], selectedDate, onDateSelect }) => {
  const [viewDate, setViewDate] = useState(new Date());

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
    const mockApptDays = [5, 8, 12, 15, 18, 22, 25, 28];
    if (mockApptDays.includes(day) && month === 2 && year === 2026) return true; // March 2026

    return appointments.some(appt => appt.appointment_date === dateStr);
  };

  const handleDateClick = (day) => {
    if (onDateSelect) {
      onDateSelect(getLocalDateString(year, month, day));
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
          }}
        >
          <span style={(activeStatus || todayStatus) ? styles.activeText : styles.dayText}>{day}</span>
          {apptStatus && (
            <div style={{
              ...styles.apptDot,
              backgroundColor: (activeStatus || todayStatus) ? 'white' : '#60a5fa'
            }} />
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

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{...styles.dotPreview, backgroundColor: '#60a5fa'}}></div>
          <span>Has Appointments</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{...styles.dotPreview, backgroundColor: '#2563eb'}}></div>
          <span>Selection</span>
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
    border: '2px solid #2563eb',
    color: '#2563eb',
  },
  selectedCell: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
  },
  activeText: {
    color: 'inherit'
  },
  dayText: {
    color: 'inherit'
  },
  apptDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    position: 'absolute',
    bottom: '4px'
  },
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
