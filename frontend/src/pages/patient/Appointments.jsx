import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiCalendar, FiClock, FiCreditCard, FiPlus, FiTrash2, FiSearch } from 'react-icons/fi';
import PatientSidebar from "../../components/PatientSidebar";
import PatientHeader from "../../components/PatientHeader";
import AppointmentCard from "../../components/AppointmentCard";
import axios from 'axios';
import toast from 'react-hot-toast';

function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [gridCols, setGridCols] = useState(3);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setAppointments(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setGridCols(1);
      } else if (window.innerWidth < 1024) {
        setGridCols(2);
      } else {
        setGridCols(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleBookNew = () => {
    navigate("/patient/find-doctor");
  };

  const handleCancelAppointment = async (id) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      const toastId = toast.loading("Cancelling appointment...");
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/appointments/${id}/status`,
          { status: 'CANCELLED' },
          { headers: { Authorization: `Bearer ${token}` } });

        setAppointments(prev => prev.map(a => a.appointment_id === id ? { ...a, status: 'CANCELLED' } : a));
        toast.success("Appointment cancelled successfully", { id: toastId });
      } catch (error) {
        toast.error("Failed to cancel appointment", { id: toastId });
      }
    }
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const getFilteredAppointments = () => {
    switch (activeTab) {
      case 'Upcoming':
        return appointments.filter(apt => ['PENDING', 'CONFIRMED', 'RESCHEDULED'].includes(apt.status) && apt.appointment_date >= todayStr);
      case 'Completed':
        return appointments.filter(apt => apt.status === 'COMPLETED' || (apt.status === 'CONFIRMED' && apt.appointment_date < todayStr));
      case 'Cancelled':
        return appointments.filter(apt => apt.status === 'CANCELLED');
      default:
        return appointments;
    }
  };

  const filteredAppointments = getFilteredAppointments();

  return (
    <div style={styles.container}>
      <PatientSidebar onLogout={handleLogout} />

      <div className="main-wrapper">
        <PatientHeader />

        <main className="content-padding">
          {/* Tab Bar and Action Header */}
          <div style={styles.tabHeader}>
            <div style={styles.tabBar}>
              {['Upcoming', 'Completed', 'Cancelled'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    ...styles.tabBtn,
                    backgroundColor: activeTab === tab ? '#3B82F6' : 'transparent',
                    color: activeTab === tab ? 'white' : '#6B7280',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div style={styles.bookSection}>
                <span style={styles.bookLabel}>Book Appointment</span>
                <button onClick={handleBookNew} style={styles.bookBtn}>
                  <FiPlus size={20} />
                  <span>Book Now</span>
                </button>
            </div>
          </div>

          {/* Appointments Grid */}
          <section style={styles.section}>
            {filteredAppointments.length > 0 ? (
              <div style={{
                ...styles.appointmentGrid,
                gridTemplateColumns: `repeat(${gridCols}, 1fr)`
              }}>
                {filteredAppointments.map((apt) => (
                  <AppointmentCard 
                    key={apt.appointment_id} 
                    appt={apt} 
                    variant="grid"
                    onCancel={handleCancelAppointment}
                    onReschedule={(appt) => toast.error("Reschedule feature coming soon!")}
                    onViewDetails={(appt) => toast.success(`Viewing details for ${appt.appointment_id}`)}
                  />
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <FiCalendar size={64} style={styles.emptyIcon} />
                <p style={styles.emptyText}>No {activeTab.toLowerCase()} appointments found</p>
                <button onClick={handleBookNew} style={styles.emptyButton}>
                  <FiPlus style={{ marginRight: '8px' }} />
                  Book New Appointment
                </button>
              </div>
            )}
          </section>
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
  tabHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    backgroundColor: 'white',
    padding: '16px 24px',
    borderRadius: 'var(--radius-2xl)',
    boxShadow: 'var(--shadow-soft)',
    border: '1px solid var(--slate-100)',
    flexWrap: 'wrap',
    gap: '20px',
  },
  tabBar: {
    display: 'flex',
    gap: '8px',
    backgroundColor: '#F3F4F6',
    padding: '6px',
    borderRadius: '14px',
  },
  tabBtn: {
    padding: '10px 24px',
    borderRadius: '10px',
    fontSize: 'var(--text-sm)',
    fontWeight: '700',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  bookSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  bookLabel: {
    fontSize: 'var(--text-sm)',
    fontWeight: '700',
    color: 'var(--slate-900)',
  },
  bookBtn: {
    padding: '12px 28px',
    borderRadius: '12px',
    backgroundColor: 'var(--primary-blue)',
    color: 'white',
    border: 'none',
    fontSize: 'var(--text-sm)',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
    transition: 'all 0.2s ease',
  },
  appointmentGrid: {
    display: 'grid',
    gap: '24px',
  },
  section: {
    marginBottom: '32px'
  },
  emptyState: {
    background: 'white',
    padding: '60px 40px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '2px dashed rgba(0, 102, 204, 0.2)'
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
    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

export default Appointments;
