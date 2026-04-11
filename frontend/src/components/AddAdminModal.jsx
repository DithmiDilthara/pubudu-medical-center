import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiUser, FiLock, FiMail, FiPhone, FiShield } from 'react-icons/fi';

const AddAdminModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingAdmin = null,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    contact_number: '',
    role_id: 1 // Default to Regular Admin
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (editingAdmin) {
      setFormData({
        username: editingAdmin.username || '',
        password: '', // Password not editable
        email: editingAdmin.email || '',
        contact_number: editingAdmin.contact_number || '',
        role_id: editingAdmin.role_id || 1
      });
    } else {
      setFormData({
        username: '',
        password: '',
        email: '',
        contact_number: '',
        role_id: 1
      });
    }
  }, [editingAdmin, isOpen]);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
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
        }
        break;
      case 'username':
        if (!editingAdmin && !value) error = 'Username is required';
        else if (value && value.length < 3) error = 'Username too short';
        break;
      case 'password':
        if (!editingAdmin && !value) error = 'Password is required';
        else if (value && value.length < 8) error = 'Password must be at least 8 characters';
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
    
    // Map contact_number to phone for backend consistency
    const submissionData = {
      ...formData,
      phone: formData.contact_number
    };
    
    onSubmit(submissionData);
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
              <h2 style={styles.title}>{editingAdmin ? 'Edit Administrator' : 'Add New Administrator'}</h2>
              <p style={styles.subtitle}>Configure access credentials and administrative permissions</p>
            </div>
            <button onClick={onClose} style={styles.closeBtn}>
              <FiX />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.scrollContent}>
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Account Credentials</h3>
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
                        disabled={!!editingAdmin}
                        style={{
                          ...styles.input, 
                          ...(editingAdmin ? styles.disabledInput : {}),
                          ...(formErrors.username ? styles.inputError : {})
                        }}
                        placeholder="admin_user"
                      />
                    </div>
                    {formErrors.username && <span style={styles.errorText}>{formErrors.username}</span>}
                  </div>

                  {!editingAdmin && (
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
                <h3 style={styles.sectionTitle}>Contact Information</h3>
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
                        placeholder="admin@pmc.lk"
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

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>System Permissions</h3>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Administrative Role</label>
                  <div style={styles.roleToggle}>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, role_id: 1})}
                      style={{
                        ...styles.roleBtn,
                        ...(formData.role_id === 1 ? styles.roleBtnActive : {})
                      }}
                    >
                      Regular Admin
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, role_id: 5})}
                      style={{
                        ...styles.roleBtn,
                        ...(formData.role_id === 5 ? styles.roleBtnActive : {})
                      }}
                    >
                      <FiShield style={{marginRight: '8px'}} /> Super Admin
                    </button>
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
                {isLoading ? 'Saving...' : (editingAdmin ? 'Update Administrator' : 'Add Administrator')}
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
    maxWidth: '650px',
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
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px 0',
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
    fontWeight: '500'
  },
  closeBtn: {
    background: '#f8fafc',
    border: 'none',
    color: '#64748b',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '18px',
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
    marginBottom: '28px'
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#4f46e5',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '16px',
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
    border: '2px solid #f1f5f9',
    backgroundColor: '#fff',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    transition: 'all 0.2s',
    '&:focus': {
      borderColor: '#4f46e5'
    }
  },
  disabledInput: {
    backgroundColor: '#f8fafc',
    color: '#94a3b8',
    cursor: 'not-allowed'
  },
  roleToggle: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    backgroundColor: '#f8fafc',
    padding: '6px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  roleBtn: {
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#64748b',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  roleBtnActive: {
    backgroundColor: 'white',
    color: '#4f46e5',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  errorText: {
    fontSize: '11px',
    color: '#ef4444',
    marginTop: '4px',
    fontWeight: '500'
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fffafb'
  },
  footer: {
    padding: '20px 32px',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    flexShrink: 0
  },
  cancelBtn: {
    padding: '10px 24px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    cursor: 'pointer'
  },
  submitBtn: {
    padding: '10px 32px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    color: 'white',
    backgroundColor: '#4f46e5',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
  }
};

export default AddAdminModal;
