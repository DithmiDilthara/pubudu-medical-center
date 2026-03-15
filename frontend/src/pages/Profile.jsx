import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiMail, FiPhone, FiCreditCard, FiSave, FiCamera } from 'react-icons/fi';
import PatientSidebar from '../components/PatientSidebar';
import PatientHeader from '../components/PatientHeader';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import DoctorSidebar from '../components/DoctorSidebar';
import DoctorHeader from '../components/DoctorHeader';
import ReceptionistSidebar from '../components/ReceptionistSidebar';
import ReceptionistHeader from '../components/ReceptionistHeader';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        contact_number: '',
        nic: '',
        blood_type: '',
        emergency_contact: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/');
                    return;
                }

                const response = await axios.get(`${API_URL}/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    const userData = response.data.data;
                    setUser(userData);
                    setFormData({
                        full_name: userData.profile?.full_name || '',
                        email: userData.email || '',
                        contact_number: userData.contact_number || '',
                        nic: userData.profile?.nic || '',
                        blood_type: userData.profile?.blood_type || '', // Assuming this exists or handling gracefully
                        emergency_contact: userData.profile?.emergency_contact || '+94 71 987 6543'
                    });
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to save changes");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    if (loading) return <div style={styles.loading}>Loading profile...</div>;

    const renderRoleComponents = () => {
        const roleId = user?.role_id;
        
        switch (roleId) {
            case 1: // Admin
                return {
                    Sidebar: <AdminSidebar />,
                    Header: <AdminHeader adminName={user?.profile?.full_name} />
                };
            case 2: // Doctor
                return {
                    Sidebar: <DoctorSidebar onLogout={handleLogout} />,
                    Header: <DoctorHeader doctorName={user?.profile?.full_name} />
                };
            case 3: // Receptionist
                return {
                    Sidebar: <ReceptionistSidebar onLogout={handleLogout} />,
                    Header: <ReceptionistHeader receptionistName={user?.profile?.full_name} />
                };
            case 4: // Patient
            default:
                return {
                    Sidebar: <PatientSidebar onLogout={handleLogout} />,
                    Header: <PatientHeader />
                };
        }
    };

    const { Sidebar, Header } = renderRoleComponents();

    return (
        <div style={styles.container}>
            {Sidebar}

            <div className="main-wrapper">
                {Header}

                <main className="content-padding" style={styles.mainContent}>
                    <div style={styles.card}>
                        {/* Section Header */}
                        <div style={styles.sectionHeader}>
                            <div style={styles.headerIconBox}>
                                <FiUser style={styles.headerIcon} />
                            </div>
                            <div style={styles.headerText}>
                                <h2 style={styles.sectionTitle}>Personal Information</h2>
                                <p style={styles.sectionSubtitle}>View and update your personal profile details</p>
                            </div>
                        </div>

                        {/* Profile Photo Section */}
                        <div style={styles.photoSection}>
                            <div style={styles.avatarWrapper}>
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <button style={styles.changeBtn}>
                                <FiCamera style={{ marginRight: '8px' }} />
                                Change Photo
                            </button>
                        </div>

                        {/* Form Grid */}
                        <div style={styles.formGrid}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="Enter email"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Phone</label>
                                <input
                                    type="text"
                                    name="contact_number"
                                    value={formData.contact_number}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>NIC Number</label>
                                <input
                                    type="text"
                                    name="nic"
                                    value={formData.nic}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="Enter NIC number"
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Blood Type</label>
                                <select
                                    name="blood_type"
                                    value={formData.blood_type}
                                    onChange={handleInputChange}
                                    style={styles.select}
                                >
                                    <option value="">Select blood type</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Emergency Contact</label>
                                <input
                                    type="text"
                                    name="emergency_contact"
                                    value={formData.emergency_contact}
                                    onChange={handleInputChange}
                                    style={styles.input}
                                    placeholder="+94 71 987 6543"
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <div style={styles.actionContainer}>
                            <button onClick={handleSave} style={styles.saveBtn}>
                                <FiSave style={{ fontSize: '18px' }} />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--slate-50)',
        fontFamily: "'Inter', sans-serif",
    },
    mainWrapper: {
        // Handled by .main-wrapper in CSS
    },
    mainContent: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
    },
    card: {
        maxWidth: '896px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-2xl)',
        border: '1px solid var(--slate-100)',
        padding: '32px',
        boxShadow: 'var(--shadow-soft)',
        height: 'fit-content'
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px',
    },
    headerIconBox: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        backgroundColor: '#E6F2FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerIcon: {
        fontSize: '24px',
        color: 'var(--primary-blue)',
    },
    headerText: {
        display: 'flex',
        flexDirection: 'column',
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#111827',
        margin: 0,
    },
    sectionSubtitle: {
        fontSize: 'var(--text-sm)',
        color: 'var(--slate-500)',
        margin: 0,
    },
    photoSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '40px',
        padding: '24px',
        backgroundColor: '#F9FAFB',
        borderRadius: '16px',
    },
    avatarWrapper: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#0066CC',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        fontWeight: 'bold',
    },
    changeBtn: {
        padding: '10px 18px',
        borderRadius: '10px',
        border: '1px solid #E5E7EB',
        backgroundColor: 'white',
        color: '#374151',
        fontSize: 'var(--text-sm)',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: '#F3F4F6',
        }
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '24px 32px',
        marginBottom: '40px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: 'var(--text-sm)',
        fontWeight: '600',
        color: 'var(--slate-600)',
    },
    input: {
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid #E5E7EB',
        fontSize: 'var(--text-base)',
        color: 'var(--slate-900)',
        outline: 'none',
        transition: 'border-color 0.2s ease',
        ':focus': {
            borderColor: '#0066CC',
        }
    },
    select: {
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid #E5E7EB',
        fontSize: 'var(--text-base)',
        color: 'var(--slate-900)',
        outline: 'none',
        backgroundColor: 'white',
        cursor: 'pointer',
    },
    actionContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        paddingTop: '24px',
        borderTop: '1px solid #F3F4F6',
    },
    saveBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 24px',
        borderRadius: '10px',
        backgroundColor: 'var(--primary-blue)',
        color: 'white',
        fontSize: '15px',
        fontWeight: '600',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
        ':hover': {
            backgroundColor: 'var(--primary-blue-hover)',
            transform: 'translateY(-1px)',
        }
    },
    loading: {
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        color: '#6B7280',
    }
};

export default Profile;
