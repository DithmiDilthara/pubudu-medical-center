import { Link, useNavigate } from "react-router-dom";
import { FiCalendar, FiSearch, FiClipboard, FiCheckSquare, FiClock } from 'react-icons/fi';
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";

const upcomingAppointments = [
  {
    id: 1,
    title: "Specialist Consultation",
    doctor: "Dr. Anjali Silva",
    specialty: "Cardiology",
    date: "2026-02-14",
    time: "10:30 AM"
  },
  {
    id: 2,
    title: "General Check-up",
    doctor: "Dr. Rohan Perera",
    specialty: "General Practice",
    date: "2026-02-20",
    time: "3:00 PM"
  }
];

function MiniCalendar({ highlightedDates }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const highlightSet = new Set(
    highlightedDates.map((d) => new Date(d).getDate())
  );

  return (
    <div style={styles.calendarContainer}>
      <div style={styles.calendarHeader}>
        <p style={styles.calendarMonth}>
          {today.toLocaleString("default", { month: "long" })} {year}
        </p>
        <span style={styles.calendarBadge}>
          Upcoming dates bold
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
            style={{
              ...styles.dayCell,
              ...(day && highlightSet.has(day) ? styles.highlightedDay : {}),
              ...(day && !highlightSet.has(day) ? styles.normalDay : {}),
              ...(!day ? styles.emptyDay : {})
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

  const handleLogout = () => {
    console.log('User logged out');
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <PatientSidebar onLogout={handleLogout} />

      <div style={styles.mainWrapper}>
        <PatientHeader patientName="Dithmi" />

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
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appt) => (
                    <div
                      key={appt.id}
                      style={styles.appointmentCard}
                    >
                      <div style={styles.appointmentCardHeader}>
                        <div>
                          <p style={styles.appointmentTitle}>{appt.title}</p>
                          <p style={styles.appointmentDoctor}>
                            {appt.doctor} · {appt.specialty}
                          </p>
                        </div>
                        <button style={styles.payButton}>
                          Pay Now
                        </button>
                      </div>
                      <p style={styles.appointmentDateTime}>
                        <FiCalendar style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        {new Date(appt.date).toLocaleDateString()}
                        <FiClock style={{ margin: '0 6px 0 12px', verticalAlign: 'middle' }} />
                        {appt.time}
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
                highlightedDates={upcomingAppointments.map((a) => a.date)}
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
    border: '2px solid white',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: 'transparent',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.3s',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  tertiaryButton: {
    borderRadius: '8px',
    border: '2px solid rgba(255, 255, 255, 0.5)',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.3s',
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
  }
};

export default PatientDashboard;


