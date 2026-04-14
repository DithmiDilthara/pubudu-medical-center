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
        email: editingReceptionist.user?.email || '',
        contact_number: editingReceptionist.user?.contact_number || '',
        nic: editingReceptionist.nic || ''
      });
    } else {
      setFormData({
        username: '',
        password: '',
        full_name: '',
        email: '',
        contact_number: '',
        nic: ''
      });
    }
  }, [editingReceptionist, isOpen]);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'full_name':
        if (!value) error = 'Full name is required';
        else if (value.length < 3) error = 'Minimum 3 characters required';
        else if (!/^[a-zA-Z\s.]+$/.test(value)) error = 'Only letters, spaces and periods allowed';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        else if (!value.toLowerCase().endsWith('@gmail.com')) error = 'Only @gmail.com emails are allowed';
        break;
      case 'contact_number':
        if (!value) error = 'Phone number is required';
        else {
          const digits = value.replace(/\D/g, '');
          const validPrefixes = ['070', '071', '072', '074', '075', '076', '077', '078'];
          const prefix = digits.substring(0, 3);
          
          if (digits.length !== 10) error = 'Must be exactly 10 digits';
          else if (!digits.startsWith('07')) error = 'Must start with 07';
          else if (!validPrefixes.includes(prefix)) error = 'Invalid Sri Lankan mobile prefix';
          else if (/(\d)\1{7,}/.test(digits)) error = 'Too many repeating digits';
          else if (/0123456|1234567|2345678|3456789/.test(digits)) error = 'Sequential numbers not allowed';
        }
        break;
      case 'nic':
        if (!value) error = 'NIC is required';
        else {
          const nic = value.trim().toUpperCase();
          const oldNicRegex = /^[0-9]{9}[VX]$/;
          const newNicRegex = /^[0-9]{12}$/;
          
          if (!oldNicRegex.test(nic) && !newNicRegex.test(nic)) {
            error = 'Invalid NIC format (e.g., 123456789V or 12 digits)';
          } else {
            const digitsOnly = nic.replace(/[VX]/g, '');
            if (/(\d)\1{8,}/.test(digitsOnly)) error = 'Invalid repeating pattern';
            if (/012345678|123456789|987654321/.test(digitsOnly)) error = 'Sequential digits not allowed';
          }
        }
        break;
      case 'username':
        if (!editingReceptionist && !value) error = 'Username is required';
        else if (value && !/^Rep_[A-Z][A-Za-z0-9]*$/.test(value)) error = "Username must start with 'Rep_' followed by a Capital letter (e.g., Rep_Sarah)";
        break;
      case 'password':
        if (!editingReceptionist && !value) error = 'Password is required';
        else if (value && value.length < 8) error = 'Password must be at least 8 characters';
        else if (value && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]*$/.test(value)) error = 'Password requires at least 1 uppercase, 1 lowercase, 1 number, and 1 special character';
        break;
      default:
        break;
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });
    
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
                        style={{
                          ...styles.input, 
                          ...(editingReceptionist ? styles.disabledInput : {}),
                          ...(formErrors.username ? styles.inputError : {})
                        }}
                        placeholder="Rep_Admin"
                      />
                    </div>
                    {formErrors.username && <span style={styles.errorText}>{formErrors.username}</span>}
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
                          style={{
                            ...styles.input,
                            ...(formErrors.password ? styles.inputError : {})
                          }}
                          placeholder="••••••••"
                        />
                      </div>
                      {formErrors.password && <span style={styles.errorText}>{formErrors.password}</span>}
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
                      style={{
                        ...styles.input,
                        ...(formErrors.full_name ? styles.inputError : {})
                      }}
                      placeholder="Sayumi Manujana"
                    />
                    {formErrors.full_name && <span style={styles.errorText}>{formErrors.full_name}</span>}
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
                        style={{
                          ...styles.input, 
                          ...(editingReceptionist ? styles.disabledInput : {}),
                          ...(formErrors.nic ? styles.inputError : {})
                        }}
                        placeholder="123456789V"
                      />
                    </div>
                    {formErrors.nic && <span style={styles.errorText}>{formErrors.nic}</span>}
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
                        style={{
                          ...styles.input,
                          ...(formErrors.email ? styles.inputError : {})
                        }}
                        placeholder="receptionist@example.com"
                      />
                    </div>
                    {formErrors.email && <span style={styles.errorText}>{formErrors.email}</span>}
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
                        style={{
                          ...styles.input,
                          ...(formErrors.contact_number ? styles.inputError : {})
                        }}
                        placeholder="0771234567"
                        maxLength="10"
                      />
                    </div>
                    {formErrors.contact_number && <span style={styles.errorText}>{formErrors.contact_number}</span>}
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
    color: '#2563eb', // blue theme for receptionist (matches doctors)
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
  errorText: {
    fontSize: '12px',
    color: '#ef4444',
    marginTop: '4px',
    fontWeight: '500'
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fffafb'
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
