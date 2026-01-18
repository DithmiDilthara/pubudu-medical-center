import { Link, useNavigate } from "react-router-dom";
import Navigation from "../components/navigation";

const upcomingAppointments = [
  { id: 1, title: "Specialist Consultation", doctor: "Dr. Anjali Silva", specialty: "Cardiology", date: "2026-02-14", time: "10:30 AM" },
  { id: 2, title: "General Check-up", doctor: "Dr. Rohan Perera", specialty: "General Practice", date: "2026-02-20", time: "3:00 PM" }
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

  const highlightSet = new Set(highlightedDates.map(d => new Date(d).getDate()));

  return (
    <div style={styles.calendarContainer}>
      <div style={styles.calendarHeader}>
        <p style={styles.calendarMonth}>
          {today.toLocaleString("default", { month: "long" })} {year}
        </p>
        <span style={styles.calendarBadge}>Upcoming dates bold</span>
      </div>
      <div style={styles.calendarGrid}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} style={styles.dayLabel}>{d}</div>
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
    console.log("User logged out");
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <Navigation onLogout={handleLogout} />

      <main style={styles.mainContent}>
        <div style={styles.headerSection}>
          <div>
            <h1 style={styles.welcomeTitle}>Welcome, Dithmi</h1>
            <p style={styles.welcomeSubtitle}>Your personalized health overview</p>
          </div>
        </div>

        <section style={styles.quickActionsSection}>
          <h3 style={styles.quickActionsTitle}>Quick Actions</h3>
          <div style={styles.quickActionsButtons}>
            <Link to="/patient/appointments" style={styles.primaryButton}>📅 Book Appointment</Link>
            <Link to="/patient/find-doctor" style={styles.secondaryButton}>👨‍⚕️ Find Doctor</Link>
            <Link to="/patient/appointments" style={styles.tertiaryButton}>📋 My Appointments</Link>
          </div>
        </section>

        <div style={styles.topGrid}>
          <section style={styles.appointmentsSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>☑️ Upcoming Appointments</h2>
              <Link to="/patient/appointments" style={styles.bookLink}>View All →</Link>
            </div>
            <div style={styles.appointmentsList}>
              {upcomingAppointments.length ? upcomingAppointments.map(appt => (
                <div key={appt.id} style={styles.appointmentCard}>
                  <div style={styles.appointmentCardHeader}>
                    <div>
                      <p style={styles.appointmentTitle}>{appt.title}</p>
                      <p style={styles.appointmentDoctor}>{appt.doctor} · {appt.specialty}</p>
                    </div>
                    <button style={styles.payButton}>Pay Now</button>
                  </div>
                  <p style={styles.appointmentDateTime}>📅 {new Date(appt.date).toLocaleDateString()} · ⏰ {appt.time}</p>
                </div>
              )) : (
                <p style={styles.noAppointmentsText}>No upcoming appointments</p>
              )}
            </div>
          </section>

          <section style={styles.calendarSection}>
            <MiniCalendar highlightedDates={upcomingAppointments.map(a => a.date)} />
          </section>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f5f5 0%, #f9fafb 100%)"
  },
  mainContent: {
    flex: 1,
    padding: "28px 32px 48px",
    maxWidth: "1200px",
    width: "100%",
    margin: "0 auto"
  },
  headerSection: {
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px"
  },
  welcomeTitle: {
    fontSize: "32px",
    fontWeight: "bold",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0
  },
  welcomeSubtitle: {
    fontSize: "15px",
    color: "#666",
    margin: "8px 0 0 0"
  },
  quickActionsSection: {
    marginBottom: "28px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "22px",
    boxShadow: "0 10px 30px rgba(102, 126, 234, 0.2)",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  },
  quickActionsTitle: {
    fontSize: "19px",
    fontWeight: "700",
    color: "white",
    margin: "0 0 14px 0"
  },
  quickActionsButtons: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap"
  },
  primaryButton: {
    borderRadius: "8px",
    backgroundColor: "white",
    padding: "12px 20px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#667eea",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    textDecoration: "none",
    border: "2px solid white"
  },
  secondaryButton: {
    borderRadius: "8px",
    border: "2px solid white",
    padding: "12px 20px",
    fontSize: "15px",
    fontWeight: "600",
    color: "white",
    backgroundColor: "transparent",
    textDecoration: "none"
  },
  tertiaryButton: {
    borderRadius: "8px",
    border: "2px solid rgba(255,255,255,0.5)",
    padding: "12px 20px",
    fontSize: "15px",
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    backgroundColor: "rgba(255,255,255,0.12)",
    textDecoration: "none"
  },
  topGrid: {
    display: "grid",
    gap: "20px",
    gridTemplateColumns: "2fr 1fr"
  },
  appointmentsSection: {
    borderRadius: "12px",
    backgroundColor: "white",
    padding: "22px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
    border: "1px solid rgba(102, 126, 234, 0.1)"
  },
  sectionHeader: {
    marginBottom: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "2px solid #f0f0f0",
    paddingBottom: "14px"
  },
  sectionTitle: {
    fontSize: "19px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0
  },
  bookLink: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#667eea",
    textDecoration: "none"
  },
  appointmentsList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  appointmentCard: {
    borderRadius: "10px",
    border: "2px solid #f0f0f0",
    padding: "14px",
    background: "linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  appointmentCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  appointmentTitle: {
    fontSize: "12px",
    color: "#888",
    margin: 0,
    letterSpacing: "0.4px"
  },
  appointmentDoctor: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#667eea",
    margin: 0
  },
  payButton: {
    fontSize: "13px",
    fontWeight: "700",
    color: "white",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "6px",
    padding: "7px 14px",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(102, 126, 234, 0.3)"
  },
  appointmentDateTime: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
    fontWeight: "500"
  },
  noAppointmentsText: {
    fontSize: "14px",
    color: "#999",
    textAlign: "center",
    padding: "20px",
    margin: 0
  },
  calendarSection: {
    gridColumn: "span 1"
  },
  calendarContainer: {
    borderRadius: "12px",
    border: "1px solid rgba(102, 126, 234, 0.15)",
    backgroundColor: "white",
    padding: "18px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)"
  },
  calendarHeader: {
    marginBottom: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "2px solid #f0f0f0",
    paddingBottom: "10px"
  },
  calendarMonth: {
    fontSize: "16px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0
  },
  calendarBadge: {
    fontSize: "12px",
    color: "#667eea",
    fontWeight: "700"
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "8px",
    textAlign: "center",
    fontSize: "14px"
  },
  dayLabel: {
    color: "#667eea",
    fontSize: "12px",
    fontWeight: "700",
    padding: "6px 0"
  },
  dayCell: {
    height: "34px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "500"
  },
  highlightedDay: {
    fontWeight: "bold",
    color: "white",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "2px solid #667eea",
    boxShadow: "0 4px 10px rgba(102, 126, 234, 0.3)"
  },
  normalDay: {
    color: "#555",
    border: "1px solid #e5e7eb"
  },
  emptyDay: {
    color: "#ddd"
  }
};

export default PatientDashboard;