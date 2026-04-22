import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiSearch, 
  FiFilter, 
  FiUser, 
  FiActivity,
  FiMail,
  FiPhone
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import AdminHeader from '../../components/AdminHeader';
import AdminSidebar from '../../components/AdminSidebar';
import AddDoctorModal from '../../components/AddDoctorModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const ManageDoctors = () => {
  const { api, user } = useAuth();
  const adminName = user?.username || 'Admin';
  const navigate = useNavigate();
  
  // State
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterSpecialization]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/doctors');
      if (response.data.success) {
        setDoctors(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load doctors');
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };
// Handle Create or Update Doctor
  const handleCreateOrUpdate = async (formData) => {
    const dataToSend = {
      username: formData.username,
      password: formData.password,
      full_name: formData.full_name,
      gender: formData.gender,
      specialization: formData.specialization,
      doctor_fee: formData.doctor_fee,
      center_fee: formData.center_fee,
      license_no: formData.license_no,
      email: formData.email,
      contact_number: formData.contact_number
    };

    try {
      setIsSubmitting(true);
      const response = editingDoctor 
        ? await api.put(`/admin/doctors/${editingDoctor.doctor_id}`, dataToSend)
        : await api.post('/admin/doctors', dataToSend);

      if (response.data.success) {
        toast.success(editingDoctor ? 'Doctor updated successfully' : 'Doctor added successfully! Credentials emailed.');
        fetchDoctors();
        setShowModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save doctor');
    } finally {
      setIsSubmitting(false);
    }
  };
// Handle Doctor Deletion
  const handleDelete = async () => {
    if (!doctorToDelete) return;
    try {
      const response = await api.delete(`/admin/doctors/${doctorToDelete.doctor_id}`);
      if (response.data.success) {
        toast.success('Doctor removed successfully');
        fetchDoctors();
      }
    } catch (error) {
      toast.error('Failed to delete doctor');
    }
  };

  // Filter & Search Logic
  const filteredDoctors = useMemo(() => {
    return doctors.filter(doctor => {
      const matchesSearch = doctor.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doctor.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterSpecialization === 'All' || doctor.specialization === filterSpecialization;
      return matchesSearch && matchesFilter;
    });
  }, [doctors, searchQuery, filterSpecialization]);

  // Pagination logic
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DR';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-LK', {
      minimumFractionDigits: 0
    }).format(amount);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.05 }
    }
  };

  return (
    <div style={styles.container}>
      <AdminSidebar />
      <div className="main-wrapper">
        <AdminHeader adminName={adminName} />

        <motion.main 
          className="content-padding"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header Title - Personalized Welcome */}
          <div style={styles.headerTitleSection}>
            <h1 style={styles.pageTitle}>Manage Doctors</h1>
            <p style={styles.pageSubtitle}>Manage your medical professional team and specializations.</p>
          </div>
          {/* Toolbar */}
          <div style={styles.toolbar}>
            <div style={styles.toolbarContent}>
              <div style={styles.searchBox}>
                <FiSearch style={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Search doctors by name or email..." 
                  style={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div style={styles.filterBox}>
                <FiFilter style={styles.filterIcon} />
                <select 
                  style={styles.filterSelect}
                  value={filterSpecialization}
                  onChange={(e) => setFilterSpecialization(e.target.value)}
                >
                  <option value="All">All Specializations</option>
                  <option value="General Physician">General Physician</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="ENT (Otolaryngology)">ENT (Otolaryngology)</option>
                  <option value="Ophthalmology">Ophthalmology</option>
                  <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Oncology">Oncology</option>
                  <option value="Nephrology">Nephrology</option>
                  <option value="Urology">Urology</option>
                  <option value="Gastroenterology">Gastroenterology</option>
                  <option value="Endocrinology">Endocrinology</option>
                  <option value="Rheumatology">Rheumatology</option>
                  <option value="Pulmonology">Pulmonology</option>
                  <option value="Diabetology">Diabetology</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="Anesthesiology">Anesthesiology</option>
                  <option value="Pathology">Pathology</option>
                  <option value="Vascular Surgery">Vascular Surgery</option>
                </select>
              </div>
            </div>
            <button 
                onClick={() => {
                    setEditingDoctor(null);
                    setShowModal(true);
                }} 
                style={styles.addButton}
            >
              <FiPlus />
              <span>Add Doctor</span>
            </button>
          </div>

          {/* Data Table */}
          <div style={styles.tableCard}>
            {loading ? (
              <div style={styles.loadingContainer}>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  style={styles.spinner}
                />
                <p>Syncing doctor database...</p>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div style={styles.emptyState}>
                <FiActivity style={styles.emptyIcon} />
                <h3>No Doctors Found</h3>
                <p>We couldn't find any doctors matching your current criteria.</p>
                <button onClick={() => {setSearchQuery(''); setFilterSpecialization('All');}} style={styles.resetBtn}>
                  Clear all filters
                </button>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Doctor</th>
                      <th style={styles.th}>Specialization</th>
                      <th style={styles.th}>Contact</th>
                      <th style={styles.th}>Fee (LKR)</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDoctors.map((doctor, idx) => (
                      <motion.tr 
                        key={doctor.doctor_id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ 
                          backgroundColor: '#eff6ff',
                          y: -2,
                          transition: { duration: 0.2 }
                        }}
                        transition={{ delay: idx * 0.05 }}
                        style={{...styles.tr, position: 'relative'}}
                      >
                        <td style={styles.td}>
                          <div style={styles.doctorInfo}>
                            <div style={styles.avatar}>
                              {getInitials(doctor.full_name)}
                            </div>
                            <div>
                              <p style={styles.doctorName}>{doctor.full_name}</p>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.specBadge}>{doctor.specialization}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.contactInfo}>
                            <p style={styles.email}><FiMail size={12} /> {doctor.user?.email || 'No email'}</p>
                            <p style={styles.phone}><FiPhone size={12} /> {doctor.user?.contact_number || 'No contact'}</p>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.feeText}>{formatCurrency((Number(doctor.doctor_fee) || 0) + (Number(doctor.center_fee) || 0))}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actions}>
                            <button 
                                onClick={() => {
                                    setEditingDoctor(doctor);
                                    setShowModal(true);
                                }} 
                                style={styles.actionBtnEdit}
                            >
                              <FiEdit2 />
                            </button>
                            <button 
                                onClick={() => {
                                    setDoctorToDelete(doctor);
                                    setShowDeleteConfirm(true);
                                }} 
                                style={styles.actionBtnDelete}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Pagination Controls */}
            {!loading && filteredDoctors.length > 0 && (
              <div style={styles.paginationPanel}>
                <div style={styles.paginationInfo}>
                  Showing <span style={{fontWeight: '700'}}>{Math.min(filteredDoctors.length, (currentPage - 1) * itemsPerPage + 1)}</span> to <span style={{fontWeight: '700'}}>{Math.min(filteredDoctors.length, currentPage * itemsPerPage)}</span> of <span style={{fontWeight: '700'}}>{filteredDoctors.length}</span> doctors
                </div>
                <div style={styles.paginationControls}>
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    style={{...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'}}
                  >
                    Previous
                  </button>
                  
                  <div style={styles.pageNumbers}>
                      {[...Array(totalPages)].map((_, i) => (
                          <button 
                              key={i + 1}
                              onClick={() => setCurrentPage(i + 1)}
                              style={{
                                  ...styles.pageNumber,
                                  backgroundColor: currentPage === i + 1 ? '#2563eb' : 'white',
                                  color: currentPage === i + 1 ? 'white' : '#475569',
                                  borderColor: currentPage === i + 1 ? '#2563eb' : '#e2e8f0'
                              }}
                          >
                              {i + 1}
                          </button>
                      ))}
                  </div>

                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    style={{...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'}}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={styles.footer_container}>
             <button onClick={() => navigate('/admin/dashboard')} style={styles.backBtn}>Back to Dashboard</button>
          </div>
        </motion.main>
      </div>

      {/* Components */}
      <AddDoctorModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateOrUpdate}
        editingDoctor={editingDoctor}
        isLoading={isSubmitting}
      />

      <ConfirmDialog 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Doctor"
        message={`Are you sure you want to delete ${doctorToDelete?.full_name}? This action will permanently remove their account.`}
        confirmLabel="Remove Doctor"
        type="danger"
      />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '32px',
    backgroundColor: 'white',
    padding: '20px 24px',
    borderRadius: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    flexWrap: 'wrap'
  },
  toolbarContent: {
    display: 'flex',
    gap: '16px',
    flex: 1,
    minWidth: '300px'
  },
  searchBox: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    color: '#94a3b8',
    fontSize: '18px'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 48px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    color: '#0f172a',
    outline: 'none',
    transition: 'all 0.2s'
  },
  filterBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  filterIcon: {
    position: 'absolute',
    left: '16px',
    color: '#94a3b8'
  },
  filterSelect: {
    padding: '12px 16px 12px 42px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.2)'
  },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '24px',
    border: '1px solid #f1f5f9',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    padding: '20px 24px',
    background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
    fontSize: '12px',
    fontWeight: '800',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '1.2px',
    borderBottom: 'none'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '20px 24px',
    verticalAlign: 'middle'
  },
  doctorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '800',
    border: '2px solid white',
    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.1)'
  },
  doctorName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  joinDate: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: 0,
    marginTop: '2px'
  },
  specBadge: {
    display: 'inline-flex',
    padding: '6px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: 'white',
    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  email: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  phone: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  feeText: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a'
  },
  statusBadge: {
    display: 'inline-flex',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  actions: {
    display: 'flex',
    gap: '8px'
  },
  actionBtnEdit: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  actionBtnDelete: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff1f2',
    color: '#e11d48',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  loadingContainer: {
    padding: '80px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    color: '#64748b'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f1f5f9',
    borderTopColor: '#2563eb',
    borderRadius: '50%'
  },
  emptyState: {
    padding: '80px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  emptyIcon: {
    fontSize: '48px',
    color: '#cbd5e1',
    marginBottom: '16px'
  },
  headerTitleSection: {
    marginBottom: "32px",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 4px 0",
    letterSpacing: "-0.5px",
    fontFamily: "var(--font-accent)",
  },
  pageSubtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500",
    fontFamily: "var(--font-main)",
  },
  resetBtn: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer'
  },
  footer_container: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '32px'
  },
  backBtn: {
    padding: '12px 24px',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  paginationPanel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 32px",
    backgroundColor: "white",
    borderTop: "1px solid #f1f5f9"
  },
  paginationInfo: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "500"
  },
  paginationControls: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  pageNumbers: {
    display: "flex",
    gap: "6px"
  },
  pageBtn: {
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#2563eb",
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    transition: "all 0.2s"
  },
  pageNumber: {
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "600",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.2s"
  }
};

export default ManageDoctors;
