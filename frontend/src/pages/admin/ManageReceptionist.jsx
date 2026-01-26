import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUser } from 'react-icons/fi';
import AdminHeader from '../../components/AdminHeader';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

const ManageReceptionist = () => {
  const { api } = useAuth();
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReceptionist, setEditingReceptionist] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    contact_number: '',
    full_name: '',
    nic: ''
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchReceptionists();
  }, []);

  const fetchReceptionists = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/receptionists');
      if (response.data.success) {
        setReceptionists(response.data.data);
      }
    } catch (error) {
      setError('Failed to fetch receptionists');
      console.error('Error fetching receptionists:', error);
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
    if (!editingReceptionist) {
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

      if (!formData.nic) {
        errors.nic = 'NIC is required';
      } else if (!/^(?:\d{9}[vVxX]|\d{12})$/.test(formData.nic)) {
        errors.nic = 'Invalid NIC format (e.g., 123456789V or 12 digits)';
      }
    }

    // Common fields
    if (!formData.full_name) {
      errors.full_name = 'Full name is required';
    } else if (formData.full_name.length < 3) {
      errors.full_name = 'Full name must be at least 3 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.full_name)) {
      errors.full_name = 'Full name can only contain letters';
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
      if (editingReceptionist) {
        // Update existing receptionist
        const response = await api.put(`/admin/receptionists/${editingReceptionist.receptionist_id}`, {
          full_name: formData.full_name,
          email: formData.email,
          contact_number: formData.contact_number
        });

        if (response.data.success) {
          setSuccess('Receptionist updated successfully');
          fetchReceptionists();
          closeModal();
        }
      } else {
        // Create new receptionist
        const response = await api.post('/admin/receptionists', formData);

        if (response.data.success) {
          setSuccess('Receptionist created successfully');
          fetchReceptionists();
          closeModal();
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save receptionist');
    }
  };

  const handleEdit = (receptionist) => {
    setEditingReceptionist(receptionist);
    setFormData({
      username: receptionist.user.username,
      password: '',
      email: receptionist.user.email || '',
      contact_number: receptionist.user.contact_number || '',
      full_name: receptionist.full_name,
      nic: receptionist.nic
    });
    setShowModal(true);
  };

  const handleDelete = async (receptionistId) => {
    if (!window.confirm('Are you sure you want to delete this receptionist?')) return;

    try {
      const response = await api.delete(`/admin/receptionists/${receptionistId}`);
      if (response.data.success) {
        setSuccess('Receptionist deleted successfully');
        fetchReceptionists();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete receptionist');
    }
  };

  const openAddModal = () => {
    setEditingReceptionist(null);
    setFormData({
      username: '',
      password: '',
      email: '',
      contact_number: '',
      full_name: '',
      nic: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingReceptionist(null);
    setFormData({
      username: '',
      password: '',
      email: '',
      contact_number: '',
      full_name: '',
      nic: ''
    });
    setFormErrors({});
  };

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div style={styles.mainContent}>
        <AdminHeader title="Manage Receptionists" />

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
            <h2 style={styles.title}>Receptionist List</h2>
            <button onClick={openAddModal} style={styles.addButton}>
              <FiPlus style={styles.buttonIcon} />
              Add New Receptionist
            </button>
          </div>

          {/* Receptionists Table */}
          {loading ? (
            <div style={styles.loading}>Loading receptionists...</div>
          ) : receptionists.length === 0 ? (
            <div style={styles.emptyState}>
              <FiUser style={styles.emptyIcon} />
              <p>No receptionists found. Add your first receptionist!</p>
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Username</th>
                    <th style={styles.th}>NIC</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Contact</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receptionists.map((receptionist) => (
                    <tr key={receptionist.receptionist_id} style={styles.tr}>
                      <td style={styles.td}>{receptionist.full_name}</td>
                      <td style={styles.td}>{receptionist.user.username}</td>
                      <td style={styles.td}>{receptionist.nic}</td>
                      <td style={styles.td}>{receptionist.user.email || 'N/A'}</td>
                      <td style={styles.td}>{receptionist.user.contact_number || 'N/A'}</td>
                      <td style={styles.td}>
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => handleEdit(receptionist)}
                            style={styles.editButton}
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDelete(receptionist.receptionist_id)}
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
                {editingReceptionist ? 'Edit Receptionist' : 'Add New Receptionist'}
              </h3>
              <button onClick={closeModal} style={styles.modalCloseBtn}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formGrid}>
                {!editingReceptionist && (
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
                    placeholder="sayumi manujana"
                  />
                  {formErrors.full_name && <span style={styles.errorText}>{formErrors.full_name}</span>}
                </div>

                {!editingReceptionist && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      NIC <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      name="nic"
                      value={formData.nic}
                      onChange={handleInputChange}
                      style={styles.input}
                      placeholder="123456789V"
                    />
                    {formErrors.nic && <span style={styles.errorText}>{formErrors.nic}</span>}
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
                    placeholder="receptionist@example.com"
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
                  {editingReceptionist ? 'Update Receptionist' : 'Add Receptionist'}
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

export default ManageReceptionist;
