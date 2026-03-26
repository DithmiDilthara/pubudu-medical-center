import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to perform this action? This cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  type = "danger" // 'danger' or 'warning'
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={styles.overlay}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          style={styles.modal}
        >
          <div style={styles.header}>
            <div style={{
              ...styles.iconWrapper,
              backgroundColor: type === 'danger' ? '#fee2e2' : '#fef3c7'
            }}>
              <FiAlertTriangle style={{
                fontSize: '24px',
                color: type === 'danger' ? '#ef4444' : '#f59e0b'
              }} />
            </div>
            <button onClick={onClose} style={styles.closeBtn}>
              <FiX />
            </button>
          </div>

          <div style={styles.content}>
            <h3 style={styles.title}>{title}</h3>
            <p style={styles.message}>{message}</p>
          </div>

          <div style={styles.footer}>
            <button onClick={onClose} style={styles.cancelBtn}>
              {cancelLabel}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }} 
              style={{
                ...styles.confirmBtn,
                backgroundColor: type === 'danger' ? '#ef4444' : '#2563eb'
              }}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
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
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden'
  },
  header: {
    padding: '24px 24px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s'
  },
  content: {
    padding: '0 24px 24px'
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0'
  },
  message: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.6',
    margin: 0
  },
  footer: {
    padding: '16px 24px',
    backgroundColor: '#f8fafc',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  cancelBtn: {
    padding: '10px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  confirmBtn: {
    padding: '10px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  }
};

export default ConfirmDialog;
