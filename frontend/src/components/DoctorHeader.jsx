import { Link, useLocation, useNavigate } from 'react-router-dom';

function DoctorHeader() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/doctor/dashboard', label: 'Dashboard' },
    { path: '/doctor/appointments', label: 'Appointments' },
    { path: '/doctor/patients', label: 'Patients' },
    { path: '/doctor/availability', label: 'Availability' }
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <Link to="/doctor/dashboard" style={styles.brand}>
          <span style={styles.brandIcon}>🩺</span>
          <div>
            <div style={styles.brandTitle}>Pubudu Medical Center</div>
            <div style={styles.brandSubtitle}>Doctor Portal</div>
          </div>
        </Link>

        <nav style={styles.navigation}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                ...styles.navItem,
                ...(pathname === item.path ? styles.navItemActive : {})
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div style={styles.headerActions}>
          <button style={styles.notificationBtn} title="Notifications">
            🔔
          </button>
          <div style={styles.profileAvatar}>Dr</div>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: '#ffffff',
    boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },

  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    minWidth: 'fit-content'
  },

  brandIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'grid',
    placeItems: 'center',
    fontSize: '20px',
    color: '#fff',
    boxShadow: '0 6px 16px rgba(102,126,234,0.35)'
  },

  brandTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#111827'
  },

  brandSubtitle: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px'
  },

  navigation: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    marginLeft: '40px'
  },

  navItem: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#4b5563',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },

  navItemActive: {
    color: '#059669',
    backgroundColor: 'rgba(5, 150, 105, 0.1)'
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: 'auto'
  },

  notificationBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    background: '#f5f7fb',
    cursor: 'pointer',
    fontSize: '18px',
    transition: 'all 0.2s ease'
  },

  profileAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 700,
    color: '#fff',
    fontSize: '12px'
  },

  logoutBtn: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #e74c3c',
    background: '#e74c3c',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 6px 14px rgba(231,76,60,0.25)'
  }
};

export default DoctorHeader;
