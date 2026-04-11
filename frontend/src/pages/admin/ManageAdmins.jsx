import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiSearch, 
  FiUser, 
  FiMail,
  FiPhone,
  FiShield,
  FiAlertTriangle
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import AdminHeader from '../../components/AdminHeader';
import AdminSidebar from '../../components/AdminSidebar';
import AddAdminModal from '../../components/AddAdminModal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const ManageAdmins = () => {
  const { api, user: currentUser } = useAuth();
  const adminName = currentUser?.username || 'Admin';
  const navigate = useNavigate();
  
  // State
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/staff');
      if (response.data.success) {
        setAdmins(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load administrators');
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    try {
      setIsSubmitting(true);
      const response = editingAdmin 
        ? await api.put(`/staff/${editingAdmin.user_id}`, formData)
        : await api.post('/staff', formData);

      if (response.data.success) {
        toast.success(editingAdmin ? 'Admin updated successfully' : 'Admin added successfully!');
        fetchAdmins();
        setShowModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save administrator');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!adminToDelete) return;
    try {
      const response = await api.delete(`/staff/${adminToDelete.user_id}`);
      if (response.data.success) {
        toast.success('Administrator removed successfully');
        fetchAdmins();
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete administrator');
    }
  };

  // Filter & Search Logic
  const filteredAdmins = useMemo(() => {
    return admins.filter(admin => {
      const matchesSearch = admin.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           admin.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [admins, searchQuery]);

  // Pagination logic
  const paginatedAdmins = filteredAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

  const getInitials = (name) => {
    return name?.split('_').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';
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
          {/* Header Title */}
          <div style={styles.headerTitleSection}>
            <h1 style={styles.pageTitle}>Manage Administrators</h1>
            <p style={styles.pageSubtitle}>Maintain system security and oversee administrative access levels.</p>
          </div>

          {/* Toolbar */}
          <div style={styles.toolbar}>
            <div style={styles.toolbarContent}>
              <div style={styles.searchBox}>
                <FiSearch style={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Search by username or email..." 
                  style={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <button 
                onClick={() => {
                    setEditingAdmin(null);
                    setShowModal(true);
                }} 
                style={styles.addButton}
            >
              <FiPlus />
              <span>Add Administrator</span>
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
                <p>Retrieving administrator registry...</p>
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div style={styles.emptyState}>
                <FiShield style={styles.emptyIcon} />
                <h3>No Administrators Found</h3>
                <p>We couldn't find any accounts matching your search.</p>
                <button onClick={() => {setSearchQuery('');}} style={styles.resetBtn}>
                  Clear Search
                </button>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Administrator</th>
                      <th style={styles.th}>Contact Info</th>
                      <th style={styles.th}>Rank / Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAdmins.map((admin, idx) => (
                      <motion.tr 
                        key={admin.user_id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ 
                          backgroundColor: '#f5f3ff',
                          y: -2,
                          transition: { duration: 0.2 }
                        }}
                        transition={{ delay: idx * 0.05 }}
                        style={styles.tr}
                      >
                        <td style={styles.td}>
                          <div style={styles.personInfo}>
                            <div style={styles.avatar}>
                              {getInitials(admin.username)}
                            </div>
                            <div>
                              <p style={styles.personName}>{admin.username}</p>
                              <p style={styles.joinDate}>ID: #{admin.user_id}</p>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.contactInfo}>
                            <p style={styles.email}><FiMail size={12} /> {admin.email || 'No email'}</p>
                            <p style={styles.phone}><FiPhone size={12} /> {admin.contact_number || 'No contact'}</p>
                          </div>
                        </td>

                        <td style={styles.td}>
                          <div style={styles.statusRow}>
                            <div style={{
                              ...styles.rankBadge,
                              backgroundColor: admin.role_id === 5 ? '#eef2ff' : '#f8fafc',
                              color: admin.role_id === 5 ? '#4f46e5' : '#64748b',
                              borderColor: admin.role_id === 5 ? '#c7d2fe' : '#e2e8f0'
                            }}>
                              {admin.role_id === 5 ? <><FiShield size={10} style={{marginRight: '4px'}} /> Super</> : 'Admin'}
                            </div>
                            <div style={{
                                ...styles.statusDot,
                                backgroundColor: admin.is_active ? '#10b981' : '#e11d48'
                            }} title={admin.is_active ? 'Active' : 'Inactive'} />
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actions}>
                            <button 
                                onClick={() => {
                                    setEditingAdmin(admin);
                                    setShowModal(true);
                                }} 
                                style={styles.actionBtnEdit}
                            >
                              <FiEdit2 />
                            </button>
                            <button 
                                onClick={() => {
                                    setAdminToDelete(admin);
                                    setShowDeleteConfirm(true);
                                }} 
                                style={styles.actionBtnDelete}
                                disabled={admin.user_id === currentUser?.user_id}
                                title={admin.user_id === currentUser?.user_id ? "Cannot delete yourself" : "Delete Admin"}
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
            
            {/* Pagination */}
            {!loading && filteredAdmins.length > itemsPerPage && (
              <div style={styles.paginationPanel}>
                <div style={styles.paginationControls}>
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    style={{...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1}}
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
                                  backgroundColor: currentPage === i + 1 ? '#4f46e5' : 'white',
                                  color: currentPage === i + 1 ? 'white' : '#64748b'
                              }}
                          >
                              {i + 1}
                          </button>
                      ))}
                  </div>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    style={{...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1}}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={styles.footer_container}>
             <button onClick={() => navigate('/admin/dashboard')} style={styles.backBtn}>Back to Control Center</button>
          </div>
        </motion.main>
      </div>

      {/* Components */}
      <AddAdminModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateOrUpdate}
        editingAdmin={editingAdmin}
        isLoading={isSubmitting}
      />

      <ConfirmDialog 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Revoke Admin Access"
        message={`Are you sure you want to remove access for "${adminToDelete?.username}"? This action cannot be undone.`}
        confirmLabel="Revoke Access"
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
  headerTitleSection: {
    marginBottom: "32px",
  },
  pageTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 4px 0",
    letterSpacing: "-0.5px"
  },
  pageSubtitle: {
    fontSize: "15px",
    color: "#64748b",
    margin: 0,
    fontWeight: "500"
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '24px',
    backgroundColor: 'white',
    padding: '16px 24px',
    borderRadius: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  toolbarContent: {
    display: 'flex',
    gap: '16px',
    flex: 1
  },
  searchBox: {
    position: 'relative',
    flex: 1,
    maxWidth: '400px'
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
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
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
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
    padding: '18px 24px',
    background: '#f8fafc',
    fontSize: '11px',
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    borderBottom: '1px solid #f1f5f9'
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.2s'
  },
  td: {
    padding: '18px 24px',
    verticalAlign: 'middle'
  },
  personInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: '#eef2ff',
    color: '#4f46e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '800',
    border: '1px solid #c7d2fe'
  },
  personName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  joinDate: {
    fontSize: '11px',
    color: '#94a3b8',
    margin: 0
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
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  rankBadge: {
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '700',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  actions: {
    display: 'flex',
    gap: '8px'
  },
  actionBtnEdit: {
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    color: '#4f46e5',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  actionBtnDelete: {
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid #fee2e2',
    backgroundColor: 'white',
    color: '#ef4444',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:disabled': {
        opacity: 0.3,
        cursor: 'not-allowed'
    }
  },
  footer_container: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '24px'
  },
  backBtn: {
    padding: '10px 20px',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer'
  },
  loadingContainer: {
    padding: '60px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#64748b'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #f1f5f9',
    borderTopColor: '#4f46e5',
    borderRadius: '50%',
    marginBottom: '16px'
  },
  emptyState: {
    padding: '60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  emptyIcon: {
    fontSize: '40px',
    color: '#cbd5e1',
    marginBottom: '16px'
  },
  paginationPanel: {
    padding: '16px 24px',
    borderTop: '1px solid #f1f5f9'
  },
  paginationControls: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px'
  },
  pageNumbers: {
    display: 'flex',
    gap: '6px'
  },
  pageNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  pageBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: 'white',
    color: '#4f46e5',
    cursor: 'pointer'
  }
};

export default ManageAdmins;
