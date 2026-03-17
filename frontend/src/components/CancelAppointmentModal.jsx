import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const CancelAppointmentModal = ({ isOpen, onClose, onConfirm, appointmentId, isLoading }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={styles.overlay}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={styles.modal}
          >
            <div style={styles.header}>
              <div style={styles.warningIcon}>
                <FiAlertTriangle />
              </div>
              <button 
                onClick={onClose} 
                style={styles.closeBtn}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>

            <div style={styles.content}>
              <h2 style={styles.title}>Cancel Appointment</h2>
              <p style={styles.message}>
                Are you sure you want to cancel appointment <strong>#APT-{appointmentId}</strong>? 
                This action will remove your scheduled slot from the system.
              </p>
            </div>

            <div style={styles.footer}>
              <button 
                onClick={onClose} 
                disabled={isLoading}
                style={styles.secondaryBtn}
              >
                Cancel
              </button>
              <button 
                onClick={onConfirm} 
                disabled={isLoading}
                style={styles.dangerBtn}
              >
                {isLoading ? 'Processing...' : 'Cancel Appointment'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '28px',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    padding: '40px 40px 0 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px'
  },
  warningIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    backgroundColor: '#fff1f2',
    color: '#ef4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s',
  },
  content: {
    padding: '0 40px 40px 40px',
    textAlign: 'left'
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: '16px',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    letterSpacing: '-0.5px'
  },
  message: {
    fontSize: '16px',
    color: '#64748b',
    lineHeight: '1.6',
    margin: 0,
    fontWeight: '500'
  },
  footer: {
    padding: '24px 40px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
    borderTop: '1px solid #f1f5f9'
  },
  secondaryBtn: {
    padding: '12px 28px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    color: '#475569',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s hover',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  dangerBtn: {
    padding: '12px 28px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.25)'
  }
};

export default CancelAppointmentModal;
