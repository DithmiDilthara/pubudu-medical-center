import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiUser, FiLock, FiMail, FiPhone, FiTarget, FiActivity, FiBriefcase } from 'react-icons/fi';

const AddReceptionistModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingReceptionist = null,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    shift: 'Morning',
    email: '',
    contact_number: '',
    nic: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (editingReceptionist) {
      setFormData({
        username: editingReceptionist.user?.username || '',
        password: '', // Password not editable
        full_name: editingReceptionist.full_name || '',
        shift: editingReceptionist.shift || 'Morning',
        email: editingReceptionist.user?.email || '',
        contact_number: editingReceptionist.user?.contact_number || '',
        nic: editingReceptionist.nic || ''
      });
    } else {
      setFormData({
        username: '',
        password: '',
        full_name: '',
        shift: 'Morning',
        email: '',
        contact_number: '',
        nic: ''
      });
    }
  }, [editingReceptionist, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.full_name) errors.full_name = 'Required';
    if (!editingReceptionist) {
        if (!formData.username) errors.username = 'Required';
        if (!formData.password) errors.password = 'Required';
        if (!formData.nic) errors.nic = 'Required';
    }
    if (!formData.email) errors.email = 'Required';
    if (!formData.contact_number) errors.contact_number = 'Required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={styles.overlay}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={styles.modal}
        >
          {/* Header */}
          <div style={styles.header}>
            <div>
              <h2 style={styles.title}>{editingReceptionist ? 'Edit Receptionist' : 'Add New Receptionist'}</h2>
              <p style={styles.subtitle}>Enter account information and shift details</p>
            </div>
            <button onClick={onClose} style={styles.closeBtn}>
              <FiX />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.scrollContent}>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Account Information</h3>
                <div style={styles.grid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Username <span style={styles.req}>*</span></label>
                    <div style={styles.inputWrapper}>
                      <FiUser style={styles.inputIcon} />
                      <input 
                        type="text" 
                        name="username" 
                        value={formData.username} 
                        onChange={handleInputChange}
                        disabled={!!editingReceptionist}
                        style={{...styles.input, ...(editingReceptionist ? styles.disabledInput : {})}}
                        placeholder="Rep_Admin"
                      />
                    </div>
                    {formErrors.username && <span style={styles.error}>{formErrors.username}</span>}
                  </div>

                  {!editingReceptionist && (
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Password <span style={styles.req}>*</span></label>
                      <div style={styles.inputWrapper}>
                        <FiLock style={styles.inputIcon} />
                        <input 
                          type="password" 
                          name="password" 
                          value={formData.password} 
                          onChange={handleInputChange}
                          style={styles.input}
                          placeholder="••••••••"
                        />
                      </div>
                      {formErrors.password && <span style={styles.error}>{formErrors.password}</span>}
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Personal Details</h3>
                <div style={styles.grid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Full Name <span style={styles.req}>*</span></label>
                    <input 
                      type="text" 
                      name="full_name" 
                      value={formData.full_name} 
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="Sayumi Manujana"
                    />
                    {formErrors.full_name && <span style={styles.error}>{formErrors.full_name}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>NIC <span style={styles.req}>*</span></label>
                    <div style={styles.inputWrapper}>
                      <FiTarget style={styles.inputIcon} />
                      <input 
                        type="text" 
                        name="nic" 
                        value={formData.nic} 
                        onChange={handleInputChange}
                        disabled={!!editingReceptionist}
                        style={{...styles.input, ...(editingReceptionist ? styles.disabledInput : {})}}
                        placeholder="123456789V"
                      />
                    </div>
                    {formErrors.nic && <span style={styles.error}>{formErrors.nic}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Shift <span style={styles.req}>*</span></label>
                    <div style={styles.inputWrapper}>
                      <FiBriefcase style={styles.inputIcon} />
                      <select 
                        name="shift" 
                        value={formData.shift} 
                        onChange={handleInputChange}
                        style={styles.input}
                      >
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Night">Night</option>
                        <option value="Full Day">Full Day</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Contact Info</h3>
                <div style={styles.grid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Email Address <span style={styles.req}>*</span></label>
                    <div style={styles.inputWrapper}>
                      <FiMail style={styles.inputIcon} />
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange}
                        style={styles.input}
                        placeholder="receptionist@example.com"
                      />
                    </div>
                    {formErrors.email && <span style={styles.error}>{formErrors.email}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Contact Number <span style={styles.req}>*</span></label>
                    <div style={styles.inputWrapper}>
                      <FiPhone style={styles.inputIcon} />
                      <input 
                        type="text" 
                        name="contact_number" 
                        value={formData.contact_number} 
                        onChange={handleInputChange}
                        style={styles.input}
                        placeholder="0771234567"
                      />
                    </div>
                    {formErrors.contact_number && <span style={styles.error}>{formErrors.contact_number}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.footer}>
              <button type="button" onClick={onClose} style={styles.cancelBtn}>
                Cancel
              </button>
              <button 
                type="submit" 
                style={styles.submitBtn}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : (editingReceptionist ? 'Update Receptionist' : 'Add Receptionist')}
              </button>
            </div>
          </form>
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
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '720px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  header: {
    padding: '24px 32px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexShrink: 0
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px 0',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
    fontWeight: '500'
  },
  closeBtn: {
    background: '#f8fafc',
    border: 'none',
    color: '#64748b',
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '20px',
    transition: 'all 0.2s'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden'
  },
  scrollContent: {
    padding: '32px',
    overflowY: 'auto',
    flex: 1
  },
  section: {
    marginBottom: '32px'
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#8b5cf6', // purple theme for receptionist
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#334155'
  },
  req: {
    color: '#ef4444'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#94a3b8',
    fontSize: '18px'
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#fff',
    fontSize: '15px',
    color: '#0f172a',
    outline: 'none',
    transition: 'all 0.2s'
  },
  disabledInput: {
    backgroundColor: '#f8fafc',
    color: '#94a3b8',
    cursor: 'not-allowed'
  },
  error: {
    fontSize: '12px',
    color: '#ef4444',
    marginTop: '4px'
  },
  footer: {
    padding: '24px 32px',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    flexShrink: 0
  },
  cancelBtn: {
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  submitBtn: {
    padding: '12px 32px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    color: 'white',
    backgroundColor: '#2563eb', // keeping same brand blue for buttons
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
  }
};

export default AddReceptionistModal;
