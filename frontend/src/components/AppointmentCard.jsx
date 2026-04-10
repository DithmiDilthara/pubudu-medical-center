import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiCalendar, FiClock, FiMapPin, FiMoreVertical, FiChevronRight, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import doctor_m1 from '../assets/doctor_m1.png';

const AppointmentCard = ({ 
  appt, 
  variant = 'carousel', // 'carousel' or 'grid'
  role = 'patient', // 'patient' or 'doctor'
  onCancel, 
  onReschedule, 
  onViewDetails 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED': return { bg: '#f0fdf4', text: '#10b981', border: '#dcfce7' };
      case 'PENDING': return { bg: '#fffbeb', text: '#f59e0b', border: '#fef3c7' };
      case 'RESCHEDULED': return { bg: '#fff7ed', text: '#f97316', border: '#ffedd5' };
      case 'CANCELLED': return { bg: '#fff1f2', text: '#e11d48', border: '#ffe4e6' };
      case 'COMPLETED': return { bg: '#eff6ff', text: '#2563eb', border: '#dbeafe' };
      case 'NO_SHOW': return { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };
      case 'RESCHEDULE_REQUIRED': return { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' };
      default: return { bg: '#f8fafc', text: '#64748b', border: '#f1f5f9' };
    }
  };

  const status = getStatusStyle(appt.status);
  const isUpcoming = ['PENDING', 'CONFIRMED', 'RESCHEDULED'].includes(appt.status?.toUpperCase());

  // Determine which info to show based on role
  const displayInfo = role === 'doctor' ? {
    name: appt.patient?.full_name || 'Patient',
    subtext: appt.patient?.nic || appt.patient?.gender || 'Patient Details',
    image: null // Can add patient image later if available
  } : {
    name: appt.doctor?.full_name || 'Doctor',
    subtext: appt.doctor?.specialization,
    image: appt.doctor?.image || doctor_m1
  };

  return (
    <motion.div 
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      style={{
        ...styles.card,
        borderTop: variant === 'grid' ? `4px solid ${status.text}` : '1px solid #f1f5f9'
      }}
    >
      <div 
        style={{
          ...styles.cardHeader,
          cursor: onViewDetails ? 'pointer' : 'default'
        }}
        onClick={() => onViewDetails && onViewDetails(appt)}
      >
        <div style={styles.avatarWrapper}>
          {displayInfo.image ? (
            <img 
              src={displayInfo.image} 
              alt={displayInfo.name} 
              style={styles.avatar}
            />
          ) : (
            <div style={styles.initialsAvatar}>
              {displayInfo.name.charAt(0)}
            </div>
          )}
          <div style={{...styles.statusPing, backgroundColor: status.text}} />
        </div>
        <div style={styles.doctorInfo}>
          <h4 style={styles.doctorName}>{displayInfo.name}</h4>
          <p style={styles.specialty}>{displayInfo.subtext}</p>
        </div>
        
        {variant === 'carousel' ? (
          <div style={{...styles.statusBadge, backgroundColor: status.bg, color: status.text, border: `1px solid ${status.border}`}}>
            {appt.status === 'RESCHEDULE_REQUIRED' ? 'Session Cancelled' : appt.status}
          </div>
        ) : (
          <div style={styles.menuContainer}>
             <button onClick={() => setShowMenu(!showMenu)} style={styles.menuToggle}>
                <FiMoreVertical />
             </button>
             <AnimatePresence>
                {showMenu && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        style={styles.dropdown}
                    >
                        <button onClick={() => { onViewDetails(appt); setShowMenu(false); }} style={styles.dropItem}>View Details</button>
                        {isUpcoming && (
                            <button 
                                onClick={() => { 
                                    if (role === 'patient') {
                                        toast.error('Please contact the Pubudu Medical Center receptionist to cancel or reschedule your appointment.', {
                                            duration: 5000,
                                            icon: '📞'
                                        });
                                    } else {
                                        onReschedule(appt); 
                                    }
                                    setShowMenu(false); 
                                }} 
                                style={styles.dropItem}
                            >
                                Reschedule
                            </button>
                        )}
                        {isUpcoming && role !== 'doctor' && (
                            <button 
                                onClick={() => { 
                                    if (role === 'patient') {
                                        toast.error('Please contact the Pubudu Medical Center receptionist to cancel or reschedule your appointment.', {
                                            duration: 5000,
                                            icon: '📞'
                                        });
                                    } else {
                                        onCancel(appt.appointment_id); 
                                    }
                                    setShowMenu(false); 
                                }} 
                                style={{...styles.dropItem, color: '#e11d48'}}
                            >
                                Cancel
                            </button>
                        )}
                    </motion.div>
                )}
             </AnimatePresence>
          </div>
        )}
      </div>

      <div style={styles.detailsList}>
        <div style={styles.detailItem}>
          <div style={styles.iconBox}><FiCalendar /></div>
          <div>
            <p style={styles.detLabel}>Date</p>
            <p style={styles.detVal}>{appt.appointment_date}</p>
          </div>
        </div>
        <div style={styles.detailItem}>
          <div style={styles.iconBox}><FiClock /></div>
          <div>
            <p style={styles.detLabel}>Time</p>
            <p style={styles.detVal}>{appt.time_slot}</p>
          </div>
        </div>
      </div>

      <div style={styles.cardFooter}>
        {variant === 'grid' && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{...styles.statusBadge, backgroundColor: status.bg, color: status.text, border: `1px solid ${status.border}`}}>
              {appt.status === 'RESCHEDULE_REQUIRED' ? 'Session Cancelled' : appt.status}
            </div>
            <div style={{
              ...styles.statusBadge, 
              backgroundColor: appt.payment_status === 'PAID' ? '#f0fdf4' : '#fef2f2', 
              color: appt.payment_status === 'PAID' ? '#166534' : '#991b1b', 
              border: `1px solid ${appt.payment_status === 'PAID' ? '#bbf7d0' : '#fecaca'}`
            }}>
              {appt.payment_status}
            </div>
          </div>
        )}
        
        <div style={styles.actionGroup}>
            {isUpcoming && role !== 'doctor' && (
              <>
                <button 
                   onClick={() => {
                        if (role === 'patient') {
                            toast.error('Please contact the Pubudu Medical Center receptionist to cancel or reschedule your appointment.', {
                                duration: 5000,
                                icon: '📞'
                            });
                        } else if (onCancel) {
                            onCancel(appt.appointment_id);
                        }
                   }}
                   style={{...styles.viewBtn, backgroundColor: '#fff1f2', color: '#e11d48'}}
                >
                    Cancel
                </button>
                {appt.payment_status !== 'PAID' && (
                  <button 
                     onClick={() => onViewDetails && onViewDetails(appt)}
                     style={{...styles.viewBtn, padding: '8px 12px'}}
                  >
                      Pay Now
                      <FiChevronRight style={{ marginLeft: '4px' }} />
                  </button>
                )}
              </>
            )}

            {appt.status === 'COMPLETED' && (
              <button 
                 onClick={() => onViewDetails && onViewDetails(appt)}
                 style={{...styles.viewBtn, width: '100%', justifyContent: 'center'}}
              >
                  Medical History
                  <FiChevronRight style={{ marginLeft: '4px' }} />
              </button>
            )}
            
            {/* Cancelled appointments show no action buttons */}
        </div>
        {appt.status === 'RESCHEDULE_REQUIRED' && (
          <div style={{
            marginTop: '12px',
            padding: '10px 14px',
            backgroundColor: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#92400e',
            fontWeight: '600',
            lineHeight: '1.5'
          }}>
            ⚠️ Your session was cancelled. Please contact the medical center to reschedule your appointment.
          </div>
        )}
      </div>
    </motion.div>
  );
};

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '28px',
    border: '1px solid #f1f5f9',
    position: 'relative',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    position: 'relative',
  },
  avatarWrapper: {
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '16px',
    backgroundColor: '#f8fafc'
  },
  statusPing: {
    position: 'absolute',
    bottom: '-2px',
    right: '-2px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    border: '3px solid white',
  },
  initialsAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: '16px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '800'
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
    fontFamily: 'var(--font-accent)',
  },
  specialty: {
    fontSize: '13px',
    color: '#2563eb',
    margin: '2px 0 0 0',
    fontWeight: '600',
    fontFamily: 'var(--font-main)',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '100px',
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: 'var(--font-accent)',
  },
  menuContainer: {
    position: 'relative'
  },
  menuToggle: {
    padding: '8px',
    borderRadius: '10px',
    border: 'none',
    background: '#f8fafc',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '18px'
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'white',
    borderRadius: '14px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f1f5f9',
    zIndex: 10,
    padding: '8px',
    minWidth: '140px'
  },
  dropItem: {
    display: 'block',
    width: '100%',
    padding: '10px 12px',
    textAlign: 'left',
    border: 'none',
    background: 'none',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e293b',
    borderRadius: '8px',
    cursor: 'pointer',
    ':hover': {
        backgroundColor: '#f8fafc'
    }
  },
  detailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '28px',
    flex: 1,
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    fontSize: '16px'
  },
  detLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    margin: 0,
    fontFamily: 'var(--font-main)',
  },
  detVal: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
    fontFamily: 'var(--font-accent)',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #f8fafc',
    minHeight: '44px'
  },
  actionGroup: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  viewBtn: {
    padding: '8px 16px',
    borderRadius: '10px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: 'none',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s'
  }
};

export default AppointmentCard;
