import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiClock, FiCreditCard } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details'); // details, bookings, transactions

    // Mock History Data (since backend implementation for this part was not requested in this specific task scope but required for UI)
    const mockBookings = [
        { id: 'B001', doctor: 'Dr. Sarah Wilson', date: '2024-03-15', time: '10:00 AM', status: 'Completed' },
        { id: 'B002', doctor: 'Dr. James Lee', date: '2024-04-02', time: '02:30 PM', status: 'Upcoming' },
    ];

    const mockTransactions = [
        { id: 'T001', date: '2024-03-15', amount: 'LKR 2500.00', method: 'Card', status: 'Success' },
        { id: 'T002', date: '2024-04-01', amount: 'LKR 1500.00', method: 'Online', status: 'Pending' },
    ];

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

    const profileData = user.profile || user; // Handle structure flexibility
    const isAdmin = user.role_id === 1; // From backend controller logic

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerContent}>
                    <h1 style={styles.title}>My Profile</h1>
                    <button onClick={() => navigate(-1)} style={styles.backButton}>Back</button>
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
                                    <FiCalendar /> Booking History
                                </button>
                                <button
                                    style={activeTab === 'transactions' ? { ...styles.menuItem, ...styles.activeMenuItem } : styles.menuItem}
                                    onClick={() => setActiveTab('transactions')}
                                >
                                    <FiCreditCard /> Transactions
                                </button>
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
                            <h2 style={styles.sectionTitle}>Booking History</h2>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>ID</th>
                                        <th style={styles.th}>Doctor</th>
                                        <th style={styles.th}>Date</th>
                                        <th style={styles.th}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockBookings.map(b => (
                                        <tr key={b.id} style={styles.tr}>
                                            <td style={styles.td}>{b.id}</td>
                                            <td style={styles.td}>{b.doctor}</td>
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

                    {activeTab === 'transactions' && !isAdmin && (
                        <div>
                            <h2 style={styles.sectionTitle}>Transaction History</h2>
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
                                    {mockTransactions.map(t => (
                                        <tr key={t.id} style={styles.tr}>
                                            <td style={styles.td}>{t.id}</td>
                                            <td style={styles.td}>{t.date}</td>
                                            <td style={styles.td} className="font-bold">{t.amount}</td>
                                            <td style={styles.td}>{t.method}</td>
                                            <td style={styles.td}>{t.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

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
        padding: '8px 16px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        background: 'white',
        cursor: 'pointer'
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
    }
};

export default Profile;
