import React from 'react';
import { useNavigate } from 'react-router-dom';

const CancellationModal = ({ messages, onClose }) => {
  const navigate = useNavigate();

  if (!messages || messages.length === 0) return null;

  const handleOk = () => {
    onClose();
    navigate('/patient/find-doctor');
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modalContent}>
        <button onClick={handleCancel} style={styles.closeButton}>
          &times;
        </button>

        <h2 style={styles.title}>Appointment Cancelled</h2>

        <div style={styles.subtitleContainer}>
          <p style={styles.subtitle}>
            Please review the following schedule changes and book a new appointment.
          </p>
        </div>

        <div style={styles.messagesContainer}>
          {messages.map((msg, idx) => (
            <div key={idx} style={styles.messageBox}>
              <p style={styles.messageText}>{msg}</p>
            </div>
          ))}
        </div>

        <button onClick={handleOk} style={styles.primaryButton}>
          Ok
        </button>

        <div style={styles.secondaryActionContainer}>
          <button onClick={handleCancel} style={styles.secondaryButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '4px',
    padding: '48px 32px',
    width: '90%',
    maxWidth: '480px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    position: 'relative',
    textAlign: 'center',
    animation: 'modalFadeIn 0.3s ease-out'
  },
  closeButton: {
    position: 'absolute',
    top: '12px',
    right: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    fontSize: '28px',
    lineHeight: 1,
    padding: '4px',
    transition: 'color 0.2s',
    fontWeight: '300'
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1e3a8a', // Dark blue matching mockup
    marginBottom: '16px',
    marginTop: 0,
    lineHeight: 1.2
  },
  subtitleContainer: {
    marginBottom: '24px',
    padding: '0 16px'
  },
  subtitle: {
    fontSize: '15px',
    color: '#4b5563',
    lineHeight: '1.5',
    margin: 0
  },
  messagesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '32px'
  },
  messageBox: {
    padding: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    backgroundColor: '#f9fafb'
  },
  messageText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    margin: 0,
    lineHeight: '1.5'
  },
  primaryButton: {
    backgroundColor: '#1e40af', // Standard solid blue like Bombas
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    width: '100%',
    maxWidth: '300px',
    display: 'inline-block'
  },
  secondaryActionContainer: {
    marginTop: '16px'
  },
  secondaryButton: {
    background: 'none',
    border: 'none',
    color: '#1f2937',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'underline',
    cursor: 'pointer',
    padding: '8px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

// Add keyframes for modal animation to the document
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
`;
document.head.appendChild(styleSheet);

export default CancellationModal;
