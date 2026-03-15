import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { FiCalendar, FiSearch, FiClipboard, FiCheckSquare, FiClock, FiPlus, FiArrowRight } from 'react-icons/fi';
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";
import CancellationModal from "../../components/CancellationModal";
import HeroCarousel from "../../components/HeroCarousel";
import AppointmentCarousel from "../../components/AppointmentCarousel";

function MiniCalendar({ highlightedDates, onDateClick }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const highlightSet = new Set(
    highlightedDates
      .filter((d) => {
        const date = new Date(d + 'T00:00:00');
        return date.getMonth() === month && date.getFullYear() === year;
      })
      .map((d) => new Date(d + 'T00:00:00').getDate())
  );

  const todayDate = today.getDate();

  return (
    <div className="glass-card" style={styles.calendarContainer}>
      <div style={styles.calendarHeader}>
        <div>
          <h3 style={styles.calendarMonth}>
            {today.toLocaleString("default", { month: "long" })} {year}
          </h3>
          <p style={styles.calendarSubText}>{highlightSet.size} events this month</p>
        </div>
      </div>
      <div style={styles.calendarGrid}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} style={styles.dayLabel}>
            {d}
          </div>
        ))}
        {cells.map((day, i) => (
          <div
            key={i}
            onClick={() => day && highlightSet.has(day) && onDateClick && onDateClick(day)}
            style={{
              ...styles.dayCell,
              ...(day && highlightSet.has(day) ? styles.highlightedDay : {}),
              ...(day === todayDate ? styles.todayDay : {}),
              ...(!day ? styles.emptyDay : {}),
            }}
          >
            {day ?? ""}
            {day && highlightSet.has(day) && <div style={styles.dotIndicator} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function PatientDashboard() {
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellationMessages, setCancellationMessages] = useState([]);

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const patientName = storedUser.full_name?.split(' ')[0] || storedUser.username || 'Patient';

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          const allApts = response.data.data;

          // Process cancellations
          const cancelledApts = allApts.filter(apt => apt.status === 'CANCELLED');
          if (cancelledApts.length > 0) {
            const notifiedCancellations = JSON.parse(sessionStorage.getItem('notifiedCancellations') || '[]');
            const newCancellations = cancelledApts.filter(apt => !notifiedCancellations.includes(apt.appointment_id));

            if (newCancellations.length > 0) {
              const messages = newCancellations.map(apt =>
                `Your appointment on ${apt.appointment_date} with ${apt.doctor?.full_name || 'the doctor'} has been CANCELLED.`
              ).join('\n\n');
              setCancellationMessages(messages.split('\n\n'));
              const updatedNotified = [...notifiedCancellations, ...newCancellations.map(a => a.appointment_id)];
              sessionStorage.setItem('notifiedCancellations', JSON.stringify(updatedNotified));
            }
          }

          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

          const upcoming = allApts
            .filter(apt => ['PENDING', 'CONFIRMED'].includes(apt.status) && apt.appointment_date >= todayStr)
            .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
          setUpcomingAppointments(upcoming);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <PatientSidebar onLogout={handleLogout} />

      <div className="main-wrapper">
        <PatientHeader patientName={patientName} />

        <CancellationModal
          messages={cancellationMessages}
          onClose={() => setCancellationMessages([])}
        />

        <main className="content-padding">
          {/* Hero Carousel Section */}
          <HeroCarousel />

          <div style={styles.summaryRow}>
            <div style={styles.statCard}>
              <div style={styles.statInfo}>
                <span style={styles.statVal}>{upcomingAppointments.length}</span>
                <span style={styles.statLab}>Upcoming Appointments</span>
              </div>
              <FiCalendar size={24} color="#3B82F6" />
            </div>
            <div style={styles.statCard}>
              <div style={styles.statInfo}>
                <span style={styles.statVal}>0</span>
                <span style={styles.statLab}>New Medical Reports</span>
              </div>
              <FiClipboard size={24} color="#10B981" />
            </div>
          </div>

          <div style={styles.dashboardGrid}>
             {/* Left Column: Quick Actions + Appointments */}
             <div style={styles.leftCol}>
                {/* Secondary Quick Actions */}
                <div style={styles.quickActionCards}>
                   <Link to="/patient/find-doctor" style={styles.actionCard}>
                      <div style={{...styles.actionIcon, background: 'rgba(59, 130, 246, 0.1)'}}>
                        <FiSearch color="#3B82F6" size={24} />
                      </div>
                      <h4 style={styles.actionCardTitle}>Find Doctor</h4>
                      <p style={styles.actionCardRoot}>Search specializations</p>
                   </Link>
                   <Link to="/patient/appointments" style={styles.actionCard}>
                      <div style={{...styles.actionIcon, background: 'rgba(16, 185, 129, 0.1)'}}>
                        <FiClipboard color="#10B981" size={24} />
                      </div>
                      <h4 style={styles.actionCardTitle}>My History</h4>
                      <p style={styles.actionCardRoot}>View past visits</p>
                   </Link>
                </div>

                <AppointmentCarousel appointments={upcomingAppointments} />
             </div>

             {/* Right Column: Calendar */}
             <div style={styles.rightCol}>
                <MiniCalendar 
                  highlightedDates={upcomingAppointments.map((a) => a.appointment_date)}
                  onDateClick={() => navigate('/patient/appointments')}
                />

                <div className="glass-card" style={styles.miniBanner}>
                  <h4 style={styles.bannerTitle}>Need Help?</h4>
                  <p style={styles.bannerText}>Contact our 24/7 support line for any medical emergencies.</p>
                  <button style={styles.bannerBtn}>Call Now</button>
                </div>
             </div>
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
    backgroundColor: 'var(--slate-50)',
    fontFamily: "'Inter', sans-serif"
  },
  mainWrapper: {
    // Handled by .main-wrapper
  },
  mainContent: {
    // Handled by .content-padding
  },
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    marginBottom: '40px'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 'var(--radius-2xl)',
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid var(--slate-100)',
    boxShadow: 'var(--shadow-soft)'
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  statVal: {
    fontSize: 'var(--text-2xl)',
    fontWeight: '800',
    color: 'var(--slate-900)'
  },
  statLab: {
    fontSize: 'var(--text-sm)',
    color: 'var(--slate-500)',
    marginTop: '4px',
    fontWeight: '500'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '32px'
  },
  quickActionCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '32px'
  },
  actionCard: {
    backgroundColor: 'white',
    borderRadius: 'var(--radius-2xl)',
    padding: '24px',
    textDecoration: 'none',
    border: '1px solid var(--slate-100)',
    transition: 'all 0.3s ease',
    boxShadow: 'var(--shadow-soft)'
  },
  actionIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  actionCardTitle: {
    fontSize: 'var(--text-base)',
    fontWeight: '700',
    color: 'var(--slate-900)',
    marginBottom: '4px'
  },
  actionCardRoot: {
    fontSize: 'var(--text-sm)',
    color: 'var(--slate-500)'
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '32px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#111827'
  },
  viewMoreLink: {
    fontSize: '14px',
    color: '#0066CC',
    fontWeight: '600',
    textDecoration: 'none'
  },
  appointmentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  appointmentCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderRadius: '16px',
    border: '1px solid #F3F4F6',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  aptInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  dateCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    backgroundColor: '#F3F4F6',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  dateDay: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#111827',
    lineHeight: 1
  },
  dateMonth: {
    fontSize: '11px',
    textTransform: 'uppercase',
    fontWeight: '700',
    color: '#6B7280'
  },
  aptText: {},
  doctorName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
    margin: 0
  },
  doctorSpecialty: {
    fontSize: '13px',
    color: '#6B7280',
    marginBottom: '6px'
  },
  timeTag: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#4B5563',
    backgroundColor: '#F9FAFB',
    padding: '4px 10px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB'
  },
  aptStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  emptyState: {
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  emptyText: {
    marginTop: '16px',
    color: '#9CA3AF',
    fontSize: '14px'
  },
  calendarContainer: {
    backgroundColor: 'white',
    borderRadius: 'var(--radius-2xl)',
    padding: '24px',
    border: '1px solid var(--slate-100)',
    boxShadow: 'var(--shadow-soft)',
    marginBottom: '24px'
  },
  calendarHeader: {
    marginBottom: '20px'
  },
  calendarMonth: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#111827',
    margin: 0
  },
  calendarSubText: {
    fontSize: '12px',
    color: '#6B7280',
    marginTop: '2px'
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '4px'
  },
  dayLabel: {
    textAlign: 'center',
    padding: '8px 0',
    fontSize: '11px',
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase'
  },
  dayCell: {
    aspectRatio: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '600',
    borderRadius: '10px',
    cursor: 'pointer',
    position: 'relative'
  },
  highlightedDay: {
    backgroundColor: '#F0F7FF',
    color: '#0066CC'
  },
  todayDay: {
    border: '2px solid #0066CC',
    color: '#0066CC'
  },
  dotIndicator: {
    position: 'absolute',
    bottom: '6px',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#0066CC'
  },
  miniBanner: {
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    borderRadius: '24px',
    padding: '28px',
    color: 'white',
    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.2)'
  },
  bannerTitle: {
    fontSize: '18px',
    fontWeight: '800',
    marginBottom: '8px'
  },
  bannerText: {
    fontSize: '13px',
    opacity: 0.9,
    lineHeight: 1.5,
    marginBottom: '20px'
  },
  bannerBtn: {
    backgroundColor: 'white',
    color: '#10B981',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer'
  }
};

export default PatientDashboard;


