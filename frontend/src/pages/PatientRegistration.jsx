import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>+</div>
        <h2 style={styles.title}>Pubudu Medical</h2>
      </div>

      <p style={styles.subtitle}>E-Channeling System</p>

      <nav style={styles.nav}>
        <NavLink 
          to="/patient/dashboard" 
          style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.navLinkActive : styles.navLinkInactive)
          })}
        >
          📊 Dashboard
        </NavLink>
        <NavLink 
          to="/patient/find-doctor" 
          style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.navLinkActive : styles.navLinkInactive)
          })}
        >
          👨‍⚕️ Find Doctor
        </NavLink>
        <NavLink 
          to="/patient/appointments" 
          style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.navLinkActive : styles.navLinkInactive)
          })}
        >
          📅 Appointments
        </NavLink>
        <NavLink 
          to="/patient/profile" 
          style={({ isActive }) => ({
            ...styles.navLink,
            ...(isActive ? styles.navLinkActive : styles.navLinkInactive)
          })}
        >
          👤 Profile
        </NavLink>
      </nav>

      <div style={styles.footer}>
        <p style={styles.footerText}>© 2026 Pubudu Medical Center</p>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    minHeight: '100vh',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.2)'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px'
  },
  logoIcon: {
    width: '44px',
    height: '44px',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: 'white',
    fontWeight: 'bold',
    border: '2px solid rgba(255, 255, 255, 0.3)'
  },
  title: {
    marginBottom: 0,
    fontSize: '16px',
    fontWeight: 'bold',
    margin: 0,
    color: 'white'
  },
  subtitle: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: '0 0 24px 0',
    fontStyle: 'italic',
    letterSpacing: '0.5px'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1
  },
  navLink: {
    display: 'block',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.3s',
    cursor: 'pointer',
    border: '2px solid transparent'
  },
  navLinkActive: {
    backgroundColor: 'white',
    color: '#667eea',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
    transform: 'translateX(4px)',
    borderLeft: '4px solid #667eea'
  },
  navLinkInactive: {
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '2px solid transparent'
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)'
  },
  footerText: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.7)',
    margin: 0,
    textAlign: 'center',
    letterSpacing: '0.3px'
  }
};

export default Sidebar;