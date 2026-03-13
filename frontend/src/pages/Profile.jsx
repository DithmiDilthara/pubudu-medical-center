import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiClock, FiCreditCard, FiFileText, FiActivity } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details'); // details, bookings, transactions

    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Derived values with safeguards
    const isAdmin = user?.role_id === 1;
    const isDoctor = user?.role_id === 2;
    const profileData = user?.profile || user || {};

    const mockBookings = [
        { id: 'B001', doctor: 'Dr. Sarah Wilson', date: '2024-03-15', time: '10:00 AM', status: 'Completed' },
        { id: 'B002', doctor: 'Dr. James Lee', date: '2024-04-02', time: '02:30 PM', status: 'Upcoming' },
    ];

    useEffect(() => {
        const fetchTransactions = async () => {
            // Only fetch if user is loaded, is not admin/doctor (patient specific), and we are on the transactions tab
            if (activeTab !== 'transactions' || !user || isAdmin || isDoctor) return;

            try {
                setLoadingTransactions(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/patient/transactions`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    setTransactions(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch transactions', error);
            } finally {
                setLoadingTransactions(false);
            }
        };

        fetchTransactions();
    }, [activeTab, isAdmin, isDoctor, user]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (activeTab !== 'history' || !user || isAdmin || isDoctor) return;

            try {
                setLoadingHistory(true);
                const token = localStorage.getItem('token');
                // We need the patient_id. It's usually in user.profile.patient_id or similar.
                // Based on authController/profile, user.profile contains the patient/doctor record.
                const patientId = user.profile?.patient_id;
                
                if (!patientId) return;

                const response = await axios.get(`${API_URL}/clinical/history/${patientId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    setHistory(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch history', error);
            } finally {
                setLoadingHistory(false);
            }
        };

        fetchHistory();
    }, [activeTab, isAdmin, isDoctor, user]);

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
                    setUser(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
                // navigate('/'); // Redirect if Auth fails
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    if (loading) return <div style={styles.container}>Loading...</div>;
    if (!user) return <div style={styles.container}>User not found</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.title}>My Profile</h1>
                </div>
            </div>

            <div style={styles.content}>
                {/* Sidebar / Tabs */}
                <div style={styles.sidebar}>
                    <div style={styles.userInfo}>
                        <div style={styles.avatar}>{user.username?.charAt(0).toUpperCase()}</div>
                        <h3 style={styles.userName}>{profileData.full_name || user.username}</h3>
                        <span style={styles.userRole}>{user.role?.role_name || 'User'}</span>
                    </div>

                    <div style={styles.menu}>
                        <button
                            style={activeTab === 'details' ? { ...styles.menuItem, ...styles.activeMenuItem } : styles.menuItem}
                            onClick={() => setActiveTab('details')}
                        >
                            <FiUser /> Personal Details
                        </button>
                        {!isAdmin && (
                            <>
                                <button
                                    style={activeTab === 'bookings' ? { ...styles.menuItem, ...styles.activeMenuItem } : styles.menuItem}
                                    onClick={() => setActiveTab('bookings')}
                                >
                                    <FiCalendar /> {isDoctor ? 'Appointment History' : 'Booking History'}
                                </button>
                                {!isDoctor && (
                                    <>
                                        <button
                                            style={activeTab === 'history' ? { ...styles.menuItem, ...styles.activeMenuItem } : styles.menuItem}
                                            onClick={() => setActiveTab('history')}
                                        >
                                            <FiFileText /> Medical History
                                        </button>
                                        <button
                                            style={activeTab === 'transactions' ? { ...styles.menuItem, ...styles.activeMenuItem } : styles.menuItem}
                                            onClick={() => setActiveTab('transactions')}
                                        >
                                            <FiCreditCard /> Transactions
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={styles.mainPanel}>

                    {activeTab === 'details' && (
                        <div>
                            <h2 style={styles.sectionTitle}>Personal Information</h2>
                            <div style={styles.grid}>
                                <div style={styles.field}>
                                    <label style={styles.label}>Full Name</label>
                                    <div style={styles.value}>{profileData.full_name || 'N/A'}</div>
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>Username</label>
                                    <div style={styles.value}>{user.username}</div>
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>Email</label>
                                    <div style={styles.value}><FiMail style={styles.icon} /> {user.email || 'N/A'}</div>
                                </div>
                                <div style={styles.field}>
                                    <label style={styles.label}>Phone</label>
                                    <div style={styles.value}><FiPhone style={styles.icon} /> {user.contact_number || 'N/A'}</div>
                                </div>
                                {profileData.nic && (
                                    <div style={styles.field}>
                                        <label style={styles.label}>NIC</label>
                                        <div style={styles.value}>{profileData.nic}</div>
                                    </div>
                                )}
                                {profileData.address && (
                                    <div style={styles.field}>
                                        <label style={styles.label}>Address</label>
                                        <div style={styles.value}><FiMapPin style={styles.icon} /> {profileData.address}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'bookings' && !isAdmin && (
                        <div>
                            <h2 style={styles.sectionTitle}>{isDoctor ? 'Appointment History' : 'Booking History'}</h2>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>ID</th>
                                        <th style={styles.th}>{isDoctor ? 'Patient' : 'Doctor'}</th>
                                        <th style={styles.th}>Date</th>
                                        <th style={styles.th}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockBookings.map(b => (
                                        <tr key={b.id} style={styles.tr}>
                                            <td style={styles.td}>{b.id}</td>
                                            <td style={styles.td}>{isDoctor ? (b.patient || 'N/A') : b.doctor}</td>
                                            <td style={styles.td}>{b.date} {b.time}</td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.badge,
                                                    background: b.status === 'Completed' ? '#d4edda' : '#fff3cd',
                                                    color: b.status === 'Completed' ? '#155724' : '#856404'
                                                }}>
                                                    {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'history' && !isAdmin && (
                        <div>
                            <h2 style={styles.sectionTitle}>Medical History</h2>
                            {loadingHistory ? (
                                <p>Loading medical records...</p>
                            ) : history.length > 0 ? (
                                <div style={styles.historyList}>
                                    {history.map(record => {
                                        // Parse notes for follow-up
                                        const notesParts = record.notes?.split('--- FOLLOW-UP ---') || [record.notes, ''];
                                        const mainNotes = notesParts[0].trim();
                                        const followUpLine = notesParts[1]?.includes('Date: ') 
                                            ? notesParts[1].split('Date: ')[1].trim().split('\n')[0] 
                                            : null;

                                        return (
                                            <div key={record.prescription_id} style={styles.recordCard}>
                                                <div style={styles.recordHeader}>
                                                    <div>
                                                        <h3 style={styles.recordDiagnosis}>{record.diagnosis}</h3>
                                                        <p style={styles.recordDoctor}>Dr. {record.appointment?.doctor?.full_name}</p>
                                                    </div>
                                                    <span style={styles.recordDate}>{new Date(record.created_at).toLocaleDateString()}</span>
                                                </div>
                                                
                                                <div style={styles.recordBody}>
                                                    <div style={styles.recordSection}>
                                                        <label style={styles.recordLabel}><FiActivity size={12} /> Medications</label>
                                                        <p style={{ ...styles.recordText, whiteSpace: 'pre-line' }}>{record.medications}</p>
                                                    </div>
                                                    
                                                    {mainNotes && (
                                                        <div style={styles.recordSection}>
                                                            <label style={styles.recordLabel}><FiFileText size={12} /> Notes</label>
                                                            <p style={styles.recordText}>{mainNotes}</p>
                                                        </div>
                                                    )}

                                                    {followUpLine && (
                                                        <div style={styles.followUpBadge}>
                                                            <FiCalendar size={12} /> Next Follow-up: <strong>{followUpLine}</strong>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p style={styles.noTransactions}>No medical records found.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'transactions' && !isAdmin && (
                        <div>
                            <h2 style={styles.sectionTitle}>Transaction History</h2>
                            {loadingTransactions ? (
                                <p>Loading transactions...</p>
                            ) : transactions.length > 0 ? (
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>ID</th>
                                            <th style={styles.th}>Date</th>
                                            <th style={styles.th}>Amount</th>
                                            <th style={styles.th}>Method</th>
                                            <th style={styles.th}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map(t => (
                                            <tr key={t.payment_id} style={styles.tr}>
                                                <td style={styles.td}>TXN-{t.payment_id}</td>
                                                <td style={styles.td}>{new Date(t.created_at).toLocaleDateString()}</td>
                                                <td style={{ ...styles.td, fontWeight: 'bold' }}>LKR {parseFloat(t.amount).toFixed(2)}</td>
                                                <td style={styles.td}>{t.payment_method}</td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        ...styles.badge,
                                                        background: t.status === 'SUCCESS' ? '#d4edda' : '#f8d7da',
                                                        color: t.status === 'SUCCESS' ? '#155724' : '#721c24'
                                                    }}>
                                                        {t.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p style={styles.noTransactions}>No transactions found.</p>
                            )}
                        </div>
                    )}

                    <div style={styles.footer}>
                        <button onClick={() => navigate(-1)} style={styles.backButton}>Back</button>
                    </div>

                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        fontFamily: "'Inter', sans-serif"
    },
    header: {
        backgroundColor: 'white',
        padding: '20px 40px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    headerContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    title: {
        margin: 0,
        fontSize: '24px',
        color: '#1f2937'
    },
    backButton: {
        padding: '10px 24px',
        border: 'none',
        borderRadius: '6px',
        background: '#0056b3',
        color: 'white',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0, 86, 179, 0.2)',
        transition: 'all 0.2s'
    },
    footer: {
        marginTop: '40px',
        display: 'flex',
        justifyContent: 'flex-end'
    },
    noTransactions: {
        textAlign: 'center',
        padding: '20px',
        color: '#6b7280'
    },
    content: {
        maxWidth: '1200px',
        margin: '40px auto',
        padding: '0 20px',
        display: 'flex',
        gap: '30px',
        flexWrap: 'wrap'
    },
    sidebar: {
        flex: '1',
        minWidth: '280px',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        height: 'fit-content',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    userInfo: {
        textAlign: 'center',
        marginBottom: '30px'
    },
    avatar: {
        width: '80px',
        height: '80px',
        background: '#0056b3',
        color: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        fontWeight: 'bold',
        margin: '0 auto 15px'
    },
    userName: {
        margin: '0 0 5px',
        color: '#111827',
        fontSize: '18px'
    },
    userRole: {
        color: '#6b7280',
        fontSize: '14px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    menu: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    menuItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 15px',
        borderRadius: '8px',
        border: 'none',
        background: 'transparent',
        color: '#4b5563',
        cursor: 'pointer',
        fontSize: '15px',
        textAlign: 'left',
        transition: 'all 0.2s'
    },
    activeMenuItem: {
        background: '#eff6ff',
        color: '#0056b3',
        fontWeight: '600'
    },
    mainPanel: {
        flex: '3',
        minWidth: '300px',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    sectionTitle: {
        margin: '0 0 30px',
        fontSize: '20px',
        color: '#1f2937',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '15px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '25px'
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    },
    label: {
        fontSize: '13px',
        color: '#6b7280',
        fontWeight: '500'
    },
    value: {
        fontSize: '16px',
        color: '#111827',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    icon: {
        color: '#9ca3af'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '10px'
    },
    th: {
        textAlign: 'left',
        padding: '12px',
        borderBottom: '2px solid #e5e7eb',
        color: '#6b7280',
        fontSize: '14px'
    },
    td: {
        padding: '12px',
        borderBottom: '1px solid #f3f4f6',
        color: '#374151',
        fontSize: '15px'
    },
    badge: {
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600'
    },
    historyList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        marginTop: '20px'
    },
    recordCard: {
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        background: '#fff',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }
    },
    recordHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        borderBottom: '1px solid #f3f4f6',
        paddingBottom: '15px'
    },
    recordDiagnosis: {
        margin: '0 0 5px',
        fontSize: '18px',
        color: '#111827',
        fontWeight: '700'
    },
    recordDoctor: {
        margin: 0,
        fontSize: '14px',
        color: '#6b7280',
        fontWeight: '500'
    },
    recordDate: {
        fontSize: '13px',
        color: '#9ca3af',
        background: '#f9fafb',
        padding: '4px 10px',
        borderRadius: '6px'
    },
    recordBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    recordSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
    },
    recordLabel: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#0056b3',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    recordText: {
        fontSize: '15px',
        color: '#374151',
        margin: 0,
        lineHeight: '1.6'
    },
    followUpBadge: {
        marginTop: '10px',
        padding: '10px 15px',
        background: '#fff7ed',
        border: '1px solid #fed7aa',
        borderRadius: '8px',
        color: '#c2410c',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    }
};

export default Profile;
