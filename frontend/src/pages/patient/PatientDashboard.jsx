import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { FiCalendar, FiSearch, FiClipboard, FiCheckSquare, FiClock } from 'react-icons/fi';
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";
import CancellationModal from "../../components/CancellationModal";

function MiniCalendar({ highlightedDates, onDateClick }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Only highlight dates in the current month
  const highlightSet = new Set(
    highlightedDates
      .filter((d) => {
        const date = new Date(d + 'T00:00:00'); // Parse as local
        return date.getMonth() === month && date.getFullYear() === year;
      })
      .map((d) => new Date(d + 'T00:00:00').getDate())
  );

  // Today's date for highlighting
  const todayDate = today.getDate();

  return (
    <div style={styles.calendarContainer}>
      <div style={styles.calendarHeader}>
        <p style={styles.calendarMonth}>
          {today.toLocaleString("default", { month: "long" })} {year}
        </p>
        <span style={styles.calendarBadge}>
          {highlightSet.size > 0 ? `${highlightSet.size} appointment${highlightSet.size > 1 ? 's' : ''}` : 'No upcoming'}
        </span>
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
              ...(day && !highlightSet.has(day) ? styles.normalDay : {}),
              ...(day === todayDate ? styles.todayDay : {}),
              ...(!day ? styles.emptyDay : {}),
              ...(day && highlightSet.has(day) ? { cursor: 'pointer' } : {})
            }}
          >
            {day ?? ""}
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

  // Get patient name from localStorage
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

          // Check for recent cancellations to notify the patient
          const cancelledApts = allApts.filter(apt => apt.status === 'CANCELLED');
          if (cancelledApts.length > 0) {
            const notifiedCancellations = JSON.parse(sessionStorage.getItem('notifiedCancellations') || '[]');
            const newCancellations = cancelledApts.filter(apt => !notifiedCancellations.includes(apt.appointment_id));

            if (newCancellations.length > 0) {
              const messages = newCancellations.map(apt =>
                `Your appointment on ${apt.appointment_date} with ${apt.doctor?.full_name || 'the doctor'} has been CANCELLED.`
              ).join('\n\n');

              // Show visual modal instead of browser alert
              setCancellationMessages(messages.split('\n\n'));

              // Mark as notified for this session
              const updatedNotified = [...notifiedCancellations, ...newCancellations.map(a => a.appointment_id)];
              sessionStorage.setItem('notifiedCancellations', JSON.stringify(updatedNotified));
            }
          }

          // Today's date for filtering
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

          // Filter for upcoming appointments (PENDING or CONFIRMED AND >= today) and sort by date
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

      <div style={styles.mainWrapper}>
        <PatientHeader patientName={patientName} />

        {/* Cancellation Notice Modal */}
        <CancellationModal
          messages={cancellationMessages}
          onClose={() => setCancellationMessages([])}
        />

        <main style={styles.mainContent}>
          {/* Quick actions */}
          <section style={styles.quickActionsSection}>
            <h3 style={styles.quickActionsTitle}>
              Quick Actions
            </h3>
            <div style={styles.quickActionsButtons}>
              <Link
                to="/patient/find-doctor"
                style={styles.primaryButton}
              >
                <FiCalendar style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Book Appointment
              </Link>
              <Link
                to="/patient/find-doctor"
                style={styles.secondaryButton}
              >
                <FiSearch style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Find Doctor
              </Link>
              <Link
                to="/patient/appointments"
                style={styles.tertiaryButton}
              >
                <FiClipboard style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                My Appointments
              </Link>
            </div>
          </section>

          {/* Top grid: Upcoming + Calendar */}
          <div style={styles.topGrid}>
            {/* Upcoming appointments list */}
            <section style={styles.appointmentsSection}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>
                  <FiCheckSquare style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                  Upcoming Appointments
                </h2>
                <Link
                  to="/patient/appointments"
                  style={styles.bookLink}
                >
                  View All →
                </Link>
              </div>

              <div style={styles.appointmentsList}>
                {loading ? (
                  <p style={styles.noAppointmentsText}>Loading appointments...</p>
                ) : upcomingAppointments.length > 0 ? (
                  upcomingAppointments.slice(0, 3).map((appt) => (
                    <div
                      key={appt.appointment_id}
                      style={styles.appointmentCard}
                    >
                      <div style={styles.appointmentCardHeader}>
                        <div>
                          <p style={styles.appointmentTitle}>{appt.status}</p>
                          <p style={styles.appointmentDoctor}>
                            {appt.doctor?.full_name || `Doctor #${appt.doctor_id}`}
                            {appt.doctor?.specialization && ` · ${appt.doctor.specialization}`}
                          </p>
                        </div>
                        <span style={{
                          ...styles.payButton,
                          backgroundColor: appt.status === 'CONFIRMED' ? '#059669' : '#0066CC',
                          background: appt.status === 'CONFIRMED'
                            ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                            : 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
                          fontSize: '12px',
                          padding: '6px 12px'
                        }}>
                          {appt.status}
                        </span>
                      </div>
                      <p style={styles.appointmentDateTime}>
                        <FiCalendar style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        {new Date(appt.appointment_date + 'T00:00:00').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        <FiClock style={{ margin: '0 6px 0 12px', verticalAlign: 'middle' }} />
                        {appt.time_slot}
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={styles.noAppointmentsText}>No upcoming appointments</p>
                )}
              </div>
            </section>

            {/* Calendar */}
            <section style={styles.calendarSection}>
              <MiniCalendar
                highlightedDates={upcomingAppointments.map((a) => a.appointment_date)}
                onDateClick={() => navigate('/patient/appointments')}
              />
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
    background: 'linear-gradient(135deg, #f5f5f5 0%, #f9fafb 100%)',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  mainContent: {
    flex: 1,
    padding: '32px'
  },
  quickActionsSection: {
    marginBottom: '32px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    padding: '24px',
    boxShadow: '0 10px 30px rgba(0, 102, 204, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  quickActionsTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '16px',
    marginTop: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  quickActionsButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px'
  },
  primaryButton: {
    borderRadius: '8px',
    backgroundColor: 'white',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#0066CC',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.3s',
    border: '2px solid white',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  secondaryButton: {
    borderRadius: '8px',
    backgroundColor: 'white',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#0066CC',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.3s',
    border: '2px solid white',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  tertiaryButton: {
    borderRadius: '8px',
    backgroundColor: 'white',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#0066CC',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.3s',
    border: '2px solid white',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  topGrid: {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: '2fr 1fr'
  },
  appointmentsSection: {
    borderRadius: '12px',
    backgroundColor: 'white',
    padding: '24px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(0, 102, 204, 0.1)'
  },
  sectionHeader: {
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '16px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  bookLink: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0066CC',
    textDecoration: 'none',
    transition: 'all 0.2s',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  appointmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  appointmentCard: {
    borderRadius: '10px',
    border: '2px solid #f0f0f0',
    padding: '16px',
    background: 'linear-gradient(135deg, rgba(0, 102, 204, 0.05) 0%, rgba(0, 82, 163, 0.05) 100%)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    transition: 'all 0.3s'
  },
  appointmentCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  appointmentTitle: {
    fontSize: '13px',
    color: '#888',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  appointmentDoctor: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0066CC',
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  payButton: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'white',
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 10px rgba(0, 102, 204, 0.3)',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  appointmentDateTime: {
    fontSize: '13px',
    color: '#666',
    margin: 0,
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  noAppointmentsText: {
    fontSize: '14px',
    color: '#999',
    textAlign: 'center',
    padding: '20px',
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  calendarSection: {
    gridColumn: 'span 1'
  },
  calendarContainer: {
    borderRadius: '12px',
    border: '1px solid rgba(0, 102, 204, 0.15)',
    backgroundColor: 'white',
    padding: '20px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 245, 245, 0.95) 100%)'
  },
  calendarHeader: {
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '12px'
  },
  calendarMonth: {
    fontSize: '16px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  calendarBadge: {
    fontSize: '12px',
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: '700',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '8px',
    textAlign: 'center',
    fontSize: '14px'
  },
  dayLabel: {
    color: '#0066CC',
    fontSize: '12px',
    fontWeight: '700',
    padding: '8px 0',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  dayCell: {
    height: '36px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  highlightedDay: {
    fontWeight: 'bold',
    color: 'white',
    background: 'linear-gradient(135deg, #0066CC 0%, #0052A3 100%)',
    border: '2px solid #0066CC',
    boxShadow: '0 4px 10px rgba(0, 102, 204, 0.3)'
  },
  normalDay: {
    color: '#555',
    border: '1px solid #e5e7eb'
  },
  emptyDay: {
    color: '#ddd'
  },
  todayDay: {
    border: '2px solid #0066CC',
    fontWeight: '700'
  }
};

export default PatientDashboard;


