import { useState } from 'react';
import DoctorHeader from '../components/DoctorHeader';

function DoctorDashboard() {
  // Sample data for today's appointments
  const [appointments] = useState([
    {
      id: 1,
      time: '9:00 AM',
      patientName: 'Pradeep Senanayake',
      phone: '0771234567',
      type: 'General Checkup',
      status: 'Scheduled'
    },
    {
      id: 2,
      time: '10:30 AM',
      patientName: 'Oshadi Karunarathna',
      phone: '0772345678',
      type: 'Follow-up',
      status: 'Scheduled'
    },
    {
      id: 3,
      time: '11:45 AM',
      patientName: 'Shalini Rathnayake',
      phone: '0773456789',
      type: 'Consultation',
      status: 'Scheduled'
    }
  ]);

  // Dashboard statistics
  const stats = {
    todayAppointments: 12,
    totalPatients: 156,
    upcomingAppointments: 28
  };

  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  return (
    <div style={styles.container}>
      <DoctorHeader />

      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.pageHeader}>
          <h1 style={styles.pageTitle}>Dashboard</h1>
          <p style={styles.pageSubtitle}>Welcome back, Dr. Kanya Ekanalyake</p>
        </div>

        {/* Statistics Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📅</div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>{stats.todayAppointments}</div>
              <div style={styles.statLabel}>Today's Appointments</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>{stats.totalPatients}</div>
              <div style={styles.statLabel}>Total Patients</div>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon}>⏰</div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>{stats.upcomingAppointments}</div>
              <div style={styles.statLabel}>Upcoming Appointments</div>
            </div>
          </div>
        </div>

        {/* Today's Appointments Section */}
        <section style={styles.appointmentsSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Today's Appointments</h2>
            <span style={styles.appointmentCount}>{appointments.length}</span>
          </div>

          <div style={styles.appointmentsList}>
            {appointments.length > 0 ? (
              appointments.map(appt => (
                <div key={appt.id} style={styles.appointmentItem}>
                  <div style={styles.appointmentTime}>
                    <span style={styles.time}>{appt.time}</span>
                  </div>

                  <div style={styles.appointmentDetails}>
                    <h4 style={styles.patientName}>{appt.patientName}</h4>
                    <p style={styles.appointmentType}>{appt.type}</p>
                    <p style={styles.contactInfo}>📞 {appt.phone}</p>
                  </div>

                  <div style={styles.appointmentStatus}>
                    <span style={styles.statusBadge}>{appt.status}</span>
                  </div>

                  <div style={styles.appointmentActions}>
                    <button style={styles.viewBtn}>View Details</button>
                    <button style={styles.completeBtn}>Mark Complete</button>
                  </div>
                </div>
              ))
            ) : (
              <p style={styles.noAppointments}>No appointments scheduled for today</p>
            )}
          </div>
        </section>

        {/* Quick Actions Section */}
        <section style={styles.quickActionsSection}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.actionsGrid}>
            <button
              style={styles.actionButton}
              onClick={() => setShowAvailabilityModal(true)}
            >
              📋 Update Availability
            </button>
            <button style={styles.actionButton}>
              📝 Add Prescription
            </button>
            <button style={styles.actionButton}>
              📊 View Reports
            </button>
          </div>
        </section>
      </main>

      {/* Update Availability Modal */}
      {showAvailabilityModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAvailabilityModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Update Availability</h3>
              <button
                style={styles.closeBtn}
                onClick={() => setShowAvailabilityModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Day</label>
                <select style={styles.select}>
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wednesday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                  <option>Saturday</option>
                </select>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Start Time</label>
                  <input type="time" style={styles.input} defaultValue="09:00" />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>End Time</label>
                  <input type="time" style={styles.input} defaultValue="17:00" />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" style={styles.checkbox} defaultChecked />
                  Available
                </label>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.cancelBtn}
                onClick={() => setShowAvailabilityModal(false)}
              >
                Cancel
              </button>
              <button
                style={styles.submitBtn}
                onClick={() => setShowAvailabilityModal(false)}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  // Container & Layout
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
  },

  // Header Styles
  header: {
    backgroundColor: '#ffffff',
    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },

  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    minWidth: 'fit-content'
  },

  brandIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'grid',
    placeItems: 'center',
    fontSize: '20px',
    color: '#fff',
    boxShadow: '0 6px 16px rgba(102,126,234,0.35)'
  },

  brandTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#111827'
  },

  brandSubtitle: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px'
  },

  navigation: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    marginLeft: '40px'
  },

  navItem: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#4b5563',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },

  navItemActive: {
    color: '#059669',
    backgroundColor: 'rgba(5, 150, 105, 0.1)'
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: 'auto'
  },

  notificationBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    background: '#f5f7fb',
    cursor: 'pointer',
    fontSize: '18px',
    transition: 'all 0.2s ease'
  },

  profileAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 700,
    color: '#fff',
    fontSize: '12px'
  },

  logoutBtn: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #e74c3c',
    background: '#e74c3c',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 6px 14px rgba(231,76,60,0.25)'
  },

  // Main Content
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px 24px'
  },

  pageHeader: {
    marginBottom: '32px'
  },

  pageTitle: {
    fontSize: '32px',
    fontWeight: 700,
    color: '#111827',
    margin: 0
  },

  pageSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '8px'
  },

  // Statistics Cards Grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },

  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease'
  },

  statIcon: {
    fontSize: '32px',
    width: '60px',
    height: '60px',
    display: 'grid',
    placeItems: 'center',
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    borderRadius: '10px'
  },

  statInfo: {
    flex: 1
  },

  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#059669'
  },

  statLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '4px'
  },

  // Appointments Section
  appointmentsSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e5e7eb'
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e5e7eb'
  },

  sectionTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#111827',
    margin: 0
  },

  appointmentCount: {
    backgroundColor: '#059669',
    color: '#fff',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 600
  },

  appointmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  appointmentItem: {
    display: 'grid',
    gridTemplateColumns: '100px 1fr 120px 200px',
    gap: '16px',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s ease'
  },

  appointmentTime: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },

  time: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#059669'
  },

  appointmentDetails: {
    display: 'flex',
    flexDirection: 'column'
  },

  patientName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#111827',
    margin: 0
  },

  appointmentType: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '4px 0 0 0'
  },

  contactInfo: {
    fontSize: '12px',
    color: '#4b5563',
    margin: '2px 0 0 0'
  },

  appointmentStatus: {
    textAlign: 'center'
  },

  statusBadge: {
    backgroundColor: '#d1e7dd',
    color: '#0f5132',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600
  },

  appointmentActions: {
    display: 'flex',
    gap: '8px'
  },

  viewBtn: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    color: '#059669',
    fontWeight: 600,
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  completeBtn: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#059669',
    color: '#fff',
    fontWeight: 600,
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  noAppointments: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '32px 16px',
    fontSize: '14px'
  },

  // Quick Actions Section
  quickActionsSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e5e7eb'
  },

  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginTop: '16px'
  },

  actionButton: {
    padding: '16px 20px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#059669',
    color: '#fff',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
  },

  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  },

  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    maxWidth: '500px',
    width: '90%'
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb'
  },

  modalTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#111827',
    margin: 0
  },

  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#6b7280',
    cursor: 'pointer',
    padding: 0
  },

  modalBody: {
    padding: '24px'
  },

  formGroup: {
    marginBottom: '20px'
  },

  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#111827',
    marginBottom: '8px'
  },

  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease'
  },

  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },

  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },

  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#111827',
    cursor: 'pointer'
  },

  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },

  modalFooter: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    padding: '20px 24px',
    borderTop: '1px solid #e5e7eb'
  },

  cancelBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: '#fff',
    color: '#4b5563',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  submitBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#059669',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};

export default DoctorDashboard;
