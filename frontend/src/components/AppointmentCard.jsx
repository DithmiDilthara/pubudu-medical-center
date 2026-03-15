import React, { useState } from 'react';
import { FiCalendar, FiClock, FiMapPin, FiMoreVertical } from 'react-icons/fi';
import doctor_m1 from '../assets/doctor_m1.png';

const AppointmentCard = ({ 
  appt, 
  variant = 'carousel', // 'carousel' or 'grid'
  onCancel, 
  onReschedule, 
  onViewDetails 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED': return { bg: '#D1FAE5', text: '#10B981' };
      case 'PENDING': return { bg: '#FEF3C7', text: '#F59E0B' };
      case 'RESCHEDULED': return { bg: '#FFEDD5', text: '#F97316' };
      case 'CANCELLED': return { bg: '#FEE2E2', text: '#EF4444' };
      case 'COMPLETED': return { bg: '#DBEAFE', text: '#3B82F6' };
      default: return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const statusStyle = getStatusColor(appt.status);
  const isUpcoming = ['PENDING', 'CONFIRMED', 'RESCHEDULED'].includes(appt.status?.toUpperCase());

  return (
    <div 
      style={{
        ...styles.card,
        transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 12px 20px rgba(0,0,0,0.05)' : '0 4px 6px rgba(0,0,0,0.02)',
        borderTopColor: isHovered ? '#3B82F6' : 'transparent',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.cardHeader}>
        <div style={styles.avatarWrapper}>
          <img 
            src={appt.doctor?.image || doctor_m1} 
            alt={appt.doctor?.full_name} 
            style={styles.avatar}
          />
        </div>
        <div style={styles.doctorInfo}>
          <h4 style={styles.doctorName}>{appt.doctor?.full_name || 'Doctor Name'}</h4>
          <p style={styles.specialty}>{appt.doctor?.specialization || 'Specialty'}</p>
        </div>
        
        {variant === 'carousel' ? (
          <div style={{...styles.statusBadge, ...styles.badgeTopRight, backgroundColor: statusStyle.bg, color: statusStyle.text}}>
            {appt.status}
          </div>
        ) : (
          <div style={styles.menuWrapper}>
            <FiMoreVertical style={styles.menuIcon} />
          </div>
        )}
      </div>

      <div style={styles.detailsList}>
        <div style={styles.detailItem}>
          <FiCalendar style={styles.detailIcon} />
          <span style={styles.detailText}>{appt.appointment_date}</span>
        </div>
        <div style={styles.detailItem}>
          <FiClock style={styles.detailIcon} />
          <span style={styles.detailText}>{appt.time_slot}</span>
        </div>
        <div style={styles.detailItem}>
          <FiMapPin style={styles.detailIcon} />
          <span style={styles.detailText}>{appt.branch || 'Main Branch'}</span>
        </div>
      </div>

      <div style={styles.cardFooter}>
        {variant === 'grid' && (
          <div style={{...styles.statusBadge, ...styles.badgeBottomLeft, backgroundColor: statusStyle.bg, color: statusStyle.text}}>
            {appt.status}
          </div>
        )}
        
        <div style={styles.actionButtons}>
          {isUpcoming ? (
            <>
              <button 
                onClick={() => onReschedule && onReschedule(appt)}
                style={{...styles.actionBtn, ...styles.rescheduleBtn}}
              >
                Reschedule
              </button>
              <button 
                onClick={() => onCancel && onCancel(appt.appointment_id)}
                style={{...styles.actionBtn, ...styles.cancelBtn}}
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              onClick={() => onViewDetails && onViewDetails(appt)}
              style={{...styles.actionBtn, ...styles.detailsBtn, gridColumn: 'span 2'}}
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid #E5E7EB',
    position: 'relative',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    overflow: 'hidden',
    borderTop: '4px solid transparent',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '20px',
    position: 'relative',
  },
  avatarWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid #F3F4F6',
    flexShrink: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 'var(--text-base)',
    fontWeight: '700',
    color: 'var(--slate-900)',
    margin: 0,
  },
  specialty: {
    fontSize: 'var(--text-sm)',
    color: 'var(--primary-blue)',
    margin: '2px 0 0 0',
    fontWeight: '500',
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '100px',
    fontSize: 'var(--text-xs)',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  badgeTopRight: {
    position: 'absolute',
    top: '0',
    right: '0',
  },
  badgeBottomLeft: {
    marginRight: 'auto',
  },
  menuWrapper: {
    padding: '4px',
    color: '#9CA3AF',
  },
  menuIcon: {
    fontSize: '18px',
  },
  detailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
    flex: 1,
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#6B7280',
  },
  detailIcon: {
    fontSize: '16px',
    color: '#9CA3AF',
  },
  detailText: {
    fontSize: 'var(--text-sm)',
    fontWeight: '500',
  },
  cardFooter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  actionBtn: {
    padding: '10px',
    borderRadius: '12px',
    fontSize: 'var(--text-sm)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
  },
  rescheduleBtn: {
    border: '1px solid #E5E7EB',
    backgroundColor: '#F9FAFB',
    color: '#4B5563',
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6',
    color: '#EF4444',
  },
  detailsBtn: {
    backgroundColor: '#3B82F6',
    color: 'white',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
  },
};

export default AppointmentCard;
