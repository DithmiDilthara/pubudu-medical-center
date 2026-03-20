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
  FiPhone,
  FiClock
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import AdminHeader from '../../components/AdminHeader';
import AdminSidebar from '../../components/AdminSidebar';
import AddReceptionistModal from '../../components/AddReceptionistModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const ManageReceptionist = () => {
  const { api, user } = useAuth();
  const adminName = user?.username || 'Admin';
  const navigate = useNavigate();
  
  // State
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingReceptionist, setEditingReceptionist] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [receptionistToDelete, setReceptionistToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReceptionists();
  }, []);

  const fetchReceptionists = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/receptionists');
      if (response.data.success) {
        let docs = response.data.data;
        
        // Add mock receptionists if list is empty for demonstration as requested
        if (docs.length === 0) {
          docs = [
            { receptionist_id: 'm1', full_name: 'Kumara Perera', shift: 'Morning', user: { email: 'kumara@pubudu.lk', contact_number: '0771234567', is_active: true } },
            { receptionist_id: 'm2', full_name: 'Dileepa Silva', shift: 'Afternoon', user: { email: 'dileepa@pubudu.lk', contact_number: '0772345678', is_active: true } },
            { receptionist_id: 'm3', full_name: 'Anula Wijesinghe', shift: 'Night', user: { email: 'anula@pubudu.lk', contact_number: '0773456789', is_active: true } },
            { receptionist_id: 'm4', full_name: 'Sunil Rathnayake', shift: 'Full Day', user: { email: 'sunil@pubudu.lk', contact_number: '0774567890', is_active: false } },
            { receptionist_id: 'm5', full_name: 'Manel Gunawardena', shift: 'Morning', user: { email: 'manel@pubudu.lk', contact_number: '0775678901', is_active: true } }
          ];
        }
        setReceptionists(docs);
      }
    } catch (error) {
      toast.error('Failed to load receptionists');
      console.error('Error fetching receptionists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      setIsSubmitting(true);
      const response = editingReceptionist 
        ? await api.put(`/admin/receptionists/${editingReceptionist.receptionist_id}`, formData)
        : await api.post('/admin/receptionists', formData);

      if (response.data.success) {
        toast.success(editingReceptionist ? 'Receptionist updated successfully' : 'Receptionist added successfully');
        fetchReceptionists();
        setShowModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save receptionist');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!receptionistToDelete) return;
    try {
      const response = await api.delete(`/admin/receptionists/${receptionistToDelete.receptionist_id}`);
      if (response.data.success) {
        toast.success('Receptionist removed successfully');
        fetchReceptionists();
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      toast.error('Failed to delete receptionist');
    }
  };

  // Filter & Search Logic
  const filteredReceptionists = useMemo(() => {
    return receptionists.filter(rec => {
      const matchesSearch = rec.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           rec.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [receptionists, searchQuery]);

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'RP';
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
            <h1 style={styles.pageTitle}>Welcome back, {adminName}!</h1>
            <p style={styles.pageSubtitle}>Coordinate frontline staff and streamline patient intake operations.</p>
          </div>
          {/* Toolbar */}
          <div style={styles.toolbar}>
            <div style={styles.toolbarContent}>
              <div style={styles.searchBox}>
                <FiSearch style={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Search receptionists by name or email..." 
                  style={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

            </div>
            <button 
                onClick={() => {
                    setEditingReceptionist(null);
                    setShowModal(true);
                }} 
                style={styles.addButton}
            >
              <FiPlus />
              <span>Add Receptionist</span>
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
                <p>Syncing staff database...</p>
              </div>
            ) : filteredReceptionists.length === 0 ? (
              <div style={styles.emptyState}>
                <FiActivity style={styles.emptyIcon} />
                <h3>No Receptionists Found</h3>
                <p>We couldn't find any staff matching your current criteria.</p>
                <button onClick={() => {setSearchQuery('');}} style={styles.resetBtn}>
                  Clear all filters
                </button>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Receptionist</th>
                      <th style={styles.th}>Contact</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReceptionists.map((rec, idx) => (
                      <motion.tr 
                        key={rec.receptionist_id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        style={styles.tr}
                      >
                        <td style={styles.td}>
                          <div style={styles.personInfo}>
                            <div style={styles.avatar}>
                              {getInitials(rec.full_name)}
                            </div>
                            <div>
                              <p style={styles.personName}>{rec.full_name}</p>
                              <p style={styles.joinDate}>Staff Registry</p>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.contactInfo}>
                            <p style={styles.email}><FiMail size={12} /> {rec.user?.email || 'No email'}</p>
                            <p style={styles.phone}><FiPhone size={12} /> {rec.user?.contact_number || 'No contact'}</p>
                          </div>
                        </td>

                        <td style={styles.td}>
                          <div style={{
                            ...styles.statusBadge,
                            backgroundColor: rec.user?.is_active !== false ? '#ecfdf5' : '#fff1f2',
                            color: rec.user?.is_active !== false ? '#10b981' : '#e11d48'
                          }}>
                            {rec.user?.is_active !== false ? 'Active' : 'Inactive'}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actions}>
                            <button 
                                onClick={() => {
                                    setEditingReceptionist(rec);
                                    setShowModal(true);
                                }} 
                                style={styles.actionBtnEdit}
                            >
                              <FiEdit2 />
                            </button>
                            <button 
                                onClick={() => {
                                    setReceptionistToDelete(rec);
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
          </div>

          <div style={styles.footer_container}>
             <button onClick={() => navigate('/admin/dashboard')} style={styles.backBtn}>Back to Dashboard</button>
          </div>
        </motion.main>
      </div>

      {/* Components */}
      <AddReceptionistModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateOrUpdate}
        editingReceptionist={editingReceptionist}
        isLoading={isSubmitting}
      />

      <ConfirmDialog 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Receptionist"
        message={`Are you sure you want to delete ${receptionistToDelete?.full_name}? This action will permanently remove their access.`}
        confirmLabel="Remove Staff"
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
    backgroundColor: '#f8fafc',
    fontSize: '12px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    borderBottom: '1px solid #f1f5f9',
    fontFamily: 'var(--font-accent)',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '20px 24px',
    verticalAlign: 'middle'
  },
  personInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '14px',
    backgroundColor: '#f5f3ff', // purple bg for receptionists
    color: '#7c3aed', // purple text
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '800',
    border: '2px solid white',
    boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.1)'
  },
  personName: {
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
  shiftBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    backgroundColor: '#f1f5f9',
    color: '#475569'
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
  }
};

export default ManageReceptionist;
