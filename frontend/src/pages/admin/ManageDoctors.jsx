import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUser, FiAlertCircle, FiCheck, FiXCircle } from 'react-icons/fi';
import AdminHeader from '../../components/AdminHeader';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

const ManageDoctors = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    contact_number: '',
    full_name: '',
    specialization: '',
    license_no: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/doctors');
      if (response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (error) {
      setError('Failed to fetch doctors');
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'username':
        if (!value) error = 'Username is required';
        else if (value.length < 4 || value.length > 15) error = 'Username 4-15 characters';
        else if (!value.startsWith('Doc_')) error = 'Must start with Doc_';
        else if (!/^[A-Z]/.test(value.slice(4))) error = 'Letter after Doc_ must be Capital';
        else if (!/^Doc_[A-Z][a-zA-Z0-9_]*$/.test(value)) error = 'Invalid characters';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 8) error = 'At least 8 characters';
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/.test(value)) error = 'Include mixed case, number & special char';
        break;
      case 'full_name':
        if (!value) error = 'Full name is required';
        else if (value.length < 3) error = 'At least 3 characters';
        else if (!/^[a-zA-Z\s.]+$/.test(value)) error = 'Alphanumeric and periods only';
        break;
      case 'specialization':
        if (!value) error = 'Specialization is required';
        break;
      case 'license_no':
        if (!value) error = 'License is required';
        else if (value.length !== 8) error = 'Must be exactly 8 characters';
        else if (!/^[a-zA-Z0-9]+$/.test(value)) error = 'Alphanumeric only';
        break;
      case 'email':
        if (!value) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'contact_number':
        if (!value) error = 'Contact number is required';
        else if (!/^0[0-9]{9}$/.test(value)) error = '10 digits starting with 0';
        break;
      default:
        break;
    }
    setFormErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const checkUsernameReq = (val) => ({
    length: val.length >= 4 && val.length <= 15,
    prefix: val.startsWith('Doc_'),
    capital: /^[A-Z]/.test(val.slice(4))
  });

  const checkPasswordReq = (val) => ({
    length: val.length >= 8,
    mixed: /(?=.*[a-z])(?=.*[A-Z])/.test(val),
    number: /(?=.*[0-9])/.test(val),
    special: /(?=.*[!@#$%^&*(),.?":{}|<>])/.test(val)
  });

  const validateForm = () => {
    const errors = {};

    // Username and Password validation (only when creating new)
    if (!editingDoctor) {
      if (!formData.username) {
        errors.username = 'Username is required';
      } else if (formData.username.length < 4 || formData.username.length > 15) {
        errors.username = 'Username must be between 4 and 15 characters';
      } else if (!formData.username.startsWith('Doc_')) {
        errors.username = 'Username must start with Doc_';
      } else if (!/^[A-Z]/.test(formData.username.slice(4))) {
        errors.username = 'The character after Doc_ must be a capital letter';
      } else if (!/^Doc_[A-Z][a-zA-Z0-9_]*$/.test(formData.username)) {
        errors.username = 'Username can only contain letters, numbers, and underscores';
      }

      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/.test(formData.password)) {
        errors.password = 'Password must include uppercase, lowercase, a number, and a special character';
      }

      if (!formData.license_no) {
        errors.license_no = 'License number is required';
      } else if (formData.license_no.length !== 8) {
        errors.license_no = 'License number must be exactly 8 characters';
      } else if (!/^[a-zA-Z0-9]+$/.test(formData.license_no)) {
        errors.license_no = 'License number must be alphanumeric';
      }
    }

    // Common fields
    if (!formData.full_name) {
      errors.full_name = 'Full name is required';
    } else if (formData.full_name.length < 3) {
      errors.full_name = 'Full name must be at least 3 characters';
    } else if (!/^[a-zA-Z\s.]+$/.test(formData.full_name)) {
      errors.full_name = 'Full name can only contain letters, spaces and periods';
    }

    if (!formData.specialization) {
      errors.specialization = 'Specialization is required';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.contact_number) {
      errors.contact_number = 'Contact number is required';
    } else if (!/^0[0-9]{9}$/.test(formData.contact_number)) {
      errors.contact_number = 'Contact number must start with 0 and be 10 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setError('Please fix all errors before submitting');
      return;
    }

    try {
      if (editingDoctor) {
        // Update existing doctor
        const response = await api.put(`/admin/doctors/${editingDoctor.doctor_id}`, {
          full_name: formData.full_name,
          specialization: formData.specialization,
          email: formData.email,
          contact_number: formData.contact_number
        });

        if (response.data.success) {
          setSuccess('Doctor updated successfully');
          fetchDoctors();
          closeModal();
        }
      } else {
        // Create new doctor
        const response = await api.post('/admin/doctors', formData);

        if (response.data.success) {
          setSuccess('Doctor created successfully');
          fetchDoctors();
          closeModal();
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save doctor');
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      username: doctor.user.username,
      password: '',
      email: doctor.user.email || '',
      contact_number: doctor.user.contact_number || '',
      full_name: doctor.full_name,
      specialization: doctor.specialization,
      license_no: doctor.license_no
    });
    setShowModal(true);
  };

  const handleDelete = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;

    try {
      const response = await api.delete(`/admin/doctors/${doctorId}`);
      if (response.data.success) {
        setSuccess('Doctor deleted successfully');
        fetchDoctors();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const openAddModal = () => {
    setEditingDoctor(null);
    setFormData({
      username: '',
      password: '',
      email: '',
      contact_number: '',
      full_name: '',
      specialization: '',
      license_no: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDoctor(null);
    setFormData({
      username: '',
      password: '',
      email: '',
      contact_number: '',
      full_name: '',
      specialization: '',
      license_no: ''
    });
    setFormErrors({});
  };

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div style={styles.mainContent}>
        <AdminHeader title="Manage Doctors" />

        <div style={styles.content}>
          {/* Alert Messages */}
          {error && (
            <div style={styles.errorAlert}>
              {error}
              <button onClick={() => setError('')} style={styles.closeBtn}>×</button>
            </div>
          )}

          {success && (
            <div style={styles.successAlert}>
              {success}
              <button onClick={() => setSuccess('')} style={styles.closeBtn}>×</button>
            </div>
          )}

          {/* Header with Add Button */}
          <div style={styles.header}>
            <h2 style={styles.title}>Doctor List</h2>
            <button onClick={openAddModal} style={styles.addButton}>
              <FiPlus style={styles.buttonIcon} />
              Add New Doctor
            </button>
          </div>

          {/* Doctors Table */}
          {loading ? (
            <div style={styles.loading}>Loading doctors...</div>
          ) : doctors.length === 0 ? (
            <div style={styles.emptyState}>
              <FiUser style={styles.emptyIcon} />
              <p>No doctors found. Add your first doctor!</p>
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Username</th>
                    <th style={styles.th}>Specialization</th>
                    <th style={styles.th}>License No.</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Contact</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor.doctor_id} style={styles.tr}>
                      <td style={styles.td}>{doctor.full_name}</td>
                      <td style={styles.td}>{doctor.user.username}</td>
                      <td style={styles.td}>{doctor.specialization}</td>
                      <td style={styles.td}>{doctor.license_no}</td>
                      <td style={styles.td}>{doctor.user.email || 'N/A'}</td>
                      <td style={styles.td}>{doctor.user.contact_number || 'N/A'}</td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => handleEdit(doctor)}
                            style={styles.editButton}
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(doctor.doctor_id)}
                            style={styles.deleteButton}
                            title="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={styles.footer}>
            <button
              onClick={() => navigate("/admin/dashboard")}
              style={styles.backButton}
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
              </h3>
              <button onClick={closeModal} style={styles.modalCloseBtn}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                {!editingDoctor && (
                  <>
                    <style>
                      {`
                        @keyframes slideDown {
                          from { opacity: 0; transform: translateY(-10px); }
                          to { opacity: 1; transform: translateY(0); }
                        }
                      `}
                    </style>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        Username <span style={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('username')}
                        onBlur={() => {
                          setFocusedField(null);
                          validateField('username', formData.username);
                        }}
                        style={{
                          ...styles.input,
                          ...(formErrors.username ? styles.inputError : {})
                        }}
                        placeholder="Enter username"
                      />
                      {focusedField === 'username' && (
                        <div style={styles.hintsBox}>
                          <p style={styles.hintsTitle}>Requirements:</p>
                          <ul style={styles.hintsList}>
                            <li style={checkUsernameReq(formData.username).length ? styles.hintMet : styles.hintUnmet}>
                              {checkUsernameReq(formData.username).length ? <FiCheck /> : <FiXCircle />} 4-15 characters long
                            </li>
                            <li style={checkUsernameReq(formData.username).prefix ? styles.hintMet : styles.hintUnmet}>
                              {checkUsernameReq(formData.username).prefix ? <FiCheck /> : <FiXCircle />} Must start with <strong>Doc_</strong>
                            </li>
                            <li style={checkUsernameReq(formData.username).capital ? styles.hintMet : styles.hintUnmet}>
                              {checkUsernameReq(formData.username).capital ? <FiCheck /> : <FiXCircle />} Next letter must be <strong>Capital</strong>
                            </li>
                          </ul>
                        </div>
                      )}
                      {formErrors.username && (
                        <span style={styles.errorText}>
                          <FiAlertCircle style={{ marginRight: '4px' }} />
                          {formErrors.username}
                        </span>
                      )}
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        Password <span style={styles.required}>*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => {
                          setFocusedField(null);
                          validateField('password', formData.password);
                        }}
                        style={{
                          ...styles.input,
                          ...(formErrors.password ? styles.inputError : {})
                        }}
                        placeholder="Enter password"
                      />
                      {focusedField === 'password' && (
                        <div style={styles.hintsBox}>
                          <p style={styles.hintsTitle}>Requirements:</p>
                          <ul style={styles.hintsList}>
                            <li style={checkPasswordReq(formData.password).length ? styles.hintMet : styles.hintUnmet}>
                              {checkPasswordReq(formData.password).length ? <FiCheck /> : <FiXCircle />} Minimum 8 characters
                            </li>
                            <li style={checkPasswordReq(formData.password).mixed ? styles.hintMet : styles.hintUnmet}>
                              {checkPasswordReq(formData.password).mixed ? <FiCheck /> : <FiXCircle />} Include uppercase & lowercase
                            </li>
                            <li style={checkPasswordReq(formData.password).number ? styles.hintMet : styles.hintUnmet}>
                              {checkPasswordReq(formData.password).number ? <FiCheck /> : <FiXCircle />} Include at least one number
                            </li>
                            <li style={checkPasswordReq(formData.password).special ? styles.hintMet : styles.hintUnmet}>
                              {checkPasswordReq(formData.password).special ? <FiCheck /> : <FiXCircle />} Include at least one special character
                            </li>
                          </ul>
                        </div>
                      )}
                      {formErrors.password && (
                        <span style={styles.errorText}>
                          <FiAlertCircle style={{ marginRight: '4px' }} />
                          {formErrors.password}
                        </span>
                      )}
                    </div>
                  </>
                )}

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Full Name <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    onBlur={() => validateField('full_name', formData.full_name)}
                    style={{
                      ...styles.input,
                      ...(formErrors.full_name ? styles.inputError : {})
                    }}
                    placeholder="Dr. Tachini Thaweesha"
                  />
                  {formErrors.full_name && (
                    <span style={styles.errorText}>
                      <FiAlertCircle style={{ marginRight: '4px' }} />
                      {formErrors.full_name}
                    </span>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Specialization <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    onBlur={() => validateField('specialization', formData.specialization)}
                    style={{
                      ...styles.input,
                      ...(formErrors.specialization ? styles.inputError : {})
                    }}
                    placeholder="Cardiology"
                  />
                  {formErrors.specialization && (
                    <span style={styles.errorText}>
                      <FiAlertCircle style={{ marginRight: '4px' }} />
                      {formErrors.specialization}
                    </span>
                  )}
                </div>

                {!editingDoctor && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      License Number <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      name="license_no"
                      value={formData.license_no}
                      onChange={handleInputChange}
                      onBlur={() => validateField('license_no', formData.license_no)}
                      style={{
                        ...styles.input,
                        ...(formErrors.license_no ? styles.inputError : {})
                      }}
                      placeholder="SLMC1234"
                    />
                    {formErrors.license_no && (
                      <span style={styles.errorText}>
                        <FiAlertCircle style={{ marginRight: '4px' }} />
                        {formErrors.license_no}
                      </span>
                    )}
                  </div>
                )}

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Email <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={() => validateField('email', formData.email)}
                    style={{
                      ...styles.input,
                      ...(formErrors.email ? styles.inputError : {})
                    }}
                    placeholder="doctor@example.com"
                  />
                  {formErrors.email && (
                    <span style={styles.errorText}>
                      <FiAlertCircle style={{ marginRight: '4px' }} />
                      {formErrors.email}
                    </span>
                  )}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Contact Number <span style={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    onBlur={() => validateField('contact_number', formData.contact_number)}
                    style={{
                      ...styles.input,
                      ...(formErrors.contact_number ? styles.inputError : {})
                    }}
                    placeholder="0771234567"
                  />
                  {formErrors.contact_number && (
                    <span style={styles.errorText}>
                      <FiAlertCircle style={{ marginRight: '4px' }} />
                      {formErrors.contact_number}
                    </span>
                  )}
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" onClick={closeModal} style={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitButton}>
                  {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f3f4f6' },
  mainContent: { flex: 1 },
  content: { padding: '30px' },

  errorAlert: { padding: '12px 16px', backgroundColor: '#fee', color: '#c33', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  successAlert: { padding: '12px 16px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'inherit' },

  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '600', color: '#333' },
  addButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#0066CC', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  buttonIcon: { fontSize: '18px' },

  loading: { textAlign: 'center', padding: '40px', color: '#666' },
  emptyState: { textAlign: 'center', padding: '60px 20px', color: '#999' },
  emptyIcon: { fontSize: '64px', marginBottom: '16px' },

  tableContainer: { backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '16px', textAlign: 'left', backgroundColor: '#f8f9fa', fontWeight: '600', color: '#333', borderBottom: '2px solid #dee2e6' },
  tr: { borderBottom: '1px solid #dee2e6' },
  td: { padding: '16px', color: '#666' },

  actionButtons: { display: 'flex', gap: '8px' },
  editButton: { padding: '6px 12px', backgroundColor: '#0066CC', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  deleteButton: { padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #dee2e6' },
  modalTitle: { fontSize: '20px', fontWeight: '600', margin: 0 },
  modalCloseBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' },

  form: { padding: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#333' },
  required: { color: '#dc3545' },
  input: { width: '100%', padding: '10px 12px', border: '2px solid #dee2e6', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', transition: 'all 0.2s' },
  inputError: { borderColor: '#dc3545', backgroundColor: '#fff5f5' },
  errorText: { display: 'flex', alignItems: 'center', color: '#dc3545', fontSize: '12px', marginTop: '4px' },

  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #dee2e6' },
  cancelButton: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  submitButton: { padding: '10px 20px', backgroundColor: '#0066CC', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  hintsBox: {
    marginTop: '8px',
    padding: '12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    animation: 'slideDown 0.2s ease-out'
  },
  hintsTitle: {
    fontSize: '12px',
    color: '#4B5563',
    fontWeight: '600',
    marginBottom: '6px',
    margin: 0
  },
  hintsList: {
    margin: 0,
    paddingLeft: '18px',
    fontSize: '12px',
    color: '#6B7280',
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  hintMet: { color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' },
  hintUnmet: { color: '#DC2626', display: 'flex', alignItems: 'center', gap: '6px' },
  footer: {
    marginTop: '32px',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  backButton: {
    padding: '10px 24px',
    border: 'none',
    borderRadius: '6px',
    background: '#0066CC',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 102, 204, 0.2)',
    transition: 'all 0.2s',
    fontFamily: "'Inter', 'Segoe UI', sans-serif"
  }
};

export default ManageDoctors;
