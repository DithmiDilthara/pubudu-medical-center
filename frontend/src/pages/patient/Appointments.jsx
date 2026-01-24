import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiDollarSign, FiPlus, FiTrash2 } from 'react-icons/fi';
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";

function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    // Load appointments from localStorage
    const savedAppointments = JSON.parse(localStorage.getItem("appointments") || "[]");
    setAppointments(savedAppointments);
  }, []);

  const handleLogout = () => {
    console.log("User logged out");
    navigate("/");
  };

  const handleBookNew = () => {
    navigate("/patient/find-doctor");
  };

  const handleCancelAppointment = (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      const updatedAppointments = appointments.filter(apt => apt.id !== id);
      setAppointments(updatedAppointments);
      localStorage.setItem("appointments", JSON.stringify(updatedAppointments));
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.date) >= new Date().setHours(0, 0, 0, 0)
  );

  const pastAppointments = appointments.filter(apt => 
    new Date(apt.date) < new Date().setHours(0, 0, 0, 0)
  );

  return (
    <div style={styles.container}>
      <PatientSidebar onLogout={handleLogout} />

      <div style={styles.mainWrapper}>
        <PatientHeader patientName="Dithmi" />

        <main style={styles.mainContent}>
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h1 style={styles.pageTitle}>My Appointments</h1>
              <p style={styles.pageSubtitle}>Manage your medical appointments</p>
            </div>
            <button onClick={handleBookNew} style={styles.bookNewButton}>
              <FiPlus style={{ marginRight: '8px' }} />
              Book New Appointment
            </button>
          </div>

          {/* Upcoming Appointments */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <FiCalendar style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Upcoming Appointments
            </h2>
            
            {upcomingAppointments.length > 0 ? (
              <div style={styles.appointmentsList}>
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} style={styles.appointmentCard}>
                    <div style={styles.appointmentHeader}>
                      <div style={styles.appointmentLeft}>
                        <div style={styles.doctorAvatar}>
                          {apt.doctor.charAt(3)}
                        </div>
                        <div>
                          <h3 style={styles.doctorName}>{apt.doctor}</h3>
                          <p style={styles.specialty}>{apt.specialty}</p>
                        </div>
                      </div>
                      <div style={styles.appointmentRight}>
                        <span style={styles.statusBadge}>Upcoming</span>
                      </div>
                    </div>

                    <div style={styles.appointmentDetails}>
                      <div style={styles.detailItem}>
                        <FiCalendar size={20} style={styles.detailIcon} />
                        <span style={styles.detailText}>
                          {new Date(apt.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div style={styles.detailItem}>
                        <FiClock size={20} style={styles.detailIcon} />
                        <span style={styles.detailText}>{apt.time}</span>
                      </div>
                      <div style={styles.detailItem}>
                        <FiDollarSign size={20} style={styles.detailIcon} />
                        <span style={styles.detailText}>Rs. {apt.fee.toFixed(2)}</span>
                      </div>
                    </div>

                    {apt.notes && (
                      <div style={styles.notesSection}>
                        <p style={styles.notesLabel}>Notes:</p>
                        <p style={styles.notesText}>{apt.notes}</p>
                      </div>
                    )}

                    <div style={styles.appointmentActions}>
                      <button 
                        onClick={() => handleCancelAppointment(apt.id)}
                        style={styles.cancelButton}
                      >
                        <FiTrash2 style={{ marginRight: '6px' }} />
                        Cancel Appointment
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <FiCalendar size={64} style={styles.emptyIcon} />
                <p style={styles.emptyText}>No upcoming appointments</p>
                <button onClick={handleBookNew} style={styles.emptyButton}>
                  <FiPlus style={{ marginRight: '8px' }} />
                  Book Your First Appointment
                </button>
              </div>
            )}
          </section>

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>
                <FiCalendar style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Past Appointments
              </h2>
              
              <div style={styles.appointmentsList}>
                {pastAppointments.map((apt) => (
                  <div key={apt.id} style={{...styles.appointmentCard, ...styles.pastCard}}>
                    <div style={styles.appointmentHeader}>
                      <div style={styles.appointmentLeft}>
                        <div style={styles.doctorAvatar}>
                          {apt.doctor.charAt(3)}
                        </div>
                        <div>
                          <h3 style={styles.doctorName}>{apt.doctor}</h3>
                          <p style={styles.specialty}>{apt.specialty}</p>
                        </div>
                      </div>
                      <div style={styles.appointmentRight}>
                        <span style={styles.pastBadge}>Completed</span>
                      </div>
                    </div>

                    <div style={styles.appointmentDetails}>
                      <div style={styles.detailItem}>
                        <FiCalendar size={20} style={styles.detailIcon} />
                        <span style={styles.detailText}>
                          {new Date(apt.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                      <div style={styles.detailItem}>
                        <FiClock size={20} style={styles.detailIcon} />
                        <span style={styles.detailText}>{apt.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
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
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  mainContent: {
    flex: 1,
    padding: '32px',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  pageTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: '0 0 8px 0',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  pageSubtitle: {
    fontSize: '15px',
    color: '#6b7280',
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  bookNewButton: {
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '700',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  section: {
    marginBottom: '32px'
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: '0 0 20px 0',
    display: 'flex',
    alignItems: 'center',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  appointmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  appointmentCard: {
    background: 'white',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '2px solid rgba(102, 126, 234, 0.1)',
    transition: 'all 0.3s'
  },
  pastCard: {
    opacity: 0.7,
    border: '2px solid #e5e7eb'
  },
  appointmentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  appointmentLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  doctorAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    flexShrink: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  doctorName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 4px 0',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  specialty: {
    fontSize: '14px',
    color: '#667eea',
    fontWeight: '600',
    margin: 0,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  appointmentRight: {},
  statusBadge: {
    padding: '6px 16px',
    fontSize: '13px',
    fontWeight: '700',
    color: 'white',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    borderRadius: '20px',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  pastBadge: {
    padding: '6px 16px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#6b7280',
    background: '#f3f4f6',
    borderRadius: '20px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  appointmentDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '16px'
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
    borderRadius: '10px',
    border: '1px solid rgba(102, 126, 234, 0.1)'
  },
  detailIcon: {
    color: '#667eea'
  },
  detailText: {
    fontSize: '14px',
    color: '#374151',
    fontWeight: '600',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  notesSection: {
    padding: '16px',
    background: '#fef3c7',
    borderRadius: '10px',
    border: '1px solid #fbbf24',
    marginBottom: '16px'
  },
  notesLabel: {
    fontSize: '13px',
    color: '#92400e',
    fontWeight: '700',
    margin: '0 0 4px 0',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  notesText: {
    fontSize: '14px',
    color: '#78350f',
    margin: 0,
    lineHeight: '1.5',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  appointmentActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px'
  },
  cancelButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#dc2626',
    background: 'white',
    border: '2px solid #dc2626',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  emptyState: {
    background: 'white',
    padding: '60px 40px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '2px dashed rgba(102, 126, 234, 0.2)'
  },
  emptyIcon: {
    color: '#9ca3af',
    marginBottom: '16px',
    opacity: 0.5
  },
  emptyText: {
    fontSize: '16px',
    color: '#9ca3af',
    marginBottom: '20px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  emptyButton: {
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '700',
    color: 'white',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

export default Appointments;
