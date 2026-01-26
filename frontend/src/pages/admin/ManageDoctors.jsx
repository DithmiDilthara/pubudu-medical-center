import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUser } from 'react-icons/fi';
import AdminHeader from '../../components/AdminHeader';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

const ManageDoctors = () => {
  const { api } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const validateForm = () => {
    const errors = {};

    // Username validation (only when creating new)
    if (!editingDoctor) {
      if (!formData.username) {
        errors.username = 'Username is required';
      } else if (formData.username.length < 4 || formData.username.length > 15) {
        errors.username = 'Username must be between 4 and 15 characters';
      } else if (!/^[a-zA-Z0-9]+$/.test(formData.username)) {
        errors.username = 'Username can only contain letters and numbers';
      }

      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(formData.password)) {
        errors.password = 'Password must include uppercase, lowercase, and a number';
      }

      if (!formData.license_no) {
        errors.license_no = 'License number is required';
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
      errors.full_name = 'Full name can only contain letters and periods';
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

    if (!validateForm()) return;

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
                    <div style={styles.formGroup}>
                      <label style={styles.label}>
                        Username <span style={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        style={styles.input}
                        placeholder="Enter username"
                      />
                      {formErrors.username && <span style={styles.errorText}>{formErrors.username}</span>}
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
                        style={styles.input}
                        placeholder="Enter password"
                      />
                      {formErrors.password && <span style={styles.errorText}>{formErrors.password}</span>}
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
                    style={styles.input}
                    placeholder="Dr. Tachini Thaweesha"
                  />
                  {formErrors.full_name && <span style={styles.errorText}>{formErrors.full_name}</span>}
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
                    style={styles.input}
                    placeholder="Cardiology"
                  />
                  {formErrors.specialization && <span style={styles.errorText}>{formErrors.specialization}</span>}
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
                      style={styles.input}
                      placeholder="ABC12345"
                    />
                    {formErrors.license_no && <span style={styles.errorText}>{formErrors.license_no}</span>}
                  </div>
                )}

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="doctor@example.com"
                  />
                  {formErrors.email && <span style={styles.errorText}>{formErrors.email}</span>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Contact Number</label>
                  <input
                    type="text"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="0771234567"
                  />
                  {formErrors.contact_number && <span style={styles.errorText}>{formErrors.contact_number}</span>}
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
  formGroup: { marginBottom: '0' },
  label: { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#333' },
  required: { color: '#dc3545' },
  input: { width: '100%', padding: '10px 12px', border: '2px solid #dee2e6', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
  errorText: { display: 'block', color: '#dc3545', fontSize: '12px', marginTop: '4px' },

  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #dee2e6' },
  cancelButton: { padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  submitButton: { padding: '10px 20px', backgroundColor: '#0066CC', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
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
