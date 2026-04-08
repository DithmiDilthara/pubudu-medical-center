import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiUser, FiLock, FiCreditCard, FiMail, FiPhone, FiTarget, FiInfo, FiActivity } from 'react-icons/fi';



const AddDoctorModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingDoctor = null,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    gender: 'MALE',
    specialization: '',
    doctor_fee: 2500,
    center_fee: 600,
    license_no: '',
    email: '',
    contact_number: ''
  });

  const [formErrors, setFormErrors] = useState({});

  const specializations = [
    "General Physician", "Cardiology", "Neurology", "Pediatrics", "Dermatology",
    "Orthopedics", "ENT (Otolaryngology)", "Ophthalmology", "Obstetrics & Gynecology",
    "Psychiatry", "Radiology", "Oncology", "Nephrology", "Urology",
    "Gastroenterology", "Endocrinology", "Rheumatology", "Pulmonology",
    "Diabetology", "General Surgery", "Anesthesiology", "Pathology", "Vascular Surgery"
  ];

  useEffect(() => {
    if (editingDoctor) {
      setFormData({
        username: editingDoctor.user?.username || '',
        password: '', // Password not editable
        full_name: editingDoctor.full_name || '',
        gender: editingDoctor.gender || 'MALE',
        specialization: editingDoctor.specialization || '',
        doctor_fee: editingDoctor.doctor_fee || 2500,
        center_fee: editingDoctor.center_fee || 600,
        license_no: editingDoctor.license_no || '',
        email: editingDoctor.user?.email || '',
        contact_number: editingDoctor.user?.contact_number || ''
      });
    } else {
      setFormData({
        username: '',
        password: '',
        full_name: '',
        gender: 'MALE',
        specialization: '',
        doctor_fee: 2500,
        center_fee: 600,
        license_no: '',
        email: '',
        contact_number: ''
      });
    }
    setFormErrors({});
  }, [editingDoctor, isOpen]);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'full_name':
        if (!value) error = 'Full name is required';
        else if (value.length < 3) error = 'Minimum 3 characters required';
        else if (!/^[a-zA-Z\s.]+$/.test(value)) error = 'Only letters, spaces and periods allowed';
        break;
      case 'specialization':
        if (!value) error = 'Please select a specialization';
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
          else if (/(\d)\1{7,}/.test(digits)) error = 'Too many repeating digits'; // e.g. 0777777777
          else if (/0123456|1234567|2345678|3456789/.test(digits)) error = 'Sequential numbers not allowed';
          else if (digits.substring(2) === '11111111' || digits.substring(2) === '22222222') error = 'Fake pattern detected';
        }
        break;
      case 'license_no':
        if (!editingDoctor) {
          if (!value) error = 'License number is required';
          else if (value.length < 5) error = 'Minimum 5 characters required';
          else if (!/^[a-zA-Z0-9]+$/.test(value)) error = 'Only alphanumeric characters allowed';
        }
        break;
      case 'doctor_fee':
        if (value === '' || value === null) error = 'Doctor fee is required';
        else if (Number(value) < 1000) error = 'Minimum fee is LKR 1,000';
        break;
      case 'center_fee':
        if (value === '' || value === null) error = 'Center fee is required';
        else if (Number(value) < 600) error = 'Minimum fee is LKR 600';
        break;
      case 'username':
        if (!editingDoctor && !value) error = 'Username is required';
        break;
      case 'password':
        if (!editingDoctor && !value) error = 'Password is required';
        break;
      case 'gender':
        if (!value) error = 'Gender selection is required';
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

  const totalFee = (Number(formData.doctor_fee) || 0) + (Number(formData.center_fee) || 0);

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
              <h2 style={styles.title}>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
              <p style={styles.subtitle}>Enter professional details and account information</p>
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
                        disabled={!!editingDoctor}
                        style={{
                          ...styles.input, 
                          ...(editingDoctor ? styles.disabledInput : {}),
                          ...(formErrors.username ? styles.inputError : {})
                        }}
                        placeholder="Doc_Admin"
                      />
                    </div>
                    {formErrors.username && <span style={styles.errorText}>{formErrors.username}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Password <span style={styles.req}>*</span></label>
                    <div style={styles.inputWrapper}>
                      <FiLock style={styles.inputIcon} />
                      <input 
                        type="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleInputChange}
                        disabled={!!editingDoctor}
                        style={{
                          ...styles.input, 
                          ...(editingDoctor ? styles.disabledInput : {}),
                          ...(formErrors.password ? styles.inputError : {})
                        }}
                        placeholder="••••••••"
                      />
                    </div>
                    {formErrors.password && <span style={styles.errorText}>{formErrors.password}</span>}
                  </div>
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Professional Details</h3>
                <div style={styles.grid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Full Name <span style={styles.req}>*</span></label>
                    <input 
                      type="text" 
                      name="full_name" 
                      value={formData.full_name} 
                      onChange={handleInputChange}
                      style={{...styles.input, ...(formErrors.full_name ? styles.inputError : {})}}
                      placeholder="Dr. Tachini Thaweesha"
                    />
                    {formErrors.full_name && <span style={styles.errorText}>{formErrors.full_name}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Gender <span style={styles.req}>*</span></label>
                    <select 
                      name="gender" 
                      value={formData.gender} 
                      onChange={handleInputChange}
                      style={{...styles.input, ...(formErrors.gender ? styles.inputError : {})}}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                    {formErrors.gender && <span style={styles.errorText}>{formErrors.gender}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Specialization <span style={styles.req}>*</span></label>
                    <select 
                      name="specialization" 
                      value={formData.specialization} 
                      onChange={handleInputChange}
                      style={{...styles.input, ...(formErrors.specialization ? styles.inputError : {})}}
                    >
                      <option value="">Select Specialization</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                    {formErrors.specialization && <span style={styles.errorText}>{formErrors.specialization}</span>}
                  </div>

                   <div style={styles.formGroup}>
                    <label style={styles.label}>License Number <span style={styles.req}>*</span></label>
                    <div style={styles.inputWrapper}>
                      <FiTarget style={styles.inputIcon} />
                      <input 
                        type="text" 
                        name="license_no" 
                        value={formData.license_no} 
                        onChange={handleInputChange}
                        disabled={!!editingDoctor}
                        style={{
                          ...styles.input, 
                          ...(editingDoctor ? styles.disabledInput : {}),
                          ...(formErrors.license_no ? styles.inputError : {})
                        }}
                        placeholder="SLMC1234"
                      />
                    </div>
                    {formErrors.license_no && <span style={styles.errorText}>{formErrors.license_no}</span>}
                  </div>
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Consultation Fees</h3>
                <div style={styles.grid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Doctor Fee (LKR) <span style={styles.req}>*</span></label>
                    <input 
                      type="number" 
                      name="doctor_fee" 
                      value={formData.doctor_fee} 
                      onChange={handleInputChange}
                      style={{...styles.input, ...(formErrors.doctor_fee ? styles.inputError : {})}}
                      placeholder="2500"
                      min="1000"
                    />
                    {formErrors.doctor_fee && <span style={styles.errorText}>{formErrors.doctor_fee}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Center Fee (LKR) <span style={styles.req}>*</span></label>
                    <input 
                      type="number" 
                      name="center_fee" 
                      value={formData.center_fee} 
                      onChange={handleInputChange}
                      style={{...styles.input, ...(formErrors.center_fee ? styles.inputError : {})}}
                      placeholder="600"
                      min="600"
                    />
                    {formErrors.center_fee && <span style={styles.errorText}>{formErrors.center_fee}</span>}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Total Fee (LKR)</label>
                    <input 
                      type="text" 
                      value={totalFee.toLocaleString()} 
                      disabled
                      style={styles.readOnlyInput}
                    />
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
                        style={{...styles.input, ...(formErrors.email ? styles.inputError : {})}}
                        placeholder="doctor@example.com"
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
                        style={{...styles.input, ...(formErrors.contact_number ? styles.inputError : {})}}
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
                {isLoading ? 'Processing...' : (editingDoctor ? 'Update Doctor' : 'Add Doctor')}
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
    height: '90vh',
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
    color: '#2563eb',
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
    transition: 'all 0.2s',
    '&:focus': {
      borderColor: '#2563eb',
      boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.1)'
    }
  },
  disabledInput: {
    backgroundColor: '#f8fafc',
    color: '#94a3b8',
    cursor: 'not-allowed'
  },
  readOnlyInput: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '12px',
    border: '1px solid #f1f5f9',
    backgroundColor: '#f8fafc',
    fontSize: '15px',
    fontWeight: '700',
    color: '#2563eb',
    cursor: 'default'
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
  daysGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  dayPill: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 18px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  dayPillActive: {
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    borderColor: '#2563eb',
    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.06)'
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
    backgroundColor: '#2563eb',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
  }
};

// Add default input icon logic for specialization
const iconStyles = {
    ...styles.inputIcon,
    left: '14px'
};

// Adjust select padding manually since it doesn't have an icon in my current structure
styles.input = {
    ...styles.input,
    '&:focus': {
        borderColor: '#2563eb',
        boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.1)'
    }
};

export default AddDoctorModal;
